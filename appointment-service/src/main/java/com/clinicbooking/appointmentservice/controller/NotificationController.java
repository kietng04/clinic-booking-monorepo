package com.clinicbooking.appointmentservice.controller;

import com.clinicbooking.appointmentservice.dto.NotificationCreateDto;
import com.clinicbooking.appointmentservice.dto.NotificationResponseDto;
import com.clinicbooking.appointmentservice.dto.NotificationUpdateDto;
import com.clinicbooking.appointmentservice.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "API quản lý thông báo")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    @Operation(summary = "Tạo thông báo mới")
    public ResponseEntity<NotificationResponseDto> createNotification(
            @Valid @RequestBody NotificationCreateDto dto) {
        NotificationResponseDto response = notificationService.createNotification(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông báo theo ID")
    public ResponseEntity<NotificationResponseDto> getNotificationById(@PathVariable Long id) {
        NotificationResponseDto response = notificationService.getNotificationById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Lấy tất cả thông báo của user")
    public ResponseEntity<Page<NotificationResponseDto>> getNotificationsByUserId(
            @PathVariable Long userId,
            Pageable pageable) {
        Page<NotificationResponseDto> response = notificationService.getNotificationsByUserId(userId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/unread")
    @Operation(summary = "Lấy thông báo chưa đọc của user")
    public ResponseEntity<List<NotificationResponseDto>> getUnreadNotificationsByUserId(@PathVariable Long userId) {
        List<NotificationResponseDto> response = notificationService.getUnreadNotificationsByUserId(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/status/{isRead}")
    @Operation(summary = "Lấy thông báo theo trạng thái đọc")
    public ResponseEntity<Page<NotificationResponseDto>> getNotificationsByUserIdAndReadStatus(
            @PathVariable Long userId,
            @PathVariable Boolean isRead,
            Pageable pageable) {
        Page<NotificationResponseDto> response = notificationService.getNotificationsByUserIdAndReadStatus(userId, isRead, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/unread/count")
    @Operation(summary = "Đếm số thông báo chưa đọc")
    public ResponseEntity<Map<String, Long>> countUnreadByUserId(@PathVariable Long userId) {
        long count = notificationService.countUnreadByUserId(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông báo")
    public ResponseEntity<NotificationResponseDto> updateNotification(
            @PathVariable Long id,
            @Valid @RequestBody NotificationUpdateDto dto) {
        NotificationResponseDto response = notificationService.updateNotification(id, dto);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/mark-read")
    @Operation(summary = "Đánh dấu thông báo đã đọc")
    public ResponseEntity<NotificationResponseDto> markAsRead(@PathVariable Long id) {
        NotificationResponseDto response = notificationService.markAsRead(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/user/{userId}/mark-all-read")
    @Operation(summary = "Đánh dấu tất cả thông báo đã đọc")
    public ResponseEntity<Void> markAllAsReadByUserId(@PathVariable Long userId) {
        notificationService.markAllAsReadByUserId(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa thông báo")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
