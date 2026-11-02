    package com.adhijevan.controller;

    import com.adhijevan.model.AddToCart;
    import com.adhijevan.service.AddToCartService;
    import com.adhijevan.service.BoxOrderService;
    import lombok.Data;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.HttpStatus;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;

    @RestController
    @RequestMapping("/api/box-order")
    public class BoxOrderController {

        @Autowired
        private BoxOrderService boxOrderService;

        @Autowired
        private AddToCartService addToCartService;

        // Add a customized box to the user's cart
        @PostMapping("/add")
        public AddToCart addBoxToCart(@RequestBody BoxOrderRequest request) {
            // Basic validation
            if (request.getUserId() == null || request.getUserId().isEmpty()) {
                throw new IllegalArgumentException("User ID is required");
            }
            if (request.getCustomizeBoxId() == null || request.getCustomizeBoxId().isEmpty()) {
                throw new IllegalArgumentException("CustomizeBox ID is required");
            }
            if (request.getQuantity() == 0) {
                throw new IllegalArgumentException("Quantity must be greater than 0");
            }

            return boxOrderService.addBoxToCart(
                    request.getUserId(),
                    request.getCustomizeBoxId(),
                    request.getSabjiIds(),
                    request.getRotiTypes(),
                    request.getQuantity()
            );
        }

        /**
         * ✅ Delete a specific box from the user's cart
         */
        @DeleteMapping("/cart/{userId}/{boxId}")
        @ResponseStatus(HttpStatus.OK)
        public AddToCart deleteBoxFromCart(@PathVariable String userId, @PathVariable String boxId) {
            if (userId == null || userId.isEmpty()) {
                throw new IllegalArgumentException("User ID is required");
            }
            if (boxId == null || boxId.isEmpty()) {
                throw new IllegalArgumentException("Box ID is required");
            }

            return boxOrderService.deleteBoxFromCart(userId, boxId);
        }


        // Request body for /add endpoint
        @Data
        public static class BoxOrderRequest {
            private String userId;
            private String customizeBoxId;
            private List<String> sabjiIds;
            private List<String> rotiTypes;
            private List<String> sweetIds;
            private int quantity = 1; // Default quantity to 1
        }

    }