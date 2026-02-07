package com.clinicbooking.appointmentservice.controller;

import com.clinicbooking.appointmentservice.dto.NotificationCreateDto;
import com.clinicbooking.appointmentservice.dto.NotificationResponseDto;
import com.clinicbooking.appointmentservice.dto.NotificationUpdateDto;
import com.clinicbooking.appointmentservice.entity.Notification.NotificationType;
import com.clinicbooking.appointmentservice.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NotificationController.class)
@ActiveProfiles("test")
@DisplayName("NotificationController Simple Tests")
class NotificationControllerSimpleTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private NotificationService notificationService;

    private NotificationCreateDto createDto;
    private NotificationResponseDto responseDto;
    private NotificationUpdateDto updateDto;

    @BeforeEach
    void setUp() {
        createDto = NotificationCreateDto.builder()
                .userId(1L)
                .title("Test Notification")
                .message("Test Message")
                .type(NotificationType.APPOINTMENT_REMINDER)
                .relatedId(100L)
                .relatedType("appointment")
                .build();

        responseDto = NotificationResponseDto.builder()
                .id(1L)
                .userId(1L)
                .userName("John Doe")
                .title("Test Notification")
                .message("Test Message")
                .type(NotificationType.APPOINTMENT_REMINDER)
                .isRead(false)
                .relatedId(100L)
                .relatedType("appointment")
                .createdAt(LocalDateTime.now())
                .build();

        updateDto = NotificationUpdateDto.builder()
                .isRead(true)
                .build();
    }

    @Test
    @DisplayName("Should create notification successfully")
    void testCreateNotification_Success() throws Exception {
        // Given
        when(notificationService.createNotification(any(NotificationCreateDto.class))).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(post("/api/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.userId").value(1L))
                .andExpect(jsonPath("$.title").value("Test Notification"))
                .andExpect(jsonPath("$.message").value("Test Message"))
                .andExpect(jsonPath("$.isRead").value(false));

        verify(notificationService).createNotification(any(NotificationCreateDto.class));
    }

    @Test
    @DisplayName("Should return bad request when creating notification with invalid data")
    void testCreateNotification_InvalidData() throws Exception {
        // Given - create dto with missing required fields
        NotificationCreateDto invalidDto = NotificationCreateDto.builder()
                .userId(null)
                .title("")
                .message("")
                .build();

        // When & Then
        mockMvc.perform(post("/api/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest());

        verify(notificationService, never()).createNotification(any());
    }

    @Test
    @DisplayName("Should get notification by id successfully")
    void testGetNotificationById_Success() throws Exception {
        // Given
        when(notificationService.getNotificationById(1L)).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(get("/api/notifications/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Test Notification"));

        verify(notificationService).getNotificationById(1L);
    }

    @Test
    @DisplayName("Should get unread notifications by user id")
    void testGetUnreadNotificationsByUserId_Success() throws Exception {
        // Given
        List<NotificationResponseDto> notifications = List.of(responseDto);
        when(notificationService.getUnreadNotificationsByUserId(1L)).thenReturn(notifications);

        // When & Then
        mockMvc.perform(get("/api/notifications/user/{userId}/unread", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].isRead").value(false));

        verify(notificationService).getUnreadNotificationsByUserId(1L);
    }

    @Test
    @DisplayName("Should get notifications by user id and related id")
    void testGetNotificationsByUserIdAndRelatedId_Success() throws Exception {
        // Given
        List<NotificationResponseDto> notifications = List.of(responseDto);
        when(notificationService.getNotificationsByUserIdAndRelatedId(1L, 100L)).thenReturn(notifications);

        // When & Then
        mockMvc.perform(get("/api/notifications/user/{userId}/related/{relatedId}", 1L, 100L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].relatedId").value(100L));

        verify(notificationService).getNotificationsByUserIdAndRelatedId(1L, 100L);
    }

    @Test
    @DisplayName("Should count unread notifications")
    void testCountUnreadByUserId_Success() throws Exception {
        // Given
        when(notificationService.countUnreadByUserId(1L)).thenReturn(5L);

        // When & Then
        mockMvc.perform(get("/api/notifications/user/{userId}/unread/count", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(5L));

        verify(notificationService).countUnreadByUserId(1L);
    }

    @Test
    @DisplayName("Should update notification successfully")
    void testUpdateNotification_Success() throws Exception {
        // Given
        when(notificationService.updateNotification(eq(1L), any(NotificationUpdateDto.class))).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(put("/api/notifications/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));

        verify(notificationService).updateNotification(eq(1L), any(NotificationUpdateDto.class));
    }

    @Test
    @DisplayName("Should mark notification as read")
    void testMarkAsRead_Success() throws Exception {
        // Given
        NotificationResponseDto readDto = NotificationResponseDto.builder()
                .id(1L)
                .userId(1L)
                .userName("John Doe")
                .title("Test Notification")
                .message("Test Message")
                .type(NotificationType.APPOINTMENT_REMINDER)
                .isRead(true)
                .createdAt(LocalDateTime.now())
                .build();

        when(notificationService.markAsRead(1L)).thenReturn(readDto);

        // When & Then
        mockMvc.perform(put("/api/notifications/{id}/read", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.isRead").value(true));

        verify(notificationService).markAsRead(1L);
    }

    @Test
    @DisplayName("Should mark all notifications as read for user")
    void testMarkAllAsReadByUserId_Success() throws Exception {
        // Given
        doNothing().when(notificationService).markAllAsReadByUserId(1L);

        // When & Then
        mockMvc.perform(put("/api/notifications/user/{userId}/read-all", 1L))
                .andExpect(status().isNoContent());

        verify(notificationService).markAllAsReadByUserId(1L);
    }

    @Test
    @DisplayName("Should delete notification successfully")
    void testDeleteNotification_Success() throws Exception {
        // Given
        doNothing().when(notificationService).deleteNotification(1L);

        // When & Then
        mockMvc.perform(delete("/api/notifications/{id}", 1L))
                .andExpect(status().isNoContent());

        verify(notificationService).deleteNotification(1L);
    }

    @Test
    @DisplayName("Should delete all notifications for user")
    void testDeleteAllNotificationsByUserId_Success() throws Exception {
        // Given
        doNothing().when(notificationService).deleteAllNotificationsByUserId(1L);

        // When & Then
        mockMvc.perform(delete("/api/notifications/user/{userId}", 1L))
                .andExpect(status().isNoContent());

        verify(notificationService).deleteAllNotificationsByUserId(1L);
    }

    @Test
    @DisplayName("Should get empty list when no unread notifications")
    void testGetUnreadNotificationsByUserId_EmptyList() throws Exception {
        // Given
        when(notificationService.getUnreadNotificationsByUserId(1L)).thenReturn(List.of());

        // When & Then
        mockMvc.perform(get("/api/notifications/user/{userId}/unread", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        verify(notificationService).getUnreadNotificationsByUserId(1L);
    }

    @Test
    @DisplayName("Should return zero count when no unread notifications")
    void testCountUnreadByUserId_Zero() throws Exception {
        // Given
        when(notificationService.countUnreadByUserId(1L)).thenReturn(0L);

        // When & Then
        mockMvc.perform(get("/api/notifications/user/{userId}/unread/count", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(0L));

        verify(notificationService).countUnreadByUserId(1L);
    }

    @Test
    @DisplayName("Should get multiple unread notifications by user id")
    void testGetUnreadNotificationsByUserId_MultipleNotifications() throws Exception {
        // Given
        NotificationResponseDto responseDto2 = NotificationResponseDto.builder()
                .id(2L)
                .userId(1L)
                .userName("John Doe")
                .title("Second Notification")
                .message("Second Message")
                .type(NotificationType.ALERT)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        when(notificationService.getUnreadNotificationsByUserId(1L))
                .thenReturn(Arrays.asList(responseDto, responseDto2));

        // When & Then
        mockMvc.perform(get("/api/notifications/user/{userId}/unread", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[1].id").value(2L));

        verify(notificationService).getUnreadNotificationsByUserId(1L);
    }
}
