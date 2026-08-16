package com.group5.marketplace.address.controller;

import com.group5.marketplace.address.dto.AddressRequest;
import com.group5.marketplace.address.dto.AddressResponse;
import com.group5.marketplace.address.service.AddressService;
import com.group5.marketplace.user.util.CurrentUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AddressController {

    private final AddressService addressService;
    private final CurrentUserService currentUserService;

    public AddressController(AddressService addressService, CurrentUserService currentUserService) {
        this.addressService = addressService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/addresses")
    public ResponseEntity<Map<String, Object>> getAddresses(Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        List<AddressResponse> addresses = addressService.getAddresses(userId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", addresses);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/addresses")
    public ResponseEntity<Map<String, Object>> create(@Validated(AddressRequest.OnCreate.class) @RequestBody AddressRequest request, Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Address created successfully");
        body.put("data", addressService.create(userId, request));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PatchMapping("/addresses/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody AddressRequest request, Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Address updated successfully");
        body.put("data", addressService.update(userId, id, request));
        return ResponseEntity.ok(body);
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id, Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        addressService.delete(userId, id);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Address deleted successfully");
        return ResponseEntity.ok(body);
    }
}