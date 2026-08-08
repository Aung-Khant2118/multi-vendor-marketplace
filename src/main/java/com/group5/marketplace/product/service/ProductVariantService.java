package com.group5.marketplace.product.service;

import com.group5.marketplace.product.dto.ProductVariantRequest;
import com.group5.marketplace.product.dto.ProductVariantResponse;

import java.util.List;

public interface ProductVariantService {

    ProductVariantResponse create(ProductVariantRequest request, Long vendorId);

    List<ProductVariantResponse> getByProduct(Long productId);

    ProductVariantResponse getById(Long id);

    ProductVariantResponse update(Long id, ProductVariantRequest request, Long vendorId);

    void updateStock(Long id, Integer stockDelta, Long vendorId);

    void delete(Long id, Long vendorId);
}

