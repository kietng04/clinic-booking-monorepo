package com.clinicbooking.clinic_booking_system.websocket;

import com.clinicbooking.clinic_booking_system.dto.message.MessageCreateDto;
import com.clinicbooking.clinic_booking_system.dto.message.MessageResponseDto;
import com.clinicbooking.clinic_booking_system.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    /**
     * Handle chat messages within a consultation
     * Client sends to: /app/chat/{consultationId}
     * Broadcast to: /topic/consultation/{consultationId}
     */
    @MessageMapping("/chat/{consultationId}")
    public void sendMessage(
            @DestinationVariable Long consultationId,
            @Payload MessageCreateDto messageDto) {

        log.info("Received message for consultation {}: {}", consultationId, messageDto.getContent());

        // Save message to database
        MessageResponseDto savedMessage = messageService.create(messageDto);

        // Broadcast to all subscribers of this consultation
        messagingTemplate.convertAndSend(
                "/topic/consultation/" + consultationId,
                savedMessage
        );
    }

    /**
     * Handle typing indicator
     * Client sends to: /app/typing/{consultationId}
     * Broadcast to: /topic/consultation/{consultationId}/typing
     */
    @MessageMapping("/typing/{consultationId}")
    public void handleTyping(
            @DestinationVariable Long consultationId,
            @Payload TypingIndicator typingIndicator) {

        messagingTemplate.convertAndSend(
                "/topic/consultation/" + consultationId + "/typing",
                typingIndicator
        );
    }

    public record TypingIndicator(Long userId, String userName, boolean isTyping) {}
}
