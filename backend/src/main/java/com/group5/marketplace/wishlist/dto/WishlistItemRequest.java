package com.group5.marketplace.wishlist.dto;

import jakarta.validation.constraints.NotNull;

public class WishlistItemRequest {

    @NotNull(message = "productId is required")
    private Long productId;

    public WishlistItemRequest() {}

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
}
