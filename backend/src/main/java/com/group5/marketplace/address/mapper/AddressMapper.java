package com.group5.marketplace.address.mapper;

import com.group5.marketplace.address.dto.AddressRequest;
import com.group5.marketplace.address.dto.AddressResponse;
import com.group5.marketplace.address.entity.Address;
import org.springframework.stereotype.Component;

@Component
public class AddressMapper {

    public Address toEntity(Long userId, AddressRequest request) {
        Address address = new Address();
        address.setUserId(userId);
        apply(address, request);
        return address;
    }

    public void apply(Address address, AddressRequest request) {
        if (request.getRecipientName() != null) address.setRecipientName(request.getRecipientName());
        if (request.getPhone() != null) address.setPhone(request.getPhone());
        if (request.getLine1() != null) address.setLine1(request.getLine1());
        if (request.getLine2() != null) address.setLine2(request.getLine2());
        if (request.getCity() != null) address.setCity(request.getCity());
        if (request.getRegion() != null) address.setRegion(request.getRegion());
        if (request.getPostalCode() != null) address.setPostalCode(request.getPostalCode());
        if (request.getCountry() != null) address.setCountry(request.getCountry());
        if (request.getAddressType() != null) address.setAddressType(request.getAddressType());
        if (request.getIsDefault() != null) address.setIsDefault(request.getIsDefault());
    }

    public AddressResponse toResponse(Address address) {
        return new AddressResponse(address.getId(), address.getRecipientName(), address.getPhone(),
                address.getLine1(), address.getLine2(), address.getCity(), address.getRegion(),
                address.getPostalCode(), address.getCountry(), address.getAddressType(),
                Boolean.TRUE.equals(address.getIsDefault()), address.getCreatedAt(), address.getUpdatedAt());
    }
}