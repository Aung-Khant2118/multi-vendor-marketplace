package com.group5.marketplace.vendor.dto;

import com.group5.marketplace.vendor.entity.Vendor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class VendorProfileResponse {

    private Long id;
    private Long userId;
    private String storeName;
    private String slug;
    private String description;
    private String businessEmail;
    private String businessPhone;
    private String logoUrl;
    private String bannerUrl;
    private BigDecimal rating;
    private Vendor.VendorStatus status;
    private LocalDateTime createdAt;

    public VendorProfileResponse() {}

    public VendorProfileResponse(Long id, Long userId, String storeName, String slug,
                                 String description, String businessEmail, String businessPhone,
                                 String logoUrl, String bannerUrl, BigDecimal rating,
                                 Vendor.VendorStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.storeName = storeName;
        this.slug = slug;
        this.description = description;
        this.businessEmail = businessEmail;
        this.businessPhone = businessPhone;
        this.logoUrl = logoUrl;
        this.bannerUrl = bannerUrl;
        this.rating = rating;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
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
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }
    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }
    public Vendor.VendorStatus getStatus() { return status; }
    public void setStatus(Vendor.VendorStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
