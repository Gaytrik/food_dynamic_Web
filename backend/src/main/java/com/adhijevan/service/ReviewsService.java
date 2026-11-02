package com.adhijevan.service;

import com.adhijevan.Enums.Role;
import com.adhijevan.model.MenuItem;
import com.adhijevan.model.Reviews;
import com.adhijevan.model.User;
import com.adhijevan.repository.MenuItemRepository;
import com.adhijevan.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewsService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private UserRepo userRepo;

    // ✅ CREATE - Only one review per user per menu item
    public Reviews createReview(String menuId, Reviews review) {
        Optional<User> optionalUser = userRepo.findById(review.getUserID());
        Optional<MenuItem> optionalMenu = menuItemRepository.findById(menuId);

        if (optionalUser.isEmpty() || optionalMenu.isEmpty()) {
            throw new RuntimeException("User or Menu item not found!");
        }

        User user = optionalUser.get();
        MenuItem menuItem = optionalMenu.get();

        // ✅ Verify purchase
        boolean hasPurchased = user.getPurchaseHistories().stream()
                .anyMatch(p -> p.getMenuId().equals(menuId));

        if (!hasPurchased) {
            throw new RuntimeException("User has not purchased this item. Review not allowed!");
        }

        // ✅ Ensure user has not already reviewed this item
        if (menuItem.getReviews() != null &&
                menuItem.getReviews().stream().anyMatch(r -> r.getUserID().equals(review.getUserID()))) {
            throw new RuntimeException("You have already reviewed this menu item!");
        }

        // ✅ Add review to menu item
        if (menuItem.getReviews() != null) {
            menuItem.getReviews().add(review);
        } else {
            menuItem.setReviews(List.of(review));
        }

        menuItemRepository.save(menuItem);
        return review;
    }

    // ✅ READ - Get all reviews for a menu item
    public List<Reviews> getReviewsForMenuItem(String menuId) {
        MenuItem menuItem = menuItemRepository.findById(menuId)
                .orElseThrow(() -> new RuntimeException("Menu item not found!"));
        return menuItem.getReviews();
    }

    // ✅ UPDATE - User can only update their own review
    public Reviews updateUserReview(String menuId, String userId, Reviews updatedReview) {
        MenuItem menuItem = menuItemRepository.findById(menuId)
                .orElseThrow(() -> new RuntimeException("Menu item not found!"));

        if (menuItem.getReviews() == null || menuItem.getReviews().isEmpty()) {
            throw new RuntimeException("No reviews exist for this menu item!");
        }

        boolean updated = false;

        for (Reviews r : menuItem.getReviews()) {
            if (r.getUserID().equals(userId)) {
                r.setRating(updatedReview.getRating());
                r.setReviewText(updatedReview.getReviewText());
                r.setIsActive(updatedReview.getIsActive());
                updated = true;
                break;
            }
        }

        if (!updated) {
            throw new RuntimeException("You have no existing review for this menu item!");
        }

        menuItemRepository.save(menuItem);
        return updatedReview;
    }

    // ✅ DELETE - User or Admin can delete
    public String deleteUserReview(String menuId, String userId) {
        MenuItem menuItem = menuItemRepository.findById(menuId)
                .orElseThrow(() -> new RuntimeException("Menu item not found!"));
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        if (menuItem.getReviews() == null || menuItem.getReviews().isEmpty()) {
            throw new RuntimeException("No reviews found to delete!");
        }

        // Check if review exists
        boolean reviewExists = menuItem.getReviews().stream()
                .anyMatch(r -> r.getUserID().equals(userId));

        if (!reviewExists) {
            throw new RuntimeException("No review found for this user on this menu!");
        }

        // Allow admin or owner to delete
        if (user.getRole() != Role.ADMIN) {
            menuItem.getReviews().removeIf(r -> r.getUserID().equals(userId));
        } else {
            // admin can delete any review
            menuItem.getReviews().removeIf(r -> r.getUserID().equals(userId));
        }

        menuItemRepository.save(menuItem);
        return "Review deleted successfully!";
    }
}
