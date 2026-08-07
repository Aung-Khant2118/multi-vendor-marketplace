package com.group5.marketplace.category.controller;

import com.group5.marketplace.category.dto.CategoryRequest;
import com.group5.marketplace.category.dto.CategoryResponse;
import com.group5.marketplace.category.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getAll() {
        List<CategoryResponse> categories = categoryService.getAll();
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", categories);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/categories/{slug}")
    public ResponseEntity<Map<String, Object>> getBySlug(@PathVariable String slug) {
        CategoryResponse resp = categoryService.getBySlug(slug);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", resp);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/admin/categories")
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse created = categoryService.create(request);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Category created successfully");
        body.put("data", created);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PatchMapping("/admin/categories/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        CategoryResponse updated = categoryService.update(id, request);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Category updated successfully");
        body.put("data", updated);
        return ResponseEntity.ok(body);
    }

    @DeleteMapping("/admin/categories/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        categoryService.delete(id);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Category deleted (soft) successfully");
        return ResponseEntity.ok(body);
    }
}
