package com.group5.marketplace.order.service;

import com.group5.marketplace.address.entity.Address;
import com.group5.marketplace.address.repository.AddressRepository;
import com.group5.marketplace.cart.entity.Cart;
import com.group5.marketplace.cart.entity.CartItem;
import com.group5.marketplace.cart.repository.CartItemRepository;
import com.group5.marketplace.cart.repository.CartRepository;
import com.group5.marketplace.order.dto.*;
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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
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

    public OrderService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                        ProductVariantRepository variantRepository, ProductRepository productRepository,
                        AddressRepository addressRepository, OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository, PaymentRepository paymentRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.variantRepository = variantRepository;
        this.productRepository = productRepository;
        this.addressRepository = addressRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
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
        Product p = v.getProduct();
        r.setVariantId(v.getId());
        r.setProductId(p.getId());
        r.setProductName(p.getName());
        r.setProductSlug(p.getSlug());
        r.setSku(v.getSku());
        r.setUnitPrice(priceOf(v, p));
        r.setQuantity(item.getQuantity());
        r.setSubtotal(r.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        if (p.getImages() != null && !p.getImages().isEmpty()) {
            r.setImageUrl(p.getImages().get(0).getUrl());
        }
        return r;
    }

    private BigDecimal priceOf(ProductVariant v, Product p) {
        return v.getPrice() != null ? v.getPrice() : (p.getPrice() != null ? p.getPrice() : BigDecimal.ZERO);
    }

    @Transactional
    public OrderResponse checkout(Long userId, CreateOrderRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty"));

        List<CartItem> items = cartItemRepository.findByCart(cart);
        if (items.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        validateAddress(userId, request.getShippingAddressId(), "shipping");
        validateAddress(userId, request.getBillingAddressId(), "billing");

        Order order = new Order();
        order.setUserId(userId);
        order.setShippingAddressId(request.getShippingAddressId());
        order.setBillingAddressId(request.getBillingAddressId());
        order.setNotes(request.getNotes());
        order = orderRepository.save(order);

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem item : items) {
            ProductVariant v = item.getVariant();
            Product p = v.getProduct();
            int qty = item.getQuantity();
            int available = v.getStock() == null ? 0 : v.getStock();
            if (available < qty) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Insufficient stock for " + (p.getName() != null ? p.getName() : "item"));
            }
            BigDecimal unitPrice = priceOf(v, p);
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(qty));
            subtotal = subtotal.add(lineTotal);

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setVariantId(v.getId());
            oi.setVendorId(p.getVendorId());
            oi.setQuantity(qty);
            oi.setUnitPrice(unitPrice);
            oi.setSubtotal(lineTotal);
            orderItems.add(oi);

            v.setStock(available - qty);
            variantRepository.save(v);
        }

        order.setSubtotal(subtotal);
        order.setShippingCost(BigDecimal.ZERO);
        order.setTax(BigDecimal.ZERO);
        order.setTotal(subtotal);
        order.setItems(orderItems);
        orderRepository.save(order);
        orderItemRepository.saveAll(orderItems);

        // simple payment record; method defaults to CASH_ON_DELIVERY
        PaymentMethod method = parseMethod(request.getPaymentMethod());
        Payment payment = new Payment();
        payment.setOrderId(order.getId());
        payment.setAmount(subtotal);
        payment.setMethod(method);
        payment.setStatus(PaymentStatus.PENDING);
        payment = paymentRepository.save(payment);

        cartItemRepository.deleteByCart(cart);

        return toOrderResponse(order, payment);
    }

    private void validateAddress(Long userId, Long addressId, String kind) {
        if (addressId == null) return;
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, kind + " address not found"));
        if (!address.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Address does not belong to the user");
        }
    }

    private PaymentMethod parseMethod(String method) {
        if (method == null || method.isBlank()) return PaymentMethod.CASH_ON_DELIVERY;
        try {
            return PaymentMethod.valueOf(method.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return PaymentMethod.CASH_ON_DELIVERY;
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
        List<OrderResponse> result = new ArrayList<>();
        for (Order o : orderRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            result.add(toOrderResponse(o, paymentRepository.findFirstByOrderIdOrderByIdDesc(o.getId()).orElse(null)));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getVendorOrders(Long vendorId) {
        List<OrderResponse> result = new ArrayList<>();
        List<OrderItem> vendorItems = orderItemRepository.findByVendorIdOrderByCreatedAtDesc(vendorId);
        java.util.LinkedHashSet<Long> orderIds = vendorItems.stream()
                .map(oi -> oi.getOrder().getId())
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new));
        for (Long orderId : orderIds) {
            Order o = orderRepository.findById(orderId).orElse(null);
            if (o != null) {
                Payment payment = paymentRepository.findFirstByOrderIdOrderByIdDesc(orderId).orElse(null);
                result.add(toOrderResponse(o, payment, vendorId));
            }
        }
        return result;
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
        if (newStatus == OrderStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot set order back to PENDING");
        }
        order.setStatus(newStatus);
        orderRepository.save(order);

        for (OrderItem oi : vendorItems) {
            OrderItemStatus itemStatus = mapToItemStatus(newStatus);
            if (itemStatus != null) oi.setStatus(itemStatus);
        }
        orderItemRepository.saveAll(vendorItems);

        Payment payment = paymentRepository.findFirstByOrderIdOrderByIdDesc(orderId).orElse(null);
        return toOrderResponse(order, payment);
    }

    private OrderItemStatus mapToItemStatus(OrderStatus orderStatus) {
        switch (orderStatus) {
            case CONFIRMED: return OrderItemStatus.PROCESSING;
            case SHIPPED: return OrderItemStatus.SHIPPED;
            case DELIVERED: return OrderItemStatus.DELIVERED;
            case REFUNDED: return OrderItemStatus.REFUNDED;
            case CANCELED: return OrderItemStatus.PENDING;
            default: return null;
        }
    }

    private OrderResponse toOrderResponse(Order order, Payment payment) {
        return toOrderResponse(order, payment, null);
    }

    private OrderResponse toOrderResponse(Order order, Payment payment, Long vendorFilter) {
        OrderResponse r = new OrderResponse();
        r.setId(order.getId());
        r.setUserId(order.getUserId());
        r.setStatus(order.getStatus().name());
        r.setSubtotal(order.getSubtotal());
        r.setShippingCost(order.getShippingCost());
        r.setTax(order.getTax());
        r.setTotal(order.getTotal());
        r.setNotes(order.getNotes());
        r.setCreatedAt(order.getCreatedAt());
        if (payment != null) {
            r.setPaymentStatus(payment.getStatus().name());
            r.setPaymentMethod(payment.getMethod().name());
        }
        List<OrderItemResponse> lines = orderItemRepository.findByOrder(order).stream()
                .filter(oi -> vendorFilter == null || vendorFilter.equals(oi.getVendorId()))
                .map(this::toOrderItemResponse)
                .collect(Collectors.toList());
        r.setItems(lines);
        return r;
    }

    private OrderItemResponse toOrderItemResponse(OrderItem oi) {
        OrderItemResponse r = new OrderItemResponse();
        r.setId(oi.getId());
        r.setVariantId(oi.getVariantId());
        ProductVariant v = variantRepository.findById(oi.getVariantId()).orElse(null);
        if (v != null) {
            r.setSku(v.getSku());
            Product p = v.getProduct();
            r.setProductId(p.getId());
            r.setProductName(p.getName());
            r.setProductSlug(p.getSlug());
        }
        r.setUnitPrice(oi.getUnitPrice());
        r.setQuantity(oi.getQuantity());
        r.setSubtotal(oi.getSubtotal());
        r.setStatus(oi.getStatus().name());
        return r;
    }
}