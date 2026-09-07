package com.group5.marketplace.admin.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class AdminAnalyticsResponse {

    private List<MonthlyData> monthlyRevenue;
    private List<MonthlyData> monthlyOrders;
    private List<MonthlyData> monthlyVendors;
    private Map<String, Long> ordersByStatus;
    private Map<String, Long> usersByRole;

    public AdminAnalyticsResponse() {}

    public AdminAnalyticsResponse(List<MonthlyData> monthlyRevenue, List<MonthlyData> monthlyOrders,
                                  List<MonthlyData> monthlyVendors, Map<String, Long> ordersByStatus,
                                  Map<String, Long> usersByRole) {
        this.monthlyRevenue = monthlyRevenue;
        this.monthlyOrders = monthlyOrders;
        this.monthlyVendors = monthlyVendors;
        this.ordersByStatus = ordersByStatus;
        this.usersByRole = usersByRole;
    }

    public List<MonthlyData> getMonthlyRevenue() { return monthlyRevenue; }
    public void setMonthlyRevenue(List<MonthlyData> monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; }
    public List<MonthlyData> getMonthlyOrders() { return monthlyOrders; }
    public void setMonthlyOrders(List<MonthlyData> monthlyOrders) { this.monthlyOrders = monthlyOrders; }
    public List<MonthlyData> getMonthlyVendors() { return monthlyVendors; }
    public void setMonthlyVendors(List<MonthlyData> monthlyVendors) { this.monthlyVendors = monthlyVendors; }
    public Map<String, Long> getOrdersByStatus() { return ordersByStatus; }
    public void setOrdersByStatus(Map<String, Long> ordersByStatus) { this.ordersByStatus = ordersByStatus; }
    public Map<String, Long> getUsersByRole() { return usersByRole; }
    public void setUsersByRole(Map<String, Long> usersByRole) { this.usersByRole = usersByRole; }

    public static class MonthlyData {
        private String month;
        private BigDecimal value;

        public MonthlyData() {}

        public MonthlyData(String month, BigDecimal value) {
            this.month = month;
            this.value = value;
        }

        public String getMonth() { return month; }
        public void setMonth(String month) { this.month = month; }
        public BigDecimal getValue() { return value; }
        public void setValue(BigDecimal value) { this.value = value; }
    }
}
