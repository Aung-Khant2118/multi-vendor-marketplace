package com.group5.marketplace.admin.dto;

import java.math.BigDecimal;

public class AdminDashboardResponse {

    private long totalUsers;
    private long totalVendors;
    private long pendingVendors;
    private long totalProducts;
    private long totalOrders;
    private BigDecimal totalRevenue;

    public AdminDashboardResponse() {}

    public AdminDashboardResponse(long totalUsers, long totalVendors, long pendingVendors,
                                  long totalProducts, long totalOrders, BigDecimal totalRevenue) {
        this.totalUsers = totalUsers;
        this.totalVendors = totalVendors;
        this.pendingVendors = pendingVendors;
        this.totalProducts = totalProducts;
        this.totalOrders = totalOrders;
        this.totalRevenue = totalRevenue;
    }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getTotalVendors() { return totalVendors; }
    public void setTotalVendors(long totalVendors) { this.totalVendors = totalVendors; }
    public long getPendingVendors() { return pendingVendors; }
    public void setPendingVendors(long pendingVendors) { this.pendingVendors = pendingVendors; }
    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }
    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
}
