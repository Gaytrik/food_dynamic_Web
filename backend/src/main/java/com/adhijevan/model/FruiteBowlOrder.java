package com.adhijevan.model;


import lombok.Data;
import org.springframework.data.annotation.Id;

import java.util.List;
import java.util.UUID;

@Data
public class FruiteBowlOrder {

    @Id
    private String id = UUID.randomUUID().toString();

    private String userId; // The user who ordered this box

    private String customizeBowlId;

    private List<String> menuId;

    private Double totalPrice;

    private int quantity; // Number of this box configuration in the cart
    
    private String imageUrl; // Image URL for the customized fruit plate

}
