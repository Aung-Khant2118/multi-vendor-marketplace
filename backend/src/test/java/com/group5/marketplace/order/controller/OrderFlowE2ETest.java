package com.group5.marketplace.order.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.group5.marketplace.address.entity.Address;
import com.group5.marketplace.address.repository.AddressRepository;
import com.group5.marketplace.auth.security.JwtService;
import com.group5.marketplace.category.entity.Category;
import com.group5.marketplace.category.repository.CategoryRepository;
import com.group5.marketplace.order.entity.Payment;
import com.group5.marketplace.order.entity.PaymentStatus;
import com.group5.marketplace.order.repository.OrderRepository;
import com.group5.marketplace.order.repository.PaymentRepository;
import com.group5.marketplace.product.entity.Product;
import com.group5.marketplace.product.entity.ProductVariant;
import com.group5.marketplace.product.repository.ProductRepository;
import com.group5.marketplace.product.repository.variant.ProductVariantRepository;
import com.group5.marketplace.user.entity.Role;
import com.group5.marketplace.user.entity.User;
import com.group5.marketplace.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:ordertest;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "jwt.secret=VGhpc0lzQVN1cGVyU2VjcmV0S2V5Rm9yTWFya2V0cGxhY2UyMDI2VGhhdElzTG9uZ0Vub3VnaA==",
        "jwt.expiration=86400000",
        "jwt.refresh-expiration=604800000",
        "app.checkout.shipping-flat-rate=5.00",
        "app.checkout.free-shipping-threshold=50.00",
        "app.checkout.tax-rate=0.08"
})
class OrderFlowE2ETest {

    @Autowired
    private org.springframework.web.context.WebApplicationContext wac;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository variantRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private com.group5.marketplace.cart.repository.CartRepository cartRepository;

    @Autowired
    private com.group5.marketplace.cart.repository.CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private JwtService jwtService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();
    private String customerToken;
    private String vendorToken;
    private Long customerId;
    private Long vendorId;
    private Long shippingAddressId;
    private Long variantId;

    @BeforeEach
    void setUp() {
        mockMvc = org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup(wac)
                .apply(org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity())
                .build();
        orderRepository.deleteAll();
        paymentRepository.deleteAll();
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        variantRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        addressRepository.deleteAll();
        userRepository.deleteAll();

        User customer = User.builder()
                .firstName("Jane")
                .lastName("Doe")
                .email("jane@example.com")
                .username("jane@example.com")
                .password("password")
                .role(Role.CUSTOMER)
                .emailVerified(true)
                .build();
        userRepository.save(customer);
        customerId = customer.getId();
        customerToken = jwtService.generateToken(customer.getEmail(), customer.getRole().name());

        User vendor = User.builder()
                .firstName("Vendor")
                .lastName("One")
                .email("vendor@example.com")
                .username("vendor@example.com")
                .password("password")
                .role(Role.VENDOR)
                .emailVerified(true)
                .build();
        userRepository.save(vendor);
        vendorId = vendor.getId();
        vendorToken = jwtService.generateToken(vendor.getEmail(), vendor.getRole().name());

        Address shipping = new Address();
        shipping.setUserId(customerId);
        shipping.setRecipientName("Jane Doe");
        shipping.setPhone("+95912345678");
        shipping.setLine1("12 Main Street");
        shipping.setCity("Yangon");
        shipping.setRegion("Yangon Region");
        shipping.setPostalCode("11181");
        shipping.setCountry("Myanmar");
        shipping.setAddressType(Address.AddressType.SHIPPING);
        shipping.setIsDefault(true);
        addressRepository.save(shipping);
        shippingAddressId = shipping.getId();

        Category category = Category.builder().name("Electronics").slug("electronics").active(true).build();
        categoryRepository.save(category);

        Product product = Product.builder()
                .name("Wireless Mouse")
                .slug("wireless-mouse")
                .description("A wireless mouse")
                .price(new BigDecimal("20.00"))
                .category(category)
                .vendorId(vendorId)
                .build();
        productRepository.save(product);

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .sku("MSE-001")
                .price(new BigDecimal("20.00"))
                .stock(10)
                .active(true)
                .build();
        variantRepository.save(variant);
        variantId = variant.getId();
    }

    @Test
    void checkoutPlacesOrderWithPricingAndSnapshots() throws Exception {
        // add to cart
        mockMvc.perform(post("/api/cart")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\": " + variantId + ", \"quantity\": 2}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items").isArray());

