package com.group5.marketplace.auth.service;

import com.group5.marketplace.auth.dto.ResetPasswordRequest;
import com.group5.marketplace.common.MailService;
import com.group5.marketplace.user.entity.User;
import com.group5.marketplace.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.Date;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final long RESET_TOKEN_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final String frontendUrl;

    public PasswordResetService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                                MailService mailService,
                                @Value("${app.frontend-url:http://localhost:3000}") String frontendUrl) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailService = mailService;
        this.frontendUrl = frontendUrl;
    }

    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String token = UUID.randomUUID().toString();
        Date expiry = new Date(System.currentTimeMillis() + RESET_TOKEN_EXPIRATION_MS);

        user.setResetToken(token);
        user.setResetTokenExpiry(expiry);

        userRepository.save(user);

        // The token is sent to the user's email, never returned in the response.
        String link = frontendUrl + "/auth/reset-password?token=" + token;
        mailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), link);
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().before(new Date())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);
    }
}