package com.adhijevan.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.adhijevan.model.MenuItem;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MenuItemRepository extends MongoRepository<MenuItem, String> {
    List<MenuItem> findByMenuCategory(String menuCategory);
    List<MenuItem> findByMenuSubCategory(String menuSubCategory);
    
    // Today's Menu queries
    List<MenuItem> findByIsTodaysSpecialTrue();
    List<MenuItem> findByIsTodaysSpecialTrueAndTodaysMenuDateOrderByTodaysMenuPosition(String date);

    @Query("{ '$or': [ " +
            "{ 'menuName': { $regex: ?0, $options: 'i' } }, " +
            "{ 'menuCategory': { $regex: ?0, $options: 'i' } }, " +
            "{ 'reviews.reviewText': { $regex: ?0, $options: 'i' } } " +
            "] }")
    Page<MenuItem> searchByNameCategoryOrReview(@Param("query") String query, Pageable pageable);


}