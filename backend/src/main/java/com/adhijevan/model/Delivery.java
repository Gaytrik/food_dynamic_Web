package com.adhijevan.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "delivery")
public class Delivery {

    @Id
    private String id;

    private String userId;

    private List<String> orderIds;

    private int totalDelivery;

    private Boolean isActive;
}
