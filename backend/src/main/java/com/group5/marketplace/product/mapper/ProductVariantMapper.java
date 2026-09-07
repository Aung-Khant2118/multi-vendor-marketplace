package com.group5.marketplace.product.mapper;

import com.group5.marketplace.product.dto.ProductVariantRequest;
import com.group5.marketplace.product.dto.ProductVariantResponse;
import com.group5.marketplace.product.dto.VariantAttributeDto;
import com.group5.marketplace.product.entity.ProductVariant;
import com.group5.marketplace.product.entity.VariantAttribute;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ProductVariantMapper {

    public ProductVariant toEntity(ProductVariantRequest req) {
        ProductVariant v = ProductVariant.builder()
                .sku(req.getSku())
                .price(req.getPrice())
                .stock(req.getStock())
                .active(req.getActive() == null ? true : req.getActive())
                .build();
        if (req.getAttributes() != null) {
            Set<VariantAttribute> attrs = new HashSet<>();
            for (VariantAttributeDto dto : req.getAttributes()) {
                VariantAttribute attr = new VariantAttribute(v, dto.getName(), dto.getValue());
                attrs.add(attr);
            }
            v.setAttributes(attrs);
        }
        return v;
    }

    public ProductVariantResponse toResponse(ProductVariant v) {
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
