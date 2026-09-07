package com.group5.marketplace.product.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public class ProductRequest {

    @NotBlank
    @Size(min = 1, max = 200)
    private String name;

    @NotBlank
    @Size(min = 1, max = 200)
    private String slug;

    @Size(max = 5000)
    private String description;

    @NotNull
    private Long categoryId;

    private BigDecimal price;

    @Size(max = 20)
    private List<String> images;

    @Valid
    private List<VariantInput> variants;

    public ProductRequest() {}

    public ProductRequest(String name, String slug, String description, Long categoryId, BigDecimal price, List<String> images, List<VariantInput> variants) {
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.categoryId = categoryId;
        this.price = price;
        this.images = images;
        this.variants = variants;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
    public List<VariantInput> getVariants() { return variants; }
    public void setVariants(List<VariantInput> variants) { this.variants = variants; }

    public static class VariantInput {

        @Size(max = 100)
        private String sku;

        @NotNull
        private BigDecimal price;

        @NotNull
        private Integer stock;

        @Valid
        private List<VariantAttributeDto> attributes;

        public VariantInput() {}

        public VariantInput(String sku, BigDecimal price, Integer stock, List<VariantAttributeDto> attributes) {
            this.sku = sku;
            this.price = price;
            this.stock = stock;
            this.attributes = attributes;
        }

        public String getSku() { return sku; }
        public void setSku(String sku) { this.sku = sku; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public Integer getStock() { return stock; }
        public void setStock(Integer stock) { this.stock = stock; }
        public List<VariantAttributeDto> getAttributes() { return attributes; }
        public void setAttributes(List<VariantAttributeDto> attributes) { this.attributes = attributes; }
    }
}
