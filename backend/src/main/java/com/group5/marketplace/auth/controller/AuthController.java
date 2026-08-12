package com.group5.marketplace.auth.controller;

import com.group5.marketplace.auth.dto.LoginRequest;
import com.group5.marketplace.auth.dto.LoginResponse;
import com.group5.marketplace.auth.dto.RegisterRequest;
import com.group5.marketplace.auth.dto.UserMeResponse;
import com.group5.marketplace.auth.service.AuthService;
import com.group5.marketplace.auth.security.JwtService;
import com.group5.marketplace.auth.security.CustomUserDetailsService;
import com.group5.marketplace.user.entity.User;
import com.group5.marketplace.vendor.entity.Vendor;
import com.group5.marketplace.vendor.service.VendorService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final VendorService vendorService;

    public AuthController(AuthService authService, JwtService jwtService, VendorService vendorService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.vendorService = vendorService;
    }

    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest request) {

        authService.register(request);

        return "Registration successful";
    }

    @PostMapping("/register-vendor")
    public String registerVendor(@Valid @RequestBody com.group5.marketplace.vendor.dto.VendorRegistrationRequest request) {

        authService.registerVendor(request);

        return "Vendor registration successful. Awaiting approval.";
    }

    @GetMapping("/me")
    public UserMeResponse me(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Vendor vendor = vendorService.getByUserId(user.getId());
        String vendorStatus = vendor == null ? null : vendor.getStatus().name();
        return new UserMeResponse(user.getId(), user.getFirstName(), user.getLastName(),
                user.getEmail(), user.getRole().name(), vendorStatus);
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