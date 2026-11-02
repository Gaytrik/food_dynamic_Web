package com.adhijevan.controller;

import com.adhijevan.model.MenuItem;
import com.adhijevan.service.MenuItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.io.IOException;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "*")
public class MenuItemController {

    @Autowired
    private MenuItemService service;

    @Autowired
    private MongoTemplate mongoTemplate;

    // ✅ ADD THIS NEW ENDPOINT for JSON updates (without image)
    @PutMapping("/{id}/status")
    public ResponseEntity<MenuItem> updateMenuItemStatus(
            @PathVariable String id,
            @RequestBody MenuItem update) {
        try {
            System.out.println("🔄 STATUS UPDATE request for ID: " + id);
            System.out.println("📤 Received status data: " + update);

            // Get existing item
            MenuItem existingItem = service.getMenuItemById(id);
            
            // Update only the available status
            existingItem.setAvailable(update.isAvailable());
            
            // Save the updated item
            MenuItem saved = service.updateMenuItem(id, existingItem, null);
            
            System.out.println("✅ STATUS UPDATE successful: " + saved.isAvailable());
            return ResponseEntity.ok(saved);

        } catch (RuntimeException e) {
            System.out.println("❌ STATUS UPDATE failed: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.out.println("❌ STATUS UPDATE error: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    // ✅ ADD THIS: JSON-only update endpoint
    @PutMapping("/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(
            @PathVariable String id,
            @RequestBody MenuItem update) {
        try {
            System.out.println("🔄 JSON UPDATE request for ID: " + id);
            System.out.println("📤 Received JSON data: " + update);

            MenuItem saved = service.updateMenuItem(id, update, null);
            System.out.println("✅ JSON UPDATE successful: " + saved.isAvailable());
            return ResponseEntity.ok(saved);

        } catch (RuntimeException e) {
            System.out.println("❌ JSON UPDATE failed: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.out.println("❌ JSON UPDATE error: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    // ✅ KEEP existing endpoint for FormData updates (with image)
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<MenuItem> updateMenuItemWithImage(
            @PathVariable String id,
            @RequestPart("menu") MenuItem update,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            System.out.println("🔄 UPDATE WITH IMAGE request for ID: " + id);
            System.out.println("📤 Received data: " + update);

            MenuItem saved = service.updateMenuItem(id, update, image);
            System.out.println("✅ UPDATE WITH IMAGE successful: " + saved.getImageUrl());
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // ✅ EXISTING: Image upload endpoint
    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, String> response = new HashMap<>();

            if (file.isEmpty()) {
                response.put("error", "File is empty");
                return ResponseEntity.badRequest().body(response);
            }

            // Use your existing service method to handle image upload
            MenuItem tempItem = new MenuItem();
            tempItem.setMenuName("temp");

            // This will trigger the Cloudinary upload in your service
            MenuItem saved = service.saveMenuItem(tempItem, file);

            response.put("imageUrl", saved.getImageUrl());
            response.put("message", "Image uploaded successfully");
            response.put("filename", file.getOriginalFilename());

            // Delete the temporary item
            service.deleteMenuItem(saved.getId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // ✅ EXISTING: Add endpoint for JSON data (without file upload)
    @PostMapping("/add")
    public ResponseEntity<MenuItem> addMenuItem(@RequestBody MenuItem menuItem) {
        try {
            // For now, save without image
            MenuItem saved = service.saveMenuItem(menuItem, null);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // ✅ EXISTING: Keep your existing endpoint for file upload
    @PostMapping(value = "/add-with-image", consumes = {"multipart/form-data"})
    public ResponseEntity<MenuItem> addMenuItemWithImage(
            @RequestPart("menuItem") MenuItem menuItem,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            MenuItem saved = service.saveMenuItem(menuItem, file);
            return ResponseEntity.ok(saved);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // ✅ EXISTING: Get all menu items
    @GetMapping("/all")
    public List<MenuItem> getAllMenuItems() {
        return service.getAllMenuItems();
    }

    // ✅ EXISTING: Filter menu items
    @GetMapping("/filter")
    public List<MenuItem> filterMenuItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String subCategory,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {

        Query query = new Query();
        if (category != null) query.addCriteria(Criteria.where("menuCategory").is(category));
        if (subCategory != null) query.addCriteria(Criteria.where("menuSubCategory").is(subCategory));
        if (minPrice != null && maxPrice != null) query.addCriteria(Criteria.where("price").gte(minPrice).lte(maxPrice));

        return mongoTemplate.find(query, MenuItem.class);
    }

    @GetMapping
    public ResponseEntity<Page<MenuItem>> getAllMenuItems(
            @RequestParam(required = false) String query,
            Pageable pageable) {
        try {
            Page<MenuItem> items;

            if (query == null || query.trim().isEmpty()) {
                // Normal pagination
                items = service.getAllMenuItems1(pageable);
            } else {
                // Global search (name, category, review)
                items = service.searchMenuItems1(query.trim(), pageable);
            }

            return ResponseEntity.ok(items);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }


    // ✅ EXISTING: Get single menu item by ID
    @GetMapping("/{id}")
    public ResponseEntity<MenuItem> getMenuItem(@PathVariable String id) {
        try {
            MenuItem item = service.getMenuItemById(id);
            return ResponseEntity.ok(item);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ EXISTING: Delete menu item
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable String id) {
        try {
            service.deleteMenuItem(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ EXISTING: Today's Menu endpoints
    @GetMapping("/todays-menu")
    public ResponseEntity<List<MenuItem>> getTodaysMenu() {
        try {
            List<MenuItem> todaysMenu = service.getTodaysMenu();
            return ResponseEntity.ok(todaysMenu);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // ✅ EXISTING: Set today's menu
    @PostMapping("/todays-menu")
    public ResponseEntity<Map<String, String>> setTodaysMenu(@RequestBody Map<String, List<String>> request) {
        try {
            List<String> menuItemIds = request.get("menuItemIds");
            
            if (menuItemIds == null || menuItemIds.size() == 0 || menuItemIds.size() > 5) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Select between 1 and 5 menu items");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            service.setTodaysMenu(menuItemIds);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Today's menu updated successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Failed to update today's menu");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}