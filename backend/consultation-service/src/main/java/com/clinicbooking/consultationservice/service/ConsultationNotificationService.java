package com.clinicbooking.consultationservice.service;

import com.clinicbooking.consultationservice.client.NotificationServiceClient;
import com.clinicbooking.consultationservice.dto.NotificationCreateRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConsultationNotificationService {

    private final NotificationServiceClient notificationServiceClient;

    public void notifyUser(Long userId, String title, String message, String type, Long relatedId) {
        try {
            notificationServiceClient.createNotification(NotificationCreateRequestDto.builder()
                    .userId(userId)
                    .title(title)
                    .message(message)
                    .type(type)
                    .relatedId(relatedId)
                    .relatedType("CONSULTATION")
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to create consultation notification for userId={}, relatedId={}: {}",
                    userId, relatedId, ex.getMessage());
        }
    }
}
