package com.group5.marketplace.promotion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ValidateCouponRequest {

    @NotBlank(message = "Coupon code is required")
    @Size(min = 2, max = 50)
    private String code;

    private java.math.BigDecimal orderTotal;

    public ValidateCouponRequest() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public java.math.BigDecimal getOrderTotal() { return orderTotal; }
    public void setOrderTotal(java.math.BigDecimal orderTotal) { this.orderTotal = orderTotal; }
}
