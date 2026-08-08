package com.group5.marketplace.product.controller;

import com.group5.marketplace.product.dto.ProductRequest;
import com.group5.marketplace.product.dto.ProductResponse;
import com.group5.marketplace.product.entity.ProductImage;
import com.group5.marketplace.product.service.ProductService;
import com.group5.marketplace.product.service.impl.ProductImageService;
import com.group5.marketplace.user.util.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final CurrentUserService currentUserService;
    private final ProductImageService productImageService;

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

