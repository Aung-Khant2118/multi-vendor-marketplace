package com.group5.marketplace.order.dto;

import java.util.List;

public class OrderResponse {

    private Long id;
    private Long userId;
    private String customerName;
    private String status;
    private java.math.BigDecimal subtotal;
    private java.math.BigDecimal shippingCost;
    private java.math.BigDecimal tax;
    private java.math.BigDecimal discount;
    private String couponCode;
    private java.math.BigDecimal total;
    private String notes;
    private Long shippingAddressId;
    private Long billingAddressId;
    private AddressSnapshotResponse shippingAddress;
    private AddressSnapshotResponse billingAddress;
    private String paymentStatus;
    private String paymentMethod;
    private java.time.LocalDateTime createdAt;
    private List<OrderItemResponse> items;
    private String cancellationReason;
    private String cancellationNote;
    private String cancelledBy;
    private java.time.LocalDateTime cancelledAt;

    public OrderResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public java.math.BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(java.math.BigDecimal subtotal) { this.subtotal = subtotal; }
    public java.math.BigDecimal getShippingCost() { return shippingCost; }
    public void setShippingCost(java.math.BigDecimal shippingCost) { this.shippingCost = shippingCost; }
    public java.math.BigDecimal getTax() { return tax; }
    public void setTax(java.math.BigDecimal tax) { this.tax = tax; }
    public java.math.BigDecimal getDiscount() { return discount; }
    public void setDiscount(java.math.BigDecimal discount) { this.discount = discount; }
    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
    public java.math.BigDecimal getTotal() { return total; }
    public void setTotal(java.math.BigDecimal total) { this.total = total; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Long getShippingAddressId() { return shippingAddressId; }
    public void setShippingAddressId(Long shippingAddressId) { this.shippingAddressId = shippingAddressId; }
    public Long getBillingAddressId() { return billingAddressId; }
    public void setBillingAddressId(Long billingAddressId) { this.billingAddressId = billingAddressId; }
    public AddressSnapshotResponse getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(AddressSnapshotResponse shippingAddress) { this.shippingAddress = shippingAddress; }
    public AddressSnapshotResponse getBillingAddress() { return billingAddress; }
    public void setBillingAddress(AddressSnapshotResponse billingAddress) { this.billingAddress = billingAddress; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<OrderItemResponse> getItems() { return items; }
    public void setItems(List<OrderItemResponse> items) { this.items = items; }
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    public String getCancellationNote() { return cancellationNote; }
    public void setCancellationNote(String cancellationNote) { this.cancellationNote = cancellationNote; }
    public String getCancelledBy() { return cancelledBy; }
    public void setCancelledBy(String cancelledBy) { this.cancelledBy = cancelledBy; }
    public java.time.LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(java.time.LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
}