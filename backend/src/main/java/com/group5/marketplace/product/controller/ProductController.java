package com.group5.marketplace.product.controller;

import com.group5.marketplace.product.dto.ProductRequest;
import com.group5.marketplace.product.dto.ProductResponse;
import com.group5.marketplace.product.dto.ProductSearchRequest;
import com.group5.marketplace.product.dto.SearchSuggestion;
import com.group5.marketplace.product.entity.ProductImage;
import com.group5.marketplace.product.service.ProductService;
import com.group5.marketplace.product.service.impl.ProductImageService;
import com.group5.marketplace.user.util.CurrentUserService;
import com.group5.marketplace.vendor.entity.Vendor;
import com.group5.marketplace.vendor.repository.VendorRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductService productService;
    private final CurrentUserService currentUserService;
    private final ProductImageService productImageService;
    private final com.group5.marketplace.product.service.ProductVariantService variantService;
    private final com.group5.marketplace.order.repository.OrderItemRepository orderItemRepository;
    private final VendorRepository vendorRepository;

    public ProductController(ProductService productService, CurrentUserService currentUserService, ProductImageService productImageService,
                             com.group5.marketplace.product.service.ProductVariantService variantService,
                             com.group5.marketplace.order.repository.OrderItemRepository orderItemRepository,
                             VendorRepository vendorRepository) {
        this.productService = productService;
        this.currentUserService = currentUserService;
        this.productImageService = productImageService;
        this.variantService = variantService;
        this.orderItemRepository = orderItemRepository;
        this.vendorRepository = vendorRepository;
    }

    private Long resolveVendorId(Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendor profile not found"));
        return vendor.getId();
    }

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long category,
            @RequestParam(required = false) Long vendor,
            @RequestParam(required = false) BigDecimal priceMin,
            @RequestParam(required = false) BigDecimal priceMax,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        ProductSearchRequest req = new ProductSearchRequest();
        req.setQ(q);
        req.setCategoryId(category);
        req.setVendorId(vendor);
        req.setPriceMin(priceMin);
        req.setPriceMax(priceMax);
        req.setInStock(inStock);
        req.setMinRating(minRating);
        req.setSort(sort);
        req.setPage(page);
        req.setSize(size);
        Page<ProductResponse> products = productService.search(req);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", products.getContent());
        body.put("totalElements", products.getTotalElements());
        body.put("totalPages", products.getTotalPages());
        body.put("currentPage", products.getNumber());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/products/autocomplete")
    public ResponseEntity<Map<String, Object>> autocomplete(
            @RequestParam String q,
            @RequestParam(defaultValue = "5") int limit) {
        List<SearchSuggestion> suggestions = productService.autocomplete(q, limit);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", suggestions);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/products/{slug}")
    public ResponseEntity<Map<String, Object>> getBySlug(@PathVariable String slug) {
        ProductResponse resp = productService.getBySlug(slug);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", resp);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/products/id/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        ProductResponse resp = productService.getById(id);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", resp);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/vendor/products")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> listMine(Principal principal) {
        Long vendorId = resolveVendorId(principal);
        List<ProductResponse> data = productService.getAllByVendor(vendorId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", data);
        body.put("vendorId", vendorId);
        body.put("count", data.size());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/vendor/dashboard")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> dashboard(Principal principal) {
        Long vendorId = resolveVendorId(principal);
        long productCount = productService.countByVendorId(vendorId);
        long variantCount = variantService.countByVendorId(vendorId);
        long stockUnits = variantService.sumStockByVendorId(vendorId);
        long ordersCount = orderItemRepository.countDistinctOrdersByVendorId(vendorId);

        Map<String, Object> data = new HashMap<>();
        data.put("productCount", productCount);
        data.put("variantCount", variantCount);
        data.put("stockUnits", stockUnits);
        data.put("ordersCount", (long) ordersCount);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", data);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/vendor/products")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody ProductRequest request, Principal principal) {
        Long vendorId = resolveVendorId(principal);
        ProductResponse created = productService.create(request, vendorId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Product created successfully");
        body.put("data", created);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PatchMapping("/vendor/products/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @Valid @RequestBody ProductRequest request, Principal principal) {
        Long vendorId = resolveVendorId(principal);
        ProductResponse updated = productService.update(id, request, vendorId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Product updated successfully");
        body.put("data", updated);
        return ResponseEntity.ok(body);
    }

    @DeleteMapping("/vendor/products/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id, Principal principal) {
        Long vendorId = resolveVendorId(principal);
        productService.delete(id, vendorId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Product deleted successfully");
        return ResponseEntity.ok(body);
    }

    @PostMapping(value = "/vendor/products/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> uploadImage(@PathVariable("id") Long id,
                                                           @RequestParam("file") MultipartFile file,
                                                           Principal principal) {
        Long vendorId = resolveVendorId(principal);
        ProductImage img = productImageService.uploadImage(id, file, vendorId);
        Map<String, Object> data = new HashMap<>();
        data.put("id", img.getId());
        data.put("url", img.getUrl());

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Image uploaded");
        body.put("data", data);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PostMapping("/vendor/products/{id}/images/url")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> saveImageUrl(@PathVariable("id") Long id,
                                                            @RequestBody Map<String, String> payload,
                                                            Principal principal) {
        Long vendorId = resolveVendorId(principal);
        String url = payload.get("url");
        if (url == null || url.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "URL is required"));
        }
        ProductImage img = productImageService.saveUrl(id, url, vendorId);
        Map<String, Object> data = new HashMap<>();
        data.put("id", img.getId());
        data.put("url", img.getUrl());

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Image saved");
        body.put("data", data);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @DeleteMapping("/vendor/products/{productId}/images/{imageId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> deleteImage(@PathVariable("productId") Long productId,
                                                           @PathVariable("imageId") Long imageId,
                                                           Principal principal) {
        Long vendorId = resolveVendorId(principal);
        productImageService.deleteImage(productId, imageId, vendorId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Image deleted");
        return ResponseEntity.ok(body);
    }
}
