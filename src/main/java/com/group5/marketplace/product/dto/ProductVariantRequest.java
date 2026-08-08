package com.group5.marketplace.product.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductVariantRequest {

    @NotNull
    private Long productId;

    private String sku;

    private BigDecimal price;

    private Integer stock;

    private String attributes; // JSON or key:value pairs

    private Boolean active;
}

