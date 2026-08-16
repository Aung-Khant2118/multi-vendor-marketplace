package com.group5.marketplace.user.mapper;

import com.group5.marketplace.auth.dto.UserMeResponse;
import com.group5.marketplace.user.entity.User;
import com.group5.marketplace.vendor.entity.Vendor;
import com.group5.marketplace.vendor.service.VendorService;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    private final VendorService vendorService;

    public UserMapper(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    public UserMeResponse toMeResponse(User user) {
        Vendor vendor = vendorService.getByUserId(user.getId());
        String vendorStatus = vendor == null ? null : vendor.getStatus().name();

        return new UserMeResponse(user.getId(), user.getFirstName(), user.getLastName(),
                user.getEmail(), user.getUsernameField(), user.getPhoneNumber(),
                user.getRole().name(), user.isEmailVerified(), vendorStatus);
    }
}