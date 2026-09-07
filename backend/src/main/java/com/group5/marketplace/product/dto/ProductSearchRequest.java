package com.group5.marketplace.product.dto;

import java.math.BigDecimal;

public class ProductSearchRequest {

    private String q;
    private Long categoryId;
    private Long vendorId;
    private BigDecimal priceMin;
    private BigDecimal priceMax;
    private Boolean inStock;
    private Double minRating;
    private String sort;
    private int page = 0;
    private int size = 20;

    public ProductSearchRequest() {}

    public String getQ() { return q; }
    public void setQ(String q) { this.q = q; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }
    public BigDecimal getPriceMin() { return priceMin; }
    public void setPriceMin(BigDecimal priceMin) { this.priceMin = priceMin; }
    public BigDecimal getPriceMax() { return priceMax; }
    public void setPriceMax(BigDecimal priceMax) { this.priceMax = priceMax; }
    public Boolean getInStock() { return inStock; }
    public void setInStock(Boolean inStock) { this.inStock = inStock; }
    public Double getMinRating() { return minRating; }
    public void setMinRating(Double minRating) { this.minRating = minRating; }
    public String getSort() { return sort; }
    public void setSort(String sort) { this.sort = sort; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
}
