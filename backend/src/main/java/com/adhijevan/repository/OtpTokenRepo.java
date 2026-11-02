package com.adhijevan.repository;

import com.adhijevan.model.OtpToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface OtpTokenRepo extends MongoRepository<OtpToken, Object> {


    Optional<OtpToken> findByEmail(String email);

    void deleteByEmail(String email);
}

