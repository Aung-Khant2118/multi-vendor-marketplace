package com.group5.marketplace.category.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(length = 1000)
    private String description;

    private String imageUrl;

    private Boolean active = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Category() {}

    public Category(Long id, String name, String slug, String description, String imageUrl, Boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.imageUrl = imageUrl;
        this.active = active == null ? true : active;
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
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private String name; private String slug; private String description; private String imageUrl; private Boolean active; private LocalDateTime createdAt; private LocalDateTime updatedAt;
        public Builder id(Long id){ this.id=id; return this; }
        public Builder name(String name){ this.name=name; return this; }
        public Builder slug(String slug){ this.slug=slug; return this; }
        public Builder description(String description){ this.description=description; return this; }
        public Builder imageUrl(String imageUrl){ this.imageUrl=imageUrl; return this; }
        public Builder active(Boolean active){ this.active=active; return this; }
        public Builder createdAt(LocalDateTime createdAt){ this.createdAt=createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt){ this.updatedAt=updatedAt; return this; }
        public Category build(){ return new Category(id,name,slug,description,imageUrl, active == null ? true : active, createdAt, updatedAt); }
    }
}