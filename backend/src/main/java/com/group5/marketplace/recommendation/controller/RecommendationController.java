package com.group5.marketplace.recommendation.controller;

import com.group5.marketplace.recommendation.service.RecommendationService;
import com.group5.marketplace.user.util.CurrentUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final CurrentUserService currentUserService;

    public RecommendationController(RecommendationService recommendationService,
                                     CurrentUserService currentUserService) {
        this.recommendationService = recommendationService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/recommendations")
    public ResponseEntity<Map<String, Object>> getRecommendations(
            @RequestParam(defaultValue = "for_you") String tab,
            @RequestParam(defaultValue = "20") int limit,
            Principal principal) {
        Long userId = null;
        if (principal != null) {
            try {
                userId = currentUserService.getCurrentUserId(principal);
            } catch (Exception e) {
                // Unauthenticated user - return generic recommendations
            }
        }
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", recommendationService.getRecommendations(userId, tab, limit));
        return ResponseEntity.ok(body);
    }
}
