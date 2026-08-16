package com.group5.marketplace.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.group5.marketplace.auth.dto.LoginRequest;
import com.group5.marketplace.auth.dto.LoginResponse;
import com.group5.marketplace.auth.dto.RefreshTokenRequest;
import com.group5.marketplace.user.dto.ChangePasswordRequest;
import com.group5.marketplace.user.dto.UpdateProfileRequest;
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

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:authtest;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "jwt.secret=VGhpc0lzQVN1cGVyU2VjcmV0S2V5Rm9yTWFya2V0cGxhY2UyMDI2VGhhdElzTG9uZ0Vub3VnaA==",
        "jwt.expiration=86400000",
        "jwt.refresh-expiration=604800000",
        "app.frontend-url=http://localhost:3000"
})
class AuthFlowE2ETest {

    @Autowired
    private org.springframework.web.context.WebApplicationContext wac;

    @Autowired
    private UserRepository userRepository;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup(wac)
                .apply(org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity())
                .build();
        userRepository.deleteAll();
    }

    @Test
    void fullAuthFlow() throws Exception {
        Map<String, String> registerBody = Map.of(
                "firstName", "Jane",
                "lastName", "Doe",
                "email", "jane@example.com",
                "password", "secret123"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerBody)))
                .andExpect(status().isOk());

        // account starts unverified and carries a verification token
        User registered = userRepository.findByEmail("jane@example.com").orElseThrow();
        assertThat(registered.isEmailVerified()).isFalse();
        assertThat(registered.getVerificationToken()).isNotBlank();

        // verifying marks the email as verified
        mockMvc.perform(get("/api/auth/verify/" + registered.getVerificationToken()))
                .andExpect(status().isOk());
        assertThat(userRepository.findByEmail("jane@example.com").orElseThrow().isEmailVerified()).isTrue();

        // login returns an access token and a refresh token
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("jane@example.com", "secret123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andReturn();

        LoginResponse login = objectMapper.readValue(loginResult.getResponse().getContentAsString(), LoginResponse.class);
        String accessToken = login.getToken();

        // /me exposes the profile including emailVerified and phone
        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("jane@example.com"))
                .andExpect(jsonPath("$.emailVerified").value(true));

        // refresh issues a fresh pair of tokens
        MvcResult refreshResult = mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RefreshTokenRequest(login.getRefreshToken()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andReturn();

        LoginResponse refreshed = objectMapper.readValue(refreshResult.getResponse().getContentAsString(), LoginResponse.class);
        assertThat(refreshed.getToken()).isNotBlank();
        assertThat(refreshed.getRefreshToken()).isNotBlank();

        // profile update persists first/last name and phone
        UpdateProfileRequest update = new UpdateProfileRequest("Jane", "Smith", "+95912345678");
        mockMvc.perform(patch("/api/users/me")
                        .header("Authorization", "Bearer " + refreshed.getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastName").value("Smith"))
                .andExpect(jsonPath("$.phoneNumber").value("+95912345678"));

        // password change with wrong current password is rejected
        ChangePasswordRequest bad = new ChangePasswordRequest("wrong", "newpass456");
        mockMvc.perform(patch("/api/users/me/password")
                        .header("Authorization", "Bearer " + refreshed.getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bad)))
                .andExpect(status().isBadRequest());

        // password change with correct current password works
        ChangePasswordRequest good = new ChangePasswordRequest("secret123", "newpass456");
        mockMvc.perform(patch("/api/users/me/password")
                        .header("Authorization", "Bearer " + refreshed.getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(good)))
                .andExpect(status().isOk());

        // the new password can be used to log in
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("jane@example.com", "newpass456"))))
                .andExpect(status().isOk());

        // an invalid/expired verification token is rejected
        mockMvc.perform(get("/api/auth/verify/not-a-real-token"))
                .andExpect(status().isBadRequest());
    }
}