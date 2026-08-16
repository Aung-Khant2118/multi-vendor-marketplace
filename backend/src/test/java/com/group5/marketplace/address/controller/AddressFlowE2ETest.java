package com.group5.marketplace.address.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.group5.marketplace.address.entity.Address;
import com.group5.marketplace.address.repository.AddressRepository;
import com.group5.marketplace.auth.security.JwtService;
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

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:addresstest;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "jwt.secret=VGhpc0lzQVN1cGVyU2VjcmV0S2V5Rm9yTWFya2V0cGxhY2UyMDI2VGhhdElzTG9uZ0Vub3VnaA==",
        "jwt.expiration=86400000",
        "jwt.refresh-expiration=604800000"
})
class AddressFlowE2ETest {

    @Autowired
    private org.springframework.web.context.WebApplicationContext wac;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private JwtService jwtService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();
    private String token;
    private Long userId;

    @BeforeEach
    void setUp() {
        mockMvc = org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup(wac)
                .apply(org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity())
                .build();
        addressRepository.deleteAll();
        userRepository.deleteAll();

        User user = User.builder()
                .firstName("Jane")
                .lastName("Doe")
                .email("jane@example.com")
                .username("jane@example.com")
                .password("password")
                .role(Role.CUSTOMER)
                .emailVerified(true)
                .build();
        userRepository.save(user);
        userId = user.getId();
        token = jwtService.generateToken(user.getEmail(), user.getRole().name());
    }

    private Map<String, Object> fullAddress() {
        return Map.of(
                "recipientName", "Jane Doe",
                "phone", "+95912345678",
                "line1", "12 Main Street",
                "line2", "Unit 4",
                "city", "Yangon",
                "region", "Yangon Region",
                "postalCode", "11181",
                "country", "Myanmar",
                "addressType", "SHIPPING",
                "isDefault", false
        );
    }

    @Test
    void createUpdateDeleteFlow() throws Exception {
        // empty to start
        mockMvc.perform(get("/api/addresses").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isEmpty());

        // create two addresses, second marked default
        MvcResult created1 = mockMvc.perform(post("/api/addresses")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(fullAddress())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.recipientName").value("Jane Doe"))
                .andExpect(jsonPath("$.data.isDefault").value(false))
                .andReturn();

        Map<String, Object> second = new java.util.HashMap<>(fullAddress());
        second.put("addressType", "BILLING");
        second.put("isDefault", true);
        mockMvc.perform(post("/api/addresses")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(second)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.isDefault").value(true));

        // exactly one default address
        List<Address> afterCreate = addressRepository.findByUserId(userId);
        assertThat(afterCreate).hasSize(2);
        assertThat(afterCreate.stream().filter(a -> Boolean.TRUE.equals(a.getIsDefault()))).hasSize(1);

        Long firstId = objectMapper.readTree(created1.getResponse().getContentAsString()).path("data").path("id").asLong();

        // partial PATCH: make the first address default, second must be unset
        mockMvc.perform(patch("/api/addresses/" + firstId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"isDefault\": true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isDefault").value(true));

        assertThat(addressRepository.findByUserId(userId).stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsDefault()))).singleElement().satisfies(a -> assertThat(a.getId()).isEqualTo(firstId));

        // delete the default address
        mockMvc.perform(delete("/api/addresses/" + firstId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        assertThat(addressRepository.findByUserId(userId)).hasSize(1);
    }

    @Test
    void validationAndOwnership() throws Exception {
        // create requires required fields
        mockMvc.perform(post("/api/addresses")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"city\":\"Yangon\"}"))
                .andExpect(status().isBadRequest());

        // create a real address for ownership tests
        MvcResult created = mockMvc.perform(post("/api/addresses")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(fullAddress())))
                .andExpect(status().isCreated())
                .andReturn();
        Long id = objectMapper.readTree(created.getResponse().getContentAsString()).path("data").path("id").asLong();

        // another user cannot update or delete it
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

        mockMvc.perform(patch("/api/addresses/" + id)
                        .header("Authorization", "Bearer " + otherToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"city\":\"Mandalay\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/addresses/" + id)
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());

        // owner can delete
        mockMvc.perform(delete("/api/addresses/" + id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}