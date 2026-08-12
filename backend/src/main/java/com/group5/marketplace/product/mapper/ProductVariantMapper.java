package com.group5.marketplace.product.mapper;

import com.group5.marketplace.product.dto.ProductVariantRequest;
import com.group5.marketplace.product.dto.ProductVariantResponse;
import com.group5.marketplace.product.entity.ProductVariant;
import org.springframework.stereotype.Component;

@Component
public class ProductVariantMapper {

    public ProductVariant toEntity(ProductVariantRequest req) {
        return ProductVariant.builder()
                .sku(req.getSku())
                .price(req.getPrice())
                .stock(req.getStock())
                .attributes(req.getAttributes())
                .active(req.getActive() == null ? true : req.getActive())
                .build();
    }

    public ProductVariantResponse toResponse(ProductVariant v) {
        return ProductVariantResponse.builder()
                .id(v.getId())
                .productId(v.getProduct() != null ? v.getProduct().getId() : null)
                .sku(v.getSku())
                .price(v.getPrice())
                .stock(v.getStock())
                .attributes(v.getAttributes())
                .active(v.getActive())
                .build();
    }
}

