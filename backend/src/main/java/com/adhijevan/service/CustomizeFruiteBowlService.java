package com.adhijevan.service;

import com.adhijevan.model.CustomizeFruiteBowl;
import com.adhijevan.repository.CustomizeFruiteBowlRepository;
import com.adhijevan.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CustomizeFruiteBowlService {

    @Autowired
    private CustomizeFruiteBowlRepository fruitBowlRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    // ✅ Create and save a new fruit bowl
    public CustomizeFruiteBowl saveFruitBowl(CustomizeFruiteBowl fruitBowl) {
        return fruitBowlRepository.save(fruitBowl);
    }

    // ✅ Update fruit bowl details and fruit list (with validation)
    public CustomizeFruiteBowl updateFruitBowl(String id, CustomizeFruiteBowl fruitBowl) {
        CustomizeFruiteBowl existing = fruitBowlRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fruit bowl not found with id: " + id));

        // 🧹 Prepare a clean list of valid fruit IDs
        List<String> validFruitIds = new ArrayList<>();

        if (fruitBowl.getFruitIds() != null) {
            for (String fruitId : fruitBowl.getFruitIds()) {
                if (menuItemRepository.existsById(fruitId)) {
                    validFruitIds.add(fruitId);
                } else {
                    System.out.println("⚠️ Skipping invalid fruit ID: " + fruitId);
                }
            }
        }

        // 🧽 Also remove any now-invalid fruit IDs that were already saved earlier
        if (existing.getFruitIds() != null && !existing.getFruitIds().isEmpty()) {
            List<String> cleanedExisting = new ArrayList<>();
            for (String oldId : existing.getFruitIds()) {
                if (menuItemRepository.existsById(oldId)) {
                    cleanedExisting.add(oldId);
                } else {
                    System.out.println("🧹 Removing old invalid fruit ID: " + oldId);
                }
            }
            existing.setFruitIds(cleanedExisting);
        }

        // ✅ Merge new valid fruit IDs (replace or combine based on your preference)
        if (!validFruitIds.isEmpty()) {
            existing.setFruitIds(validFruitIds);
        }

        // ✅ Update other editable fields safely
        if (fruitBowl.getFruitCount() != 0) {
            existing.setFruitCount(fruitBowl.getFruitCount());
        }
        if (fruitBowl.getType() != null) {
            existing.setType(fruitBowl.getType());
        }
        if (fruitBowl.getPrice() != null) {
            existing.setPrice(fruitBowl.getPrice());
        }
        if (fruitBowl.getIsActive() != null) {
            existing.setIsActive(fruitBowl.getIsActive());
        }

        System.out.println("✅ Saving updated fruit bowl: " + existing.getId());
        return fruitBowlRepository.save(existing);
    }


    // ✅ Add fruits to the bowl
    public CustomizeFruiteBowl addFruits(String bowlId, List<String> fruitIdsToAdd) {
        CustomizeFruiteBowl existing = fruitBowlRepository.findById(bowlId)
                .orElseThrow(() -> new RuntimeException("Fruit bowl not found with id: " + bowlId));

        List<String> currentFruits = existing.getFruitIds() == null
                ? new ArrayList<>()
                : new ArrayList<>(existing.getFruitIds());

        for (String fruitId : fruitIdsToAdd) {
            if (!menuItemRepository.existsById(fruitId)) {
                throw new RuntimeException("Invalid fruit ID: " + fruitId);
            }
            if (!currentFruits.contains(fruitId)) {
                currentFruits.add(fruitId);
            }
        }

        existing.setFruitIds(currentFruits);
        return fruitBowlRepository.save(existing);
    }

    // ✅ Remove fruits from the bowl
    public CustomizeFruiteBowl deleteFruits(String bowlId, List<String> fruitIdsToRemove) {
        CustomizeFruiteBowl existing = fruitBowlRepository.findById(bowlId)
                .orElseThrow(() -> new RuntimeException("Fruit bowl not found with id: " + bowlId));

        if (existing.getFruitIds() != null && !existing.getFruitIds().isEmpty()) {
            existing.getFruitIds().removeAll(fruitIdsToRemove);
        }

        return fruitBowlRepository.save(existing);
    }

    // ✅ Get all fruit bowls
    public List<CustomizeFruiteBowl> getAllFruitBowls() {
        return fruitBowlRepository.findAll();
    }

    // ✅ Get a specific fruit bowl by ID
    public Optional<CustomizeFruiteBowl> getFruitBowlById(String id) {
        return fruitBowlRepository.findById(id);
    }

    // ✅ Delete a fruit bowl completely
    public void deleteFruitBowl(String id) {
        if (!fruitBowlRepository.existsById(id)) {
            throw new RuntimeException("Fruit bowl not found with id: " + id);
        }
        fruitBowlRepository.deleteById(id);
    }
}
