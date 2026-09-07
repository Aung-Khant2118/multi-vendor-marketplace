package com.group5.marketplace.order.controller;

import com.group5.marketplace.order.dto.OrderResponse;
import com.group5.marketplace.order.dto.UpdateOrderStatusRequest;
import com.group5.marketplace.order.entity.OrderItemStatus;
import com.group5.marketplace.order.repository.OrderItemRepository;
import com.group5.marketplace.order.repository.OrderRepository;
import com.group5.marketplace.order.service.OrderService;
import com.group5.marketplace.product.entity.Product;
import com.group5.marketplace.product.entity.ProductVariant;
import com.group5.marketplace.product.repository.ProductRepository;
import com.group5.marketplace.product.repository.variant.ProductVariantRepository;
import com.group5.marketplace.user.util.CurrentUserService;
import com.group5.marketplace.vendor.entity.Vendor;
import com.group5.marketplace.vendor.repository.VendorRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vendor")
public class VendorOrderController {

    private final OrderService orderService;
    private final CurrentUserService currentUserService;
    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final VendorRepository vendorRepository;

    public VendorOrderController(OrderService orderService, CurrentUserService currentUserService,
                                  OrderItemRepository orderItemRepository,
                                  OrderRepository orderRepository,
                                  ProductVariantRepository variantRepository,
                                  ProductRepository productRepository,
                                  VendorRepository vendorRepository) {
        this.orderService = orderService;
        this.currentUserService = currentUserService;
        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
        this.variantRepository = variantRepository;
        this.productRepository = productRepository;
        this.vendorRepository = vendorRepository;
    }

    private Long resolveVendorId(Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendor profile not found"));
        return vendor.getId();
    }

    @GetMapping("/orders")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> list(Principal principal) {
        Long vendorId = resolveVendorId(principal);
        List<OrderResponse> orders = orderService.getVendorOrders(vendorId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", orders);
        return ResponseEntity.ok(body);
    }

    @PutMapping("/orders/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable Long id,
                                                            @Valid @RequestBody UpdateOrderStatusRequest request,
                                                            Principal principal) {
        Long vendorId = resolveVendorId(principal);
        OrderResponse order = orderService.updateOrderStatus(vendorId, id, request);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Order status updated");
        body.put("data", order);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/analytics")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> analytics(Principal principal) {
        Long vendorId = resolveVendorId(principal);

        BigDecimal totalRevenue = orderItemRepository.sumRevenueByVendorId(vendorId);
        long totalOrders = orderItemRepository.countDistinctOrdersByVendorId(vendorId);
        long totalItems = orderItemRepository.countByVendorId(vendorId);
        long refundedItems = orderItemRepository.countByVendorIdAndStatus(vendorId, OrderItemStatus.REFUNDED);

        BigDecimal avgOrderValue = totalOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        String refundRate = totalItems > 0
                ? String.format("%.1f%%", (refundedItems * 100.0 / totalItems))
                : "0.0%";

        // Top products by revenue
        List<Object[]> topRows = orderItemRepository.findTopProductsByRevenue(vendorId, PageRequest.of(0, 5));
        Set<Long> variantIds = topRows.stream()
                .map(r -> (Long) r[0])
                .collect(Collectors.toSet());
        Map<Long, ProductVariant> variantMap = variantIds.isEmpty() ? Map.of()
                : variantRepository.findByIdIn(variantIds).stream()
                        .collect(Collectors.toMap(ProductVariant::getId, Function.identity()));
        Set<Long> productIds = variantMap.values().stream()
                .map(v -> v.getProduct().getId())
                .collect(Collectors.toSet());
        Map<Long, Product> productMap = productIds.isEmpty() ? Map.of()
                : productRepository.findByIdIn(productIds).stream()
                        .collect(Collectors.toMap(Product::getId, Function.identity()));

        List<Map<String, Object>> topProducts = new ArrayList<>();
        for (Object[] row : topRows) {
            Long variantId = (Long) row[0];
            BigDecimal revenue = (BigDecimal) row[1];
            Long sales = (Long) row[2];
            ProductVariant v = variantMap.get(variantId);
            String name = "Unknown Product";
            if (v != null && v.getProduct() != null) {
                Product p = productMap.get(v.getProduct().getId());
                if (p == null) p = v.getProduct();
                if (p != null) name = p.getName();
            }
            Map<String, Object> item = new HashMap<>();
            item.put("name", name);
            item.put("sales", sales);
            item.put("revenue", revenue);
            topProducts.add(item);
        }

        // Order-level status breakdown
        Map<String, Long> statusBreakdown = new HashMap<>();
        List<Object[]> statusRows = orderRepository.countByStatusGroupForVendor(vendorId);
        for (Object[] row : statusRows) {
            statusBreakdown.put(row[0].toString(), (Long) row[1]);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("totalRevenue", totalRevenue);
        data.put("totalOrders", totalOrders);
        data.put("avgOrderValue", avgOrderValue);
        data.put("refundRate", refundRate);
        data.put("topProducts", topProducts);
        data.put("statusBreakdown", statusBreakdown);

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", data);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/analytics/timeseries")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> analyticsTimeSeries(Principal principal) {
        Long vendorId = resolveVendorId(principal);
        LocalDateTime since = LocalDateTime.now().minusMonths(12);

        // Monthly revenue for this vendor
        List<Object[]> revenueRows = orderItemRepository.sumRevenueByVendorIdAndMonth(vendorId, since);
        List<Map<String, Object>> monthlyRevenue = new ArrayList<>();
        for (Object[] row : revenueRows) {
            Map<String, Object> item = new HashMap<>();
            item.put("month", row[0]);
            item.put("value", row[1]);
            monthlyRevenue.add(item);
        }

        // Monthly order count for this vendor
        List<Object[]> orderRows = orderItemRepository.countOrdersByVendorIdAndMonth(vendorId, since);
        List<Map<String, Object>> monthlyOrders = new ArrayList<>();
        for (Object[] row : orderRows) {
            Map<String, Object> item = new HashMap<>();
            item.put("month", row[0]);
            item.put("value", row[1]);
            monthlyOrders.add(item);
        }

        // Order-level status breakdown
        List<Object[]> statusRows = orderRepository.countByStatusGroupForVendor(vendorId);
        Map<String, Long> statusBreakdown = new HashMap<>();
        for (Object[] row : statusRows) {
            statusBreakdown.put(row[0].toString(), (Long) row[1]);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("monthlyRevenue", monthlyRevenue);
        data.put("monthlyOrders", monthlyOrders);
        data.put("statusBreakdown", statusBreakdown);

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", data);
        return ResponseEntity.ok(body);
    }
}