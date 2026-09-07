package com.group5.marketplace.config;

import com.group5.marketplace.order.entity.*;
import com.group5.marketplace.order.repository.OrderItemRepository;
import com.group5.marketplace.order.repository.OrderRepository;
import com.group5.marketplace.order.repository.PaymentRepository;
import com.group5.marketplace.product.entity.Product;
import com.group5.marketplace.product.entity.ProductVariant;
import com.group5.marketplace.product.repository.ProductRepository;
import com.group5.marketplace.product.repository.variant.ProductVariantRepository;
import com.group5.marketplace.user.entity.Role;
import com.group5.marketplace.user.entity.User;
import com.group5.marketplace.user.repository.UserRepository;
import com.group5.marketplace.vendor.entity.Vendor;
import com.group5.marketplace.vendor.repository.VendorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class SeedDataRunner implements CommandLineRunner {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final TransactionTemplate txTemplate;

    public SeedDataRunner(OrderRepository orderRepository,
                          OrderItemRepository orderItemRepository,
                          PaymentRepository paymentRepository,
                          ProductRepository productRepository,
                          ProductVariantRepository variantRepository,
                          UserRepository userRepository,
                          VendorRepository vendorRepository,
                          TransactionTemplate txTemplate) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
        this.txTemplate = txTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            doSeed();
        } catch (Exception e) {
            System.err.println("[SeedData] ERROR: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void doSeed() {
        long orderCount = orderRepository.count();
        System.out.println("[SeedData] Found " + orderCount + " existing orders.");

        List<User> customers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .toList();
        List<Vendor> vendors = vendorRepository.findAll();
        List<Product> products = productRepository.findAll();

        System.out.println("[SeedData] Customers: " + customers.size()
                + ", Vendors: " + vendors.size() + ", Products: " + products.size());

        if (customers.isEmpty() || vendors.isEmpty() || products.isEmpty()) {
            System.out.println("[SeedData] Not enough base data. Skipping.");
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        Set<String> existingMonths = new HashSet<>();
        List<Object[]> rows = orderRepository.countOrdersByMonth(now.minusMonths(13));
        System.out.println("[SeedData] Existing month rows: " + rows.size());
        for (Object[] row : rows) {
            System.out.println("[SeedData]   month=" + row[0] + " count=" + row[1]);
            existingMonths.add((String) row[0]);
        }

        int missingMonths = 0;
        for (int i = 0; i < 12; i++) {
            LocalDateTime month = now.minusMonths(i);
            String key = month.getYear() + "-" + String.format("%02d", month.getMonthValue());
            boolean has = existingMonths.contains(key);
            if (!has) missingMonths++;
            System.out.println("[SeedData]   " + key + " -> " + (has ? "EXISTS" : "MISSING"));
        }

        if (missingMonths == 0) {
            System.out.println("[SeedData] All 12 months covered. No seed needed.");
            return;
        }

        System.out.println("[SeedData] " + missingMonths + " months missing. Generating orders...");

        List<Vendor> activeVendors = vendors.stream()
                .filter(v -> v.getStatus() == Vendor.VendorStatus.ACTIVE)
                .toList();
        if (activeVendors.isEmpty()) activeVendors = vendors;

        Map<Long, List<Product>> productsByVendor = new HashMap<>();
        for (Product p : products) {
            if (p.getVendorId() == null) continue;
            productsByVendor.computeIfAbsent(p.getVendorId(), k -> new ArrayList<>()).add(p);
        }

        Random rng = ThreadLocalRandom.current();
        int totalOrders = 0;

        for (int monthOffset = 11; monthOffset >= 0; monthOffset--) {
            LocalDateTime month = now.minusMonths(monthOffset);
            String monthKey = month.getYear() + "-" + String.format("%02d", month.getMonthValue());
            if (existingMonths.contains(monthKey)) continue;

            int ordersThisMonth = 4 + rng.nextInt(9);

            for (int o = 0; o < ordersThisMonth; o++) {
                User customer = customers.get(rng.nextInt(customers.size()));
                Vendor vendor = activeVendors.get(rng.nextInt(activeVendors.size()));
                List<Product> vendorProducts = productsByVendor.getOrDefault(vendor.getId(), products);
                if (vendorProducts.isEmpty()) continue;

                int dayOfMonth = 1 + rng.nextInt(28);
                int hour = 8 + rng.nextInt(14);
                LocalDateTime orderDate = month
                        .withDayOfMonth(dayOfMonth)
                        .withHour(hour)
                        .withMinute(rng.nextInt(60))
                        .withSecond(rng.nextInt(60));

                int finalTotalOrders = totalOrders;
                txTemplate.executeWithoutResult(status -> {
                    Order order = new Order();
                    order.setUserId(customer.getId());
                    order.setStatus(OrderStatus.values()[rng.nextInt(OrderStatus.values().length)]);
                    order.setShippingCost(BigDecimal.valueOf(3000 + rng.nextInt(5000)).setScale(2, RoundingMode.HALF_UP));
                    order.setTax(BigDecimal.ZERO);
                    order.setDiscount(BigDecimal.ZERO);

                    AddressSnapshot snapshot = new AddressSnapshot();
                    snapshot.setRecipientName(customer.getFirstName() + " " + customer.getLastName());
                    snapshot.setPhone("09-" + (10000000 + rng.nextInt(90000000)));
                    snapshot.setLine1((100 + rng.nextInt(900)) + " Main Street");
                    snapshot.setCity("Yangon");
                    snapshot.setRegion("Yangon Region");
                    snapshot.setPostalCode("11121");
                    snapshot.setCountry("Myanmar");
                    order.setShippingAddressSnapshot(snapshot);
                    order.setBillingAddressSnapshot(snapshot);

                    order.setCreatedAt(orderDate);
                    order.setUpdatedAt(orderDate);
                    orderRepository.save(order);

                    int itemCount = 1 + rng.nextInt(3);
                    BigDecimal orderTotal = BigDecimal.ZERO;

                    for (int i = 0; i < itemCount; i++) {
                        Product product = vendorProducts.get(rng.nextInt(vendorProducts.size()));
                        List<ProductVariant> variants = variantRepository.findByProductId(product.getId());
                        if (variants.isEmpty()) continue;
                        ProductVariant variant = variants.get(rng.nextInt(variants.size()));

                        int qty = 1 + rng.nextInt(4);
                        BigDecimal unitPrice = variant.getPrice() != null ? variant.getPrice() : product.getPrice();
                        if (unitPrice == null) unitPrice = BigDecimal.valueOf(5000 + rng.nextInt(50000));
                        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);
                        orderTotal = orderTotal.add(lineTotal);

                        OrderItem item = new OrderItem();
                        item.setOrder(order);
                        item.setVariantId(variant.getId());
                        item.setVendorId(vendor.getId());
                        item.setQuantity(qty);
                        item.setUnitPrice(unitPrice);
                        item.setSubtotal(lineTotal);
                        item.setStatus(OrderItemStatus.values()[rng.nextInt(OrderItemStatus.values().length)]);
                        item.setCreatedAt(orderDate);
                        item.setUpdatedAt(orderDate);
                        orderItemRepository.save(item);
                    }

                    order.setSubtotal(orderTotal);
                    order.setTotal(orderTotal.add(order.getShippingCost()));
                    orderRepository.save(order);

                    if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CANCELED) {
                        Payment payment = new Payment();
                        payment.setOrderId(order.getId());
                        payment.setAmount(order.getTotal());
                        payment.setCurrency("MMK");
                        payment.setMethod(PaymentMethod.CASH_ON_DELIVERY);
                        payment.setStatus(PaymentStatus.COMPLETED);
                        payment.setPaidAt(orderDate.plusMinutes(5 + rng.nextInt(30)));
                        payment.setCreatedAt(orderDate);
                        payment.setUpdatedAt(orderDate);
                        paymentRepository.save(payment);
                    }
                });
                totalOrders++;
            }
        }

        System.out.println("[SeedData] Done! Created " + totalOrders + " orders across missing months.");
    }
}
