package com.group5.marketplace.product.service;

import com.group5.marketplace.product.dto.ProductRequest;
import com.group5.marketplace.product.dto.ProductResponse;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {

    ProductResponse create(ProductRequest request, Long vendorId);

    List<ProductResponse> getAll();

    ProductResponse getBySlug(String slug);

    ProductResponse getById(Long id);

    List<ProductResponse> getAllByVendor(Long vendorId);

    Page<ProductResponse> search(String q, Long categoryId, BigDecimal priceMin,
                                 BigDecimal priceMax, String sort, int page, int size);

    ProductResponse update(Long id, ProductRequest request, Long vendorId);

    void delete(Long id, Long vendorId);
}
