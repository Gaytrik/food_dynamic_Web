package com.adhijevan.service;

import com.adhijevan.model.CustomizeBox;
import com.adhijevan.repository.CustomizeBoxRepository;
import com.adhijevan.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CustomizeBoxService {

    @Autowired
    private CustomizeBoxRepository customizeRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    // ✅ Save new box
   public CustomizeBox saveBox(CustomizeBox customizeBox) {
    if (customizeBox.getRotiType() == null || customizeBox.getRotiType().isEmpty()) {
        System.out.println("⚠️ RotiType is empty while saving!");
    } else {
        System.out.println("✅ Saving box with rotiType: " + customizeBox.getRotiType());
    }
    return customizeRepository.save(customizeBox);
}


    // ✅ Update basic details + sabji list (with validation and merge)
    public CustomizeBox updateBox(String id, CustomizeBox customizeBox) {
        // Find existing CustomizeBox
        CustomizeBox existingBox = customizeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("CustomizeBox not found with id: " + id));

        // Replace sabjiId list with new list (if provided)
        if (customizeBox.getSabjiId() != null) {
            List<String> newSabjiIds = customizeBox.getSabjiId();
            // Validate sabji IDs
            for (String sabjiId : newSabjiIds) {
                if (!menuItemRepository.existsById(sabjiId)) {
                    throw new IllegalArgumentException("Invalid sabji ID: " + sabjiId);
                }
            }
            existingBox.setSabjiId(new ArrayList<>(newSabjiIds)); // Replace with new list
        }

        // Replace rotiType list with new list (if provided)
       // ✅ Always update rotiType (even if list is empty)
existingBox.setRotiType(
        customizeBox.getRotiType() != null
                ? new ArrayList<>(customizeBox.getRotiType())
                : new ArrayList<>()
);


        // Update other fields if provided
        if (customizeBox.getSabjiCount() != 0) {
            existingBox.setSabjiCount(customizeBox.getSabjiCount());
        }
        if (customizeBox.getPrice() != null) {
            existingBox.setPrice(customizeBox.getPrice());
        }
        if (customizeBox.getChapptiCount() != 0) {
            existingBox.setChapptiCount(customizeBox.getChapptiCount());
        }
        if (customizeBox.getIsRice() != null) {
            existingBox.setIsRice(customizeBox.getIsRice());
        }
        if (customizeBox.getIsDesert() != null) {
            existingBox.setIsDesert(customizeBox.getIsDesert());
        }
        if (customizeBox.getIsActive() != null) {
            existingBox.setIsActive(customizeBox.getIsActive());
        }
        if (customizeBox.getDesertCount() != 0) {
            existingBox.setDesertCount(customizeBox.getDesertCount());
        }

        // Save and return updated CustomizeBox
        return customizeRepository.save(existingBox);
    }
    // ✅ Add new sabji IDs (explicitly without other field updates)
    public CustomizeBox addSabjis(String boxId, List<String> sabjiIdsToAdd) {
        CustomizeBox existingBox = customizeRepository.findById(boxId)
                .orElseThrow(() -> new RuntimeException("CustomizeBox not found with id: " + boxId));

        List<String> current = existingBox.getSabjiId() == null ? new ArrayList<>() : new ArrayList<>(existingBox.getSabjiId());

        for (String sabjiId : sabjiIdsToAdd) {
            if (!menuItemRepository.existsById(sabjiId)) {
                throw new RuntimeException("Invalid sabji ID: " + sabjiId);
            }
            if (!current.contains(sabjiId)) {
                current.add(sabjiId);
            }
        }

        existingBox.setSabjiId(current);
        return customizeRepository.save(existingBox);
    }

    // ✅ Delete sabji IDs from list
    public CustomizeBox deleteSabjis(String boxId, List<String> sabjiIdsToRemove) {
        CustomizeBox existingBox = customizeRepository.findById(boxId)
                .orElseThrow(() -> new RuntimeException("CustomizeBox not found with id: " + boxId));

        if (existingBox.getSabjiId() != null && !existingBox.getSabjiId().isEmpty()) {
            existingBox.getSabjiId().removeAll(sabjiIdsToRemove);
        }

        return customizeRepository.save(existingBox);
    }

    // ✅ Get all boxes
    public List<CustomizeBox> getAllBoxes() {
        return customizeRepository.findAll();
    }

    // ✅ Get box by ID
    public Optional<CustomizeBox> getBoxById(String id) {
        return customizeRepository.findById(id);
    }
}
