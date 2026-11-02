package com.adhijevan.service;

import com.adhijevan.model.AddToCart;
import com.adhijevan.model.CustomizeFruiteBowl;
import com.adhijevan.model.FruiteBowlOrder;
import com.adhijevan.repository.AddToCartRepository;
import com.adhijevan.repository.CustomizeFruiteBowlRepository;
import com.adhijevan.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FruitBowlOrderService {

    @Autowired
    private CustomizeFruiteBowlRepository customizeFruiteBowlRepository;

    @Autowired
    private AddToCartRepository addToCartRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    /**
     * ✅ Add or update a customized fruit bowl in the user's cart.
     * Supports negative quantities (reduces existing quantity).
     */
    public AddToCart addFruitBowlToCart(String userId, String customizeBowlId, List<String> fruitIds, int quantity) {

        // 🔹 Validate CustomizeFruiteBowl existence
        CustomizeFruiteBowl customizeBowl = customizeFruiteBowlRepository.findById(customizeBowlId)
                .orElseThrow(() -> new IllegalArgumentException("CustomizeFruiteBowl not found: " + customizeBowlId));

        if (fruitIds == null) fruitIds = new ArrayList<>();

        // 🔹 Validate fruit IDs
        if (fruitIds.size() > customizeBowl.getFruitCount()) {
            throw new IllegalArgumentException("Too many fruits selected. Max allowed: " + customizeBowl.getFruitCount());
        }
        for (String fruitId : fruitIds) {
            if (!menuItemRepository.existsById(fruitId)) {
                throw new IllegalArgumentException("Invalid fruit ID: " + fruitId);
            }
        }

        // 🔹 Build FruiteBowlOrder object
        FruiteBowlOrder bowlOrder = new FruiteBowlOrder();
        bowlOrder.setUserId(userId); // ✅ ensure userId is always set
        bowlOrder.setCustomizeBowlId(customizeBowlId);
        bowlOrder.setMenuId(fruitIds);
        bowlOrder.setTotalPrice(customizeBowl.getPrice());
        bowlOrder.setQuantity(quantity);
        bowlOrder.setImageUrl("/Images/Fruit-plate.jpg"); // Default image for customized fruit plate

        // 🔹 Find user's active cart
        Optional<AddToCart> optionalCart = addToCartRepository.findByUserIdAndIsActive(userId, true);
        AddToCart cart;

        if (optionalCart.isPresent()) {
            cart = optionalCart.get();

            // Check for existing bowl configuration
            for (FruiteBowlOrder existingOrder : cart.getFruiteBowlOrders()) {
                if (isSameBowl(existingOrder, bowlOrder)) {
                    int currentQty = existingOrder.getQuantity();
                    int updatedQty = currentQty + quantity; // ✅ handle negatives too

                    // ⚠️ If updated quantity ≤ 0, remove from cart
                    if (updatedQty <= 0) {
                        cart.getFruiteBowlOrders().remove(existingOrder);
                    } else {
                        existingOrder.setQuantity(updatedQty);
                    }

                    cart.setUpdatedAt(Instant.now());
                    return addToCartRepository.save(cart);
                }
            }

            // If not found and quantity > 0, add as new bowl
            if (quantity > 0) {
                cart.getFruiteBowlOrders().add(bowlOrder);
            } else {
                throw new IllegalArgumentException("Cannot add a new fruit bowl with non-positive quantity.");
            }

        } else {
            // Create new cart if user has none
            if (quantity <= 0) {
                throw new IllegalArgumentException("Cannot create a new cart with non-positive quantity.");
            }

            cart = AddToCart.builder()
                    .userId(userId)
                    .isActive(true)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .box(new ArrayList<>())
                    .fruiteBowlOrders(new ArrayList<>())
                    .build();

            cart.getFruiteBowlOrders().add(bowlOrder);
        }

        cart.setUpdatedAt(Instant.now());
        return addToCartRepository.save(cart);
    }

    /**
     * ✅ Compare two FruiteBowlOrder configurations
     */
    private boolean isSameBowl(FruiteBowlOrder existingBowl, FruiteBowlOrder newBowl) {
        if (!existingBowl.getCustomizeBowlId().equals(newBowl.getCustomizeBowlId())) {
            return false;
        }

        List<String> existingFruits = existingBowl.getMenuId() != null ? existingBowl.getMenuId() : new ArrayList<>();
        List<String> newFruits = newBowl.getMenuId() != null ? newBowl.getMenuId() : new ArrayList<>();

        return new ArrayList<>(existingFruits).equals(new ArrayList<>(newFruits));
    }

    /**
     * ✅ Delete a specific fruit bowl order from user's cart
     */
    public AddToCart deleteFruitBowlFromCart(String userId, String fruitBowlOrderId) {
        Optional<AddToCart> optionalCart = addToCartRepository.findByUserIdAndIsActive(userId, true);

        if (optionalCart.isEmpty()) {
            throw new RuntimeException("Active cart not found for user: " + userId);
        }

        AddToCart cart = optionalCart.get();

        boolean removed = cart.getFruiteBowlOrders().removeIf(
                bowl -> bowl.getId() != null && bowl.getId().equals(fruitBowlOrderId)
        );

        if (!removed) {
            throw new RuntimeException("Fruit bowl order not found in user's cart: " + fruitBowlOrderId);
        }

        cart.setUpdatedAt(Instant.now());
        return addToCartRepository.save(cart);
    }
}
