package com.clinicbooking.appointmentservice.controller;

import com.clinicbooking.appointmentservice.dto.NotificationCreateDto;
import com.clinicbooking.appointmentservice.dto.NotificationResponseDto;
import com.clinicbooking.appointmentservice.dto.NotificationUpdateDto;
import com.clinicbooking.appointmentservice.entity.Notification;
import com.clinicbooking.appointmentservice.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "API quản lý thông báo cho bệnh nhân")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    @Operation(summary = "Tạo thông báo mới")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Thông báo được tạo thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ")
    })
    public ResponseEntity<NotificationResponseDto> createNotification(
            @Valid @RequestBody NotificationCreateDto dto) {
        NotificationResponseDto response = notificationService.createNotification(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông báo theo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Thông báo được lấy thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy thông báo")
    })
    public ResponseEntity<NotificationResponseDto> getNotificationById(@PathVariable Long id) {
        NotificationResponseDto response = notificationService.getNotificationById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Lấy tất cả thông báo của user (sắp xếp mới nhất trước)")
    @Parameter(name = "userId", description = "ID của người dùng", required = true)
    @Parameter(name = "page", description = "Số trang (bắt đầu từ 0)", example = "0")
    @Parameter(name = "size", description = "Kích thước trang", example = "10")
    @Parameter(name = "sort", description = "Sắp xếp theo createdAt DESC", example = "createdAt,desc")
    @ApiResponse(responseCode = "200", description = "Danh sách thông báo được lấy thành công")
    public ResponseEntity<Page<NotificationResponseDto>> getNotificationsByUserId(
            @PathVariable Long userId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<NotificationResponseDto> response = notificationService.getNotificationsByUserId(userId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/unread")
    @Operation(summary = "Lấy tất cả thông báo chưa đọc của user (sắp xếp mới nhất trước)")
    @Parameter(name = "userId", description = "ID của người dùng", required = true)
    @ApiResponse(responseCode = "200", description = "Danh sách thông báo chưa đọc được lấy thành công")
    public ResponseEntity<List<NotificationResponseDto>> getUnreadNotificationsByUserId(@PathVariable Long userId) {
        List<NotificationResponseDto> response = notificationService.getUnreadNotificationsByUserId(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/status/{isRead}")
    @Operation(summary = "Lấy thông báo theo trạng thái đã đọc/chưa đọc (sắp xếp mới nhất trước)")
    @Parameter(name = "userId", description = "ID của người dùng", required = true)
    @Parameter(name = "isRead", description = "Trạng thái: true (đã đọc) hoặc false (chưa đọc)", required = true)
    @ApiResponse(responseCode = "200", description = "Danh sách thông báo được lấy thành công")
    public ResponseEntity<Page<NotificationResponseDto>> getNotificationsByUserIdAndReadStatus(
            @PathVariable Long userId,
            @PathVariable Boolean isRead,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<NotificationResponseDto> response = notificationService.getNotificationsByUserIdAndReadStatus(userId, isRead, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/type/{type}")
    @Operation(summary = "Lấy thông báo theo loại (sắp xếp mới nhất trước)")
    @Parameter(name = "userId", description = "ID của người dùng", required = true)
    @Parameter(name = "type", description = "Loại thông báo (APPOINTMENT_REMINDER, APPOINTMENT_CONFIRMED, v.v.)", required = true)
    @ApiResponse(responseCode = "200", description = "Danh sách thông báo được lấy thành công")
    public ResponseEntity<Page<NotificationResponseDto>> getNotificationsByUserIdAndType(
            @PathVariable Long userId,
            @PathVariable Notification.NotificationType type,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<NotificationResponseDto> response = notificationService.getNotificationsByUserIdAndType(userId, type, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/related/{relatedId}")
    @Operation(summary = "Lấy thông báo theo ID liên quan (ví dụ: appointment ID)")
    @Parameter(name = "userId", description = "ID của người dùng", required = true)
    @Parameter(name = "relatedId", description = "ID liên quan (e.g. appointment ID)", required = true)
    @ApiResponse(responseCode = "200", description = "Danh sách thông báo được lấy thành công")
    public ResponseEntity<List<NotificationResponseDto>> getNotificationsByUserIdAndRelatedId(
            @PathVariable Long userId,
            @PathVariable Long relatedId) {
        List<NotificationResponseDto> response = notificationService.getNotificationsByUserIdAndRelatedId(userId, relatedId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/unread/count")
    @Operation(summary = "Đếm số thông báo chưa đọc")
    @Parameter(name = "userId", description = "ID của người dùng", required = true)
    @ApiResponse(responseCode = "200", description = "Số lượng thông báo chưa đọc")
    public ResponseEntity<Map<String, Long>> countUnreadByUserId(@PathVariable Long userId) {
        long count = notificationService.countUnreadByUserId(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông báo")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Thông báo được cập nhật thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy thông báo")
    })
    public ResponseEntity<NotificationResponseDto> updateNotification(
            @PathVariable Long id,
            @Valid @RequestBody NotificationUpdateDto dto) {
        NotificationResponseDto response = notificationService.updateNotification(id, dto);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Đánh dấu thông báo đã đọc")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Thông báo được đánh dấu đã đọc"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy thông báo")
    })
    public ResponseEntity<NotificationResponseDto> markAsRead(@PathVariable Long id) {
        NotificationResponseDto response = notificationService.markAsRead(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/user/{userId}/read-all")
    @Operation(summary = "Đánh dấu tất cả thông báo đã đọc cho một user")
    @Parameter(name = "userId", description = "ID của người dùng", required = true)
    @ApiResponse(responseCode = "204", description = "Tất cả thông báo được đánh dấu đã đọc")
    public ResponseEntity<Void> markAllAsReadByUserId(@PathVariable Long userId) {
        notificationService.markAllAsReadByUserId(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa thông báo theo ID")
    @Parameter(name = "id", description = "ID của thông báo", required = true)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Thông báo được xóa thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy thông báo")
    })
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/user/{userId}")
    @Operation(summary = "Xóa tất cả thông báo của một user")
    @Parameter(name = "userId", description = "ID của người dùng", required = true)
    @ApiResponse(responseCode = "204", description = "Tất cả thông báo được xóa thành công")
    public ResponseEntity<Void> deleteAllNotificationsByUserId(@PathVariable Long userId) {
        notificationService.deleteAllNotificationsByUserId(userId);
        return ResponseEntity.noContent().build();
    }
}
