package com.group5.marketplace.category.service;

import com.group5.marketplace.category.dto.CategoryRequest;
import com.group5.marketplace.category.dto.CategoryResponse;

import java.util.List;

public interface CategoryService {

    CategoryResponse create(CategoryRequest request);

    List<CategoryResponse> getAll();

    CategoryResponse getById(Long id);

    CategoryResponse getBySlug(String slug);

    CategoryResponse update(Long id, CategoryRequest request);

    void delete(Long id);
}
