package com.clinicbooking.appointmentservice.controller;

import com.clinicbooking.appointmentservice.dto.NotificationResponseDto;
import com.clinicbooking.appointmentservice.entity.Notification;
import com.clinicbooking.appointmentservice.service.NotificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NotificationController.class)
@ActiveProfiles("test")
@DisplayName("Notification Controller Access Tests")
class NotificationControllerAccessTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationService notificationService;

    @Test
    @DisplayName("Should allow patient to access own notifications")
    void shouldAllowPatientToAccessOwnNotifications() throws Exception {
        NotificationResponseDto dto = NotificationResponseDto.builder()
                .id(1L)
                .userId(32L)
                .title("Test")
                .message("Test message")
                .type(Notification.NotificationType.SYSTEM)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        when(notificationService.getNotificationsByUserId(32L, PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(dto), PageRequest.of(0, 10), 1));

        mockMvc.perform(get("/api/notifications/user/32")
                        .header("X-User-Id", "32")
                        .header("X-User-Role", "PATIENT")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should deny patient reading another user's notifications")
    void shouldDenyPatientReadingOtherNotifications() throws Exception {
        mockMvc.perform(get("/api/notifications/user/31")
                        .header("X-User-Id", "32")
                        .header("X-User-Role", "PATIENT")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Cannot access notifications of another user"));
    }

    @Test
    @DisplayName("Should allow admin reading another user's notifications")
    void shouldAllowAdminReadingOtherNotifications() throws Exception {
        when(notificationService.getNotificationsByUserId(31L, PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 10), 0));

        mockMvc.perform(get("/api/notifications/user/31")
                        .header("X-User-Id", "30")
                        .header("X-User-Role", "ADMIN")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should deny malformed user identity header")
    void shouldDenyMalformedUserIdentity() throws Exception {
        mockMvc.perform(get("/api/notifications/user/31")
                        .header("X-User-Id", "abc")
                        .header("X-User-Role", "PATIENT")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Invalid user identity"));
    }

    @Test
    @DisplayName("Should deny mark-as-read for notifications of another user")
    void shouldDenyMarkAsReadForAnotherUserNotification() throws Exception {
        when(notificationService.getNotificationById(10L))
                .thenReturn(NotificationResponseDto.builder()
                        .id(10L)
                        .userId(31L)
                        .title("Doctor notification")
                        .message("Msg")
                        .type(Notification.NotificationType.SYSTEM)
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build());

        mockMvc.perform(put("/api/notifications/10/read")
                        .header("X-User-Id", "32")
                        .header("X-User-Role", "PATIENT"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Cannot access notifications of another user"));

        verify(notificationService).getNotificationById(10L);
        verify(notificationService, never()).markAsRead(10L);
    }
}
