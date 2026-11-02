package com.adhijevan.controller;

import com.adhijevan.model.OtpToken;
import com.adhijevan.model.User;
import com.adhijevan.service.UserSerivce;
import jakarta.mail.MessagingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*") // ✅ match frontend domain
public class UserController {

    @Autowired
    private UserSerivce userSerivce;

    // ✅ Register new user
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) throws MessagingException {
        log.info("[register] New registration attempt for {}", user.getEmail());

        try {
            User savedUser = userSerivce.saveUser(user);
            return ResponseEntity.status(201).body(savedUser);
        } catch (IllegalStateException e) {
            // Email already exists case
            return ResponseEntity.status(409).body("Email already exists");
        } catch (Exception e) {
            // Other unexpected errors
            return ResponseEntity.status(500).body("Registration failed");
        }
    }


    // ✅ Login user
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String email, @RequestParam String password) {
        log.info("[login] Attempt for {}", email);
        String token = userSerivce.login(email, password);
        return ResponseEntity.ok(token);
    }

    // ✅ Send OTP for specific purpose
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(
            @RequestParam String email,
            @RequestParam OtpToken.OtpPurpose purpose
    ) throws MessagingException {
        log.info("[sendOtp] Sending OTP for {} with purpose {}", email, purpose);
        String result = userSerivce.sendOtp(email, purpose);
        return ResponseEntity.ok(result);
    }

    // ✅ Verify OTP for any purpose
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestParam String userEmail,
            @RequestParam String tokenId,
            @RequestParam String otp,
            @RequestParam OtpToken.OtpPurpose purpose,
            @RequestParam(required = false) String value
    ) {
        final String LOG_PREFIX = "[verifyOtp] ";

        try {
            log.info("{}Request received for user: {}, purpose: {}", LOG_PREFIX, userEmail, purpose);
            String result = userSerivce.verifyOtp(userEmail, tokenId, otp, purpose, value);

            if (result.contains("successfully")) {
                return ResponseEntity.ok(result);
            } else if (result.contains("Wrong OTP") || result.contains("Expired") || result.contains("not found")) {
                return ResponseEntity.badRequest().body(result);
            } else {
                log.error("{}Unexpected result: {}", LOG_PREFIX, result);
                return ResponseEntity.internalServerError().body("Unexpected error occurred");
            }
        } catch (Exception e) {
            log.error("{}Exception while verifying OTP: {}", LOG_PREFIX, e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Internal server error");
        }
    }

    // ✅ Test endpoint
    @GetMapping("/test")
    public String test() {
        return "✅ Auth API working fine!";
    }

    // ✅ Update user
    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestParam String email, @RequestBody User user) {
        log.info("[updateUser] Updating user {}", email);
        Optional<User> updatedUser = userSerivce.updateUser(email, user);
        return updatedUser.isPresent() ? ResponseEntity.ok(updatedUser) : ResponseEntity.notFound().build();
    }

    // ✅ Get user by email
    @GetMapping("/user")
    public ResponseEntity<?> getByEmail(@RequestParam String email) {
        Optional<User> user = userSerivce.getUserByEmail(email);
        return user.isPresent() ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @GetMapping("/user/{userId}")
    public Optional<User> getUserById(@PathVariable String userId){
        return userSerivce.getuserbyId(userId);
    }

    // ✅ Delete user by email
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteUserByEmail(@RequestParam String email) {
        log.info("[deleteUser] Deleting user {}", email);
        String result = userSerivce.deleteUserByEmail(email);
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public List<User>  getall(){
        return userSerivce.getall();
    }
    // ✅ Paginated user list (admin)
    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(Pageable pageable) {
        final String LOG_PREFIX = "[getAllUsers] ";
        try {
            log.info("{}Fetching page {} with size {}", LOG_PREFIX, pageable.getPageNumber(), pageable.getPageSize());
            Page<User> users = userSerivce.getAll(pageable);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("{}Error fetching users: {}", LOG_PREFIX, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/users/search")
    public ResponseEntity<Page<User>> searchUsers(
            @RequestParam(required = false) String query,
            Pageable pageable) {
        try {
            if (query == null || query.trim().isEmpty()) {
                // fallback to normal pagination if no search
                Page<User> users = userSerivce.getAll(pageable);
                return ResponseEntity.ok(users);
            }

            Page<User> users = userSerivce.searchUsers(query.trim(), pageable);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error searching users: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

}