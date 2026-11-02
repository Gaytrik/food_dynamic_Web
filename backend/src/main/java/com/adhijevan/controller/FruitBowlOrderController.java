package com.adhijevan.controller;

import com.adhijevan.model.AddToCart;
import com.adhijevan.service.AddToCartService;
import com.adhijevan.service.FruitBowlOrderService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fruit-bowl-order")
public class FruitBowlOrderController {

    @Autowired
    private FruitBowlOrderService fruitBowlOrderService;

    @Autowired
    private AddToCartService addToCartService;

    /**
     * ✅ Add a customized fruit bowl to the user's cart
     */
    @PostMapping("/add")
    public AddToCart addFruitBowlToCart(@RequestBody FruitBowlOrderRequest request) {
        // Basic validation
        if (request.getUserId() == null || request.getUserId().isEmpty()) {
            throw new IllegalArgumentException("User ID is required");
        }
        if (request.getCustomizeBowlId() == null || request.getCustomizeBowlId().isEmpty()) {
            throw new IllegalArgumentException("CustomizeBowl ID is required");
        }
        if (request.getQuantity() == 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        return fruitBowlOrderService.addFruitBowlToCart(
                request.getUserId(),
                request.getCustomizeBowlId(),
                request.getFruitIds(),
                request.getQuantity()
        );
    }

    /**
     * ✅ Delete a specific fruit bowl from the user's cart
     */
    @DeleteMapping("/cart/{userId}/{fruitBowlId}")
    @ResponseStatus(HttpStatus.OK)
    public AddToCart deleteFruitBowlFromCart(
            @PathVariable String userId,
            @PathVariable String fruitBowlId
    ) {
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("User ID is required");
        }
        if (fruitBowlId == null || fruitBowlId.isEmpty()) {
            throw new IllegalArgumentException("FruitBowl ID is required");
        }

        return fruitBowlOrderService.deleteFruitBowlFromCart(userId, fruitBowlId);
    }

    // ✅ Request body for /add endpoint
    @Data
    public static class FruitBowlOrderRequest {
        private String userId;
        private String customizeBowlId;
        private List<String> fruitIds;
        private int quantity = 1; // Default quantity
    }
}
