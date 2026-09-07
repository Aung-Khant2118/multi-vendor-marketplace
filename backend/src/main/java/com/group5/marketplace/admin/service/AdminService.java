package com.group5.marketplace.admin.service;

import com.group5.marketplace.admin.dto.AdminAnalyticsResponse;
import com.group5.marketplace.admin.dto.AdminDashboardResponse;
import com.group5.marketplace.admin.dto.AdminUserResponse;
import com.group5.marketplace.admin.dto.AdminVendorResponse;
import com.group5.marketplace.audit.service.AuditService;
import com.group5.marketplace.notification.entity.Notification.NotificationType;
import com.group5.marketplace.notification.service.NotificationService;
import com.group5.marketplace.category.dto.CategoryResponse;
import com.group5.marketplace.category.entity.Category;
import com.group5.marketplace.category.mapper.CategoryMapper;
import com.group5.marketplace.category.repository.CategoryRepository;
import com.group5.marketplace.order.entity.PaymentStatus;
import com.group5.marketplace.order.repository.OrderRepository;
import com.group5.marketplace.order.repository.PaymentRepository;
import com.group5.marketplace.product.repository.ProductRepository;
import com.group5.marketplace.user.entity.User;
import com.group5.marketplace.user.repository.UserRepository;
import com.group5.marketplace.vendor.entity.Vendor;
import com.group5.marketplace.vendor.repository.VendorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public AdminService(UserRepository userRepository,
                        VendorRepository vendorRepository,
                        ProductRepository productRepository,
                        OrderRepository orderRepository,
                        PaymentRepository paymentRepository,
                        CategoryRepository categoryRepository,
                        CategoryMapper categoryMapper,
                        AuditService auditService,
                        NotificationService notificationService) {
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    // ─── Dashboard ───────────────────────────────────────────────

    public AdminDashboardResponse getDashboard() {
        long totalUsers = userRepository.count();
        long totalVendors = vendorRepository.count();
        long pendingVendors = vendorRepository.countByStatus(Vendor.VendorStatus.PENDING);
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();

        BigDecimal totalRevenue = paymentRepository.sumAmountByStatus(PaymentStatus.COMPLETED);

        return new AdminDashboardResponse(totalUsers, totalVendors, pendingVendors,
                totalProducts, totalOrders, totalRevenue);
    }

    public AdminAnalyticsResponse getAnalytics() {
        LocalDateTime since = LocalDateTime.now().minusMonths(12);

        // Monthly revenue from completed payments
        List<Object[]> revenueRows = paymentRepository.sumAmountByStatusAndMonth(PaymentStatus.COMPLETED.name(), since);
        List<AdminAnalyticsResponse.MonthlyData> monthlyRevenue = revenueRows.stream()
                .map(r -> new AdminAnalyticsResponse.MonthlyData(asMonthKey(r[0]), asBigDecimal(r[1])))
                .collect(Collectors.toList());

        // Monthly orders
        List<Object[]> orderRows = orderRepository.countOrdersByMonth(since);
        List<AdminAnalyticsResponse.MonthlyData> monthlyOrders = orderRows.stream()
                .map(r -> new AdminAnalyticsResponse.MonthlyData(asMonthKey(r[0]), asBigDecimal(r[1])))
                .collect(Collectors.toList());

        // Monthly vendor registrations
        List<Object[]> vendorRows = vendorRepository.countVendorsByMonth(since);
        List<AdminAnalyticsResponse.MonthlyData> monthlyVendors = vendorRows.stream()
                .map(r -> new AdminAnalyticsResponse.MonthlyData(asMonthKey(r[0]), asBigDecimal(r[1])))
                .collect(Collectors.toList());

        // Orders by status
        List<Object[]> statusRows = orderRepository.countByStatusGroup();
        Map<String, Long> ordersByStatus = new HashMap<>();
        for (Object[] row : statusRows) {
            ordersByStatus.put(row[0].toString(), asLong(row[1]));
        }

        // Users by role
        List<Object[]> roleRows = userRepository.countByRoleGroup();
        Map<String, Long> usersByRole = new HashMap<>();
        for (Object[] row : roleRows) {
            usersByRole.put(row[0].toString(), asLong(row[1]));
        }

        return new AdminAnalyticsResponse(monthlyRevenue, monthlyOrders, monthlyVendors,
                ordersByStatus, usersByRole);
    }

    private static String asMonthKey(Object value) {
        return value == null ? null : value.toString();
    }

    private static BigDecimal asBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return new BigDecimal(value.toString());
    }

    private static long asLong(Object value) {
        if (value == null) return 0L;
        if (value instanceof Number n) return n.longValue();
        return Long.parseLong(value.toString());
    }

    // ─── Categories ─────────────────────────────────────────────

    public java.util.List<CategoryResponse> listCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    // ─── User management ─────────────────────────────────────────

    public Page<AdminUserResponse> listUsers(String role, int page, int size) {
        Page<User> users;
        if (role != null && !role.isBlank()) {
            try {
                com.group5.marketplace.user.entity.Role userRole =
                        com.group5.marketplace.user.entity.Role.valueOf(role.toUpperCase());
                users = userRepository.findByRoleOrderByIdDesc(userRole, PageRequest.of(page, size));
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Invalid role: " + role);
            }
        } else {
            users = userRepository.findAllByOrderByIdDesc(PageRequest.of(page, size));
        }
        return users.map(this::toUserResponse);
    }

    public AdminUserResponse getUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));
        return toUserResponse(user);
    }

    public AdminUserResponse updateUserRole(Long userId, com.group5.marketplace.user.entity.Role role,
                                            Long adminId, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));

        com.group5.marketplace.user.entity.Role previousRole = user.getRole();
        user.setRole(role);
        userRepository.save(user);

        auditService.log(adminId, adminEmail, "UPDATE_ROLE", "User", userId,
                "Role changed from " + previousRole + " to " + role, null);

        return toUserResponse(user);
    }

    // ─── Vendor management ───────────────────────────────────────

    public Page<AdminVendorResponse> listVendors(String status, int page, int size) {
        Page<Vendor> vendors;
        if (status != null && !status.isBlank()) {
            try {
                Vendor.VendorStatus vendorStatus = Vendor.VendorStatus.valueOf(status.toUpperCase());
                vendors = vendorRepository.findByStatusOrderByCreatedAtDesc(vendorStatus, PageRequest.of(page, size));
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Invalid status: " + status);
            }
        } else {
            vendors = vendorRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        }

        java.util.Set<Long> userIds = vendors.stream()
                .map(Vendor::getUserId)
                .collect(java.util.stream.Collectors.toSet());
        java.util.Map<Long, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(java.util.stream.Collectors.toMap(User::getId, u -> u));

        return vendors.map(v -> toVendorResponse(v, userMap.get(v.getUserId())));
    }

    public AdminVendorResponse getVendor(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Vendor not found"));
        return toVendorResponse(vendor);
    }

    public AdminVendorResponse approveVendor(Long vendorId, Long adminId, String adminEmail) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Vendor not found"));

        if (vendor.getStatus() == Vendor.VendorStatus.ACTIVE) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Vendor is already approved");
        }

        vendor.setStatus(Vendor.VendorStatus.ACTIVE);
        vendor.setApprovedAt(LocalDateTime.now());
        vendor.setApprovedBy(adminId);
        vendorRepository.save(vendor);

        auditService.log(adminId, adminEmail, "APPROVE_VENDOR", "Vendor", vendorId,
                "Vendor '" + vendor.getStoreName() + "' approved", null);

        notificationService.send(
                vendor.getUserId(),
                NotificationType.VENDOR_APPROVED,
                "Vendor Application Approved",
                "Your vendor application for '" + vendor.getStoreName() + "' has been approved. You can now start selling.",
                vendorId,
                "Vendor"
        );

        return toVendorResponse(vendor);
    }

    public AdminVendorResponse rejectVendor(Long vendorId, Long adminId, String adminEmail) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Vendor not found"));

        if (vendor.getStatus() == Vendor.VendorStatus.REJECTED) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Vendor is already rejected");
        }

        vendor.setStatus(Vendor.VendorStatus.REJECTED);
        vendorRepository.save(vendor);

        auditService.log(adminId, adminEmail, "REJECT_VENDOR", "Vendor", vendorId,
                "Vendor '" + vendor.getStoreName() + "' rejected", null);

        notificationService.send(
                vendor.getUserId(),
                NotificationType.VENDOR_REJECTED,
                "Vendor Application Rejected",
                "Your vendor application for '" + vendor.getStoreName() + "' has been rejected. Please contact support for details.",
                vendorId,
                "Vendor"
        );

        return toVendorResponse(vendor);
    }

    public AdminVendorResponse suspendVendor(Long vendorId, Long adminId, String adminEmail) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Vendor not found"));

        if (vendor.getStatus() == Vendor.VendorStatus.SUSPENDED) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Vendor is already suspended");
        }

        vendor.setStatus(Vendor.VendorStatus.SUSPENDED);
        vendorRepository.save(vendor);

        auditService.log(adminId, adminEmail, "SUSPEND_VENDOR", "Vendor", vendorId,
                "Vendor '" + vendor.getStoreName() + "' suspended", null);

        notificationService.send(
                vendor.getUserId(),
                NotificationType.VENDOR_SUSPENDED,
                "Vendor Account Suspended",
                "Your vendor account '" + vendor.getStoreName() + "' has been suspended. Please contact support for details.",
                vendorId,
                "Vendor"
        );

        return toVendorResponse(vendor);
    }

    // ─── Mappers ─────────────────────────────────────────────────

    private AdminUserResponse toUserResponse(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole(),
                user.isEmailVerified(),
                null
        );
    }

    private AdminVendorResponse toVendorResponse(Vendor vendor) {
        User user = userRepository.findById(vendor.getUserId()).orElse(null);
        return toVendorResponse(vendor, user);
    }

    private AdminVendorResponse toVendorResponse(Vendor vendor, User user) {
        return new AdminVendorResponse(
                vendor.getId(),
                vendor.getUserId(),
                user != null ? user.getFirstName() : null,
                user != null ? user.getLastName() : null,
                user != null ? user.getEmail() : null,
                vendor.getStoreName(),
                vendor.getSlug(),
                vendor.getDescription(),
                vendor.getBusinessEmail(),
                vendor.getBusinessPhone(),
                vendor.getRating(),
                vendor.getStatus(),
                vendor.getApprovedAt(),
                vendor.getApprovedBy(),
                vendor.getCreatedAt()
        );
    }
}
