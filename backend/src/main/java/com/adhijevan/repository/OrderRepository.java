package com.adhijevan.repository;

import com.adhijevan.model.Orders;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Orders, String> {
    
    // Existing methods...
    List<Orders> findByUserId(String userId);
    List<Orders> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Orders> findByPaymentStatus(String paymentStatus);
    List<Orders> findByOrderStatus(String orderStatus);
    List<Orders> findByUserIdAndOrderStatus(String userId, String orderStatus);
    
    // ✅ ADD THIS NEW METHOD
    Orders findByAdhijevanOrderId(String adhijevanOrderId);
    
    @Query("{ 'userId': ?0 }")
    List<Orders> findRecentOrdersByUser(String userId);

    Page<Orders> findByCustomerNameContainingIgnoreCaseOrCustomerPhoneContainingIgnoreCaseOrAdhijevanOrderIdContainingIgnoreCase(String search, String search1, String search2, Pageable pageable);

    Page<Orders> findByCreatedAtBetween(LocalDateTime localDateTime, LocalDateTime localDateTime1, Pageable pageable);

    Page<Orders> findByOrderStatusIgnoreCase(String status, Pageable pageable);
}