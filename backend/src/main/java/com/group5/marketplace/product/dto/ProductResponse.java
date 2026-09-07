package com.group5.marketplace.product.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ProductResponse {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private Long categoryId;
    private Long vendorId;
    private String storeName;
    private Double averageRating;
    private Integer reviewCount;
    private List<String> images;
    private List<ProductImageData> imageObjects;
    private List<ProductVariantResponse> variants;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProductResponse() {}

    public ProductResponse(Long id, String name, String slug, String description, BigDecimal price, Long categoryId, Long vendorId, String storeName, Double averageRating, Integer reviewCount, List<String> images, List<ProductImageData> imageObjects, List<ProductVariantResponse> variants, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.price = price;
        this.categoryId = categoryId;
        this.vendorId = vendorId;
        this.storeName = storeName;
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
        this.images = images;
        this.imageObjects = imageObjects;
        this.variants = variants;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }
    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
    public List<ProductImageData> getImageObjects() { return imageObjects; }
    public void setImageObjects(List<ProductImageData> imageObjects) { this.imageObjects = imageObjects; }
    public List<ProductVariantResponse> getVariants() { return variants; }
    public void setVariants(List<ProductVariantResponse> variants) { this.variants = variants; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id; private String name; private String slug; private String description; private BigDecimal price; private Long categoryId; private Long vendorId; private String storeName; private Double averageRating; private Integer reviewCount; private List<String> images; private List<ProductImageData> imageObjects; private List<ProductVariantResponse> variants; private LocalDateTime createdAt; private LocalDateTime updatedAt;
        public Builder id(Long id){ this.id = id; return this; }
        public Builder name(String name){ this.name = name; return this; }
        public Builder slug(String slug){ this.slug = slug; return this; }
        public Builder description(String description){ this.description = description; return this; }
        public Builder price(BigDecimal price){ this.price = price; return this; }
        public Builder categoryId(Long categoryId){ this.categoryId = categoryId; return this; }
        public Builder vendorId(Long vendorId){ this.vendorId = vendorId; return this; }
        public Builder storeName(String storeName){ this.storeName = storeName; return this; }
        public Builder averageRating(Double averageRating){ this.averageRating = averageRating; return this; }
        public Builder reviewCount(Integer reviewCount){ this.reviewCount = reviewCount; return this; }
        public Builder images(List<String> images){ this.images = images; return this; }
        public Builder imageObjects(List<ProductImageData> imageObjects){ this.imageObjects = imageObjects; return this; }
        public Builder variants(List<ProductVariantResponse> variants){ this.variants = variants; return this; }
        public Builder createdAt(LocalDateTime createdAt){ this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt){ this.updatedAt = updatedAt; return this; }
        public ProductResponse build(){ return new ProductResponse(id,name,slug,description,price,categoryId,vendorId,storeName,averageRating,reviewCount,images,imageObjects,variants,createdAt,updatedAt); }
    }
}
