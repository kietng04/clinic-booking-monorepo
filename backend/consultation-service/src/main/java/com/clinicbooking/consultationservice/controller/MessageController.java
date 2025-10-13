package com.clinicbooking.consultationservice.controller;

import com.clinicbooking.consultationservice.dto.MessageDto;
import com.clinicbooking.consultationservice.dto.SendMessageRequestDto;
import com.clinicbooking.consultationservice.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * REST and WebSocket Controller for message operations
 */
@Controller
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Messages", description = "Chat message management endpoints")
public class MessageController {

    private final MessageService messageService;

    /**
     * REST endpoint to send a message
     */
    @PostMapping("/api/messages")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    @Operation(summary = "Send a message",
               description = "Send a text or file message in a consultation")
    public ResponseEntity<MessageDto> sendMessage(
            @Valid @RequestBody SendMessageRequestDto request,
            @RequestAttribute("userId") Long userId,
            @RequestAttribute("userRole") String userRole) {
        log.info("User {} sending message to consultation {}", userId, request.getConsultationId());
        MessageDto message = messageService.sendMessage(request, userId, userRole);
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    /**
     * WebSocket endpoint to send a message (real-time)
     */
    @MessageMapping("/consultation/{consultationId}/send")
    public void sendMessageViaWebSocket(
            @DestinationVariable Long consultationId,
            @Payload SendMessageRequestDto request,
            Principal principal) {
        log.info("WebSocket message received for consultation {}", consultationId);
        // Extract user ID and role from principal
        // This would require custom authentication for WebSocket
        // For now, using REST endpoint is recommended
    }

    /**
     * Get all messages for a consultation
     */
    @GetMapping("/api/messages/consultation/{consultationId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    @Operation(summary = "Get messages for consultation",
               description = "Get all messages in a consultation")
    public ResponseEntity<List<MessageDto>> getMessages(
            @PathVariable Long consultationId,
            @RequestAttribute("userId") Long userId) {
        log.info("Fetching messages for consultation {} by user {}", consultationId, userId);
        List<MessageDto> messages = messageService.getMessagesByConsultation(consultationId, userId);
        return ResponseEntity.ok(messages);
    }

    /**
     * Get messages with pagination
     */
    @GetMapping("/api/messages/consultation/{consultationId}/paginated")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    @Operation(summary = "Get messages with pagination",
               description = "Get messages in a consultation with pagination")
    public ResponseEntity<Page<MessageDto>> getMessagesPaginated(
            @PathVariable Long consultationId,
            @RequestAttribute("userId") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        log.info("Fetching paginated messages for consultation {} by user {}", consultationId, userId);
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageDto> messages = messageService.getMessagesByConsultationPaginated(
                consultationId, userId, pageable);
        return ResponseEntity.ok(messages);
    }

    /**
     * Get unread messages for a consultation
     */
    @GetMapping("/api/messages/consultation/{consultationId}/unread")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    @Operation(summary = "Get unread messages",
               description = "Get all unread messages in a consultation")
    public ResponseEntity<List<MessageDto>> getUnreadMessages(
            @PathVariable Long consultationId,
            @RequestAttribute("userId") Long userId) {
        log.info("Fetching unread messages for consultation {} by user {}", consultationId, userId);
        List<MessageDto> messages = messageService.getUnreadMessages(consultationId, userId);
        return ResponseEntity.ok(messages);
    }

    /**
     * Mark messages as read
     */
    @PutMapping("/api/messages/consultation/{consultationId}/read")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    @Operation(summary = "Mark messages as read",
               description = "Mark all unread messages in a consultation as read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long consultationId,
            @RequestAttribute("userId") Long userId) {
        log.info("Marking messages as read for consultation {} by user {}", consultationId, userId);
        messageService.markMessagesAsRead(consultationId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Count unread messages
     */
    @GetMapping("/api/messages/consultation/{consultationId}/unread-count")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    @Operation(summary = "Count unread messages",
               description = "Get count of unread messages in a consultation")
    public ResponseEntity<Long> countUnreadMessages(
            @PathVariable Long consultationId,
            @RequestAttribute("userId") Long userId) {
        Long count = messageService.countUnreadMessages(consultationId, userId);
        return ResponseEntity.ok(count);
    }

    /**
     * Delete a message
     */
    @DeleteMapping("/api/messages/{messageId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    @Operation(summary = "Delete a message",
               description = "Soft delete a message (only sender can delete)")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long messageId,
            @RequestAttribute("userId") Long userId) {
        log.info("User {} deleting message {}", userId, messageId);
        messageService.deleteMessage(messageId, userId);
        return ResponseEntity.noContent().build();
    }
}
