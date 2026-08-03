package com.group5.marketplace.auth.controller;

import com.group5.marketplace.auth.dto.LoginRequest;
import com.group5.marketplace.auth.dto.LoginResponse;
import com.group5.marketplace.auth.dto.RegisterRequest;
import com.group5.marketplace.auth.service.AuthService;
import com.group5.marketplace.auth.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest request) {

        authService.register(request);

        return "Registration successful";
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/logout")
    public String logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            jwtService.logout(token);
        }
        return "Logged out";
    }
}