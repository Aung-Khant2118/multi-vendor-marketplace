package com.group5.marketplace.product.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_images")
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private String url;

    private Long uploaderId;

    private Boolean primaryImage = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public ProductImage() {}

    public ProductImage(Long id, Product product, String url, Long uploaderId, Boolean primaryImage, LocalDateTime createdAt) {
        this.id = id;
        this.product = product;
        this.url = url;
        this.uploaderId = uploaderId;
        this.primaryImage = primaryImage == null ? false : primaryImage;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public Long getUploaderId() { return uploaderId; }
    public void setUploaderId(Long uploaderId) { this.uploaderId = uploaderId; }
    public Boolean getPrimaryImage() { return primaryImage; }
    public void setPrimaryImage(Boolean primaryImage) { this.primaryImage = primaryImage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private Product product; private String url; private Long uploaderId; private Boolean primaryImage; private LocalDateTime createdAt;
        public Builder id(Long id){ this.id=id; return this; }
        public Builder product(Product product){ this.product=product; return this; }
        public Builder url(String url){ this.url=url; return this; }
        public Builder uploaderId(Long uploaderId){ this.uploaderId=uploaderId; return this; }
        public Builder primaryImage(Boolean primaryImage){ this.primaryImage=primaryImage; return this; }
        public Builder createdAt(LocalDateTime createdAt){ this.createdAt=createdAt; return this; }
        public ProductImage build(){ return new ProductImage(id,product,url,uploaderId, primaryImage == null ? false : primaryImage, createdAt); }
    }
}
