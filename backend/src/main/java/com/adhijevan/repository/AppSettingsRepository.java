package com.adhijevan.repository;

import com.adhijevan.model.AppSettings;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppSettingsRepository extends MongoRepository<AppSettings, String> {
    
    // Find the first (and should be only) settings record
    Optional<AppSettings> findFirstByOrderByCreatedAtDesc();
    
    // Check if any settings exist
    boolean existsByIdIsNotNull();
}