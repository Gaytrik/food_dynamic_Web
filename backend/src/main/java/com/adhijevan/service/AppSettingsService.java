package com.adhijevan.service;

import com.adhijevan.model.AppSettings;
import com.adhijevan.repository.AppSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
public class AppSettingsService {

    @Autowired
    private AppSettingsRepository appSettingsRepository;

    // Get current app settings (create default if none exist)
    public AppSettings getCurrentSettings() {
        Optional<AppSettings> settings = appSettingsRepository.findFirstByOrderByCreatedAtDesc();
        
        if (settings.isPresent()) {
            return settings.get();
        } else {
            // Create default settings if none exist
            AppSettings defaultSettings = new AppSettings(5.0, 50.0, 150.0);
            return appSettingsRepository.save(defaultSettings);
        }
    }

    // Update app settings
    public AppSettings updateSettings(AppSettings newSettings, String updatedBy) {
        AppSettings currentSettings = getCurrentSettings();
        
        // Update values
        if (newSettings.getGstPercentage() != null) {
            currentSettings.setGstPercentage(newSettings.getGstPercentage());
        }
        
        if (newSettings.getDeliveryChargeAmount() != null) {
            currentSettings.setDeliveryChargeAmount(newSettings.getDeliveryChargeAmount());
        }
        
        if (newSettings.getFreeDeliveryThreshold() != null) {
            currentSettings.setFreeDeliveryThreshold(newSettings.getFreeDeliveryThreshold());
        }
        
        // Update metadata
        currentSettings.setUpdatedBy(updatedBy);
        currentSettings.setUpdatedAt(Instant.now());
        
        return appSettingsRepository.save(currentSettings);
    }

    // Get GST percentage
    public Double getGstPercentage() {
        return getCurrentSettings().getGstPercentage();
    }

    // Get delivery charge for given subtotal
    public Double getDeliveryCharge(Double subtotal) {
        return getCurrentSettings().calculateDeliveryCharge(subtotal);
    }

    // Get GST amount for given subtotal
    public Double getGstAmount(Double subtotal) {
        return getCurrentSettings().calculateGstAmount(subtotal);
    }

    // Calculate total amount including GST and delivery
    public Double calculateTotalAmount(Double subtotal) {
        AppSettings settings = getCurrentSettings();
        Double gstAmount = settings.calculateGstAmount(subtotal);
        Double deliveryCharge = settings.calculateDeliveryCharge(subtotal);
        return subtotal + gstAmount + deliveryCharge;
    }

    // Get pricing breakdown
    public PricingBreakdown getPricingBreakdown(Double subtotal) {
        AppSettings settings = getCurrentSettings();
        Double gstAmount = settings.calculateGstAmount(subtotal);
        Double deliveryCharge = settings.calculateDeliveryCharge(subtotal);
        Double totalAmount = subtotal + gstAmount + deliveryCharge;
        
        return new PricingBreakdown(subtotal, gstAmount, deliveryCharge, totalAmount, 
                                  settings.getGstPercentage(), settings.getFreeDeliveryThreshold());
    }

    // Inner class for pricing breakdown response
    public static class PricingBreakdown {
        private Double subtotal;
        private Double gstAmount;
        private Double deliveryCharge;
        private Double totalAmount;
        private Double gstPercentage;
        private Double freeDeliveryThreshold;

        public PricingBreakdown(Double subtotal, Double gstAmount, Double deliveryCharge, 
                              Double totalAmount, Double gstPercentage, Double freeDeliveryThreshold) {
            this.subtotal = subtotal;
            this.gstAmount = gstAmount;
            this.deliveryCharge = deliveryCharge;
            this.totalAmount = totalAmount;
            this.gstPercentage = gstPercentage;
            this.freeDeliveryThreshold = freeDeliveryThreshold;
        }

        // Getters
        public Double getSubtotal() { return subtotal; }
        public Double getGstAmount() { return gstAmount; }
        public Double getDeliveryCharge() { return deliveryCharge; }
        public Double getTotalAmount() { return totalAmount; }
        public Double getGstPercentage() { return gstPercentage; }
        public Double getFreeDeliveryThreshold() { return freeDeliveryThreshold; }
    }
}