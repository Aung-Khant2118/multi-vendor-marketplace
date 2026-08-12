package com.group5.marketplace.auth.controller;

import com.group5.marketplace.auth.dto.ForgotPasswordRequest;
import com.group5.marketplace.auth.dto.ResetPasswordRequest;
import com.group5.marketplace.auth.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        // generate and email token in production; do not return token in response
        passwordResetService.requestPasswordReset(request.getEmail());
        return "If that email exists, a password reset link has been sent.";
    }

    @PostMapping("/reset-password")
    public String resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return "Password has been reset successfully";
    }
}