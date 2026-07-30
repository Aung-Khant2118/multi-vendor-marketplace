package com.group5.marketplace.auth.controller;

import com.group5.marketplace.auth.dto.LoginRequest;
import com.group5.marketplace.auth.dto.LoginResponse;
import com.group5.marketplace.auth.dto.RegisterRequest;
import com.group5.marketplace.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest request) {

        authService.register(request);

        return "Registration successful";
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}