package com.adhijevan.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "otp_tokens")
public class OtpToken {

    @Id
    private String id;
    private String userId;        // optional: link to user if available
    private String email;         // email this OTP is for
    private String otp;       // hashed OTP (BCrypt)
    private OtpPurpose purpose;   // enum: VERIFY_EMAIL, CHANGE_EMAIL, RESET_PASSWORD
    private int attempts;         // failed verify attempts count
    private Instant createdAt;    // use for TTL index
    private Instant expiresAt;    // descriptive - optional

    public enum OtpPurpose {
        VERIFY_EMAIL,
        RESET_PASSWORD,
        CHANGE_EMAIL
    }

}
