package com.group5.marketplace.product.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public class ProductVariantRequest {

    private Long productId;

    @Size(max = 100)
    private String sku;

    private BigDecimal price;

    private Integer stock;

    @Valid
    private List<VariantAttributeDto> attributes;

    private Boolean active;

    public ProductVariantRequest() {}

    public ProductVariantRequest(Long productId, String sku, BigDecimal price, Integer stock, List<VariantAttributeDto> attributes, Boolean active) {
        this.productId = productId;
        this.sku = sku;
        this.price = price;
        this.stock = stock;
        this.attributes = attributes;
        this.active = active;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public List<VariantAttributeDto> getAttributes() { return attributes; }
    public void setAttributes(List<VariantAttributeDto> attributes) { this.attributes = attributes; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
