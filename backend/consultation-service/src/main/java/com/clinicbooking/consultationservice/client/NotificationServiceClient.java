package com.clinicbooking.consultationservice.client;

import com.clinicbooking.consultationservice.dto.NotificationCreateRequestDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "appointment-service", fallback = NotificationServiceClientFallback.class)
public interface NotificationServiceClient {

    @PostMapping("/api/notifications")
    void createNotification(@RequestBody NotificationCreateRequestDto request);
}
