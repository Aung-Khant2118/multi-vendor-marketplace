package com.group5.marketplace.order.controller;

import com.group5.marketplace.order.dto.CreateOrderRequest;
import com.group5.marketplace.order.dto.OrderResponse;
import com.group5.marketplace.order.service.OrderService;
import com.group5.marketplace.user.util.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class OrderController {

    private final OrderService orderService;
    private final CurrentUserService currentUserService;

    public OrderController(OrderService orderService, CurrentUserService currentUserService) {
        this.orderService = orderService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/orders")
    public ResponseEntity<Map<String, Object>> checkout(@Valid @RequestBody CreateOrderRequest request, Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        OrderResponse order = orderService.checkout(userId, request);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Order placed successfully");
        body.put("data", order);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/orders")
    public ResponseEntity<Map<String, Object>> list(Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        List<OrderResponse> orders = orderService.getOrders(userId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", orders);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable Long id, Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        OrderResponse order = orderService.getOrder(userId, id);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", order);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/orders/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancel(@PathVariable Long id, Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        OrderResponse order = orderService.cancelOrder(userId, id);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Order cancelled successfully");
        body.put("data", order);
        return ResponseEntity.ok(body);
    }
}