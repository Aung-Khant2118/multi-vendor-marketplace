package com.group5.marketplace.order.controller;

import com.group5.marketplace.order.dto.AddToCartRequest;
import com.group5.marketplace.order.dto.CartResponse;
import com.group5.marketplace.order.service.OrderService;
import com.group5.marketplace.user.util.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CartController {

    private final OrderService orderService;
    private final CurrentUserService currentUserService;

    public CartController(OrderService orderService, CurrentUserService currentUserService) {
        this.orderService = orderService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/cart")
    public ResponseEntity<Map<String, Object>> getCart(Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", orderService.getCart(userId));
        return ResponseEntity.ok(body);
    }

    @PostMapping("/cart")
    public ResponseEntity<Map<String, Object>> addToCart(@Valid @RequestBody AddToCartRequest request, Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", orderService.addToCart(userId, request));
        return ResponseEntity.ok(body);
    }
}