package com.group5.marketplace.order.dto;

import jakarta.validation.constraints.NotNull;

public class AddToCartRequest {

    @NotNull
    private Long variantId;

    @jakarta.validation.constraints.Min(1)
    private Integer quantity = 1;

    public AddToCartRequest() {}

    public Long getVariantId() { return variantId; }
    public void setVariantId(Long variantId) { this.variantId = variantId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}