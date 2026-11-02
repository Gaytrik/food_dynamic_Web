package com.adhijevan.controller;

import com.adhijevan.model.AppSettings;
import com.adhijevan.service.AppSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class AppSettingsController {

    @Autowired
    private AppSettingsService appSettingsService;

    // Get current app settings
    @GetMapping
    public ResponseEntity<AppSettings> getCurrentSettings() {
        try {
            AppSettings settings = appSettingsService.getCurrentSettings();
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Update app settings (Admin only)
    @PutMapping
    public ResponseEntity<Map<String, Object>> updateSettings(
            @RequestBody AppSettings newSettings,
            @RequestParam(required = false, defaultValue = "admin") String updatedBy) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate input
            if (newSettings.getGstPercentage() != null && 
                (newSettings.getGstPercentage() < 0 || newSettings.getGstPercentage() > 50)) {
                response.put("success", false);
                response.put("message", "GST percentage must be between 0% and 50%");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (newSettings.getDeliveryChargeAmount() != null && newSettings.getDeliveryChargeAmount() < 0) {
                response.put("success", false);
                response.put("message", "Delivery charge cannot be negative");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (newSettings.getFreeDeliveryThreshold() != null && newSettings.getFreeDeliveryThreshold() < 0) {
                response.put("success", false);
                response.put("message", "Free delivery threshold cannot be negative");
                return ResponseEntity.badRequest().body(response);
            }

            AppSettings updatedSettings = appSettingsService.updateSettings(newSettings, updatedBy);
            
            response.put("success", true);
            response.put("message", "Settings updated successfully");
            response.put("data", updatedSettings);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating settings: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Get pricing breakdown for a given subtotal
    @GetMapping("/pricing-breakdown")
    public ResponseEntity<AppSettingsService.PricingBreakdown> getPricingBreakdown(
            @RequestParam Double subtotal) {
        try {
            if (subtotal < 0) {
                return ResponseEntity.badRequest().build();
            }
            
            AppSettingsService.PricingBreakdown breakdown = appSettingsService.getPricingBreakdown(subtotal);
            return ResponseEntity.ok(breakdown);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get just the GST percentage
    @GetMapping("/gst")
    public ResponseEntity<Map<String, Double>> getGstPercentage() {
        try {
            Double gstPercentage = appSettingsService.getGstPercentage();
            Map<String, Double> response = new HashMap<>();
            response.put("gstPercentage", gstPercentage);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get delivery charge for a given subtotal
    @GetMapping("/delivery-charge")
    public ResponseEntity<Map<String, Double>> getDeliveryCharge(@RequestParam Double subtotal) {
        try {
            if (subtotal < 0) {
                return ResponseEntity.badRequest().build();
            }
            
            Double deliveryCharge = appSettingsService.getDeliveryCharge(subtotal);
            Map<String, Double> response = new HashMap<>();
            response.put("deliveryCharge", deliveryCharge);
            response.put("subtotal", subtotal);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}