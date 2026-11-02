package com.adhijevan.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.UUID;

@Data
@Document(collection = "box_orders")
public class Box {
    @Id
    private String id = UUID.randomUUID().toString();

    private String customizeBoxId; // Reference to CustomizeBox used
    private String userId; // The user who ordered this box
    private List<String> sabjiId; // Selected sabjis (within sabjiCount limit)
    private List<Roti> rotis; // Roti selections with type + count
    private Boolean includeRice; // If rice is part of box
    private Double totalPrice; // Final calculated price
    private int quantity; // Number of this box configuration in the cart
    private String imageUrl; // Image URL for the customized tiffin box

    @Data
    public static class Roti {
        private String type; // like "Butter Roti", "Plain Roti"
        private int count;
    }
}