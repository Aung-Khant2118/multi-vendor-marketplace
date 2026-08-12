package com.group5.marketplace.order.dto;

import java.util.List;

public class CartResponse {

    private Long id;
    private List<CartItemResponse> items;
    private Integer totalQuantity;
    private java.math.BigDecimal totalPrice;

    public CartResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public List<CartItemResponse> getItems() { return items; }
    public void setItems(List<CartItemResponse> items) { this.items = items; }
    public Integer getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(Integer totalQuantity) { this.totalQuantity = totalQuantity; }
    public java.math.BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(java.math.BigDecimal totalPrice) { this.totalPrice = totalPrice; }
}