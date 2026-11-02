//package com.adhijevan.service;
//
//import com.adhijevan.model.AddToCart;
//import com.adhijevan.model.Box;
//import com.adhijevan.model.CustomizeBox;
//import com.adhijevan.repository.AddToCartRepository;
//import com.adhijevan.repository.CustomizeBoxRepository;
//import com.adhijevan.repository.MenuItemRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.time.Instant;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Optional;
//
//@Service
//public class BoxOrderService {
//
//    @Autowired
//    private CustomizeBoxRepository customizeBoxRepository;
//
//    @Autowired
//    private AddToCartRepository addToCartRepository;
//
//    @Autowired
//    private MenuItemRepository menuItemRepository;
//
//    public AddToCart addBoxToCart(String userId, String customizeBoxId, List<String> sabjiIds, List<String> rotiTypes, List<String> sweetsIds, int quantity) {
//        // Validate CustomizeBox
//        CustomizeBox customizeBox = customizeBoxRepository.findById(customizeBoxId)
//                .orElseThrow(() -> new IllegalArgumentException("CustomizeBox not found: " + customizeBoxId));
//
//        // Handle null lists
//        if (sabjiIds == null) sabjiIds = new ArrayList<>();
//        if (rotiTypes == null) rotiTypes = new ArrayList<>();
//        if (sweetsIds == null) sweetsIds = new ArrayList<>();
//
//        // Basic validation
//        if (sabjiIds.size() > customizeBox.getSabjiCount()) {
//            throw new IllegalArgumentException("Too many sabjis selected. Max allowed: " + customizeBox.getSabjiCount());
//        }
//        for (String sabjiId : sabjiIds) {
//            if (!menuItemRepository.existsById(sabjiId)) {
//                throw new IllegalArgumentException("Invalid sabji ID: " + sabjiId);
//            }
//        }
//        if (rotiTypes.isEmpty() && customizeBox.getChapptiCount() > 0) {
//            throw new IllegalArgumentException("At least one roti type is required");
//        }
//        boolean isDesertAllowed = customizeBox.getIsDesert() != null && customizeBox.getIsDesert();
//        if (!sweetsIds.isEmpty() && !isDesertAllowed) {
//            throw new IllegalArgumentException("Sweets are not allowed for this box");
//        }
//        for (String sweetId : sweetsIds) {
//            if (!menuItemRepository.existsById(sweetId)) {
//                throw new IllegalArgumentException("Invalid sweet ID: " + sweetId);
//            }
//        }
//
//        // Build Box
//        Box box = new Box();
//        box.setCustomizeBoxId(customizeBoxId);
//        box.setUserId(userId);
//        box.setSabjiId(sabjiIds);
//        box.setQuantity(quantity);
//        box.setTotalPrice(customizeBox.getPrice());
//
//        // Add rotis
//        List<Box.Roti> rotis = new ArrayList<>();
//        int chapptiCount = customizeBox.getChapptiCount();
//        if (!rotiTypes.isEmpty()) {
//            int baseCount = chapptiCount / rotiTypes.size();
//            int remainder = chapptiCount % rotiTypes.size();
//            for (int i = 0; i < rotiTypes.size(); i++) {
//                Box.Roti roti = new Box.Roti();
//                roti.setType(rotiTypes.get(i));
//                roti.setCount(baseCount + (i < remainder ? 1 : 0));
//                rotis.add(roti);
//            }
//        }
//        box.setRotis(rotis);
//
//        // Add rice and sweets
//        box.setIncludeRice(customizeBox.getIsRice() != null && customizeBox.getIsRice());
//        if (isDesertAllowed && !sweetsIds.isEmpty()) {
//            box.setSweetsId(sweetsIds);
//        }
//
//        // Add to cart
//        Optional<AddToCart> optionalCart = addToCartRepository.findByUserIdAndIsActive(userId, true);
//        AddToCart cart;
//        if (optionalCart.isPresent()) {
//            cart = optionalCart.get();
//            // Check for existing box with same configuration
//            for (Box existingBox : cart.getBox()) {
//                if (isSameBox(existingBox, box)) {
//                    int currentQty = existingBox.getQuantity();
//                    int updatedQty = currentQty + quantity;
//
//                    // 🧠 Rule 1: Don't allow quantity below 1
//                    if (updatedQty < 1) {
//                        throw new IllegalArgumentException("Cannot reduce box quantity below 1. Use delete endpoint instead.");
//                    }
//
//                    // 🧠 Rule 2: Update the quantity
//                    existingBox.setQuantity(updatedQty);
//                    cart.setUpdatedAt(Instant.now());
//                    return addToCartRepository.save(cart);
//                }
//
//            }
//            cart.getBox().add(box);
//        } else {
//            cart = AddToCart.builder()
//                    .userId(userId)
//                    .isActive(true)
//                    .createdAt(Instant.now())
//                    .updatedAt(Instant.now())
//                    .box(new ArrayList<>())
//                    .build();
//            cart.getBox().add(box);
//        }
//        cart.setUpdatedAt(Instant.now());
//        return addToCartRepository.save(cart);
//    }
//
//    // Check if two boxes have the same configuration
//    private boolean isSameBox(Box existingBox, Box newBox) {
//        if (!existingBox.getCustomizeBoxId().equals(newBox.getCustomizeBoxId())) {
//            return false;
//        }
//        if (!existingBox.getUserId().equals(newBox.getUserId())) {
//            return false;
//        }
//        List<String> existingSabjis = existingBox.getSabjiId() != null ? existingBox.getSabjiId() : new ArrayList<>();
//        List<String> newSabjis = newBox.getSabjiId() != null ? newBox.getSabjiId() : new ArrayList<>();
//        if (!new ArrayList<>(existingSabjis).equals(new ArrayList<>(newSabjis))) {
//            return false;
//        }
//        List<Box.Roti> existingRotis = existingBox.getRotis() != null ? existingBox.getRotis() : new ArrayList<>();
//        List<Box.Roti> newRotis = newBox.getRotis() != null ? newBox.getRotis() : new ArrayList<>();
//        if (existingRotis.size() != newRotis.size()) {
//            return false;
//        }
//        for (int i = 0; i < existingRotis.size(); i++) {
//            if (!existingRotis.get(i).getType().equals(newRotis.get(i).getType()) ||
//                    existingRotis.get(i).getCount() != newRotis.get(i).getCount()) {
//                return false;
//            }
//        }
//        List<String> existingSweets = existingBox.getSweetsId() != null ? existingBox.getSweetsId() : new ArrayList<>();
//        List<String> newSweets = newBox.getSweetsId() != null ? newBox.getSweetsId() : new ArrayList<>();
//        return new ArrayList<>(existingSweets).equals(new ArrayList<>(newSweets)) &&
//                Boolean.compare(existingBox.getIncludeRice() != null && existingBox.getIncludeRice(),
//                        newBox.getIncludeRice() != null && newBox.getIncludeRice()) == 0;
//    }
//
//
//    /**
//     * ✅ Delete a specific box from the user's active cart.
//     */
//    public AddToCart deleteBoxFromCart(String userId, String boxId) {
//        Optional<AddToCart> optionalCart = addToCartRepository.findByUserIdAndIsActive(userId, true);
//
//        if (optionalCart.isEmpty()) {
//            throw new RuntimeException("Active cart not found for user: " + userId);
//        }
//
//        AddToCart cart = optionalCart.get();
//
//        // Find and remove the box
//        boolean removed = cart.getBox().removeIf(box -> box.getId() != null && box.getId().equals(boxId));
//
//        if (!removed) {
//            throw new RuntimeException("Box not found in user's cart: " + boxId);
//        }
//
//        cart.setUpdatedAt(Instant.now());
//        return addToCartRepository.save(cart);
//    }
//
//}

