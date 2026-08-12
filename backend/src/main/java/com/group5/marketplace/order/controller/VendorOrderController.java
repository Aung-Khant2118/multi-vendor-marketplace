package com.group5.marketplace.order.controller;

import com.group5.marketplace.order.dto.OrderResponse;
import com.group5.marketplace.order.dto.UpdateOrderStatusRequest;
import com.group5.marketplace.order.service.OrderService;
import com.group5.marketplace.user.util.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vendor")
public class VendorOrderController {

    private final OrderService orderService;
    private final CurrentUserService currentUserService;

    public VendorOrderController(OrderService orderService, CurrentUserService currentUserService) {
        this.orderService = orderService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/orders")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> list(Principal principal) {
        Long vendorId = currentUserService.getCurrentUserId(principal);
        List<OrderResponse> orders = orderService.getVendorOrders(vendorId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", orders);
        return ResponseEntity.ok(body);
    }

    @PutMapping("/orders/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable Long id,
                                                            @Valid @RequestBody UpdateOrderStatusRequest request,
                                                            Principal principal) {
        Long vendorId = currentUserService.getCurrentUserId(principal);
        OrderResponse order = orderService.updateOrderStatus(vendorId, id, request);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Order status updated");
        body.put("data", order);
        return ResponseEntity.ok(body);
    }
}