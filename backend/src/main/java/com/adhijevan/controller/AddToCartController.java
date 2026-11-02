package com.adhijevan.controller;

import com.adhijevan.model.AddToCart;
import com.adhijevan.service.AddToCartService;
import com.adhijevan.service.AppSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*") // Allow frontend access (you can restrict domain later)
public class AddToCartController {

    @Autowired
    private AddToCartService addToCartService;

    @Autowired
    private AppSettingsService appSettingsService;

    /**
     * Add or update a cart item for the given user.
     */
    @PostMapping("/{userId}/add")
    public ResponseEntity<AddToCart> addToCart(
            @PathVariable String userId,
            @RequestBody AddToCart.CartItem cartItem) {

        AddToCart updatedCart = addToCartService.addToCart(userId, cartItem);
        return ResponseEntity.ok(updatedCart);
    }

    /**
     * Get the active cart for a user.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getCart(@PathVariable String userId) {
        Optional<AddToCart> cart = addToCartService.getCartByUserId(userId);

        if (cart.isPresent()) {
            return ResponseEntity.ok(cart.get());
        } else {
            return ResponseEntity.status(404).body("No active cart found for user: " + userId);
        }
    }

    /**
     * Update an existing cart item (quantity or price).
     */


    /**
     * Delete a specific item from the cart.
     */
    @DeleteMapping("/{userId}/item/{menuItemId}")
    public ResponseEntity<?> deleteCartItem(
            @PathVariable String userId,
            @PathVariable String menuItemId) {

        try {
            AddToCart updatedCart = addToCartService.deleteCartItem(userId, menuItemId);
            return ResponseEntity.ok(updatedCart);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    /**
     * Clear or deactivate entire cart for the user.
     */
    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<String> clearCart(@PathVariable String userId) {
        addToCartService.clearCart(userId);
        return ResponseEntity.ok("Cart cleared for user: " + userId);
    }

    /**
     * Get pricing breakdown for cart
     */
    @GetMapping("/{userId}/pricing")
    public ResponseEntity<AppSettingsService.PricingBreakdown> getCartPricing(@PathVariable String userId) {
        try {
            Optional<AddToCart> cart = addToCartService.getCartByUserId(userId);
            if (cart.isPresent()) {
                double subtotal = cart.get().getTotal();
                AppSettingsService.PricingBreakdown breakdown = appSettingsService.getPricingBreakdown(subtotal);
                return ResponseEntity.ok(breakdown);
            } else {
                // Return empty cart pricing
                AppSettingsService.PricingBreakdown breakdown = appSettingsService.getPricingBreakdown(0.0);
                return ResponseEntity.ok(breakdown);
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
