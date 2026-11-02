package com.adhijevan.service;

import com.adhijevan.model.MenuItem;
import com.adhijevan.repository.MenuItemRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@Service
public class MenuItemService {

    private final MenuItemRepository repository;
    private final CloudinaryService cloudinaryService;

    public MenuItemService(MenuItemRepository repository, CloudinaryService cloudinaryService) {
        this.repository = repository;
        this.cloudinaryService = cloudinaryService;
    }

    // ✅ EXISTING: Save menu item with optional image
    public MenuItem saveMenuItem(MenuItem menuItem, MultipartFile image) throws IOException {
        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService.uploadFile(image);
            menuItem.setImageUrl(imageUrl);
        }
        return repository.save(menuItem);
    }

    // ✅ EXISTING: Get all menu items
    public List<MenuItem> getAllMenuItems() {
        return repository.findAll();
    }


    public Page<MenuItem> getAllMenuItems1(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public Page<MenuItem> searchMenuItems1(String query, Pageable pageable) {
        return repository.searchByNameCategoryOrReview(query, pageable);
    }

    // ✅ EXISTING: Get menu item by ID
    public MenuItem getMenuItemById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found with ID: " + id));
    }

    // ✅ EXISTING: Update menu item with optional new image
    public MenuItem updateMenuItem(String id, MenuItem updatedMenuItem, MultipartFile newImage) {
        try {
            MenuItem existing = getMenuItemById(id);

            // Update fields if provided
            if (updatedMenuItem.getMenuName() != null)
                existing.setMenuName(updatedMenuItem.getMenuName());

            if (updatedMenuItem.getDescription() != null)
                existing.setDescription(updatedMenuItem.getDescription());

            if (updatedMenuItem.getMenuCategory() != null)
                existing.setMenuCategory(updatedMenuItem.getMenuCategory());

            if (updatedMenuItem.getMenuSubCategory() != null)
                existing.setMenuSubCategory(updatedMenuItem.getMenuSubCategory());

            if (updatedMenuItem.getPrice() != 0)
                existing.setPrice(updatedMenuItem.getPrice());

            if (updatedMenuItem.getPreparationTime() != null)
                existing.setPreparationTime(updatedMenuItem.getPreparationTime());

            if (updatedMenuItem.getSpiceLevel() != null)
                existing.setSpiceLevel(updatedMenuItem.getSpiceLevel());

            if (updatedMenuItem.getAvailability() != null && !updatedMenuItem.getAvailability().isEmpty())
                existing.setAvailability(updatedMenuItem.getAvailability());

            // ✅ IMPORTANT: Update available status
            existing.setAvailable(updatedMenuItem.isAvailable());

            // Handle image update
            if (newImage != null && !newImage.isEmpty()) {
                if (existing.getImageUrl() != null && !existing.getImageUrl().isEmpty()) {
                    try {
                        cloudinaryService.deleteByUrl(existing.getImageUrl());
                    } catch (Exception e) {
                        System.err.println("⚠️ Failed to delete old image: " + e.getMessage());
                    }
                }
                String newImageUrl = cloudinaryService.uploadFile(newImage);
                existing.setImageUrl(newImageUrl);
            }

            return repository.save(existing);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update menu item: " + e.getMessage());
        }
    }

    // ✅ EXISTING: Delete menu item
    public void deleteMenuItem(String id) {
        MenuItem menuItem = getMenuItemById(id);

        if (menuItem.getImageUrl() != null && !menuItem.getImageUrl().isEmpty()) {
            try {
                cloudinaryService.deleteByUrl(menuItem.getImageUrl());
            } catch (Exception e) {
                System.err.println("⚠️ Failed to delete image from Cloudinary: " + e.getMessage());
            }
        }
        repository.deleteById(id);
    }

    // ✅ EXISTING: Get by category
    public List<MenuItem> getByCategory(String category) {
        return repository.findByMenuCategory(category);
    }

    // ✅ EXISTING: Get by sub-category
    public List<MenuItem> getBySubCategory(String subCategory) {
        return repository.findByMenuSubCategory(subCategory);
    }

    // ✅ EXISTING: Today's Menu methods
    public List<MenuItem> getTodaysMenu() {
        try {
            String today = java.time.LocalDate.now().toString();
            List<MenuItem> todaysMenu = repository.findByIsTodaysSpecialTrueAndTodaysMenuDateOrderByTodaysMenuPosition(today);
            
            // If no items selected for today, return first 5 items as fallback
            if (todaysMenu.isEmpty()) {
                List<MenuItem> allItems = repository.findAll();
                return allItems.stream().limit(5).collect(java.util.stream.Collectors.toList());
            }
            
            return todaysMenu;
        } catch (Exception e) {
            // Fallback to first 5 items
            List<MenuItem> allItems = repository.findAll();
            return allItems.stream().limit(5).collect(java.util.stream.Collectors.toList());
        }
    }

    // ✅ EXISTING: Set today's menu
    public void setTodaysMenu(List<String> menuItemIds) {
        try {
            String today = java.time.LocalDate.now().toString();
            
            // Clear previous today's menu
            clearTodaysMenu();
            
            // Set new today's menu
            for (int i = 0; i < menuItemIds.size(); i++) {
                String itemId = menuItemIds.get(i);
                MenuItem item = getMenuItemById(itemId);
                
                item.setIsTodaysSpecial(true);
                item.setTodaysMenuPosition(i + 1);
                item.setTodaysMenuDate(today);
                
                repository.save(item);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to set today's menu: " + e.getMessage());
        }
    }

    // ✅ EXISTING: Clear today's menu
    private void clearTodaysMenu() {
        try {
            List<MenuItem> currentTodaysMenu = repository.findByIsTodaysSpecialTrue();
            for (MenuItem item : currentTodaysMenu) {
                item.setIsTodaysSpecial(false);
                item.setTodaysMenuPosition(null);
                item.setTodaysMenuDate(null);
                repository.save(item);
            }
        } catch (Exception e) {
            System.err.println("Error clearing today's menu: " + e.getMessage());
        }
    }
}