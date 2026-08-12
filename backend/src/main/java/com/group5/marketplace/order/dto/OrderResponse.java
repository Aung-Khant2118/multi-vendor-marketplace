package com.group5.marketplace.order.dto;

import java.util.List;

public class OrderResponse {

    private Long id;
    private Long userId;
    private String status;
    private java.math.BigDecimal subtotal;
    private java.math.BigDecimal shippingCost;
    private java.math.BigDecimal tax;
    private java.math.BigDecimal total;
    private String notes;
    private String paymentStatus;
    private String paymentMethod;
    private java.time.LocalDateTime createdAt;
    private List<OrderItemResponse> items;

    public OrderResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public java.math.BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(java.math.BigDecimal subtotal) { this.subtotal = subtotal; }
    public java.math.BigDecimal getShippingCost() { return shippingCost; }
    public void setShippingCost(java.math.BigDecimal shippingCost) { this.shippingCost = shippingCost; }
    public java.math.BigDecimal getTax() { return tax; }
    public void setTax(java.math.BigDecimal tax) { this.tax = tax; }
    public java.math.BigDecimal getTotal() { return total; }
    public void setTotal(java.math.BigDecimal total) { this.total = total; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<OrderItemResponse> getItems() { return items; }
    public void setItems(List<OrderItemResponse> items) { this.items = items; }
}