package com.group5.marketplace.product.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ProductVariantResponse {

    private Long id;
    private Long productId;
    private String sku;
    private BigDecimal price;
    private Integer stock;
    private String attributes;
    private Boolean active;
}

