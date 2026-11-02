package com.adhijevan.repository;

import com.adhijevan.model.CustomizeBox;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CustomizeBoxRepository extends MongoRepository<CustomizeBox, String> {
}
