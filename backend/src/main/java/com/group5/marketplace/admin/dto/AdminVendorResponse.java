package com.group5.marketplace.admin.dto;

import com.group5.marketplace.vendor.entity.Vendor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AdminVendorResponse {

    private Long id;
    private Long userId;
    private String userFirstName;
    private String userLastName;
    private String userEmail;
    private String storeName;
    private String slug;
    private String description;
    private String businessEmail;
    private String businessPhone;
    private BigDecimal rating;
    private Vendor.VendorStatus status;
    private LocalDateTime approvedAt;
    private Long approvedBy;
    private LocalDateTime createdAt;

    public AdminVendorResponse() {}

    public AdminVendorResponse(Long id, Long userId, String userFirstName, String userLastName,
                               String userEmail, String storeName, String slug, String description,
                               String businessEmail, String businessPhone, BigDecimal rating,
                               Vendor.VendorStatus status, LocalDateTime approvedAt, Long approvedBy,
                               LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.userFirstName = userFirstName;
        this.userLastName = userLastName;
        this.userEmail = userEmail;
        this.storeName = storeName;
        this.slug = slug;
        this.description = description;
        this.businessEmail = businessEmail;
        this.businessPhone = businessPhone;
        this.rating = rating;
        this.status = status;
        this.approvedAt = approvedAt;
        this.approvedBy = approvedBy;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserFirstName() { return userFirstName; }
    public void setUserFirstName(String userFirstName) { this.userFirstName = userFirstName; }
    public String getUserLastName() { return userLastName; }
    public void setUserLastName(String userLastName) { this.userLastName = userLastName; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getBusinessEmail() { return businessEmail; }
    public void setBusinessEmail(String businessEmail) { this.businessEmail = businessEmail; }
    public String getBusinessPhone() { return businessPhone; }
    public void setBusinessPhone(String businessPhone) { this.businessPhone = businessPhone; }
    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }
    public Vendor.VendorStatus getStatus() { return status; }
    public void setStatus(Vendor.VendorStatus status) { this.status = status; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public Long getApprovedBy() { return approvedBy; }
    public void setApprovedBy(Long approvedBy) { this.approvedBy = approvedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
