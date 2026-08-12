package com.group5.marketplace.category.service;

import com.group5.marketplace.category.dto.CategoryRequest;
import com.group5.marketplace.category.dto.CategoryResponse;
import com.group5.marketplace.category.entity.Category;
import com.group5.marketplace.category.mapper.CategoryMapper;
import com.group5.marketplace.category.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public CategoryServiceImpl(CategoryRepository categoryRepository, CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }

    @Override
    public CategoryResponse create(CategoryRequest request) {

        if (categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Category name already exists.");
        }

        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Category slug already exists.");
        }

        Category category = categoryMapper.toEntity(request);

        Category savedCategory = categoryRepository.save(category);

        return categoryMapper.toResponse(savedCategory);
    }

    @Override
    public List<CategoryResponse> getAll() {

        return categoryRepository.findAll()
                .stream()
                .filter(Category::getActive)
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    public CategoryResponse getById(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found."));

        return categoryMapper.toResponse(category);
    }

    @Override
    public CategoryResponse getBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Category not found."));

        return categoryMapper.toResponse(category);
    }

    @Override
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found."));

        // validate name
        if (request.getName() != null && !request.getName().equals(category.getName())) {
            categoryRepository.findByName(request.getName()).ifPresent(c -> {
                if (!c.getId().equals(id)) {
                    throw new RuntimeException("Category name already exists.");
                }
            });
            category.setName(request.getName());
        }

        // validate slug
        if (request.getSlug() != null && !request.getSlug().equals(category.getSlug())) {
            categoryRepository.findBySlug(request.getSlug()).ifPresent(c -> {
                if (!c.getId().equals(id)) {
                    throw new RuntimeException("Category slug already exists.");
                }
            });
            category.setSlug(request.getSlug());
        }

        if (request.getDescription() != null) category.setDescription(request.getDescription());
        if (request.getImageUrl() != null) category.setImageUrl(request.getImageUrl());
        if (request.getActive() != null) category.setActive(request.getActive());

        Category saved = categoryRepository.save(category);

        return categoryMapper.toResponse(saved);
    }

    @Override
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found."));

        // soft delete: set active = false
        category.setActive(false);
        categoryRepository.save(category);
    }
}
