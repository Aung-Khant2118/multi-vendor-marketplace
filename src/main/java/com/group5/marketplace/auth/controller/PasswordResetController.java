package com.group5.marketplace.auth.controller;

import com.group5.marketplace.auth.dto.ForgotPasswordRequest;
import com.group5.marketplace.auth.dto.ResetPasswordRequest;
import com.group5.marketplace.auth.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public String forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String token = passwordResetService.requestPasswordReset(request.getEmail());
        // In production: send token by email; returning token for demo/testing only
        return "Password reset token: " + token;
    }

    @PostMapping("/reset-password")
    public String resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return "Password has been reset successfully";
    }
}