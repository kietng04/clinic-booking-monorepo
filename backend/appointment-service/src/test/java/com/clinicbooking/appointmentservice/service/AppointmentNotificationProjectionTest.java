package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.client.UserServiceClient;
import com.clinicbooking.appointmentservice.dto.AppointmentResponseDto;
import com.clinicbooking.appointmentservice.dto.NotificationCreateDto;
import com.clinicbooking.appointmentservice.entity.Appointment;
import com.clinicbooking.appointmentservice.entity.Notification;
import com.clinicbooking.appointmentservice.event.AppointmentEventPublisher;
import com.clinicbooking.appointmentservice.mapper.AppointmentMapper;
import com.clinicbooking.appointmentservice.repository.AppointmentRepository;
import com.clinicbooking.appointmentservice.repository.DoctorScheduleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.times;

@ExtendWith(MockitoExtension.class)
class AppointmentNotificationProjectionTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private DoctorScheduleRepository doctorScheduleRepository;

    @Mock
    private AppointmentMapper appointmentMapper;

    @Mock
    private AppointmentEventPublisher eventPublisher;

    @Mock
    private UserServiceClient userServiceClient;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    @Test
    void completeAppointment_shouldCreateCompletedAndFeedbackNotifications() {
        Appointment appointment = Appointment.builder()
                .id(12L)
                .patientId(101L)
                .doctorId(202L)
                .status(Appointment.AppointmentStatus.CONFIRMED)
                .appointmentDate(LocalDate.now().plusDays(1))
                .appointmentTime(LocalTime.of(9, 0))
                .build();

        when(appointmentRepository.findById(12L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);
        when(appointmentMapper.toDto(any(Appointment.class))).thenReturn(AppointmentResponseDto.builder().id(12L).build());

        appointmentService.completeAppointment(12L);

        ArgumentCaptor<NotificationCreateDto> captor = ArgumentCaptor.forClass(NotificationCreateDto.class);
        verify(notificationService, times(2)).createNotification(captor.capture());

        assertThat(captor.getAllValues())
                .extracting(NotificationCreateDto::getType)
                .containsExactly(
                        Notification.NotificationType.APPOINTMENT_COMPLETED,
                        Notification.NotificationType.FEEDBACK_AVAILABLE
                );
        assertThat(captor.getAllValues())
                .extracting(NotificationCreateDto::getRelatedId)
                .containsOnly(12L);
    }

    @Test
    void cancelAppointment_shouldCreateCancelledNotification() {
        Appointment appointment = Appointment.builder()
                .id(13L)
                .patientId(303L)
                .doctorId(404L)
                .status(Appointment.AppointmentStatus.CONFIRMED)
                .appointmentDate(LocalDate.now().plusDays(2))
                .appointmentTime(LocalTime.of(10, 0))
                .build();

        when(appointmentRepository.findById(13L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);
        when(appointmentMapper.toDto(any(Appointment.class))).thenReturn(AppointmentResponseDto.builder().id(13L).build());

        appointmentService.cancelAppointment(13L, "Patient request");

        ArgumentCaptor<NotificationCreateDto> captor = ArgumentCaptor.forClass(NotificationCreateDto.class);
        verify(notificationService).createNotification(captor.capture());

        NotificationCreateDto created = captor.getValue();
        assertThat(created.getUserId()).isEqualTo(303L);
        assertThat(created.getType()).isEqualTo(Notification.NotificationType.APPOINTMENT_CANCELLED);
        assertThat(created.getRelatedId()).isEqualTo(13L);
    }
}
