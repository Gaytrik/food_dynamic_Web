package com.adhijevan.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "messages")
public class Messages {

    @Id
    private String id;

    private String orderId;

    private String userId;

    private String orderStatus;

    private Instant sentAt;


    private Boolean seen = false;
}
