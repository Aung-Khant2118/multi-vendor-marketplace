package com.group5.marketplace.vendor.service;

import com.group5.marketplace.vendor.dto.VendorRegistrationRequest;
import com.group5.marketplace.vendor.entity.Vendor;
import com.group5.marketplace.vendor.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.Locale;

@Service
public class VendorService {

    private final VendorRepository vendorRepository;

    public VendorService(VendorRepository vendorRepository) {
        this.vendorRepository = vendorRepository;
    }

    public Vendor createProfile(Long userId, VendorRegistrationRequest request) {
        String slug = uniqueSlug(request.getStoreName());

        String description = request.getStoreDescription() == null ? "" : request.getStoreDescription();
        if (request.getBusinessAddress() != null && !request.getBusinessAddress().isBlank()) {
            description = (description.isBlank() ? "" : description + "\n") + request.getBusinessAddress();
        }

        Vendor vendor = Vendor.builder()
                .userId(userId)
                .storeName(request.getStoreName())
                .slug(slug)
                .description(description)
                .businessEmail(request.getEmail())
                .status(Vendor.VendorStatus.PENDING)
                .build();

        return vendorRepository.save(vendor);
    }

    public Vendor getByUserId(Long userId) {
        return vendorRepository.findByUserId(userId).orElse(null);
    }

    String uniqueSlug(String storeName) {
        String base = slugify(storeName);
        String candidate = base;
        int i = 2;
        while (vendorRepository.existsBySlug(candidate)) {
            candidate = base + "-" + i;
            i++;
        }
        return candidate;
    }

    String slugify(String input) {
        if (input == null) return "store";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("[\\s-]+", "-");
        return normalized.isEmpty() ? "store" : normalized;
    }
}