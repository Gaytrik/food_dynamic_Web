package com.adhijevan.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.concurrent.CompletableFuture;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private static final SecureRandom random = new SecureRandom();

    // Utility to generate 6-digit verification code

    // ✅ 1️⃣ Send Welcome Email
    @Async
    public void sendWelcomeEmail(String to, String userName) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");

        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; margin: 0; padding: 0;}
                        .container {max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;}
                        .header {background: linear-gradient(135deg, #6a11cb, #2575fc); color: #fff; text-align: center; padding: 30px 20px;}
                        .content {padding: 30px 25px; text-align: center; color: #444;}
                        .button {display: inline-block; margin-top: 20px; padding: 12px 28px; background-color: #2575fc; color: white; border-radius: 6px; text-decoration: none;}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header"><h1>🌟 Welcome to Adhijevan!</h1></div>
                        <div class="content">
                            <h2>Hello, %s 👋</h2>
                            <p>We’re thrilled to have you on board.</p>
                            <a href="https://your-website.com/login" class="button">Get Started</a>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(userName);

        helper.setFrom("dkkarla9@gmail.com");
        helper.setTo(to);
        helper.setSubject("🎉 Welcome to Adhijevan!");
        helper.setText(html, true);

        mailSender.send(message);
        System.out.println("✅ Welcome email sent to " + to);
    }

    // ✅ 2️⃣ Send Verification Code for Email Verification
    @Async
    public CompletableFuture<String> sendVerificationCode(String to, String userName, String code)
            throws MessagingException {

        String subject = "🔐 Verify Your Email - Adhijevan";
        String html = """
                <div style='font-family: Arial; background:#f7f9fc; padding:20px;'>
                    <div style='max-width:600px; background:#fff; padding:25px; border-radius:10px; margin:auto; box-shadow:0 2px 8px rgba(0,0,0,0.1)'>
                        <h2>Hello %s 👋</h2>
                        <p>Here is your email verification code:</p>
                        <h1 style='color:#2575fc; letter-spacing:4px;'>%s</h1>
                        <p>This code is valid for 10 minutes.</p>
                        <p>Thank you,<br><b>Adhijevan Team</b></p>
                    </div>
                </div>
                """
                .formatted(userName, code);

        sendEmail(to, subject, html);
        return CompletableFuture.completedFuture(code);
        // you can save this in DB or cache
    }

    // ✅ 3️⃣ Send Change Email Verification Code
    @Async
    public CompletableFuture<String> sendChangeEmailCode(String to, String userName, String code)
            throws MessagingException {

        String subject = "✉️ Confirm Your New Email - Adhijevan";
        String html = """
                <div style='font-family: Arial; background:#f7f9fc; padding:20px;'>
                    <div style='max-width:600px; background:#fff; padding:25px; border-radius:10px; margin:auto; box-shadow:0 2px 8px rgba(0,0,0,0.1)'>
                        <h2>Hi %s 👋</h2>
                        <p>We received a request to change your email address. Use this code to confirm:</p>
                        <h1 style='color:#6a11cb; letter-spacing:4px;'>%s</h1>
                        <p>If you didn’t make this request, ignore this email.</p>
                    </div>
                </div>
                """
                .formatted(userName, code);

        sendEmail(to, subject, html);
        return CompletableFuture.completedFuture(code);

    }

    // ✅ 4️⃣ Send Forgot Password Code
    @Async
    public CompletableFuture<String> sendForgotPasswordCode(String to, String userName, String code)
            throws MessagingException {

        String subject = "🔑 Reset Your Password - Adhijevan";
        String html = """
                <div style='font-family: Arial; background:#f7f9fc; padding:20px;'>
                    <div style='max-width:600px; background:#fff; padding:25px; border-radius:10px; margin:auto; box-shadow:0 2px 8px rgba(0,0,0,0.1)'>
                        <h2>Hey %s 👋</h2>
                        <p>Use this code to reset your password:</p>
                        <h1 style='color:#2575fc; letter-spacing:4px;'>%s</h1>
                        <p>This code expires in 10 minutes.</p>
                    </div>
                </div>
                """
                .formatted(userName, code);

        sendEmail(to, subject, html);
        return CompletableFuture.completedFuture(code);

    }

    // ✅ 5️⃣ Send Email Verification Success Email
    @Async
    public void sendEmailVerifiedSuccess(String to, String userName) throws MessagingException {
        String subject = "✅ Your Email Has Been Verified - Adhijevan";
        String html = """
                <div style='font-family: Arial; background:#f7f9fc; padding:20px;'>
                    <div style='max-width:600px; background:#fff; padding:25px; border-radius:10px; margin:auto;
                                box-shadow:0 2px 8px rgba(0,0,0,0.1); text-align:center;'>
                        <h2 style='color:#2575fc;'>🎉 Congratulations, %s!</h2>
                        <p>Your email has been successfully verified.</p>
                        <p>Welcome to the full Adhijevan experience 🚀</p>
                        <a href='https://your-website.com/login'
                           style='display:inline-block; margin-top:20px; padding:12px 28px;
                                  background-color:#2575fc; color:white; border-radius:6px; text-decoration:none;'>
                           Go to Dashboard
                        </a>
                        <p style='margin-top:30px; color:#777;'>- The Adhijevan Team</p>
                    </div>
                </div>
                """.formatted(userName);

        sendEmail(to, subject, html);
    }

    // ✅ 6️⃣ Send Password Reset Success Email
    @Async
    public void sendPasswordResetSuccess(String to, String userName) throws MessagingException {
        String subject = "🔒 Password Reset Successfully - Adhijevan";
        String html = """
                <div style='font-family: Arial; background:#f7f9fc; padding:20px;'>
                    <div style='max-width:600px; background:#fff; padding:25px; border-radius:10px; margin:auto;
                                box-shadow:0 2px 8px rgba(0,0,0,0.1); text-align:center;'>
                        <h2>Hi %s 👋</h2>
                        <p>Your password has been successfully reset.</p>
                        <p>If this wasn’t you, please <a href='https://your-website.com/support'>contact support</a> immediately.</p>
                        <a href='https://your-website.com/login'
                           style='display:inline-block; margin-top:20px; padding:12px 28px;
                                  background-color:#6a11cb; color:white; border-radius:6px; text-decoration:none;'>
                           Log In Securely
                        </a>
                        <p style='margin-top:30px; color:#777;'>Stay safe,<br>The Adhijevan Team</p>
                    </div>
                </div>
                """
                .formatted(userName);

        sendEmail(to, subject, html);
    }

    // ✅ 7️⃣ Send Email Change Success Email
    @Async
    public void sendEmailChangeSuccess(String to, String userName) throws MessagingException {
        String subject = "📬 Email Changed Successfully - Adhijevan";
        String html = """
                <div style='font-family: Arial; background:#f7f9fc; padding:20px;'>
                    <div style='max-width:600px; background:#fff; padding:25px; border-radius:10px; margin:auto;
                                box-shadow:0 2px 8px rgba(0,0,0,0.1); text-align:center;'>
                        <h2>Hello %s 👋</h2>
                        <p>Your account email address has been successfully updated.</p>
                        <p>If you did not request this change, please contact our support immediately.</p>
                        <p style='margin-top:30px; color:#777;'>Thank you,<br>The Adhijevan Team</p>
                    </div>
                </div>
                """.formatted(userName);

        sendEmail(to, subject, html);
    }

    // ✅ Common email-sending helper
    @Async
    private void sendEmail(String to, String subject, String html) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
        helper.setFrom("dkkarla9@gmail.com");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(message);
        System.out.println("📧 Email sent to " + to + " with subject: " + subject);
    }
}
