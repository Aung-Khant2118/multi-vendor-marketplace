package com.group5.marketplace.product.service;

import com.group5.marketplace.product.dto.ProductRequest;
import com.group5.marketplace.product.dto.ProductResponse;

import java.util.List;
public interface ProductService {

    ProductResponse create(ProductRequest request, Long vendorId);

    List<ProductResponse> getAll();

    ProductResponse getBySlug(String slug);

    ProductResponse getById(Long id);

    ProductResponse update(Long id, ProductRequest request, Long vendorId);

    void delete(Long id, Long vendorId);
}