package com.adhijevan.service;

import com.adhijevan.model.AddToCart;
import com.adhijevan.model.Box;
import com.adhijevan.model.CustomizeBox;
import com.adhijevan.repository.AddToCartRepository;
import com.adhijevan.repository.CustomizeBoxRepository;
import com.adhijevan.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class BoxOrderService {

    @Autowired
    private CustomizeBoxRepository customizeBoxRepository;

    @Autowired
    private AddToCartRepository addToCartRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    public AddToCart addBoxToCart(String userId, String customizeBoxId, List<String> sabjiIds, List<String> rotiTypes,
            int quantity) {
        // Validate CustomizeBox
        CustomizeBox customizeBox = customizeBoxRepository.findById(customizeBoxId)
                .orElseThrow(() -> new IllegalArgumentException("CustomizeBox not found: " + customizeBoxId));

        // Handle null lists
        if (sabjiIds == null)
            sabjiIds = new ArrayList<>();
        if (rotiTypes == null)
            rotiTypes = new ArrayList<>();

        // Basic validation
        if (sabjiIds.size() > customizeBox.getSabjiCount()) {
            throw new IllegalArgumentException(
                    "Too many sabjis selected. Max allowed: " + customizeBox.getSabjiCount());
        }
        for (String sabjiId : sabjiIds) {
            if (!menuItemRepository.existsById(sabjiId)) {
                throw new IllegalArgumentException("Invalid sabji ID: " + sabjiId);
            }
        }

        if (rotiTypes.isEmpty() && customizeBox.getChapptiCount() > 0) {
            throw new IllegalArgumentException("At least one roti type is required");
        }

        // Build Box
        Box box = new Box();
        box.setCustomizeBoxId(customizeBoxId);
        box.setUserId(userId);
        box.setSabjiId(sabjiIds);
        box.setQuantity(quantity);
        box.setTotalPrice(customizeBox.getPrice());
        box.setImageUrl("/Images/Tiffin_box.png"); // Default image for customized tiffin

        // Add rotis
        List<Box.Roti> rotis = new ArrayList<>();
        int chapptiCount = customizeBox.getChapptiCount();
        if (!rotiTypes.isEmpty()) {
            int baseCount = chapptiCount / rotiTypes.size();
            int remainder = chapptiCount % rotiTypes.size();
            for (int i = 0; i < rotiTypes.size(); i++) {
                Box.Roti roti = new Box.Roti();
                roti.setType(rotiTypes.get(i));
                roti.setCount(baseCount + (i < remainder ? 1 : 0));
                rotis.add(roti);
            }
        }
        box.setRotis(rotis);

        // Add rice info
        box.setIncludeRice(customizeBox.getIsRice() != null && customizeBox.getIsRice());

        // Add to cart
        Optional<AddToCart> optionalCart = addToCartRepository.findByUserIdAndIsActive(userId, true);
        AddToCart cart;
        if (optionalCart.isPresent()) {
            cart = optionalCart.get();
            // Check for existing box with same configuration
            for (Box existingBox : cart.getBox()) {
                if (isSameBox(existingBox, box)) {
                    int currentQty = existingBox.getQuantity();
                    int updatedQty = currentQty + quantity;

                    if (updatedQty < 1) {
                        throw new IllegalArgumentException(
                                "Cannot reduce box quantity below 1. Use delete endpoint instead.");
                    }

                    existingBox.setQuantity(updatedQty);
                    cart.setUpdatedAt(Instant.now());
                    return addToCartRepository.save(cart);
                }
            }
            cart.getBox().add(box);
        } else {
            cart = AddToCart.builder()
                    .userId(userId)
                    .isActive(true)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .box(new ArrayList<>())
                    .build();
            cart.getBox().add(box);
        }
        cart.setUpdatedAt(Instant.now());
        return addToCartRepository.save(cart);
    }

    // Check if two boxes have the same configuration (without sweets)
    private boolean isSameBox(Box existingBox, Box newBox) {
        if (!existingBox.getCustomizeBoxId().equals(newBox.getCustomizeBoxId())) {
            return false;
        }
        if (!existingBox.getUserId().equals(newBox.getUserId())) {
            return false;
        }

        List<String> existingSabjis = existingBox.getSabjiId() != null ? existingBox.getSabjiId() : new ArrayList<>();
        List<String> newSabjis = newBox.getSabjiId() != null ? newBox.getSabjiId() : new ArrayList<>();
        if (!new ArrayList<>(existingSabjis).equals(new ArrayList<>(newSabjis))) {
            return false;
        }

        List<Box.Roti> existingRotis = existingBox.getRotis() != null ? existingBox.getRotis() : new ArrayList<>();
        List<Box.Roti> newRotis = newBox.getRotis() != null ? newBox.getRotis() : new ArrayList<>();
        if (existingRotis.size() != newRotis.size()) {
            return false;
        }

        for (int i = 0; i < existingRotis.size(); i++) {
            if (!existingRotis.get(i).getType().equals(newRotis.get(i).getType()) ||
                    existingRotis.get(i).getCount() != newRotis.get(i).getCount()) {
                return false;
            }
        }

        return Boolean.compare(existingBox.getIncludeRice() != null && existingBox.getIncludeRice(),
                newBox.getIncludeRice() != null && newBox.getIncludeRice()) == 0;
    }

    /**
     * ✅ Delete a specific box from the user's active cart.
     */
    public AddToCart deleteBoxFromCart(String userId, String boxId) {
        Optional<AddToCart> optionalCart = addToCartRepository.findByUserIdAndIsActive(userId, true);

        if (optionalCart.isEmpty()) {
            throw new RuntimeException("Active cart not found for user: " + userId);
        }

        AddToCart cart = optionalCart.get();

        boolean removed = cart.getBox().removeIf(box -> box.getId() != null && box.getId().equals(boxId));

        if (!removed) {
            throw new RuntimeException("Box not found in user's cart: " + boxId);
        }

        cart.setUpdatedAt(Instant.now());
        return addToCartRepository.save(cart);
    }

}
