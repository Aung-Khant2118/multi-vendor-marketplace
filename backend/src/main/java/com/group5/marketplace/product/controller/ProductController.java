package com.group5.marketplace.product.controller;

import com.group5.marketplace.product.dto.ProductRequest;
import com.group5.marketplace.product.dto.ProductResponse;
import com.group5.marketplace.product.entity.ProductImage;
import com.group5.marketplace.product.service.ProductService;
import com.group5.marketplace.product.service.impl.ProductImageService;
import com.group5.marketplace.user.util.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    public ProductController(ProductService productService, CurrentUserService currentUserService, ProductImageService productImageService,
                             com.group5.marketplace.product.service.ProductVariantService variantService) {
        this.productService = productService;
        this.currentUserService = currentUserService;
        this.productImageService = productImageService;
        this.variantService = variantService;
    }

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> list() {
        List<ProductResponse> data = productService.getAll();
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", data);
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

    // Explicit id-based lookup so the frontend can request a product by numeric id.
    @GetMapping("/products/id/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        ProductResponse resp = productService.getById(id);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", resp);
        return ResponseEntity.ok(body);
    }

    // Vendor's own product listing.
    @GetMapping("/vendor/products")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> listMine(Principal principal) {
        Long vendorId = currentUserService.getCurrentUserId(principal);
        List<ProductResponse> data = productService.getAllByVendor(vendorId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", data);
        return ResponseEntity.ok(body);
    }

    // Vendor dashboard summary counts.
    @GetMapping("/vendor/dashboard")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> dashboard(Principal principal) {
        Long vendorId = currentUserService.getCurrentUserId(principal);
        List<ProductResponse> products = productService.getAllByVendor(vendorId);
        long variantCount = 0;
        long stockUnits = 0;
        for (ProductResponse p : products) {
            List<com.group5.marketplace.product.dto.ProductVariantResponse> variants =
                    variantService.getByProduct(p.getId());
            variantCount += variants.size();
            for (com.group5.marketplace.product.dto.ProductVariantResponse v : variants) {
                stockUnits += v.getStock() == null ? 0 : v.getStock();
            }
        }
        Map<String, Object> data = new HashMap<>();
        data.put("productCount", (long) products.size());
        data.put("variantCount", variantCount);
        data.put("stockUnits", stockUnits);
        data.put("ordersCount", 0L);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", data);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/vendor/products")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody ProductRequest request, Principal principal) {
        // vendorId extraction: resolve current authenticated user id
        Long vendorId = currentUserService.getCurrentUserId(principal);
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
        Long vendorId = currentUserService.getCurrentUserId(principal);
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
        Long vendorId = currentUserService.getCurrentUserId(principal);
        productService.delete(id, vendorId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Product deleted successfully");
        return ResponseEntity.ok(body);
    }

    // Image upload endpoint for vendors
    @PostMapping(value = "/vendor/products/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> uploadImage(@PathVariable("id") Long id,
                                                           @RequestParam("file") MultipartFile file,
                                                           Principal principal) {
        Long vendorId = currentUserService.getCurrentUserId(principal);
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

    @DeleteMapping("/vendor/products/{productId}/images/{imageId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> deleteImage(@PathVariable("productId") Long productId,
                                                           @PathVariable("imageId") Long imageId,
                                                           Principal principal) {
        Long vendorId = currentUserService.getCurrentUserId(principal);
        productImageService.deleteImage(productId, imageId, vendorId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Image deleted");
        return ResponseEntity.ok(body);
    }
}

