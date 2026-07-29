package com.group5.marketplace.controller;

import com.group5.marketplace.dto.LoginRequest;
import com.group5.marketplace.dto.LoginResponse;
import com.group5.marketplace.dto.RegisterRequest;
import com.group5.marketplace.service.AuthService;
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