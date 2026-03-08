package com.clinicbooking.consultationservice.client;

import com.clinicbooking.consultationservice.dto.NotificationCreateRequestDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class NotificationServiceClientFallback implements NotificationServiceClient {
    @Override
    public void createNotification(NotificationCreateRequestDto request) {
        log.warn("Notification fallback triggered for userId={}, title={}",
                request != null ? request.getUserId() : null,
                request != null ? request.getTitle() : null);
    }
}
