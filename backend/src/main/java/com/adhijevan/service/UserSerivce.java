package com.adhijevan.service;

import com.adhijevan.model.OtpToken;
import com.adhijevan.model.User;
import com.adhijevan.repository.OtpTokenRepo;
import com.adhijevan.repository.UserRepo;
import com.adhijevan.utils.JwtUtils;
import jakarta.mail.MessagingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class UserSerivce {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private OtpTokenRepo otpTokenRepo;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;
    private static final SecureRandom secureRandom = new SecureRandom();
    private final int OTP_EXPIRY_MINUTES = 10;
    private final int MAX_VERIFY_ATTEMPTS = 5;


    public User saveUser(User user) throws MessagingException {
        String normalizedEmail = user.getEmail().toLowerCase();
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setEmail(normalizedEmail);

        Optional<User> existingUser = userRepo.findByEmail(normalizedEmail);
        if (existingUser.isPresent()) {
            throw new IllegalStateException("Email already exists");
        }

               User user1 =  userRepo.save(user);
                emailService.sendWelcomeEmail(user.getEmail(),user.getName());
                return user1;
    }



    public List<User> getall() {
        return userRepo.findAll();
    }

    public String login(String email, String rawPassword) {
        String normalizedEmail = email.toLowerCase();
        Optional<User> userOpt = userRepo.findByEmail(normalizedEmail);
        if (userOpt.isEmpty()) {
            return "Invalid email or password";
        }

        User user = userOpt.get();

        if (user.getIsBlock() != null && user.getIsBlock()) {
            return "User account is blocked";
        }

        // Check password
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            return "Invalid email or password";
        }

        // Everything checks out — generate JWT
        String role = user.getRole() != null ? user.getRole().name() : "USER"; // assuming Enum Role
        String token = jwtUtils.generateToken(normalizedEmail, role);

        return token;
    }


    @Transactional
    public String sendOtp(String email, OtpToken.OtpPurpose purpose) {
        final String LOG_PREFIX = "[sendOtp] ";

        try {
            // 1️⃣ Validate input
            if (email == null || email.isBlank()) {
                log.warn("{}Invalid email input: '{}'", LOG_PREFIX, email);
                throw new IllegalArgumentException("Email cannot be null or blank");
            }

            // 2️⃣ Check if user exists
            Optional<User> optionalUser = userRepo.findByEmail(email);
            if (optionalUser.isEmpty()) {
                log.warn("{}User not found for email: {}", LOG_PREFIX, email);
                return "User not found";
            }

            User user = optionalUser.get();

            // 3️⃣ Remove if old OTPs
            Optional<OtpToken> otpToken1 = otpTokenRepo.findByEmail(email);
            if (otpToken1.isPresent()) {
                otpTokenRepo.deleteByEmail(email);
            }

            log.debug("{}Old OTPs deleted for user: {}, purpose: {}", LOG_PREFIX, email, purpose);

            // 4️⃣ Generate new OTP
            int codeInt = secureRandom.nextInt(900000) + 100000; // 6-digit OTP
            String code = String.valueOf(codeInt);
            log.debug("{}Generated new OTP: {} for email: {}", LOG_PREFIX, code, email);

            // 5️⃣ Create OTP record
            OtpToken otpToken = new OtpToken();
            otpToken.setId(UUID.randomUUID().toString());
            otpToken.setEmail(email);
            otpToken.setOtp(code);
            otpToken.setPurpose(purpose);
            otpToken.setCreatedAt(Instant.now());
            otpToken.setExpiresAt(Instant.now().plus(OTP_EXPIRY_MINUTES, ChronoUnit.MINUTES));
            otpToken.setAttempts(0);

            otpTokenRepo.save(otpToken);
            log.info("{}Saved new OTP for email: {}, purpose: {}", LOG_PREFIX, email, purpose);

            // 6️⃣ Send email based on purpose
            switch (purpose) {
                case VERIFY_EMAIL:
                    emailService.sendVerificationCode(email, user.getName(), code);
                    break;
                case RESET_PASSWORD:
                    emailService.sendForgotPasswordCode(email, user.getName(), code);
                    break;
                case CHANGE_EMAIL:
                    emailService.sendChangeEmailCode(email, user.getName(), code);
                    break;
                default:
                    log.error("{}Invalid OTP purpose: {}", LOG_PREFIX, purpose);
                    return "Invalid OTP purpose";
            }

            // 7️⃣ Final log
            log.info("{}OTP successfully sent to {} (purpose: {}, expires in {} min)",
                    LOG_PREFIX, email, purpose, OTP_EXPIRY_MINUTES);

            return otpToken.getId();

        } catch (MessagingException e) {
            log.error("{}Failed to send OTP email to {} due to messaging error: {}", LOG_PREFIX, email, e.getMessage(), e);
            throw new RuntimeException("Failed to send OTP email", e);
        } catch (Exception e) {
            log.error("{}Unexpected error while generating OTP for {}: {}", LOG_PREFIX, email, e.getMessage(), e);
            throw new RuntimeException("Internal error while sending OTP", e);
        }
    }

    public String verifyOtp(String userEmail, String tokenId, String otp, OtpToken.OtpPurpose purpose, String value) throws MessagingException {
        Optional<OtpToken> otpTokenOpt = otpTokenRepo.findById(tokenId);
        Optional<User> userOpt = userRepo.findByEmail(userEmail);

        if (otpTokenOpt.isEmpty() || userOpt.isEmpty()) {
            return "User or OTP not found";
        }

        OtpToken otpToken = otpTokenOpt.get();
        User user = userOpt.get();

        // Increment attempts
        otpToken.setAttempts(otpToken.getAttempts() + 1);

        // Check if expired first
        if (Instant.now().isAfter(otpToken.getExpiresAt())) {
            otpTokenRepo.delete(otpToken);
            return "Expired OTP";
        }
        // Check OTP match
        if (otp == null || !otp.equals(otpToken.getOtp())) {
            if (otpToken.getAttempts() >= MAX_VERIFY_ATTEMPTS) {
                otpTokenRepo.delete(otpToken);
                return "Attempt limit exceeded. Please request a new OTP.";
            } else {
                otpTokenRepo.save(otpToken);
                return "Wrong OTP";
            }
        }
        // OTP is valid — handle by purpose
        switch (purpose) {
            case VERIFY_EMAIL:
                user.setIsEmailVerify(true);
                userRepo.save(user);
                otpTokenRepo.delete(otpToken);
                emailService.sendEmailVerifiedSuccess(user.getEmail(), user.getName());
                return "Email verified successfully";

            case RESET_PASSWORD:
                user.setPassword(passwordEncoder.encode(value));
                userRepo.save(user);
                otpTokenRepo.delete(otpToken);
                emailService.sendPasswordResetSuccess(user.getEmail(), user.getName());
                return "Password reset successfully";

            case CHANGE_EMAIL:
                user.setEmail(value);
                userRepo.save(user);
                otpTokenRepo.delete(otpToken);
                emailService.sendEmailChangeSuccess(user.getEmail(), user.getName());
                ;
                return "Email changed successfully";

            default:
                return "Invalid OTP purpose";
        }
    }

    public Page<User> searchUsers(String query, Pageable pageable) {
        return userRepo.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrNumberContaining(
                query, query, query, pageable
        );
    }

    public Optional<User> getUserByEmail(String email) {
        if (email == null || email.isBlank()) {
            log.warn("Attempted to fetch user with null or blank email");
            return Optional.empty();
        }
        Optional<User> user = userRepo.findByEmail(email);
        if (user.isEmpty()) {
            log.info("No user found with email: {}", email);
        }

        return user;
    }


    public Page<User> getAll(Pageable pageable) {
        return userRepo.findAll(pageable);
    }

    @Transactional
    public Optional<User> updateUser(String email, User user) {
        if (email == null || email.isBlank()) {
            log.warn("Attempted to update user with null or blank email");
            return Optional.empty();
        }
        return userRepo.findByEmail(email)
                .map(existing -> {
                    if (user.getName() != null) existing.setName(user.getName());
                    if (user.getAddress() != null) existing.setAddress(user.getAddress());
                    if (user.getGender() != null) existing.setGender(user.getGender());
                    if (user.getIsBlock() != null) existing.setIsBlock(user.getIsBlock());
                    log.info("Updating user: {}", existing.getEmail());
                    return userRepo.save(existing);
                });
    }

    public Optional<User> getuserbyId(String userId) {
        return userRepo.findById(userId);
    }

    @Transactional
    public String deleteUserByEmail(String email) {
        if (email == null || email.isBlank()) {
            log.warn("Attempted to delete user with null or blank email");
            return "Invalid email";
        }

        Optional<User> userOptional = userRepo.findByEmail(email);
        if (userOptional.isEmpty()) {
            log.info("No user found with email: {}", email);
            return "User not found";
        }

        userRepo.delete(userOptional.get());
        log.info("User with email {} deleted successfully", email);

        return "User deleted successfully";
    }
}