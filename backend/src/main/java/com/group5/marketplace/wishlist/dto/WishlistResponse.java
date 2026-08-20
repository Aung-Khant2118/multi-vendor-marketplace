package com.group5.marketplace.wishlist.dto;

import java.time.LocalDateTime;
import java.util.List;

public class WishlistResponse {

    private Long id;
    private String name;
    private List<WishlistItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public WishlistResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public List<WishlistItemResponse> getItems() { return items; }
    public void setItems(List<WishlistItemResponse> items) { this.items = items; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
