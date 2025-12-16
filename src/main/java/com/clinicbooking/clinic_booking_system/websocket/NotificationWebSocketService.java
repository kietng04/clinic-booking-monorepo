package com.clinicbooking.clinic_booking_system.websocket;

import com.clinicbooking.clinic_booking_system.dto.notification.NotificationResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Send notification to a specific user via WebSocket
     */
    public void sendNotificationToUser(Long userId, NotificationResponseDto notification) {
        log.info("Sending WebSocket notification to user {}: {}", userId, notification.getTitle());

        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                notification
        );
    }

    /**
     * Send notification to all subscribers (broadcast)
     */
    public void broadcastNotification(NotificationResponseDto notification) {
        log.info("Broadcasting notification: {}", notification.getTitle());

        messagingTemplate.convertAndSend(
                "/topic/notifications",
                notification
        );
    }

    /**
     * Send real-time appointment update
     */
    public void sendAppointmentUpdate(Long userId, Object appointmentUpdate) {
        log.info("Sending appointment update to user {}", userId);

        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/appointments",
                appointmentUpdate
        );
    }
}
