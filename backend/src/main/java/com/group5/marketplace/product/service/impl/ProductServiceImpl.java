package com.group5.marketplace.product.service.impl;

// implementation already attempted earlier; creating final file

import com.group5.marketplace.category.repository.CategoryRepository;
import com.group5.marketplace.product.dto.ProductRequest;
import com.group5.marketplace.product.dto.ProductResponse;
import com.group5.marketplace.product.entity.Product;
import com.group5.marketplace.product.entity.ProductImage;
import com.group5.marketplace.product.mapper.ProductMapper;
import com.group5.marketplace.product.repository.ProductRepository;
import com.group5.marketplace.product.repository.ProductImageRepository;
import com.group5.marketplace.product.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;
    private final ProductImageRepository imageRepository;

    public ProductServiceImpl(ProductRepository productRepository, CategoryRepository categoryRepository, ProductMapper productMapper, ProductImageRepository imageRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productMapper = productMapper;
        this.imageRepository = imageRepository;
    }

    @Override
    public ProductResponse create(ProductRequest request, Long vendorId) {
        Product p = productMapper.toEntity(request);
        p.setVendorId(vendorId);

        if (request.getCategoryId() != null) {
            var cat = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found"));
            p.setCategory(cat);
        }

        Product saved = productRepository.save(p);

        if (request.getImages() != null) {
            List<ProductImage> images = request.getImages().stream().map(url -> ProductImage.builder()
                    .product(saved)
                    .url(url)
                    .uploaderId(vendorId)
                    .build()).collect(Collectors.toList());
            imageRepository.saveAll(images);
        }

        return productMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAll() {
        return productRepository.findAll().stream().map(productMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getBySlug(String slug) {
        Product p = productRepository.findBySlug(slug).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return productMapper.toResponse(p);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product p = productRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return productMapper.toResponse(p);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllByVendor(Long vendorId) {
        return productRepository.findByVendorId(vendorId).stream()
                .map(productMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> search(String q, Long categoryId, BigDecimal priceMin,
                                        BigDecimal priceMax, String sort, int page, int size) {
        Pageable pageable;
        if (sort != null && !sort.isBlank()) {
            switch (sort) {
                case "price_asc":
                    pageable = PageRequest.of(page, size, Sort.by("price").ascending());
                    break;
                case "price_desc":
                    pageable = PageRequest.of(page, size, Sort.by("price").descending());
                    break;
                case "name":
                    pageable = PageRequest.of(page, size, Sort.by("name").ascending());
                    break;
                case "oldest":
                    pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
                    break;
                default:
                    pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                    break;
            }
        } else {
            pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        }

        return productRepository.search(q != null ? q : "", categoryId, priceMin, priceMax, null, pageable)
                .map(productMapper::toResponse);
    }

    @Override
    public ProductResponse update(Long id, ProductRequest request, Long vendorId) {
        Product p = productRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (p.getVendorId() == null || !p.getVendorId().equals(vendorId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner");

        if (request.getName() != null) p.setName(request.getName());
        if (request.getSlug() != null) p.setSlug(request.getSlug());
        if (request.getDescription() != null) p.setDescription(request.getDescription());
        if (request.getPrice() != null) p.setPrice(request.getPrice());

        if (request.getCategoryId() != null) {
            var cat = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found"));
            p.setCategory(cat);
        }

        Product saved = productRepository.save(p);
        return productMapper.toResponse(saved);
    }

    @Override
    public void delete(Long id, Long vendorId) {
        Product p = productRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (p.getVendorId() == null || !p.getVendorId().equals(vendorId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner");
        productRepository.delete(p);
    }
}

