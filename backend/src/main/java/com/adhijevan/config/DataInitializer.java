package com.adhijevan.config;

import com.adhijevan.service.AppSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private AppSettingsService appSettingsService;

    @Override
    public void run(String... args) throws Exception {
        // Initialize default settings if none exist
        try {
            appSettingsService.getCurrentSettings();
            System.out.println("✅ App settings initialized successfully");
        } catch (Exception e) {
            System.err.println("❌ Error initializing app settings: " + e.getMessage());
        }
    }
}