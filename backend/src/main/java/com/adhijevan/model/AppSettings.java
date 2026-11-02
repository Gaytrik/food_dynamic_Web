package com.adhijevan.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "app_settings")
public class AppSettings {

    @Id
    private String id;

    // GST Configuration
    private Double gstPercentage;

    // Delivery Configuration
    private Double deliveryChargeAmount;
    private Double freeDeliveryThreshold;

    // Metadata
    private String updatedBy; // Admin user who made the change
    private Instant createdAt;
    private Instant updatedAt;

    // Default constructor with default values
    public AppSettings(Double gstPercentage, Double deliveryChargeAmount, Double freeDeliveryThreshold) {
        this.gstPercentage = gstPercentage != null ? gstPercentage : 5.0; // Default 5%
        this.deliveryChargeAmount = deliveryChargeAmount != null ? deliveryChargeAmount : 50.0; // Default ₹50
        this.freeDeliveryThreshold = freeDeliveryThreshold != null ? freeDeliveryThreshold : 150.0; // Default ₹150
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // Method to calculate delivery charge based on subtotal
    public Double calculateDeliveryCharge(Double subtotal) {
        if (subtotal == null || subtotal < 0) {
            return deliveryChargeAmount;
        }
        return subtotal >= freeDeliveryThreshold ? 0.0 : deliveryChargeAmount;
    }

    // Method to calculate GST amount
    public Double calculateGstAmount(Double subtotal) {
        if (subtotal == null || subtotal < 0) {
            return 0.0;
        }
        return subtotal * (gstPercentage / 100.0);
    }

    // Update timestamps
    public void updateTimestamp() {
        this.updatedAt = Instant.now();
    }
}