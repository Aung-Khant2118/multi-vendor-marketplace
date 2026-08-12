package com.group5.marketplace.auth.service;

import com.group5.marketplace.auth.dto.RegisterRequest;
import com.group5.marketplace.user.entity.Role;
import com.group5.marketplace.user.entity.User;
import com.group5.marketplace.user.repository.UserRepository;
import com.group5.marketplace.auth.dto.LoginRequest;
import com.group5.marketplace.auth.dto.LoginResponse;
import com.group5.marketplace.auth.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
@Service
public class AuthService {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.group5.marketplace.vendor.service.VendorService vendorService;

    public AuthService(JwtService jwtService, UserRepository userRepository, PasswordEncoder passwordEncoder,
                       com.group5.marketplace.vendor.service.VendorService vendorService) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.vendorService = vendorService;
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
                .build();

        userRepository.save(user);
    }
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return LoginResponse.builder()
                .token(token)
                .build();
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
                .build();

        User saved = userRepository.save(user);

        // vendor profile starts in PENDING status and must be approved by an admin before selling
        vendorService.createProfile(saved.getId(), request);
    }
}