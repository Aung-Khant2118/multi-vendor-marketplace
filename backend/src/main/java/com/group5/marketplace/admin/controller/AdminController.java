package com.group5.marketplace.admin.controller;

import com.group5.marketplace.admin.dto.AdminAnalyticsResponse;
import com.group5.marketplace.admin.dto.AdminDashboardResponse;
import com.group5.marketplace.admin.dto.AdminUserResponse;
import com.group5.marketplace.admin.dto.AdminVendorResponse;
import com.group5.marketplace.admin.dto.UpdateUserStatusRequest;
import com.group5.marketplace.admin.service.AdminService;
import com.group5.marketplace.audit.entity.AuditLog;
import com.group5.marketplace.audit.service.AuditService;
import com.group5.marketplace.category.dto.CategoryResponse;
import com.group5.marketplace.user.util.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final AuditService auditService;
    private final CurrentUserService currentUserService;

    public AdminController(AdminService adminService, AuditService auditService,
                           CurrentUserService currentUserService) {
        this.adminService = adminService;
        this.auditService = auditService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        AdminDashboardResponse data = adminService.getDashboard();
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", data);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> analytics() {
        AdminAnalyticsResponse data = adminService.getAnalytics();
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", data);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> listCategories() {
        java.util.List<CategoryResponse> categories = adminService.listCategories();
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", categories);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> listUsers(
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AdminUserResponse> users = adminService.listUsers(role, page, size);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", users.getContent());
        body.put("totalElements", users.getTotalElements());
        body.put("totalPages", users.getTotalPages());
        body.put("currentPage", users.getNumber());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> getUser(@PathVariable Long id) {
        AdminUserResponse user = adminService.getUser(id);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", user);
        return ResponseEntity.ok(body);
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<Map<String, Object>> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request,
            Principal principal) {
        Long adminId = currentUserService.getCurrentUserId(principal);
        String adminEmail = principal.getName();
        AdminUserResponse user = adminService.updateUserRole(id, request.getRole(), adminId, adminEmail);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "User role updated");
        body.put("data", user);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/vendors")
    public ResponseEntity<Map<String, Object>> listVendors(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AdminVendorResponse> vendors = adminService.listVendors(status, page, size);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", vendors.getContent());
        body.put("totalElements", vendors.getTotalElements());
        body.put("totalPages", vendors.getTotalPages());
        body.put("currentPage", vendors.getNumber());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/vendors/{id}")
    public ResponseEntity<Map<String, Object>> getVendor(@PathVariable Long id) {
        AdminVendorResponse vendor = adminService.getVendor(id);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", vendor);
        return ResponseEntity.ok(body);
    }

    @PatchMapping("/vendors/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveVendor(@PathVariable Long id, Principal principal) {
        Long adminId = currentUserService.getCurrentUserId(principal);
        String adminEmail = principal.getName();
        AdminVendorResponse vendor = adminService.approveVendor(id, adminId, adminEmail);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Vendor approved");
        body.put("data", vendor);
        return ResponseEntity.ok(body);
    }

    @PatchMapping("/vendors/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectVendor(@PathVariable Long id, Principal principal) {
        Long adminId = currentUserService.getCurrentUserId(principal);
        String adminEmail = principal.getName();
        AdminVendorResponse vendor = adminService.rejectVendor(id, adminId, adminEmail);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Vendor rejected");
        body.put("data", vendor);
        return ResponseEntity.ok(body);
    }

    @PatchMapping("/vendors/{id}/suspend")
    public ResponseEntity<Map<String, Object>> suspendVendor(@PathVariable Long id, Principal principal) {
        Long adminId = currentUserService.getCurrentUserId(principal);
        String adminEmail = principal.getName();
        AdminVendorResponse vendor = adminService.suspendVendor(id, adminId, adminEmail);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Vendor suspended");
        body.put("data", vendor);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<Map<String, Object>> listAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuditLog> logs = auditService.getAll(page, size);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", logs.getContent());
        body.put("totalElements", logs.getTotalElements());
        body.put("totalPages", logs.getTotalPages());
        body.put("currentPage", logs.getNumber());
        return ResponseEntity.ok(body);
    }
}
