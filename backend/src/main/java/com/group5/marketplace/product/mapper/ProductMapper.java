package com.group5.marketplace.product.mapper;

import com.group5.marketplace.product.dto.ProductRequest;
import com.group5.marketplace.product.dto.ProductResponse;
import com.group5.marketplace.product.entity.Product;
import com.group5.marketplace.product.entity.ProductImage;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;
@Component
public class ProductMapper {

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
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .description(p.getDescription())
                .price(p.getPrice())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .vendorId(p.getVendorId())
                .images(images)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}

