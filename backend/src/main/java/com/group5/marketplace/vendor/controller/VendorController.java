package com.group5.marketplace.vendor.controller;

import com.group5.marketplace.user.util.CurrentUserService;
import com.group5.marketplace.vendor.dto.VendorProfileRequest;
import com.group5.marketplace.vendor.dto.VendorProfileResponse;
import com.group5.marketplace.vendor.service.VendorService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/vendor")
@org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
public class VendorController {

    private final VendorService vendorService;
    private final CurrentUserService currentUserService;

    public VendorController(VendorService vendorService, CurrentUserService currentUserService) {
        this.vendorService = vendorService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        VendorProfileResponse profile = vendorService.getProfile(userId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", profile);
        return ResponseEntity.ok(body);
    }

    @PatchMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @Valid @RequestBody VendorProfileRequest request,
            Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        VendorProfileResponse profile = vendorService.updateProfile(userId, request);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Profile updated successfully");
        body.put("data", profile);
        return ResponseEntity.ok(body);
    }

    @PostMapping(value = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadLogo(
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        VendorProfileResponse profile = vendorService.uploadLogo(userId, file);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Logo uploaded successfully");
        body.put("data", profile);
        return ResponseEntity.ok(body);
    }

    @PostMapping(value = "/banner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadBanner(
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        VendorProfileResponse profile = vendorService.uploadBanner(userId, file);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Banner uploaded successfully");
        body.put("data", profile);
        return ResponseEntity.ok(body);
    }
}
