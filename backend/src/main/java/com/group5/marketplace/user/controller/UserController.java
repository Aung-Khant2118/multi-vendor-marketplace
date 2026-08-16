package com.group5.marketplace.user.controller;

import com.group5.marketplace.auth.dto.UserMeResponse;
import com.group5.marketplace.user.dto.ChangePasswordRequest;
import com.group5.marketplace.user.dto.UpdateProfileRequest;
import com.group5.marketplace.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PatchMapping("/me")
    public UserMeResponse updateProfile(Principal principal, @Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(principal, request);
    }

    @PatchMapping("/me/password")
    public String changePassword(Principal principal, @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(principal, request);
        return "Password changed successfully";
    }
}