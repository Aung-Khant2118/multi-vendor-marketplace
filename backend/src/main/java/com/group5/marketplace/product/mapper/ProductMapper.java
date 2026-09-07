package com.group5.marketplace.product.mapper;

import com.group5.marketplace.product.dto.ProductImageData;
import com.group5.marketplace.product.dto.ProductRequest;
import com.group5.marketplace.product.dto.ProductResponse;
import com.group5.marketplace.product.dto.ProductVariantResponse;
import com.group5.marketplace.product.dto.VariantAttributeDto;
import com.group5.marketplace.product.entity.Product;
import com.group5.marketplace.product.entity.ProductImage;
import com.group5.marketplace.product.entity.ProductVariant;
import com.group5.marketplace.product.entity.VariantAttribute;
import com.group5.marketplace.vendor.entity.Vendor;
import com.group5.marketplace.vendor.repository.VendorRepository;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

    private final VendorRepository vendorRepository;

    public ProductMapper(VendorRepository vendorRepository) {
        this.vendorRepository = vendorRepository;
    }

    public Map<Long, String> resolveVendorNames(List<Product> products) {
        Set<Long> vendorIds = products.stream()
                .map(Product::getVendorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        if (vendorIds.isEmpty()) {
            return Map.of();
        }
        return vendorRepository.findByIdIn(vendorIds).stream()
                .collect(Collectors.toMap(Vendor::getId, Vendor::getStoreName, (a, b) -> a));
    }

    public Product toEntity(ProductRequest req) {
        return Product.builder()
                .name(req.getName())
                .slug(req.getSlug())
                .description(req.getDescription())
                .price(req.getPrice())
                .build();
    }

    public ProductResponse toResponse(Product p, Map<Long, String> vendorNames) {
        List<String> images = p.getImages() == null ? List.of()
                : p.getImages().stream().map(ProductImage::getUrl).collect(Collectors.toList());
        List<ProductImageData> imageObjects = p.getImages() == null ? List.of()
                : p.getImages().stream().map(img -> new ProductImageData(img.getId(), img.getUrl())).collect(Collectors.toList());
        List<ProductVariantResponse> variants = p.getVariants() == null ? List.of()
                : p.getVariants().stream().map(this::toVariantResponse).collect(Collectors.toList());
        String storeName = null;
        if (p.getVendorId() != null) {
            storeName = vendorNames.get(p.getVendorId());
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
                .averageRating(p.getAverageRating())
                .reviewCount(p.getReviewCount())
                .images(images)
                .imageObjects(imageObjects)
                .variants(variants)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private ProductVariantResponse toVariantResponse(ProductVariant v) {
        List<VariantAttributeDto> attrDtos = v.getAttributes() == null ? Collections.emptyList()
                : v.getAttributes().stream()
                    .map(a -> new VariantAttributeDto(a.getName(), a.getValue()))
                    .collect(Collectors.toList());
        int stockCount = v.getStock() == null ? 0 : v.getStock();
        return ProductVariantResponse.builder()
                .id(v.getId())
                .productId(v.getProduct() != null ? v.getProduct().getId() : null)
                .sku(v.getSku())
                .price(v.getPrice())
                .stock(v.getStock())
                .inStock(stockCount > 0)
                .variantLabel(v.getVariantLabel())
                .attributes(attrDtos)
                .active(v.getActive())
                .build();
    }
}
