package com.group5.marketplace.product.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProductResponse {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private Long categoryId;
    private Long vendorId;
    private List<String> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
