package com.adhijevan.controller;

import com.adhijevan.model.Reviews;
import com.adhijevan.service.ReviewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewsController {

    @Autowired
    private ReviewsService reviewsService;

    // ✅ CREATE Review
    @PostMapping("/{menuId}")
    public ResponseEntity<?> createReview(
            @PathVariable String menuId,
            @RequestBody Reviews review
    ) {
        try {
            Reviews saved = reviewsService.createReview(menuId, review);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ READ all reviews for a menu
    @GetMapping("/{menuId}")
    public ResponseEntity<?> getReviewsForMenu(@PathVariable String menuId) {
        try {
            List<Reviews> reviews = reviewsService.getReviewsForMenuItem(menuId);
            return ResponseEntity.ok(reviews);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // ✅ UPDATE user review
    @PutMapping("/{menuId}/{userId}")
    public ResponseEntity<?> updateUserReview(
            @PathVariable String menuId,
            @PathVariable String userId,
            @RequestBody Reviews updatedReview
    ) {
        try {
            Reviews updated = reviewsService.updateUserReview(menuId, userId, updatedReview);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ DELETE user review
    @DeleteMapping("/{menuId}/{userId}")
    public ResponseEntity<?> deleteUserReview(
            @PathVariable String menuId,
            @PathVariable String userId
    ) {
        try {
            String msg = reviewsService.deleteUserReview(menuId, userId);
            return ResponseEntity.ok(msg);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
}
