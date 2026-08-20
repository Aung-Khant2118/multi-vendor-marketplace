package com.group5.marketplace.wishlist.controller;

import com.group5.marketplace.user.util.CurrentUserService;
import com.group5.marketplace.wishlist.dto.WishlistItemRequest;
import com.group5.marketplace.wishlist.dto.WishlistResponse;
import com.group5.marketplace.wishlist.service.WishlistService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class WishlistController {

    private final WishlistService wishlistService;
    private final CurrentUserService currentUserService;

    public WishlistController(WishlistService wishlistService, CurrentUserService currentUserService) {
        this.wishlistService = wishlistService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/wishlist")
    public ResponseEntity<Map<String, Object>> getWishlist(Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", wishlistService.getWishlist(userId));
        return ResponseEntity.ok(body);
    }

    @PostMapping("/wishlist/items")
    public ResponseEntity<Map<String, Object>> addItem(@Valid @RequestBody WishlistItemRequest request, Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        WishlistResponse wishlist = wishlistService.addItem(userId, request.getProductId());
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Product added to wishlist");
        body.put("data", wishlist);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @DeleteMapping("/wishlist/items/{id}")
    public ResponseEntity<Map<String, Object>> removeItem(@PathVariable Long id, Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        WishlistResponse wishlist = wishlistService.removeItem(userId, id);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Product removed from wishlist");
        body.put("data", wishlist);
        return ResponseEntity.ok(body);
    }
}
