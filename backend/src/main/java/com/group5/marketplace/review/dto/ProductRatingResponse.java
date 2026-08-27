package com.group5.marketplace.review.dto;

public class ProductRatingResponse {

    private Long productId;
    private Double averageRating;
    private long totalReviews;

    public ProductRatingResponse() {}

    public ProductRatingResponse(Long productId, Double averageRating, long totalReviews) {
        this.productId = productId;
        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public long getTotalReviews() { return totalReviews; }
    public void setTotalReviews(long totalReviews) { this.totalReviews = totalReviews; }
}
