package com.group5.marketplace.address.dto;

import com.group5.marketplace.address.entity.Address.AddressType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AddressRequest {

    public interface OnCreate {}

    @NotBlank(groups = OnCreate.class)
    @Size(min = 1, max = 200)
    private String recipientName;

    @NotBlank(groups = OnCreate.class)
    @Size(min = 1, max = 20)
    private String phone;

    @NotBlank(groups = OnCreate.class)
    @Size(min = 1, max = 300)
    private String line1;

    @Size(max = 300)
    private String line2;

    @NotBlank(groups = OnCreate.class)
    @Size(min = 1, max = 100)
    private String city;

    @Size(max = 100)
    private String region;

    @Size(max = 20)
    private String postalCode;

    @NotBlank(groups = OnCreate.class)
    @Size(min = 1, max = 100)
    private String country;

    private AddressType addressType;

    private Boolean isDefault;

    public AddressRequest() {}

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getLine1() { return line1; }
    public void setLine1(String line1) { this.line1 = line1; }
    public String getLine2() { return line2; }
    public void setLine2(String line2) { this.line2 = line2; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public AddressType getAddressType() { return addressType; }
    public void setAddressType(AddressType addressType) { this.addressType = addressType; }
    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }
}