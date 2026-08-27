package com.group5.marketplace.vendor.service;

import com.group5.marketplace.storage.supabase.SupabaseStorageClient;
import com.group5.marketplace.vendor.dto.VendorProfileRequest;
import com.group5.marketplace.vendor.dto.VendorProfileResponse;
import com.group5.marketplace.vendor.dto.VendorRegistrationRequest;
import com.group5.marketplace.vendor.entity.Vendor;
import com.group5.marketplace.vendor.repository.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.text.Normalizer;
import java.util.Locale;

@Service
public class VendorService {

    private final VendorRepository vendorRepository;
    private final SupabaseStorageClient storageClient;

    public VendorService(VendorRepository vendorRepository, SupabaseStorageClient storageClient) {
        this.vendorRepository = vendorRepository;
        this.storageClient = storageClient;
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

    public VendorProfileResponse getProfile(Long userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Vendor profile not found"));
        return toProfileResponse(vendor);
    }

    public VendorProfileResponse updateProfile(Long userId, VendorProfileRequest request) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Vendor profile not found"));

        if (request.getStoreName() != null && !request.getStoreName().isBlank()) {
            vendor.setStoreName(request.getStoreName());
        }
        if (request.getDescription() != null) {
            vendor.setDescription(request.getDescription());
        }
        if (request.getBusinessEmail() != null) {
            vendor.setBusinessEmail(request.getBusinessEmail());
        }
        if (request.getBusinessPhone() != null) {
            vendor.setBusinessPhone(request.getBusinessPhone());
        }

        Vendor saved = vendorRepository.save(vendor);
        return toProfileResponse(saved);
    }

    public VendorProfileResponse uploadLogo(Long userId, MultipartFile file) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Vendor profile not found"));

        try {
            String url = storageClient.uploadFile(vendor.getId(), file);
            vendor.setLogoUrl(url);
        } catch (IOException | InterruptedException e) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload logo");
        }

        Vendor saved = vendorRepository.save(vendor);
        return toProfileResponse(saved);
    }

    public VendorProfileResponse uploadBanner(Long userId, MultipartFile file) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Vendor profile not found"));

        try {
            String url = storageClient.uploadFile(vendor.getId(), file);
            vendor.setBannerUrl(url);
        } catch (IOException | InterruptedException e) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload banner");
        }

        Vendor saved = vendorRepository.save(vendor);
        return toProfileResponse(saved);
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

    private VendorProfileResponse toProfileResponse(Vendor vendor) {
        return new VendorProfileResponse(
                vendor.getId(),
                vendor.getUserId(),
                vendor.getStoreName(),
                vendor.getSlug(),
                vendor.getDescription(),
                vendor.getBusinessEmail(),
                vendor.getBusinessPhone(),
                vendor.getLogoUrl(),
                vendor.getBannerUrl(),
                vendor.getRating(),
                vendor.getStatus(),
                vendor.getCreatedAt()
        );
    }
}