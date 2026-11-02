package com.adhijevan.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "cart")
public class AddToCart {

    @Id
    private String id;           // cart ID

    private String userId;       // user who owns the cart

    @Builder.Default
    private List<CartItem> items = new ArrayList<>();

    private List<Box> box = new ArrayList<>();

    private List<FruiteBowlOrder> fruiteBowlOrders = new ArrayList<>();

    @Builder.Default
    private Boolean isActive = true;

    private Instant createdAt;
    private Instant updatedAt;

    // Compute total cart value
    public double getTotal() {
        return items.stream()
                .mapToDouble(CartItem::getTotalPrice)
                .sum();
    }

    // Handle timestamps
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    // ✅ Make this static so it doesn’t hold reference to AddToCart
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItem {

        private String menuItemId;
        private int quantity;
        private Double price;

        public double getTotalPrice() {
            return price * Math.max(quantity, 1);
        }
    }
}
