package com.group5.marketplace.product.mapper;

import com.group5.marketplace.product.dto.ProductRequest;
import com.group5.marketplace.product.dto.ProductResponse;
import com.group5.marketplace.product.entity.Product;
import com.group5.marketplace.product.entity.ProductImage;
import com.group5.marketplace.vendor.repository.VendorRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

    private final VendorRepository vendorRepository;

    public ProductMapper(VendorRepository vendorRepository) {
        this.vendorRepository = vendorRepository;
    }

    public Product toEntity(ProductRequest req) {
        return Product.builder()
                .name(req.getName())
                .slug(req.getSlug())
                .description(req.getDescription())
                .price(req.getPrice())
                .build();
    }

    public ProductResponse toResponse(Product p) {
        List<String> images = p.getImages() == null ? List.of() : p.getImages().stream().map(ProductImage::getUrl).collect(Collectors.toList());
        String storeName = null;
        if (p.getVendorId() != null) {
            try {
                storeName = vendorRepository.findByUserId(p.getVendorId())
                        .map(v -> v.getStoreName())
                        .orElse(null);
            } catch (Exception e) {
                // vendor_id may contain corrupted data (e.g. null bytes); skip store name lookup
            }
        }
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .description(p.getDescription())
                .price(p.getPrice())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .vendorId(p.getVendorId())
                .storeName(storeName)
                .images(images)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
