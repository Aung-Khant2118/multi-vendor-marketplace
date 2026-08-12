package com.group5.marketplace.product.dto;

import java.math.BigDecimal;

public class ProductVariantResponse {

    private Long id;
    private Long productId;
    private String sku;
    private BigDecimal price;
    private Integer stock;
    private String attributes;
    private Boolean active;

    public ProductVariantResponse() {}

    public ProductVariantResponse(Long id, Long productId, String sku, BigDecimal price, Integer stock, String attributes, Boolean active) {
        this.id = id;
        this.productId = productId;
        this.sku = sku;
        this.price = price;
        this.stock = stock;
        this.attributes = attributes;
        this.active = active;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public String getAttributes() { return attributes; }
    public void setAttributes(String attributes) { this.attributes = attributes; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private Long productId; private String sku; private BigDecimal price; private Integer stock; private String attributes; private Boolean active;
        public Builder id(Long id){ this.id=id; return this; }
        public Builder productId(Long productId){ this.productId=productId; return this; }
        public Builder sku(String sku){ this.sku=sku; return this; }
        public Builder price(BigDecimal price){ this.price=price; return this; }
        public Builder stock(Integer stock){ this.stock=stock; return this; }
        public Builder attributes(String attributes){ this.attributes=attributes; return this; }
        public Builder active(Boolean active){ this.active=active; return this; }
        public ProductVariantResponse build(){ return new ProductVariantResponse(id,productId,sku,price,stock,attributes,active); }
    }
}

