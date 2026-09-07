package com.group5.marketplace.promotion.service;

import com.group5.marketplace.promotion.dto.CouponRequest;
import com.group5.marketplace.promotion.dto.CouponResponse;
import com.group5.marketplace.promotion.dto.CouponValidationResponse;
import com.group5.marketplace.promotion.entity.Coupon;
import com.group5.marketplace.promotion.entity.Coupon.DiscountType;
import com.group5.marketplace.promotion.repository.CouponRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @Transactional
    public CouponResponse createCoupon(Long vendorId, CouponRequest request) {
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Coupon code is required");
        }
        String code = request.getCode().trim().toUpperCase();
        if (couponRepository.existsByCodeIgnoreCase(code)) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Coupon code already exists");
        }

        if (request.getDiscountType() == DiscountType.PERCENTAGE
                && request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Percentage discount cannot exceed 100%");
        }

        Coupon coupon = Coupon.builder()
                .code(code)
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount())
                .maxUses(request.getMaxUses())
                .startDate(parseDate(request.getStartDate()))
                .endDate(parseDate(request.getEndDate()))
                .vendorId(vendorId)
                .build();

        Coupon saved = couponRepository.save(coupon);
        return toResponse(saved);
    }

    @Transactional
    public CouponResponse updateCoupon(Long vendorId, Long couponId, CouponRequest request) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Coupon not found"));

        if (coupon.getVendorId() != null && !coupon.getVendorId().equals(vendorId)) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Not your coupon");
        }

        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Coupon code is required");
        }
        String code = request.getCode().trim().toUpperCase();
        if (!code.equals(coupon.getCode()) && couponRepository.existsByCodeIgnoreCase(code)) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Coupon code already exists");
        }

        coupon.setCode(code);
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO);
        coupon.setMaxUses(request.getMaxUses());
        coupon.setStartDate(parseDate(request.getStartDate()));
        coupon.setEndDate(parseDate(request.getEndDate()));

        Coupon saved = couponRepository.save(coupon);
        return toResponse(saved);
    }

    @Transactional
    public void toggleCoupon(Long vendorId, Long couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Coupon not found"));

        if (coupon.getVendorId() != null && !coupon.getVendorId().equals(vendorId)) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Not your coupon");
        }

        coupon.setActive(!coupon.isActive());
        couponRepository.save(coupon);
    }

    public List<CouponResponse> getVendorCoupons(Long vendorId) {
        return couponRepository.findByVendorIdOrderByCreatedAtDesc(vendorId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CouponValidationResponse validateCoupon(String code, BigDecimal orderTotal) {
        if (code == null || code.isBlank()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Coupon code is required");
        }
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid coupon code"));

        if (!coupon.isActive()) {
            return new CouponValidationResponse(false, "Coupon is inactive");
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            return new CouponValidationResponse(false, "Coupon is not yet active");
        }
        if (coupon.getEndDate() != null && now.isAfter(coupon.getEndDate())) {
            return new CouponValidationResponse(false, "Coupon has expired");
        }

        if (coupon.getMaxUses() != null && coupon.getUsedCount() >= coupon.getMaxUses()) {
            return new CouponValidationResponse(false, "Coupon usage limit reached");
        }

        if (orderTotal != null && orderTotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            return new CouponValidationResponse(false,
                    "Minimum order amount is $" + coupon.getMinOrderAmount());
        }

        BigDecimal discountAmount = calculateDiscount(coupon, orderTotal);

        CouponValidationResponse response = new CouponValidationResponse(true, "Coupon is valid");
        response.setCode(coupon.getCode());
        response.setDiscountType(coupon.getDiscountType().name());
        response.setDiscountValue(coupon.getDiscountValue());
        response.setDiscountAmount(discountAmount);
        return response;
    }

    @Transactional
    public void applyCoupon(String code) {
        if (code == null || code.isBlank()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Coupon code is required");
        }
        Coupon coupon = couponRepository.findByCodeForUpdate(code.trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid coupon code"));
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
    }

    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal subtotal) {
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            return subtotal.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            return coupon.getDiscountValue().min(subtotal);
        }
    }

    private LocalDateTime parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (Exception e) {
            try {
                return LocalDateTime.parse(dateStr + "T00:00:00", DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } catch (Exception ex) {
                return null;
            }
        }
    }

    private CouponResponse toResponse(Coupon coupon) {
        CouponResponse r = new CouponResponse();
        r.setId(coupon.getId());
        r.setCode(coupon.getCode());
        r.setDiscountType(coupon.getDiscountType());
        r.setDiscountValue(coupon.getDiscountValue());
        r.setMinOrderAmount(coupon.getMinOrderAmount());
        r.setMaxUses(coupon.getMaxUses());
        r.setUsedCount(coupon.getUsedCount());
        r.setStartDate(coupon.getStartDate());
        r.setEndDate(coupon.getEndDate());
        r.setActive(coupon.isActive());
        r.setVendorId(coupon.getVendorId());
        r.setCreatedAt(coupon.getCreatedAt());
        return r;
    }
}
