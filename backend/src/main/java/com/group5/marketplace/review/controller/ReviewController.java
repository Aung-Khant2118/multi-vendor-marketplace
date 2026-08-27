package com.group5.marketplace.review.controller;

import com.group5.marketplace.review.dto.ProductRatingResponse;
import com.group5.marketplace.review.dto.ReviewRequest;
import com.group5.marketplace.review.dto.ReviewResponse;
import com.group5.marketplace.review.service.ReviewService;
import com.group5.marketplace.user.util.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;
    private final CurrentUserService currentUserService;

    public ReviewController(ReviewService reviewService, CurrentUserService currentUserService) {
        this.reviewService = reviewService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/reviews")
    public ResponseEntity<Map<String, Object>> submitReview(
            @Valid @RequestBody ReviewRequest request,
            Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        ReviewResponse review = reviewService.submitReview(userId, request);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Review submitted successfully");
        body.put("data", review);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/products/{id}/reviews")
    public ResponseEntity<Map<String, Object>> getProductReviews(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ReviewResponse> reviews = reviewService.getProductReviews(id, page, size);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", reviews.getContent());
        body.put("totalElements", reviews.getTotalElements());
        body.put("totalPages", reviews.getTotalPages());
        body.put("currentPage", reviews.getNumber());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/products/{id}/rating")
    public ResponseEntity<Map<String, Object>> getProductRating(@PathVariable Long id) {
        ProductRatingResponse rating = reviewService.getProductRating(id);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", rating);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/products/{id}/reviewed")
    public ResponseEntity<Map<String, Object>> hasReviewed(
            @PathVariable Long id,
            Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        boolean reviewed = reviewService.hasUserReviewedProduct(userId, id);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", reviewed);
        return ResponseEntity.ok(body);
    }
}
