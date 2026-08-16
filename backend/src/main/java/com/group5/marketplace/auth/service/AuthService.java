package com.group5.marketplace.auth.service;

import com.group5.marketplace.auth.dto.RefreshTokenRequest;
import com.group5.marketplace.auth.dto.RegisterRequest;
import com.group5.marketplace.common.MailService;
import com.group5.marketplace.user.entity.Role;
import com.group5.marketplace.user.entity.User;
import com.group5.marketplace.user.repository.UserRepository;
import com.group5.marketplace.auth.dto.LoginRequest;
import com.group5.marketplace.auth.dto.LoginResponse;
import com.group5.marketplace.auth.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.Date;
import java.util.UUID;

@Service
public class AuthService {

    private static final long VERIFICATION_TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.group5.marketplace.vendor.service.VendorService vendorService;
    private final MailService mailService;
    private final String frontendUrl;

    public AuthService(JwtService jwtService, UserRepository userRepository, PasswordEncoder passwordEncoder,
                       com.group5.marketplace.vendor.service.VendorService vendorService,
                       MailService mailService,
                       @Value("${app.frontend-url:http://localhost:3000}") String frontendUrl) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.vendorService = vendorService;
        this.mailService = mailService;
        this.frontendUrl = frontendUrl;
    }

    public void register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        // The request only carries first/last name, email and password. The DB
        // username column is non-null, so reuse the email as the username.
        String username = request.getEmail();

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .username(username)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .emailVerified(false)
                .build();

        issueVerificationToken(user);

        userRepository.save(user);

        sendVerificationEmail(user);
    }

    public void registerVendor(com.group5.marketplace.vendor.dto.VendorRegistrationRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .username(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.VENDOR)
                .emailVerified(false)
                .build();

        issueVerificationToken(user);

        User saved = userRepository.save(user);

        // vendor profile starts in PENDING status and must be approved by an admin before selling
        vendorService.createProfile(saved.getId(), request);

        sendVerificationEmail(saved);
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail(), user.getRole().name());

        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .build();
    }

    public LoginResponse refresh(RefreshTokenRequest request) {

        String email = jwtService.extractUsername(request.getRefreshToken());
        if (email == null || !jwtService.isRefreshTokenValid(request.getRefreshToken(), email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail(), user.getRole().name());

        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .build();
    }

    public User verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired verification token"));

        if (user.getVerificationTokenExpiry() == null || user.getVerificationTokenExpiry().before(new Date())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired verification token");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);

        return userRepository.save(user);
    }

    private void issueVerificationToken(User user) {
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setVerificationTokenExpiry(new Date(System.currentTimeMillis() + VERIFICATION_TOKEN_EXPIRATION_MS));
    }

    private void sendVerificationEmail(User user) {
        String link = frontendUrl + "/auth/verify-email?token=" + user.getVerificationToken();
        mailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), link);
    }
}