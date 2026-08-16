package com.group5.marketplace.category.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.group5.marketplace.category.dto.CategoryRequest;
import com.group5.marketplace.category.entity.Category;
import com.group5.marketplace.category.repository.CategoryRepository;
import com.group5.marketplace.user.entity.Role;
import com.group5.marketplace.user.entity.User;
import com.group5.marketplace.user.repository.UserRepository;
import com.group5.marketplace.auth.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "jwt.secret=VGhpc0lzQVN1cGVyU2VjcmV0S2V5Rm9yTWFya2V0cGxhY2UyMDI2VGhhdElzTG9uZ0Vub3VnaA==",
        "jwt.expiration=86400000",
        "jwt.refresh-expiration=604800000"
})
class CategoryControllerE2ETest {

    @LocalServerPort
    private int port;

    @Autowired
    private org.springframework.web.context.WebApplicationContext wac;

    private org.springframework.test.web.servlet.MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CategoryRepository categoryRepository;

    private String adminToken;
    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup(wac)
                .apply(org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity())
                .build();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        User admin = User.builder()
                .firstName("Admin")
                .lastName("User")
                .email("admin@example.com")
                .username("admin@example.com")
                .password("password")
                .role(Role.ADMIN)
                .emailVerified(true)
                .build();

        userRepository.save(admin);

        adminToken = jwtService.generateToken(admin.getEmail(), admin.getRole().name());
    }

    @Test
    void unauthenticatedCannotCreate() throws Exception {
        CategoryRequest req = new CategoryRequest();
        req.setName("Throws");
        req.setSlug("throws");

        mockMvc.perform(post("/api/admin/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @org.springframework.security.test.context.support.WithMockUser(roles = "ADMIN")
    @Test
    void adminCanCreateAndFetch() throws Exception {
        CategoryRequest req = new CategoryRequest();
        req.setName("Toys");
        req.setSlug("toys");

        // create
        mockMvc.perform(post("/api/admin/categories")
                                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("admin@example.com").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Toys"));

        // list public
        mockMvc.perform(get("/api/categories").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].slug").value("toys"));

        // get by slug
        mockMvc.perform(get("/api/categories/toys").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.slug").value("toys"));
    }

    @org.springframework.security.test.context.support.WithMockUser(roles = "ADMIN")
    @Test
    void adminCanUpdateAndDelete() throws Exception {
        Category cat = Category.builder()
                .name("Gadgets")
                .slug("gadgets")
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        Category saved = categoryRepository.save(cat);

        CategoryRequest upd = new CategoryRequest();
        upd.setName("Gadgets New");
        upd.setSlug("gadgets-new");

        mockMvc.perform(patch("/api/admin/categories/" + saved.getId())
                                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("admin@example.com").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(upd)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Gadgets New"))
                .andExpect(jsonPath("$.data.slug").value("gadgets-new"));

        mockMvc.perform(delete("/api/admin/categories/" + saved.getId())
                                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("admin@example.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // deleted should be inactive
        mockMvc.perform(get("/api/categories/gadgets-new").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(false));
    }
}
