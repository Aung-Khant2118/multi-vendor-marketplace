package com.group5.marketplace.product.entity;

import com.group5.marketplace.category.entity.Category;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@Column(nullable = false)
private String name;

@Column(nullable = false, unique = true)
private String slug;

@Column(length = 2000)
private String description;

private BigDecimal price;

@ManyToOne
@JoinColumn(name = "category_id")
private Category category;

private Long vendorId; // reference to user id who owns the product

@OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
private List<ProductVariant> variants;

@OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
private List<ProductImage> images;

@CreationTimestamp
private LocalDateTime createdAt;

@UpdateTimestamp
private LocalDateTime updatedAt;

public Product() {}

public Product(Long id, String name, String slug, String description, BigDecimal price, Category category, Long vendorId, List<ProductVariant> variants, List<ProductImage> images, LocalDateTime createdAt, LocalDateTime updatedAt) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.description = description;
    this.price = price;
    this.category = category;
    this.vendorId = vendorId;
    this.variants = variants;
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
public Category getCategory() { return category; }
public void setCategory(Category category) { this.category = category; }
public Long getVendorId() { return vendorId; }
public void setVendorId(Long vendorId) { this.vendorId = vendorId; }
public List<ProductVariant> getVariants() { return variants; }
public void setVariants(List<ProductVariant> variants) { this.variants = variants; }
public List<ProductImage> getImages() { return images; }
public void setImages(List<ProductImage> images) { this.images = images; }
public LocalDateTime getCreatedAt() { return createdAt; }
public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
public LocalDateTime getUpdatedAt() { return updatedAt; }
public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

public static Builder builder() { return new Builder(); }
public static class Builder {
    private Long id; private String name; private String slug; private String description; private BigDecimal price; private Category category; private Long vendorId; private java.util.List<ProductVariant> variants; private java.util.List<ProductImage> images; private LocalDateTime createdAt; private LocalDateTime updatedAt;
    public Builder id(Long id){ this.id=id; return this; }
    public Builder name(String name){ this.name=name; return this; }
    public Builder slug(String slug){ this.slug=slug; return this; }
    public Builder description(String description){ this.description=description; return this; }
    public Builder price(BigDecimal price){ this.price=price; return this; }
    public Builder category(Category category){ this.category=category; return this; }
    public Builder vendorId(Long vendorId){ this.vendorId=vendorId; return this; }
    public Builder variants(java.util.List<ProductVariant> variants){ this.variants=variants; return this; }
    public Builder images(java.util.List<ProductImage> images){ this.images=images; return this; }
    public Builder createdAt(LocalDateTime createdAt){ this.createdAt=createdAt; return this; }
    public Builder updatedAt(LocalDateTime updatedAt){ this.updatedAt=updatedAt; return this; }
    public Product build(){ return new Product(id,name,slug,description,price,category,vendorId,variants,images,createdAt,updatedAt); }
}
}
