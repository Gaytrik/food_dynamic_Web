package com.adhijevan.repository;

import com.adhijevan.model.Delivery;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface DeliveryRepository extends MongoRepository<Delivery,Object> {
    Optional<Delivery> findByUserId();
}
