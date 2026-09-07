package com.group5.marketplace.product.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "product_variants")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private String sku;

    private BigDecimal price;

    private Integer stock;

    @OneToMany(mappedBy = "variant", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<VariantAttribute> attributes = new HashSet<>();

    private Boolean active = true;

    public ProductVariant() {}

    public ProductVariant(Long id, Product product, String sku, BigDecimal price, Integer stock, Set<VariantAttribute> attributes, Boolean active) {
        this.id = id;
        this.product = product;
        this.sku = sku;
        this.price = price;
        this.stock = stock;
        this.attributes = attributes != null ? attributes : new HashSet<>();
        this.active = active == null ? true : active;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public Set<VariantAttribute> getAttributes() { return attributes; }
    public void setAttributes(Set<VariantAttribute> attributes) { this.attributes = attributes; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public String getVariantLabel() {
        if (attributes == null || attributes.isEmpty()) return null;
        return attributes.stream()
                .map(VariantAttribute::getValue)
                .collect(Collectors.joining(" / "));
    }

    public void addAttribute(VariantAttribute attribute) {
        attributes.add(attribute);
        attribute.setVariant(this);
    }

    public void removeAttribute(VariantAttribute attribute) {
        attributes.remove(attribute);
        attribute.setVariant(null);
    }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private Product product; private String sku; private BigDecimal price; private Integer stock; private Set<VariantAttribute> attributes; private Boolean active;
        public Builder id(Long id){ this.id=id; return this; }
        public Builder product(Product product){ this.product=product; return this; }
        public Builder sku(String sku){ this.sku=sku; return this; }
        public Builder price(BigDecimal price){ this.price=price; return this; }
        public Builder stock(Integer stock){ this.stock=stock; return this; }
        public Builder attributes(Set<VariantAttribute> attributes){ this.attributes=attributes; return this; }
        public Builder active(Boolean active){ this.active=active; return this; }
        public ProductVariant build(){ return new ProductVariant(id,product,sku,price,stock,attributes,active); }
    }
}
