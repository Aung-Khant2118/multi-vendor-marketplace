package com.group5.marketplace.product.dto;

public class SearchSuggestion {

    private Long id;
    private String name;
    private String slug;
    private String type;
    private String imageUrl;

    public SearchSuggestion() {}

    public SearchSuggestion(Long id, String name, String slug, String type, String imageUrl) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.type = type;
        this.imageUrl = imageUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
