package com.group5.marketplace.vendor.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class VendorProfileRequest {

    @Size(min = 2, max = 200)
    private String storeName;

    @Size(max = 2000)
    private String description;

    @Email
    @Size(max = 255)
    private String businessEmail;

    @Size(max = 20)
    private String businessPhone;

    public VendorProfileRequest() {}

    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getBusinessEmail() { return businessEmail; }
    public void setBusinessEmail(String businessEmail) { this.businessEmail = businessEmail; }
    public String getBusinessPhone() { return businessPhone; }
    public void setBusinessPhone(String businessPhone) { this.businessPhone = businessPhone; }
}
