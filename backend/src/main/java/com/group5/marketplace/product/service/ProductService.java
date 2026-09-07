package com.group5.marketplace.product.service;

import com.group5.marketplace.product.dto.ProductRequest;
import com.group5.marketplace.product.dto.ProductResponse;
import com.group5.marketplace.product.dto.ProductSearchRequest;
import com.group5.marketplace.product.dto.SearchSuggestion;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ProductService {

    ProductResponse create(ProductRequest request, Long vendorId);

    List<ProductResponse> getAll();

    ProductResponse getBySlug(String slug);

    ProductResponse getById(Long id);

    List<ProductResponse> getAllByVendor(Long vendorId);

    long countByVendorId(Long vendorId);

    Page<ProductResponse> search(ProductSearchRequest request);

    List<SearchSuggestion> autocomplete(String q, int limit);

    ProductResponse update(Long id, ProductRequest request, Long vendorId);

    void delete(Long id, Long vendorId);
}
