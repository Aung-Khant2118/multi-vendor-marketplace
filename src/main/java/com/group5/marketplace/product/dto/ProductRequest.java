package com.group5.marketplace.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String slug;

    private String description;

    @NotNull
    private Long categoryId;

    private BigDecimal price;

    private List<String> images; // urls
}
