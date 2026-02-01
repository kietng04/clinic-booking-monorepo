package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.client.UserServiceClient;
import com.clinicbooking.appointmentservice.dto.AppointmentResponseDto;
import com.clinicbooking.appointmentservice.entity.Appointment;
import com.clinicbooking.appointmentservice.event.AppointmentEventPublisher;
import com.clinicbooking.appointmentservice.mapper.AppointmentMapper;
import com.clinicbooking.appointmentservice.repository.AppointmentRepository;
import com.clinicbooking.appointmentservice.repository.DoctorScheduleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceImplTest {
    @Mock private AppointmentRepository appointmentRepository;
    @Mock private AppointmentMapper appointmentMapper;
    @Mock private AppointmentEventPublisher eventPublisher;
    @Mock private DoctorScheduleRepository doctorScheduleRepository;
    @Mock private NotificationService notificationService;
    @Mock private UserServiceClient userServiceClient;

    @InjectMocks private AppointmentServiceImpl appointmentService;

    @Test
    void completeAppointment_allowsUpcomingConfirmed() {
        Appointment appointment = Appointment.builder()
            .id(11L)
            .status(Appointment.AppointmentStatus.CONFIRMED)
            .appointmentDate(LocalDate.now().plusDays(1))
            .appointmentTime(LocalTime.of(10, 0))
            .build();

        when(appointmentRepository.findById(11L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(appointment)).thenReturn(appointment);
        when(appointmentMapper.toDto(appointment)).thenReturn(AppointmentResponseDto.builder().id(11L).build());

        assertDoesNotThrow(() -> appointmentService.completeAppointment(11L));
        assertEquals(Appointment.AppointmentStatus.COMPLETED, appointment.getStatus());
    }
}
