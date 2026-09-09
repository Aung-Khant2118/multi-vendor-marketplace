package com.group5.marketplace.order.service;

import com.group5.marketplace.address.entity.Address;
import com.group5.marketplace.address.repository.AddressRepository;
import com.group5.marketplace.cart.entity.Cart;
import com.group5.marketplace.cart.entity.CartItem;
import com.group5.marketplace.cart.repository.CartItemRepository;
import com.group5.marketplace.cart.repository.CartRepository;
import com.group5.marketplace.order.config.CheckoutProperties;
import com.group5.marketplace.order.dto.*;
import com.group5.marketplace.order.entity.AddressSnapshot;
import com.group5.marketplace.order.entity.Order;
import com.group5.marketplace.order.entity.OrderItem;
import com.group5.marketplace.order.entity.OrderItemStatus;
import com.group5.marketplace.order.entity.OrderStatus;
import com.group5.marketplace.order.entity.Payment;
import com.group5.marketplace.order.entity.PaymentMethod;
import com.group5.marketplace.order.entity.PaymentStatus;
import com.group5.marketplace.order.repository.OrderItemRepository;
import com.group5.marketplace.order.repository.OrderRepository;
import com.group5.marketplace.order.repository.PaymentRepository;
import com.group5.marketplace.product.entity.Product;
import com.group5.marketplace.product.entity.ProductVariant;
import com.group5.marketplace.product.repository.ProductRepository;
import com.group5.marketplace.product.repository.variant.ProductVariantRepository;
import com.group5.marketplace.notification.entity.Notification.NotificationType;
import com.group5.marketplace.notification.service.NotificationService;
import com.group5.marketplace.promotion.entity.Coupon;
import com.group5.marketplace.promotion.repository.CouponRepository;
import com.group5.marketplace.promotion.service.CouponService;
import com.group5.marketplace.user.entity.User;
import com.group5.marketplace.user.repository.UserRepository;
import com.group5.marketplace.vendor.entity.Vendor;
import com.group5.marketplace.vendor.repository.VendorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final CheckoutProperties checkoutProperties;
    private final NotificationService notificationService;
    private final CouponService couponService;
    private final CouponRepository couponRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;

    public OrderService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                        ProductVariantRepository variantRepository, ProductRepository productRepository,
                        AddressRepository addressRepository, OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository, PaymentRepository paymentRepository,
                        CheckoutProperties checkoutProperties, NotificationService notificationService,
                        CouponService couponService, CouponRepository couponRepository,
                        VendorRepository vendorRepository, UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.variantRepository = variantRepository;
        this.productRepository = productRepository;
        this.addressRepository = addressRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
        this.checkoutProperties = checkoutProperties;
        this.notificationService = notificationService;
        this.couponService = couponService;
        this.couponRepository = couponRepository;
        this.vendorRepository = vendorRepository;
        this.userRepository = userRepository;
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart c = new Cart(userId);
            return cartRepository.save(c);
        });
    }

    @Transactional
    public CartResponse addToCart(Long userId, AddToCartRequest request) {
        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));

        if (!Boolean.TRUE.equals(variant.getActive())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Variant is inactive");
        }
        int qty = request.getQuantity() == null ? 1 : request.getQuantity();
        int available = variant.getStock() == null ? 0 : variant.getStock();
        if (available <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Variant out of stock");
        }

        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findByCartAndVariant(cart, variant)
                .orElseGet(() -> {
                    CartItem ci = new CartItem(cart, variant, 0);
                    return cartItemRepository.save(ci);
                });

        int newQty = item.getQuantity() + qty;
        if (newQty > available) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only " + available + " units available");
        }
        item.setQuantity(newQty);
        cartItemRepository.save(item);

        return toCartResponse(cart);
    }

    @Transactional
    public CartResponse removeFromCart(Long userId, Long variantId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart not found"));

        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));

        CartItem item = cartItemRepository.findByCartAndVariant(cart, variant)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));

        cartItemRepository.delete(item);
        return toCartResponse(cart);
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart == null) {
            CartResponse empty = new CartResponse();
            empty.setItems(List.of());
            empty.setTotalQuantity(0);
            empty.setTotalPrice(BigDecimal.ZERO);
            return empty;
        }
        return toCartResponse(cart);
    }

    private CartResponse toCartResponse(Cart cart) {
        CartResponse resp = new CartResponse();
        resp.setId(cart.getId());
        List<CartItemResponse> lines = cartItemRepository.findByCart(cart).stream()
                .map(this::toCartItemResponse)
                .collect(Collectors.toList());
        resp.setItems(lines);
        int totalQty = lines.stream().mapToInt(CartItemResponse::getQuantity).sum();
        BigDecimal totalPrice = lines.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        resp.setTotalQuantity(totalQty);
        resp.setTotalPrice(totalPrice);
        return resp;
    }

    private CartItemResponse toCartItemResponse(CartItem item) {
        CartItemResponse r = new CartItemResponse();
        ProductVariant v = item.getVariant();
        if (v == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cart item references a missing variant");
        }
        Product p = v.getProduct();
        if (p == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Product variant references a missing product");
        }
        r.setVariantId(v.getId());
        r.setProductId(p.getId());
        r.setProductName(p.getName());
        r.setProductSlug(p.getSlug());
        r.setVariantLabel(v.getVariantLabel());
        r.setUnitPrice(priceOf(v, p));
        r.setQuantity(item.getQuantity());
        r.setSubtotal(r.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        if (p.getImages() != null && !p.getImages().isEmpty()) {
            r.setImageUrl(p.getImages().iterator().next().getUrl());
        }
        r.setVendorId(p.getVendorId());
        if (p.getVendorId() != null) {
            vendorRepository.findById(p.getVendorId())
                    .ifPresent(vendor -> r.setVendorName(vendor.getStoreName()));
        }
        return r;
    }

    private BigDecimal priceOf(ProductVariant v, Product p) {
        return v.getPrice() != null ? v.getPrice() : (p.getPrice() != null ? p.getPrice() : BigDecimal.ZERO);
    }

    @Transactional
    public List<OrderResponse> checkout(Long userId, CreateOrderRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty"));

        List<CartItem> items = cartItemRepository.findByCart(cart);
        if (items.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        if (request.getShippingAddressId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Shipping address is required");
        }
        Address shippingAddress = ownedAddress(userId, request.getShippingAddressId(), "shipping");
        Address billingAddress = request.getBillingAddressId() == null
                ? shippingAddress
                : ownedAddress(userId, request.getBillingAddressId(), "billing");

        PaymentMethod method = parseMethod(request.getPaymentMethod());

        // Group cart items by vendorId
        Map<Long, List<CartItem>> itemsByVendor = new LinkedHashMap<>();
        for (CartItem item : items) {
            ProductVariant v = item.getVariant();
            if (v == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart item references a missing variant");
            }
            Product p = v.getProduct();
            if (p == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product variant references a missing product");
            }
            Long vendorId = p.getVendorId();
            if (vendorId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product has no vendor assigned");
            }
            itemsByVendor.computeIfAbsent(vendorId, k -> new ArrayList<>()).add(item);
        }

        // Compute the total cart subtotal before splitting by vendor, so the coupon
        // is applied (and its usedCount incremented) exactly once against the full amount.
        BigDecimal cartSubtotal = BigDecimal.ZERO;
        for (List<CartItem> vendorItems : itemsByVendor.values()) {
            for (CartItem item : vendorItems) {
                ProductVariant v = item.getVariant();
                Product p = v.getProduct();
                BigDecimal unitPrice = priceOf(v, p);
                cartSubtotal = cartSubtotal.add(unitPrice.multiply(BigDecimal.valueOf(item.getQuantity())));
            }
        }

        // Resolve coupon once (before the vendor loop)
        BigDecimal totalDiscount = BigDecimal.ZERO;
        String couponCode = null;
        Coupon coupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            coupon = couponRepository.findByCodeIgnoreCase(request.getCouponCode().trim())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid coupon code"));
            couponService.applyCoupon(coupon.getCode());
            totalDiscount = couponService.calculateDiscount(coupon, cartSubtotal);
            couponCode = coupon.getCode();
        }

        List<OrderResponse> responses = new ArrayList<>();

        for (Map.Entry<Long, List<CartItem>> entry : itemsByVendor.entrySet()) {
            Long vendorId = entry.getKey();
            List<CartItem> vendorItems = entry.getValue();

            Order order = new Order();
            order.setUserId(userId);
            order.setShippingAddressId(shippingAddress.getId());
            order.setBillingAddressId(billingAddress.getId());
            order.setShippingAddressSnapshot(toSnapshot(shippingAddress));
            order.setBillingAddressSnapshot(toSnapshot(billingAddress));
            order.setNotes(request.getNotes());
            order = orderRepository.save(order);

            BigDecimal subtotal = BigDecimal.ZERO;
            List<OrderItem> orderItems = new ArrayList<>();
            List<ProductVariant> stockUpdates = new ArrayList<>();
            for (CartItem item : vendorItems) {
                ProductVariant v = item.getVariant();
                Product p = v.getProduct();

                ProductVariant locked = variantRepository.findByIdForUpdate(v.getId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Variant not found"));

                int qty = item.getQuantity();
                int available = locked.getStock() == null ? 0 : locked.getStock();
                if (available < qty) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Insufficient stock for " + (p.getName() != null ? p.getName() : "item"));
                }
                BigDecimal unitPrice = priceOf(locked, p);
                BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(qty));
                subtotal = subtotal.add(lineTotal);

                OrderItem oi = new OrderItem();
                oi.setOrder(order);
                oi.setVariantId(locked.getId());
                oi.setVendorId(p.getVendorId());
                oi.setQuantity(qty);
                oi.setUnitPrice(unitPrice);
                oi.setSubtotal(lineTotal);
                orderItems.add(oi);

                locked.setStock(available - qty);
                stockUpdates.add(locked);
            }

            BigDecimal shippingCost = computeShipping(subtotal);
            BigDecimal tax = computeTax(subtotal);

            // Distribute the total discount proportionally across vendor sub-orders
            BigDecimal discount = BigDecimal.ZERO;
            if (totalDiscount.compareTo(BigDecimal.ZERO) > 0 && cartSubtotal.compareTo(BigDecimal.ZERO) > 0) {
                discount = totalDiscount.multiply(subtotal)
                        .divide(cartSubtotal, 2, RoundingMode.HALF_UP);
            }

            BigDecimal total = subtotal.add(shippingCost).add(tax).subtract(discount);
            if (total.compareTo(BigDecimal.ZERO) < 0) {
                total = BigDecimal.ZERO;
                discount = subtotal.add(shippingCost).add(tax);
            }

            order.setSubtotal(subtotal);
            order.setShippingCost(shippingCost);
            order.setTax(tax);
            order.setDiscount(discount);
            order.setCouponCode(couponCode);
            order.setTotal(total);
            order.getItems().addAll(orderItems);
            orderRepository.save(order);
            variantRepository.saveAll(stockUpdates);

            Payment payment = new Payment();
            payment.setOrderId(order.getId());
            payment.setAmount(total);
            payment.setMethod(method);
            payment.setStatus(PaymentStatus.PENDING);
            if (method != PaymentMethod.CASH_ON_DELIVERY) {
                payment.setStatus(PaymentStatus.COMPLETED);
                payment.setTransactionId("TXN-" + UUID.randomUUID());
                payment.setPaidAt(LocalDateTime.now());
            }
            payment = paymentRepository.save(payment);

            responses.add(toOrderResponse(order, payment));
        }

        cartItemRepository.deleteByCart(cart);

        return responses;
    }

    private Address ownedAddress(Long userId, Long addressId, String kind) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, kind + " address not found"));
        if (!address.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Address does not belong to the user");
        }
        return address;
    }

    private AddressSnapshot toSnapshot(Address address) {
        AddressSnapshot s = new AddressSnapshot();
        s.setRecipientName(address.getRecipientName());
        s.setPhone(address.getPhone());
        s.setLine1(address.getLine1());
        s.setLine2(address.getLine2());
        s.setCity(address.getCity());
        s.setRegion(address.getRegion());
        s.setPostalCode(address.getPostalCode());
        s.setCountry(address.getCountry());
        return s;
    }

    private BigDecimal computeShipping(BigDecimal subtotal) {
        if (subtotal.compareTo(checkoutProperties.getFreeShippingThreshold()) >= 0) {
            return BigDecimal.ZERO;
        }
        return checkoutProperties.getShippingFlatRate().setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal computeTax(BigDecimal subtotal) {
        return BigDecimal.ZERO;
    }

    private PaymentMethod parseMethod(String method) {
        if (method == null || method.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment method is required");
        }
        try {
            return PaymentMethod.valueOf(method.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid payment method");
        }
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!order.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your order");
        }
        Payment payment = paymentRepository.findFirstByOrderIdOrderByIdDesc(order.getId()).orElse(null);
        return toOrderResponse(order, payment);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (orders.isEmpty()) return List.of();

        Set<Long> orderIds = orders.stream().map(Order::getId).collect(Collectors.toSet());
        Map<Long, Payment> paymentMap = toLatestPaymentMap(paymentRepository.findLatestByOrderIds(orderIds));
        Map<Long, List<OrderItem>> itemsMap = loadOrderItemsBatch(orderIds);
        Map<Long, ProductVariant> variantMap = loadVariantsBatch(itemsMap);
        Map<Long, Product> productMap = loadProductsBatch(variantMap);

        return orders.stream()
                .map(o -> toOrderResponse(o, paymentMap.get(o.getId()), null, itemsMap, variantMap, productMap))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<OrderResponse> getVendorOrders(Long vendorId, int page, int size) {
        org.springframework.data.domain.PageRequest pageRequest = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<OrderItem> vendorItemPage =
                orderItemRepository.findByVendorIdOrderByCreatedAtDesc(vendorId, pageRequest);
        if (vendorItemPage.isEmpty()) return org.springframework.data.domain.Page.empty(pageRequest);

        List<OrderItem> vendorItems = vendorItemPage.getContent();

        LinkedHashSet<Long> orderIds = vendorItems.stream()
                .map(oi -> oi.getOrder().getId())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        Map<Long, Order> orderMap = vendorItems.stream()
                .map(OrderItem::getOrder)
                .distinct()
                .collect(Collectors.toMap(Order::getId, Function.identity()));

        Map<Long, Payment> paymentMap = toLatestPaymentMap(paymentRepository.findLatestByOrderIds(orderIds));
        Map<Long, List<OrderItem>> itemsMap = loadOrderItemsBatch(orderIds);
        Map<Long, ProductVariant> variantMap = loadVariantsBatch(itemsMap);
        Map<Long, Product> productMap = loadProductsBatch(variantMap);

        List<OrderResponse> responses = orderIds.stream()
                .map(id -> orderMap.get(id))
                .filter(Objects::nonNull)
                .map(o -> toOrderResponse(o, paymentMap.get(o.getId()), vendorId, itemsMap, variantMap, productMap))
                .collect(Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(responses, pageRequest, vendorItemPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<OrderResponse> getAdminOrders(String status, int page, int size) {
        org.springframework.data.domain.PageRequest pageRequest = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<Order> orders;
        if (status != null && !status.isBlank()) {
            OrderStatus orderStatus;
            try {
                orderStatus = OrderStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid order status: " + status);
            }
            orders = orderRepository.findByStatusOrderByCreatedAtDesc(orderStatus, pageRequest);
        } else {
            orders = orderRepository.findAllByOrderByCreatedAtDesc(pageRequest);
        }

        if (orders.isEmpty()) return org.springframework.data.domain.Page.empty(pageRequest);

        Set<Long> orderIds = orders.stream().map(Order::getId).collect(Collectors.toSet());
        Map<Long, Payment> paymentMap = toLatestPaymentMap(paymentRepository.findLatestByOrderIds(orderIds));
        Map<Long, List<OrderItem>> itemsMap = loadOrderItemsBatch(orderIds);
        Map<Long, ProductVariant> variantMap = loadVariantsBatch(itemsMap);
        Map<Long, Product> productMap = loadProductsBatch(variantMap);

        return orders.map(o -> toOrderResponse(o, paymentMap.get(o.getId()), null, itemsMap, variantMap, productMap));
    }

    @Transactional(readOnly = true)
    public OrderResponse getAdminOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        Payment payment = paymentRepository.findFirstByOrderIdOrderByIdDesc(order.getId()).orElse(null);
        return toOrderResponse(order, payment);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long vendorId, Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        List<OrderItem> vendorItems = orderItemRepository.findByOrder(order).stream()
                .filter(oi -> vendorId.equals(oi.getVendorId()))
                .toList();
        if (vendorItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This vendor has no items in the order");
        }

        String status = request.getStatus() == null ? null : request.getStatus().trim().toUpperCase();
        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid order status");
        }

        Map<OrderStatus, OrderStatus> allowedTransitions = Map.of(
            OrderStatus.PENDING, OrderStatus.CONFIRMED,
            OrderStatus.CONFIRMED, OrderStatus.PROCESSING,
            OrderStatus.PROCESSING, OrderStatus.SHIPPED,
            OrderStatus.SHIPPED, OrderStatus.DELIVERED,
            OrderStatus.DELIVERED, OrderStatus.COMPLETED
        );

        OrderStatus expectedNext = allowedTransitions.get(order.getStatus());
        if (expectedNext == null || expectedNext != newStatus) {
            String currentLabel = order.getStatus().name().charAt(0) + order.getStatus().name().substring(1).toLowerCase();
            String targetLabel = newStatus.name().charAt(0) + newStatus.name().substring(1).toLowerCase();
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Cannot transition from " + currentLabel + " to " + targetLabel);
        }

        order.setStatus(newStatus);
        orderRepository.save(order);

        for (OrderItem oi : vendorItems) {
            OrderItemStatus itemStatus = mapToItemStatus(newStatus);
            if (itemStatus != null) oi.setStatus(itemStatus);
        }
        orderItemRepository.saveAll(vendorItems);

        Payment payment = paymentRepository.findFirstByOrderIdOrderByIdDesc(orderId).orElse(null);
        if (payment != null) {
            if (newStatus == OrderStatus.DELIVERED && payment.getMethod() == PaymentMethod.CASH_ON_DELIVERY) {
                payment.setStatus(PaymentStatus.COMPLETED);
                payment.setPaidAt(LocalDateTime.now());
                payment = paymentRepository.save(payment);
            }
        }

        String statusLabel = newStatus.name().charAt(0) + newStatus.name().substring(1).toLowerCase();
        notificationService.send(
                order.getUserId(),
                NotificationType.ORDER_UPDATE,
                "Order " + statusLabel,
                "Your order #" + orderId + " has been " + statusLabel.toLowerCase() + ".",
                orderId,
                "Order"
        );

        return toOrderResponse(order, payment);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, CancelOrderRequest request, String actorRole, Long actorUserId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order is already cancelled");
        }
        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot cancel a completed order");
        }
        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot cancel an order that has been delivered");
        }

        if ("CUSTOMER".equals(actorRole)) {
            if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only cancel orders in Pending or Confirmed status");
            }
        } else if ("VENDOR".equals(actorRole)) {
            if (order.getStatus() != OrderStatus.PENDING) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Vendors can only cancel orders in Pending status");
            }
            List<OrderItem> vendorItems = orderItemRepository.findByOrder(order).stream()
                    .filter(oi -> actorUserId.equals(oi.getVendorId()))
                    .toList();
            if (vendorItems.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This vendor has no items in the order");
            }
        } else if (!"ADMIN".equals(actorRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unknown actor role");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(request.getReason());
        order.setCancellationNote(request.getCustomNote());
        order.setCancelledBy(actorRole);
        order.setCancelledAt(LocalDateTime.now());
        orderRepository.save(order);

        List<OrderItem> allItems = orderItemRepository.findByOrder(order);
        for (OrderItem oi : allItems) {
            oi.setStatus(OrderItemStatus.CANCELLED);
        }
        orderItemRepository.saveAll(allItems);

        for (OrderItem oi : allItems) {
            variantRepository.findByIdForUpdate(oi.getVariantId()).ifPresent(v -> {
                v.setStock(v.getStock() + oi.getQuantity());
                variantRepository.save(v);
            });
        }

        Payment payment = paymentRepository.findFirstByOrderIdOrderByIdDesc(orderId).orElse(null);
        if (payment != null) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
        }

        String reasonLabel = request.getReason();
        notificationService.send(
                order.getUserId(),
                NotificationType.ORDER_UPDATE,
                "Order Cancelled",
                "Your order #" + orderId + " has been cancelled. Reason: " + reasonLabel
                    + (request.getCustomNote() != null && !request.getCustomNote().isBlank()
                        ? ". Note: " + request.getCustomNote() : ""),
                orderId,
                "Order"
        );

        Payment freshPayment = paymentRepository.findFirstByOrderIdOrderByIdDesc(orderId).orElse(null);
        return toOrderResponse(order, freshPayment);
    }

    private OrderItemStatus mapToItemStatus(OrderStatus orderStatus) {
        switch (orderStatus) {
            case CONFIRMED: return OrderItemStatus.PENDING;
            case PROCESSING: return OrderItemStatus.PROCESSING;
            case SHIPPED: return OrderItemStatus.SHIPPED;
            case DELIVERED: return OrderItemStatus.DELIVERED;
            case COMPLETED: return OrderItemStatus.COMPLETED;
            default: return null;
        }
    }

    private OrderResponse toOrderResponse(Order order, Payment payment) {
        return toOrderResponse(order, payment, null);
    }

    private OrderResponse toOrderResponse(Order order, Payment payment, Long vendorFilter) {
        Map<Long, List<OrderItem>> itemsMap = loadOrderItemsBatch(Set.of(order.getId()));
        Map<Long, ProductVariant> variantMap = loadVariantsBatch(itemsMap);
        Map<Long, Product> productMap = loadProductsBatch(variantMap);
        return toOrderResponse(order, payment, vendorFilter, itemsMap, variantMap, productMap);
    }

    private OrderResponse toOrderResponse(Order order, Payment payment, Long vendorFilter,
                                           Map<Long, List<OrderItem>> itemsMap,
                                           Map<Long, ProductVariant> variantMap,
                                           Map<Long, Product> productMap) {
        OrderResponse r = new OrderResponse();
        r.setId(order.getId());
        r.setUserId(order.getUserId());
        userRepository.findById(order.getUserId()).ifPresent(user -> {
            String name = (user.getFirstName() != null ? user.getFirstName() : "") +
                          (user.getLastName() != null ? " " + user.getLastName() : "");
            r.setCustomerName(name.trim());
        });
        r.setStatus(order.getStatus().name());
        r.setSubtotal(order.getSubtotal());
        r.setShippingCost(order.getShippingCost());
        r.setTax(order.getTax());
        r.setDiscount(order.getDiscount());
        r.setCouponCode(order.getCouponCode());
        r.setTotal(order.getTotal());
        r.setNotes(order.getNotes());
        r.setShippingAddressId(order.getShippingAddressId());
        r.setBillingAddressId(order.getBillingAddressId());
        r.setShippingAddress(toSnapshotResponse(order.getShippingAddressSnapshot()));
        r.setBillingAddress(toSnapshotResponse(order.getBillingAddressSnapshot()));
        r.setCreatedAt(order.getCreatedAt());
        if (payment != null) {
            r.setPaymentStatus(payment.getStatus().name());
            r.setPaymentMethod(payment.getMethod().name());
        }
        List<OrderItem> items = itemsMap.getOrDefault(order.getId(), List.of());
        List<OrderItemResponse> lines = items.stream()
                .filter(oi -> vendorFilter == null || vendorFilter.equals(oi.getVendorId()))
                .map(oi -> toOrderItemResponse(oi, variantMap, productMap))
                .collect(Collectors.toList());
        r.setItems(lines);
        r.setCancellationReason(order.getCancellationReason());
        r.setCancellationNote(order.getCancellationNote());
        r.setCancelledBy(order.getCancelledBy());
        r.setCancelledAt(order.getCancelledAt());
        return r;
    }

    private Map<Long, Payment> toLatestPaymentMap(List<Payment> payments) {
        Map<Long, Payment> result = new LinkedHashMap<>();
        for (Payment p : payments) {
            result.putIfAbsent(p.getOrderId(), p);
        }
        return result;
    }

    private Map<Long, List<OrderItem>> loadOrderItemsBatch(Set<Long> orderIds) {
        if (orderIds.isEmpty()) return Map.of();
        List<OrderItem> allItems = orderItemRepository.findByOrderIdIn(orderIds);
        return allItems.stream().collect(Collectors.groupingBy(oi -> oi.getOrder().getId()));
    }

    private Map<Long, ProductVariant> loadVariantsBatch(Map<Long, List<OrderItem>> itemsMap) {
        Set<Long> variantIds = itemsMap.values().stream()
                .flatMap(Collection::stream)
                .map(OrderItem::getVariantId)
                .collect(Collectors.toSet());
        if (variantIds.isEmpty()) return Map.of();
        return variantRepository.findAllByIdIn(variantIds).stream()
                .collect(Collectors.toMap(ProductVariant::getId, Function.identity()));
    }

    private Map<Long, Product> loadProductsBatch(Map<Long, ProductVariant> variantMap) {
        Set<Long> productIds = variantMap.values().stream()
                .map(v -> v.getProduct().getId())
                .collect(Collectors.toSet());
        if (productIds.isEmpty()) return Map.of();
        return productRepository.findByIdIn(productIds).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));
    }

    private AddressSnapshotResponse toSnapshotResponse(AddressSnapshot s) {
        AddressSnapshotResponse r = new AddressSnapshotResponse();
        if (s == null) return r;
        r.setRecipientName(s.getRecipientName());
        r.setPhone(s.getPhone());
        r.setLine1(s.getLine1());
        r.setLine2(s.getLine2());
        r.setCity(s.getCity());
        r.setRegion(s.getRegion());
        r.setPostalCode(s.getPostalCode());
        r.setCountry(s.getCountry());
        return r;
    }

    private OrderItemResponse toOrderItemResponse(OrderItem oi) {
        return toOrderItemResponse(oi, Map.of(), Map.of());
    }

    private OrderItemResponse toOrderItemResponse(OrderItem oi,
                                                   Map<Long, ProductVariant> variantMap,
                                                   Map<Long, Product> productMap) {
        OrderItemResponse r = new OrderItemResponse();
        r.setId(oi.getId());
        r.setVariantId(oi.getVariantId());
        ProductVariant v = variantMap.get(oi.getVariantId());
        if (v != null) {
            r.setVariantLabel(v.getVariantLabel());
            Product p = productMap.get(v.getProduct().getId());
            if (p != null) {
                r.setProductId(p.getId());
                r.setProductName(p.getName());
                r.setProductSlug(p.getSlug());
            }
        }
        r.setUnitPrice(oi.getUnitPrice());
        r.setQuantity(oi.getQuantity());
        r.setSubtotal(oi.getSubtotal());
        r.setStatus(oi.getStatus().name());
        return r;
    }
}