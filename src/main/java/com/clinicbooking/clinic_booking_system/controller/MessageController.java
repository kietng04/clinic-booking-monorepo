package com.clinicbooking.clinic_booking_system.controller;

import com.clinicbooking.clinic_booking_system.dto.common.ApiResponse;
import com.clinicbooking.clinic_booking_system.dto.common.PageResponse;
import com.clinicbooking.clinic_booking_system.dto.message.MessageCreateDto;
import com.clinicbooking.clinic_booking_system.dto.message.MessageResponseDto;
import com.clinicbooking.clinic_booking_system.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService service;

    @PostMapping
    public ResponseEntity<ApiResponse<MessageResponseDto>> create(
            @Valid @RequestBody MessageCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<MessageResponseDto>builder()
                        .success(true)
                        .message("Gửi tin nhắn thành công")
                        .data(service.create(dto))
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MessageResponseDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<MessageResponseDto>builder()
                .success(true)
                .data(service.getById(id))
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/consultation/{consultationId}")
    public ResponseEntity<PageResponse<MessageResponseDto>> getAllByConsultation(
            @PathVariable Long consultationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getAllByConsultation(consultationId, page, size));
    }

    @GetMapping("/consultation/{consultationId}/unread")
    public ResponseEntity<ApiResponse<List<MessageResponseDto>>> getUnreadByConsultation(
            @PathVariable Long consultationId) {
        return ResponseEntity.ok(ApiResponse.<List<MessageResponseDto>>builder()
                .success(true)
                .data(service.getUnreadByConsultation(consultationId))
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/consultation/{consultationId}/unread/count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@PathVariable Long consultationId) {
        return ResponseEntity.ok(ApiResponse.<Long>builder()
                .success(true)
                .data(service.getUnreadCount(consultationId))
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<MessageResponseDto>> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<MessageResponseDto>builder()
                .success(true)
                .message("Đánh dấu tin nhắn đã đọc")
                .data(service.markAsRead(id))
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PatchMapping("/consultation/{consultationId}/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@PathVariable Long consultationId) {
        service.markAllAsReadForConsultation(consultationId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Đánh dấu tất cả tin nhắn đã đọc")
                .timestamp(LocalDateTime.now())
                .build());
    }
}
