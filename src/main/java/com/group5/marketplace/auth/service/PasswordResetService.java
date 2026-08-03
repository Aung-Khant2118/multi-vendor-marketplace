package com.group5.marketplace.auth.service;

import com.group5.marketplace.auth.dto.ResetPasswordRequest;
import com.group5.marketplace.auth.dto.ForgotPasswordRequest;
import com.group5.marketplace.user.entity.User;
import com.group5.marketplace.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final long RESET_TOKEN_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public String requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();
        Date expiry = new Date(System.currentTimeMillis() + RESET_TOKEN_EXPIRATION_MS);

        user.setResetToken(token);
        user.setResetTokenExpiry(expiry);

        userRepository.save(user);

        // In production, send token to user's email. Returning for testing.
        return token;
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().before(new Date())) {
            throw new RuntimeException("Invalid or expired reset token");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);
    }
}