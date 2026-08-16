package com.group5.marketplace.address.service;

import com.group5.marketplace.address.dto.AddressRequest;
import com.group5.marketplace.address.dto.AddressResponse;
import com.group5.marketplace.address.entity.Address;
import com.group5.marketplace.address.mapper.AddressMapper;
import com.group5.marketplace.address.repository.AddressRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final AddressMapper addressMapper;

    public AddressService(AddressRepository addressRepository, AddressMapper addressMapper) {
        this.addressRepository = addressRepository;
        this.addressMapper = addressMapper;
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> getAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(addressMapper::toResponse)
                .toList();
    }

    @Transactional
    public AddressResponse create(Long userId, AddressRequest request) {
        Address address = addressMapper.toEntity(userId, request);

        if (Boolean.TRUE.equals(address.getIsDefault())) {
            clearDefaultAddresses(userId);
        }

        return addressMapper.toResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse update(Long userId, Long addressId, AddressRequest request) {
        Address address = ownedAddress(userId, addressId);

        addressMapper.apply(address, request);

        if (Boolean.TRUE.equals(address.getIsDefault())) {
            clearDefaultAddresses(userId, addressId);
        }

        return addressMapper.toResponse(addressRepository.save(address));
    }

    @Transactional
    public void delete(Long userId, Long addressId) {
        Address address = ownedAddress(userId, addressId);
        addressRepository.delete(address);
    }

    private Address ownedAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));
        if (!address.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Address does not belong to the user");
        }
        return address;
    }

    private void clearDefaultAddresses(Long userId) {
        clearDefaultAddresses(userId, null);
    }

    private void clearDefaultAddresses(Long userId, Long excludeId) {
        addressRepository.findByUserId(userId).stream()
                .filter(a -> !a.getId().equals(excludeId))
                .filter(a -> Boolean.TRUE.equals(a.getIsDefault()))
                .forEach(a -> {
                    a.setIsDefault(false);
                    addressRepository.save(a);
                });
    }
}