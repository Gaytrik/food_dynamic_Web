package com.adhijevan.service;

import com.adhijevan.model.AddToCart;
import com.adhijevan.model.MenuItem;
import com.adhijevan.repository.AddToCartRepository;
import com.adhijevan.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Iterator;
import java.util.Optional;

@Service
public class AddToCartService {

    @Autowired
    private AddToCartRepository addToCartRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    /**
     * Adds a cart item for the given user.
     * Checks whether the menu item exists before adding.
     */
    public AddToCart addToCart(String userId, AddToCart.CartItem cartItem) {

        // ✅ Validate if the menu item exists
        Optional<MenuItem> menuItemOptional = menuItemRepository.findById(cartItem.getMenuItemId());
        if (menuItemOptional.isEmpty()) {
            throw new RuntimeException("Menu item not found with ID: " + cartItem.getMenuItemId());
        }

        // Optional: Auto-set the price from menu item if not provided
        MenuItem menuItem = menuItemOptional.get();
        if (cartItem.getPrice() == null || cartItem.getPrice() <= 0) {
            cartItem.setPrice(menuItem.getPrice());
        }

        Optional<AddToCart> optionalCart = addToCartRepository.findByUserIdAndIsActive(userId, true);
        AddToCart cart;

        if (optionalCart.isPresent()) {
            cart = optionalCart.get();
            boolean itemExists = false;
            for (AddToCart.CartItem item : cart.getItems()) {
                if (item.getMenuItemId().equals(cartItem.getMenuItemId())) {
                    // Update quantity if same item exists
                    item.setQuantity(item.getQuantity() + cartItem.getQuantity());
                    itemExists = true;
                    break;
                }
            }

            if (!itemExists) {
                cart.getItems().add(cartItem);
            }
            cart.setUpdatedAt(Instant.now());

        } else {
            // Create a new cart for the user
            cart = AddToCart.builder()
                    .userId(userId)
                    .isActive(true)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            cart.getItems().add(cartItem);
        }

        return addToCartRepository.save(cart);
    }

    /**
     * Get active cart for a user.
     */
    public Optional<AddToCart> getCartByUserId(String userId) {
        return addToCartRepository.findByUserIdAndIsActive(userId, true);
    }

    /**
     * Delete a specific item from the user's active cart.
     */
    public AddToCart deleteCartItem(String userId, String menuItemId) {
        Optional<AddToCart> optionalCart = addToCartRepository.findByUserIdAndIsActive(userId, true);

        if (optionalCart.isPresent()) {
            AddToCart cart = optionalCart.get();

            Iterator<AddToCart.CartItem> iterator = cart.getItems().iterator();
            while (iterator.hasNext()) {
                AddToCart.CartItem item = iterator.next();
                if (item.getMenuItemId().equals(menuItemId)) {
                    iterator.remove();
                    cart.setUpdatedAt(Instant.now());
                    return addToCartRepository.save(cart);
                }
            }

            throw new RuntimeException("Item not found in cart for user: " + userId);
        }

        throw new RuntimeException("Active cart not found for user: " + userId);
    }

    /**
     * Delete or deactivate the entire cart for a user.
     */
    public void clearCart(String userId) {
        Optional<AddToCart> optionalCart = addToCartRepository.findByUserIdAndIsActive(userId, true);

       addToCartRepository.deleteByUserId(userId);
    }
}
