package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.client.UserServiceClient;
import com.clinicbooking.appointmentservice.dto.AppointmentFeedbackDto;
import com.clinicbooking.appointmentservice.dto.AppointmentResponseDto;
import com.clinicbooking.appointmentservice.entity.Appointment;
import com.clinicbooking.appointmentservice.event.AppointmentEventPublisher;
import com.clinicbooking.appointmentservice.exception.ValidationException;
import com.clinicbooking.appointmentservice.mapper.AppointmentMapper;
import com.clinicbooking.appointmentservice.repository.AppointmentRepository;
import com.clinicbooking.appointmentservice.repository.DoctorScheduleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AppointmentFeedbackServiceTest {

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

    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    private Appointment completedAppointment;
    private AppointmentFeedbackDto feedbackDto;

    @BeforeEach
    void setUp() {
        completedAppointment = Appointment.builder()
                .id(11L)
                .patientId(101L)
                .doctorId(202L)
                .appointmentDate(LocalDate.now().minusDays(1))
                .appointmentTime(LocalTime.of(10, 0))
                .status(Appointment.AppointmentStatus.COMPLETED)
                .build();

        feedbackDto = AppointmentFeedbackDto.builder()
                .rating(BigDecimal.valueOf(4.5))
                .review("Bac si tu van rat ky.")
                .build();
    }

    @Test
    @DisplayName("submitFeedback should save rating for completed own appointment")
    void submitFeedback_shouldSaveRatingForCompletedOwnAppointment() {
        AppointmentResponseDto responseDto = AppointmentResponseDto.builder()
                .id(11L)
                .patientRating(BigDecimal.valueOf(4.5))
                .patientReview("Bac si tu van rat ky.")
                .build();

        when(appointmentRepository.findById(11L)).thenReturn(Optional.of(completedAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));
        when(appointmentMapper.toDto(any(Appointment.class))).thenReturn(responseDto);

        AppointmentResponseDto result = appointmentService.submitFeedback(11L, 101L, feedbackDto);

        assertThat(result.getPatientRating()).isEqualByComparingTo("4.5");
        verify(appointmentRepository).save(completedAppointment);
    }

    @Test
    @DisplayName("submitFeedback should reject when appointment is not completed")
    void submitFeedback_shouldRejectWhenAppointmentNotCompleted() {
        Appointment appointment = Appointment.builder()
                .id(11L)
                .patientId(101L)
                .status(Appointment.AppointmentStatus.CONFIRMED)
                .build();
        when(appointmentRepository.findById(11L)).thenReturn(Optional.of(appointment));

        assertThatThrownBy(() -> appointmentService.submitFeedback(11L, 101L, feedbackDto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("hoàn thành");

        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("submitFeedback should reject when patient does not own appointment")
    void submitFeedback_shouldRejectWhenPatientDoesNotOwnAppointment() {
        when(appointmentRepository.findById(11L)).thenReturn(Optional.of(completedAppointment));

        assertThatThrownBy(() -> appointmentService.submitFeedback(11L, 999L, feedbackDto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("không có quyền");

        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("submitFeedback should reject duplicate feedback")
    void submitFeedback_shouldRejectDuplicateFeedback() {
        completedAppointment.setPatientRating(BigDecimal.valueOf(5.0));
        when(appointmentRepository.findById(11L)).thenReturn(Optional.of(completedAppointment));

        assertThatThrownBy(() -> appointmentService.submitFeedback(11L, 101L, feedbackDto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("đánh giá");

        verify(appointmentRepository, never()).save(any());
    }
}