        // checkout with CARD payment
        MvcResult created = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "shippingAddressId", shippingAddressId,
                                "billingAddressId", shippingAddressId,
                                "paymentMethod", "CARD",
                                "notes", "Please deliver in the morning"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.subtotal").value(40.00))
                .andExpect(jsonPath("$.data.shippingCost").value(5.00))
                .andExpect(jsonPath("$.data.tax").value(3.20))
                .andExpect(jsonPath("$.data.total").value(48.20))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.paymentMethod").value("CARD"))
                .andExpect(jsonPath("$.data.paymentStatus").value("COMPLETED"))
                .andExpect(jsonPath("$.data.shippingAddress.city").value("Yangon"))
                .andExpect(jsonPath("$.data.billingAddress.recipientName").value("Jane Doe"))
                .andExpect(jsonPath("$.data.items[0].quantity").value(2))
                .andReturn();

        Long orderId = objectMapper.readTree(created.getResponse().getContentAsString()).path("data").path("id").asLong();
        assertThat(orderId).isNotNull();

        // stock decremented
        ProductVariant v = variantRepository.findById(variantId).orElseThrow();
        assertThat(v.getStock()).isEqualTo(8);

        // payment record completed with transaction id
        Payment payment = paymentRepository.findFirstByOrderIdOrderByIdDesc(orderId).orElseThrow();
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(payment.getTransactionId()).isNotBlank();

        // cart cleared
        mockMvc.perform(get("/api/cart").header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items").isEmpty());
    }

    @Test
    void checkoutRejectsMissingAddressAndInvalidPaymentMethod() throws Exception {
        mockMvc.perform(post("/api/cart")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\": " + variantId + ", \"quantity\": 1}"))
                .andExpect(status().isOk());

        // missing shipping address
        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"paymentMethod\": \"CARD\"}"))
                .andExpect(status().isBadRequest());

        // invalid payment method
        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"shippingAddressId\": " + shippingAddressId + ", \"paymentMethod\": \"BITCOIN\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void cancelOrderRestocksAndRefundsPaidPayment() throws Exception {
        mockMvc.perform(post("/api/cart")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\": " + variantId + ", \"quantity\": 2}"))
                .andExpect(status().isOk());

        MvcResult created = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "shippingAddressId", shippingAddressId,
                                "paymentMethod", "CARD"))))
                .andExpect(status().isCreated())
                .andReturn();
        Long orderId = objectMapper.readTree(created.getResponse().getContentAsString()).path("data").path("id").asLong();

        mockMvc.perform(post("/api/orders/" + orderId + "/cancel")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELED"))
                .andExpect(jsonPath("$.data.paymentStatus").value("REFUNDED"));

        // stock restored
        ProductVariant v = variantRepository.findById(variantId).orElseThrow();
        assertThat(v.getStock()).isEqualTo(10);
    }

    @Test
    void cashOnDeliveryMarksPaymentCompleteOnDelivery() throws Exception {
        mockMvc.perform(post("/api/cart")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\": " + variantId + ", \"quantity\": 1}"))
                .andExpect(status().isOk());

        MvcResult created = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "shippingAddressId", shippingAddressId,
                                "paymentMethod", "CASH_ON_DELIVERY"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.paymentStatus").value("PENDING"))
                .andReturn();
        Long orderId = objectMapper.readTree(created.getResponse().getContentAsString()).path("data").path("id").asLong();

        // vendor delivers -> COD payment completed
        mockMvc.perform(put("/api/vendor/orders/" + orderId)
                        .header("Authorization", "Bearer " + vendorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\": \"DELIVERED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("DELIVERED"))
                .andExpect(jsonPath("$.data.paymentStatus").value("COMPLETED"));

        List<Payment> payments = List.of(paymentRepository.findFirstByOrderIdOrderByIdDesc(orderId).orElseThrow());
        assertThat(payments.get(0).getStatus()).isEqualTo(PaymentStatus.COMPLETED);
    }

    @Test
    void orderOwnershipEnforced() throws Exception {
        User other = User.builder()
                .firstName("Other")
                .lastName("User")
                .email("other@example.com")
                .username("other@example.com")
                .password("password")
                .role(Role.CUSTOMER)
                .emailVerified(true)
                .build();
        userRepository.save(other);
        String otherToken = jwtService.generateToken(other.getEmail(), other.getRole().name());

        mockMvc.perform(post("/api/cart")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\": " + variantId + ", \"quantity\": 1}"))
                .andExpect(status().isOk());

        MvcResult created = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "shippingAddressId", shippingAddressId,
                                "paymentMethod", "CASH_ON_DELIVERY"))))
                .andExpect(status().isCreated())
                .andReturn();
        Long orderId = objectMapper.readTree(created.getResponse().getContentAsString()).path("data").path("id").asLong();

        // another user cannot view or cancel the order
        mockMvc.perform(get("/api/orders/" + orderId).header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/orders/" + orderId + "/cancel").header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());
    }
}