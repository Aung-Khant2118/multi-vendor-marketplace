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
    private List<String> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProductResponse() {}

    public ProductResponse(Long id, String name, String slug, String description, BigDecimal price, Long categoryId, Long vendorId, List<String> images, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.price = price;
        this.categoryId = categoryId;
        this.vendorId = vendorId;
        this.images = images;
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
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id; private String name; private String slug; private String description; private BigDecimal price; private Long categoryId; private Long vendorId; private List<String> images; private LocalDateTime createdAt; private LocalDateTime updatedAt;
        public Builder id(Long id){ this.id = id; return this; }
        public Builder name(String name){ this.name = name; return this; }
        public Builder slug(String slug){ this.slug = slug; return this; }
        public Builder description(String description){ this.description = description; return this; }
        public Builder price(BigDecimal price){ this.price = price; return this; }
        public Builder categoryId(Long categoryId){ this.categoryId = categoryId; return this; }
        public Builder vendorId(Long vendorId){ this.vendorId = vendorId; return this; }
        public Builder images(List<String> images){ this.images = images; return this; }
        public Builder createdAt(LocalDateTime createdAt){ this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt){ this.updatedAt = updatedAt; return this; }
        public ProductResponse build(){ return new ProductResponse(id,name,slug,description,price,categoryId,vendorId,images,createdAt,updatedAt); }
    }
}
