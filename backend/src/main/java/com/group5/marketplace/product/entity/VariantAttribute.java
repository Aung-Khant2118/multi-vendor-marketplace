package com.group5.marketplace.product.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "variant_attributes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"variant_id", "name"})
})
public class VariantAttribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 255)
    private String value;

    public VariantAttribute() {}

    public VariantAttribute(ProductVariant variant, String name, String value) {
        this.variant = variant;
        this.name = name;
        this.value = value;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ProductVariant getVariant() { return variant; }
    public void setVariant(ProductVariant variant) { this.variant = variant; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}
