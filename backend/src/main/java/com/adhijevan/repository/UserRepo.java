package com.adhijevan.repository;

import com.adhijevan.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepo extends MongoRepository<User, Object> {
    Optional<User> findByEmail(String useremail);

    Page<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrNumberContaining(String query, String query1, String query2, Pageable pageable);
}