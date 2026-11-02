package com.adhijevan.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
public class Reviews {
    private String userID;
    private String reviewText;
    private int rating;
    private Boolean isActive = false;
}
