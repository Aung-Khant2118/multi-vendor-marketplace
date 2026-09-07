package com.group5.marketplace.product.service.impl;

import com.group5.marketplace.category.entity.Category;
import com.group5.marketplace.category.repository.CategoryRepository;
import com.group5.marketplace.product.dto.ProductRequest;
import com.group5.marketplace.product.dto.ProductResponse;
import com.group5.marketplace.product.dto.ProductSearchRequest;
import com.group5.marketplace.product.dto.SearchSuggestion;
import com.group5.marketplace.product.dto.VariantAttributeDto;
import com.group5.marketplace.product.entity.Product;
import com.group5.marketplace.product.entity.ProductImage;
import com.group5.marketplace.product.entity.ProductVariant;
import com.group5.marketplace.product.entity.VariantAttribute;
import com.group5.marketplace.product.mapper.ProductMapper;
import com.group5.marketplace.product.repository.ProductRepository;
import com.group5.marketplace.product.service.ProductService;
import com.group5.marketplace.vendor.entity.Vendor;
import com.group5.marketplace.vendor.repository.VendorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final VendorRepository vendorRepository;
    private final ProductMapper productMapper;

    public ProductServiceImpl(ProductRepository productRepository, CategoryRepository categoryRepository,
                              VendorRepository vendorRepository, ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.vendorRepository = vendorRepository;
        this.productMapper = productMapper;
    }

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request, Long vendorId) {
        Product p = productMapper.toEntity(request);
        p.setVendorId(vendorId);

        if (request.getCategoryId() != null) {
            var cat = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found"));
            p.setCategory(cat);
        }

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            Set<ProductImage> images = request.getImages().stream().map(url -> ProductImage.builder()
                    .product(p)
                    .url(url)
                    .uploaderId(vendorId)
                    .build()).collect(Collectors.toSet());
            p.setImages(images);
        }

        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            List<ProductVariant> variants = new ArrayList<>();
            for (ProductRequest.VariantInput vi : request.getVariants()) {
                Set<VariantAttribute> attrs = new HashSet<>();
                if (vi.getAttributes() != null) {
                    for (VariantAttributeDto dto : vi.getAttributes()) {
                        attrs.add(new VariantAttribute(null, dto.getName(), dto.getValue()));
                    }
                }
                ProductVariant variant = ProductVariant.builder()
                        .product(p)
                        .sku(vi.getSku())
                        .price(vi.getPrice())
                        .stock(vi.getStock())
                        .attributes(attrs)
                        .active(true)
                        .build();
                for (VariantAttribute attr : attrs) {
                    attr.setVariant(variant);
                }
                variants.add(variant);
            }
            p.setVariants(variants);
        }

        Product saved = productRepository.save(p);
        Map<Long, String> vendorNames = saved.getVendorId() != null
                ? productMapper.resolveVendorNames(List.of(saved))
                : Map.of();
        return productMapper.toResponse(saved, vendorNames);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAll() {
        List<Product> products = productRepository.findAllWithImages();
        Map<Long, String> vendorNames = productMapper.resolveVendorNames(products);
        return products.stream()
                .map(p -> productMapper.toResponse(p, vendorNames))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getBySlug(String slug) {
        Product p = productRepository.findBySlug(slug).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        Map<Long, String> vendorNames = p.getVendorId() != null
                ? productMapper.resolveVendorNames(List.of(p))
                : Map.of();
        return productMapper.toResponse(p, vendorNames);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product p = productRepository.findWithImagesById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        Map<Long, String> vendorNames = p.getVendorId() != null
                ? productMapper.resolveVendorNames(List.of(p))
                : Map.of();
        return productMapper.toResponse(p, vendorNames);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllByVendor(Long vendorId) {
        List<Product> products = productRepository.findByVendorId(vendorId);
        Map<Long, String> vendorNames = productMapper.resolveVendorNames(products);
        return products.stream()
                .map(p -> productMapper.toResponse(p, vendorNames))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long countByVendorId(Long vendorId) {
        return productRepository.countByVendorId(vendorId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> search(ProductSearchRequest req) {
        String q = req.getQ() != null ? req.getQ().trim() : "";
        Long categoryId = req.getCategoryId();
        BigDecimal priceMin = req.getPriceMin();
        BigDecimal priceMax = req.getPriceMax();
        Long vendorId = req.getVendorId();
        String sort = req.getSort();
        int page = req.getPage();
        int size = req.getSize();

        boolean hasTextSearch = q != null && !q.isEmpty();
        boolean hasSort = sort != null && !sort.isBlank();

        Sort springSort = Sort.unsorted();
        if (hasSort) {
            springSort = switch (sort) {
                case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
                case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
                case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt");
                case "oldest" -> Sort.by(Sort.Direction.ASC, "createdAt");
                case "name" -> Sort.by(Sort.Direction.ASC, "name");
                case "rating" -> Sort.by(Sort.Direction.DESC, "averageRating");
                default -> Sort.unsorted();
            };
        }

        Pageable pageable = hasSort
                ? PageRequest.of(page, size, springSort)
                : PageRequest.of(page, size);

        List<Product> content;
        long total;

        if (hasTextSearch) {
            try {
                Page<Long> idPage = productRepository.searchFullTextIds(
                        q, categoryId, priceMin, priceMax, vendorId, sort, pageable);
                total = idPage.getTotalElements();
                if (idPage.isEmpty()) {
                    content = List.of();
                } else {
                    List<Long> ids = idPage.getContent();
                    Map<Long, Integer> idOrder = new java.util.HashMap<>();
                    for (int i = 0; i < ids.size(); i++) idOrder.put(ids.get(i), i);
                    content = new ArrayList<>(productRepository.findByIdInWithAll(ids));
                    content.sort(Comparator.comparingInt(p -> idOrder.getOrDefault(p.getId(), Integer.MAX_VALUE)));
                }
            } catch (Exception e) {
                Page<Product> result = productRepository.search(
                        q, categoryId, priceMin, priceMax, vendorId, pageable);
                content = new ArrayList<>(result.getContent());
                total = result.getTotalElements();
            }
        } else {
            Page<Product> result = productRepository.search(
                    q, categoryId, priceMin, priceMax, vendorId, pageable);
            content = new ArrayList<>(result.getContent());
            total = result.getTotalElements();
        }

        if (Boolean.TRUE.equals(req.getInStock())) {
            content = content.stream()
                    .filter(p -> p.getVariants() != null &&
                            p.getVariants().stream().anyMatch(v -> v.getStock() != null && v.getStock() > 0))
                    .collect(Collectors.toList());
        }

        Map<Long, String> vendorNames = productMapper.resolveVendorNames(content);
        List<ProductResponse> responseList = content.stream()
                .map(p -> productMapper.toResponse(p, vendorNames))
                .collect(Collectors.toList());
        return new org.springframework.data.domain.PageImpl<>(responseList, pageable, total);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SearchSuggestion> autocomplete(String q, int limit) {
        if (q == null || q.trim().isEmpty()) {
            return List.of();
        }
        String query = q.trim();
        int effectiveLimit = Math.min(Math.max(limit, 1), 10);

        List<SearchSuggestion> results = new ArrayList<>();

        // Search products
        try {
            List<Product> products = productRepository.autocomplete(query, effectiveLimit);
            results.addAll(products.stream()
                    .map(p -> {
                        String imageUrl = (p.getImages() != null && !p.getImages().isEmpty())
                                ? p.getImages().iterator().next().getUrl() : null;
                        return new SearchSuggestion(p.getId(), p.getName(), p.getSlug(), "product", imageUrl);
                    })
                    .collect(Collectors.toList()));
        } catch (Exception e) {
            List<Product> products = productRepository.search(
                    query, null, null, null, null,
                    PageRequest.of(0, effectiveLimit))
                    .getContent();
            results.addAll(products.stream()
                    .map(p -> {
                        String imageUrl = (p.getImages() != null && !p.getImages().isEmpty())
                                ? p.getImages().iterator().next().getUrl() : null;
                        return new SearchSuggestion(p.getId(), p.getName(), p.getSlug(), "product", imageUrl);
                    })
                    .collect(Collectors.toList()));
        }

        // Search vendors
        try {
            List<Vendor> vendors = vendorRepository.searchByName(query, PageRequest.of(0, effectiveLimit));
            results.addAll(vendors.stream()
                    .map(v -> new SearchSuggestion(v.getId(), v.getStoreName(), v.getSlug(), "vendor", v.getLogoUrl()))
                    .collect(Collectors.toList()));
        } catch (Exception ignored) {}

        // Search categories
        try {
            List<Category> categories = categoryRepository.searchByName(query, PageRequest.of(0, effectiveLimit));
            results.addAll(categories.stream()
                    .map(c -> new SearchSuggestion(c.getId(), c.getName(), c.getSlug(), "category", c.getImageUrl()))
                    .collect(Collectors.toList()));
        } catch (Exception ignored) {}

        return results;
    }

    @Override
    @Transactional
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
        Map<Long, String> vendorNames = saved.getVendorId() != null
                ? productMapper.resolveVendorNames(List.of(saved))
                : Map.of();
        return productMapper.toResponse(saved, vendorNames);
    }

    @Override
    @Transactional
    public void delete(Long id, Long vendorId) {
        Product p = productRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (p.getVendorId() == null || !p.getVendorId().equals(vendorId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner");
        productRepository.delete(p);
    }
}
