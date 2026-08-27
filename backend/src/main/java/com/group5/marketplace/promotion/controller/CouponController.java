package com.group5.marketplace.promotion.controller;

import com.group5.marketplace.promotion.dto.CouponRequest;
import com.group5.marketplace.promotion.dto.CouponResponse;
import com.group5.marketplace.promotion.dto.CouponValidationResponse;
import com.group5.marketplace.promotion.dto.ValidateCouponRequest;
import com.group5.marketplace.promotion.service.CouponService;
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
public class CouponController {

    private final CouponService couponService;
    private final CurrentUserService currentUserService;

    public CouponController(CouponService couponService, CurrentUserService currentUserService) {
        this.couponService = couponService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/vendor/coupons")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> createCoupon(
            @Valid @RequestBody CouponRequest request,
            Principal principal) {
        Long vendorId = currentUserService.getCurrentUserId(principal);
        CouponResponse coupon = couponService.createCoupon(vendorId, request);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Coupon created successfully");
        body.put("data", coupon);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PatchMapping("/vendor/coupons/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequest request,
            Principal principal) {
        Long vendorId = currentUserService.getCurrentUserId(principal);
        CouponResponse coupon = couponService.updateCoupon(vendorId, id, request);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Coupon updated successfully");
        body.put("data", coupon);
        return ResponseEntity.ok(body);
    }

    @PatchMapping("/vendor/coupons/{id}/toggle")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> toggleCoupon(
            @PathVariable Long id,
            Principal principal) {
        Long vendorId = currentUserService.getCurrentUserId(principal);
        couponService.toggleCoupon(vendorId, id);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Coupon status toggled");
        return ResponseEntity.ok(body);
    }

    @GetMapping("/vendor/coupons")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> listVendorCoupons(Principal principal) {
        Long vendorId = currentUserService.getCurrentUserId(principal);
        List<CouponResponse> coupons = couponService.getVendorCoupons(vendorId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", coupons);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/coupons/validate")
    public ResponseEntity<Map<String, Object>> validateCoupon(
            @Valid @RequestBody ValidateCouponRequest request) {
        CouponValidationResponse validation = couponService.validateCoupon(
                request.getCode(), request.getOrderTotal());
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", validation);
        return ResponseEntity.ok(body);
    }
}
