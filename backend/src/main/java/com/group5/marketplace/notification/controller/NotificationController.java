package com.group5.marketplace.notification.controller;

import com.group5.marketplace.notification.dto.NotificationResponse;
import com.group5.marketplace.notification.service.NotificationService;
import com.group5.marketplace.user.util.CurrentUserService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    public NotificationController(NotificationService notificationService, CurrentUserService currentUserService) {
        this.notificationService = notificationService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        Page<NotificationResponse> notifications = notificationService.getUserNotifications(userId, page, size);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", notifications.getContent());
        body.put("totalElements", notifications.getTotalElements());
        body.put("totalPages", notifications.getTotalPages());
        body.put("currentPage", notifications.getNumber());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> unreadCount(Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        long count = notificationService.getUnreadCount(userId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", count);
        return ResponseEntity.ok(body);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long id, Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        boolean updated = notificationService.markAsRead(userId, id);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", updated ? "Marked as read" : "Notification not found");
        return ResponseEntity.ok(body);
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(Principal principal) {
        Long userId = currentUserService.getCurrentUserId(principal);
        int count = notificationService.markAllAsRead(userId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", count + " notifications marked as read");
        return ResponseEntity.ok(body);
    }
}
