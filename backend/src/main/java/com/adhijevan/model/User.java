package com.adhijevan.model;

import com.adhijevan.Enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 100, message = "Name must be between 2–50 characters")
    private String name;

    @Indexed(unique = true)
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private Boolean isEmailVerify = false;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String number;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @NotBlank(message = "Password cannot be blank")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$",
            message = "Password must contain upper, lower, number, and special character"
    )
    private String password;

    @NotBlank(message = "Gender is required")
    @Pattern(regexp = "^(Male|Female|Other)$", message = "Gender must be Male, Female, or Other")
    private String gender;

    private Role role = Role.USER;

    private Boolean isBlock = false;

    @Size(max = 200, message = "Address must be less than 200 characters")
    private String address;

    private List<PurchaseHistory> purchaseHistories = new ArrayList<>();

    // ✅ static inner class so MongoDB can serialize it
    @Data
    public static class PurchaseHistory {
        private String menuId;
        private int purchaseCount;
    }


}
