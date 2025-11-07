package com.clinicbooking.clinic_booking_system.controller;

import com.clinicbooking.clinic_booking_system.dto.common.ApiResponse;
import com.clinicbooking.clinic_booking_system.dto.common.PageResponse;
import com.clinicbooking.clinic_booking_system.dto.notification.NotificationCreateDto;
import com.clinicbooking.clinic_booking_system.dto.notification.NotificationResponseDto;
import com.clinicbooking.clinic_booking_system.entity.Notification;
import com.clinicbooking.clinic_booking_system.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService service;

    @PostMapping
    public ResponseEntity<ApiResponse<NotificationResponseDto>> create(
            @Valid @RequestBody NotificationCreateDto dto) {
        NotificationResponseDto notification = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<NotificationResponseDto>builder()
                        .success(true)
                        .message("Tạo thông báo thành công")
                        .data(notification)
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NotificationResponseDto>> getById(@PathVariable Long id) {
        NotificationResponseDto notification = service.getById(id);
        return ResponseEntity.ok(ApiResponse.<NotificationResponseDto>builder()
                .success(true)
                .data(notification)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<PageResponse<NotificationResponseDto>> getAllByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getAllByUser(userId, page, size));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<PageResponse<NotificationResponseDto>> getUnreadByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getUnreadByUser(userId, page, size));
    }

    @GetMapping("/user/{userId}/unread/count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@PathVariable Long userId) {
        long count = service.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.<Long>builder()
                .success(true)
                .data(count)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponseDto>> markAsRead(@PathVariable Long id) {
        NotificationResponseDto notification = service.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.<NotificationResponseDto>builder()
                .success(true)
                .message("Đánh dấu thông báo đã đọc")
                .data(notification)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PatchMapping("/user/{userId}/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@PathVariable Long userId) {
        service.markAllAsReadForUser(userId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Đánh dấu tất cả thông báo đã đọc")
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<NotificationResponseDto>> search(
            @RequestParam Long userId,
            @RequestParam(required = false) Notification.NotificationType type,
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.search(userId, type, isRead, page, size));
    }
}
