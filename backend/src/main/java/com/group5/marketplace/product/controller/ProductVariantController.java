package com.group5.marketplace.product.controller;

import com.group5.marketplace.product.dto.ProductVariantRequest;
import com.group5.marketplace.product.dto.ProductVariantResponse;
import com.group5.marketplace.product.service.ProductVariantService;
import com.group5.marketplace.user.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProductVariantController {

    private final ProductVariantService variantService;
    private final UserRepository userRepository;

    public ProductVariantController(ProductVariantService variantService, UserRepository userRepository) {
        this.variantService = variantService;
        this.userRepository = userRepository;
    }

    private Long getVendorId(java.security.Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();
    }

    @GetMapping("/products/{productId}/variants")
    public ResponseEntity<Map<String,Object>> listByProduct(@PathVariable Long productId) {
        List<ProductVariantResponse> data = variantService.getByProduct(productId);
        Map<String,Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", data);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/variants/{id}")
    public ResponseEntity<Map<String,Object>> getById(@PathVariable Long id) {
        ProductVariantResponse resp = variantService.getById(id);
        Map<String,Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", resp);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/vendor/products/{productId}/variants")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String,Object>> create(@PathVariable Long productId, @Valid @RequestBody ProductVariantRequest request, Principal principal) {
        // ensure request productId matches path
        request.setProductId(productId);
        Long vendorId = getVendorId(principal);
        ProductVariantResponse created = variantService.create(request, vendorId);
        Map<String,Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Variant created");
        body.put("data", created);
        return ResponseEntity.status(201).body(body);
    }

    @PatchMapping("/vendor/variants/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String,Object>> update(@PathVariable Long id, @Valid @RequestBody ProductVariantRequest request, Principal principal) {
        Long vendorId = getVendorId(principal);
        ProductVariantResponse updated = variantService.update(id, request, vendorId);
        Map<String,Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Variant updated");
        body.put("data", updated);
        return ResponseEntity.ok(body);
    }

    @PatchMapping("/vendor/variants/{id}/stock")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String,Object>> patchStock(@PathVariable Long id, @RequestParam Integer delta, Principal principal) {
        Long vendorId = getVendorId(principal);
        variantService.updateStock(id, delta, vendorId);
        Map<String,Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Stock updated");
        return ResponseEntity.ok(body);
    }

    @DeleteMapping("/vendor/variants/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String,Object>> delete(@PathVariable Long id, Principal principal) {
        Long vendorId = getVendorId(principal);
        variantService.delete(id, vendorId);
        Map<String,Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Variant deleted");
        return ResponseEntity.ok(body);
    }
}

