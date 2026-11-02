package com.adhijevan.repository;

import com.adhijevan.model.AddToCart;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AddToCartRepository extends MongoRepository<AddToCart, String> {


    Optional<AddToCart> findByUserIdAndIsActive(String userId, Boolean isActive);

    Optional<AddToCart> findByUserId(String userID);

    void deleteByUserId(String userId);
}
