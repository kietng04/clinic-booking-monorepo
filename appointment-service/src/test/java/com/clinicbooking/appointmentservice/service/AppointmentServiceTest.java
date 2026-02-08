package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.client.UserServiceClient;
import com.clinicbooking.appointmentservice.dto.*;
import com.clinicbooking.appointmentservice.entity.Appointment;
import com.clinicbooking.appointmentservice.entity.DoctorSchedule;
import com.clinicbooking.appointmentservice.event.AppointmentEventPublisher;
import com.clinicbooking.appointmentservice.exception.ResourceNotFoundException;
import com.clinicbooking.appointmentservice.exception.ValidationException;
import com.clinicbooking.appointmentservice.mapper.AppointmentMapper;
import com.clinicbooking.appointmentservice.repository.AppointmentRepository;
import com.clinicbooking.appointmentservice.repository.DoctorScheduleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

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

    private Appointment appointment;
    private AppointmentCreateDto createDto;
    private AppointmentResponseDto responseDto;
    private UserDto patientDto;
    private UserDto doctorDto;
    private DoctorSchedule doctorSchedule;

    @BeforeEach
    void setUp() {
        // Setup test data
        appointment = Appointment.builder()
                .id(1L)
                .patientId(1L)
                .patientName("John Doe")
                .patientPhone("0123456789")
                .doctorId(2L)
                .doctorName("Dr. Smith")
                .appointmentDate(LocalDate.now().plusDays(1))
                .appointmentTime(LocalTime.of(9, 0))
                .durationMinutes(30)
                .type(Appointment.AppointmentType.IN_PERSON)
                .status(Appointment.AppointmentStatus.PENDING)
                .priority(Appointment.Priority.NORMAL)
                .symptoms("Headache")
                .serviceFee(BigDecimal.valueOf(100000))
                .build();

        createDto = new AppointmentCreateDto();
        createDto.setPatientId(1L);
        createDto.setDoctorId(2L);
        createDto.setAppointmentDate(LocalDate.now().plusDays(1));
        createDto.setAppointmentTime(LocalTime.of(9, 0));
        createDto.setDurationMinutes(30);
        createDto.setType("IN_PERSON");
        createDto.setPriority("NORMAL");
        createDto.setSymptoms("Headache");

        responseDto = new AppointmentResponseDto();
        responseDto.setId(1L);
        responseDto.setPatientId(1L);
        responseDto.setDoctorId(2L);
        responseDto.setStatus("PENDING");

        patientDto = new UserDto();
        patientDto.setId(1L);
        patientDto.setFullName("John Doe");
        patientDto.setPhone("0123456789");
        patientDto.setRole("PATIENT");

        doctorDto = new UserDto();
        doctorDto.setId(2L);
        doctorDto.setFullName("Dr. Smith");
        doctorDto.setRole("DOCTOR");

        doctorSchedule = DoctorSchedule.builder()
                .id(1L)
                .doctorId(2L)
                .dayOfWeek((LocalDate.now().plusDays(1).getDayOfWeek().getValue()) % 7)
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(12, 0))
                .isAvailable(true)
                .build();
    }

    @Test
    void testCreateAppointment_Success() {
        // Given
        when(doctorScheduleRepository.findByDoctorIdAndDayOfWeek(anyLong(), anyInt()))
                .thenReturn(List.of(doctorSchedule));
        when(appointmentRepository.hasOverlappingAppointmentNative(anyLong(), any(), any(), any()))
                .thenReturn(false);
        when(userServiceClient.getUserById(1L)).thenReturn(patientDto);
        when(userServiceClient.getUserById(2L)).thenReturn(doctorDto);
        when(appointmentMapper.toEntity(any())).thenReturn(appointment);
        when(appointmentRepository.save(any())).thenReturn(appointment);
        when(appointmentMapper.toDto(any())).thenReturn(responseDto);

        // When
        AppointmentResponseDto result = appointmentService.createAppointment(createDto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(appointmentRepository).save(any());
        verify(eventPublisher).publishAppointmentCreated(any());
    }

    @Test
    void testCreateAppointment_InvalidDuration() {
        // Given
        createDto.setDurationMinutes(5); // Less than minimum

        // When/Then
        assertThatThrownBy(() -> appointmentService.createAppointment(createDto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Thời gian khám phải từ");
    }

    @Test
    void testCreateAppointment_PastDate() {
        // Given
        createDto.setAppointmentDate(LocalDate.now().minusDays(1));

        // When/Then
        assertThatThrownBy(() -> appointmentService.createAppointment(createDto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Không thể đặt lịch trong quá khứ");
    }

    @Test
    void testCreateAppointment_TooFarInFuture() {
        // Given
        createDto.setAppointmentDate(LocalDate.now().plusMonths(4));

        // When/Then
        assertThatThrownBy(() -> appointmentService.createAppointment(createDto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Không thể đặt lịch quá 3 tháng trước");
    }

    @Test
    void testCreateAppointment_OverlappingTime() {
        // Given
        when(doctorScheduleRepository.findByDoctorIdAndDayOfWeek(anyLong(), anyInt()))
                .thenReturn(List.of(doctorSchedule));
        when(appointmentRepository.hasOverlappingAppointmentNative(anyLong(), any(), any(), any()))
                .thenReturn(true);

        // When/Then
        assertThatThrownBy(() -> appointmentService.createAppointment(createDto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Khung giờ này đã bị trùng");
    }

    @Test
    void testCreateAppointment_NotADoctor() {
        // Given
        when(doctorScheduleRepository.findByDoctorIdAndDayOfWeek(anyLong(), anyInt()))
                .thenReturn(List.of(doctorSchedule));
        when(appointmentRepository.hasOverlappingAppointmentNative(anyLong(), any(), any(), any()))
                .thenReturn(false);
        when(userServiceClient.getUserById(1L)).thenReturn(patientDto);

        UserDto nonDoctorDto = new UserDto();
        nonDoctorDto.setRole("PATIENT");
        when(userServiceClient.getUserById(2L)).thenReturn(nonDoctorDto);

        // When/Then
        assertThatThrownBy(() -> appointmentService.createAppointment(createDto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Người dùng không phải là bác sĩ");
    }

    @Test
    void testCreateAppointment_AutoSeedScheduleWhenMissing() {
        // Given: first lookup has no schedule, service should create defaults and retry.
        when(doctorScheduleRepository.findByDoctorIdAndDayOfWeek(anyLong(), anyInt()))
                .thenReturn(Collections.emptyList())
                .thenReturn(List.of(doctorSchedule));
        when(doctorScheduleRepository.findByDoctorId(2L))
                .thenReturn(Collections.emptyList());
        when(doctorScheduleRepository.saveAll(anyList()))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(appointmentRepository.hasOverlappingAppointmentNative(anyLong(), any(), any(), any()))
                .thenReturn(false);
        when(userServiceClient.getUserById(1L)).thenReturn(patientDto);
        when(userServiceClient.getUserById(2L)).thenReturn(doctorDto);
        when(appointmentMapper.toEntity(any())).thenReturn(appointment);
        when(appointmentRepository.save(any())).thenReturn(appointment);
        when(appointmentMapper.toDto(any())).thenReturn(responseDto);

        // When
        AppointmentResponseDto result = appointmentService.createAppointment(createDto);

        // Then
        assertThat(result).isNotNull();
        verify(doctorScheduleRepository).saveAll(anyList());
        verify(appointmentRepository).save(any());
    }

    @Test
    void testGetAppointmentById_Success() {
        // Given
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(appointmentMapper.toDto(any())).thenReturn(responseDto);

        // When
        AppointmentResponseDto result = appointmentService.getAppointmentById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(appointmentRepository).findById(1L);
    }

    @Test
    void testGetAppointmentById_NotFound() {
        // Given
        when(appointmentRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> appointmentService.getAppointmentById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Lịch hẹn không tồn tại");
    }

    @Test
    void testGetAppointmentsByPatient() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Appointment> appointmentPage = new PageImpl<>(List.of(appointment));
        when(appointmentRepository.findByPatientId(1L, pageable)).thenReturn(appointmentPage);
        when(appointmentMapper.toDto(any())).thenReturn(responseDto);

        // When
        Page<AppointmentResponseDto> result = appointmentService.getAppointmentsByPatient(1L, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(appointmentRepository).findByPatientId(1L, pageable);
    }

    @Test
    void testGetAppointmentsByDoctor() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Appointment> appointmentPage = new PageImpl<>(List.of(appointment));
        when(appointmentRepository.findByDoctorId(2L, pageable)).thenReturn(appointmentPage);
        when(appointmentMapper.toDto(any())).thenReturn(responseDto);

        // When
        Page<AppointmentResponseDto> result = appointmentService.getAppointmentsByDoctor(2L, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(appointmentRepository).findByDoctorId(2L, pageable);
    }

    @Test
    void testConfirmAppointment_Success() {
        // Given
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any())).thenReturn(appointment);
        when(appointmentMapper.toDto(any())).thenReturn(responseDto);

        // When
        AppointmentResponseDto result = appointmentService.confirmAppointment(1L);

        // Then
        assertThat(result).isNotNull();
        verify(appointmentRepository).save(any());
        verify(eventPublisher).publishAppointmentUpdated(any());
        verify(notificationService).createNotification(any());
    }

    @Test
    void testCancelAppointment_Success() {
        // Given
        String cancelReason = "Patient requested cancellation";
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any())).thenReturn(appointment);
        when(appointmentMapper.toDto(any())).thenReturn(responseDto);

        // When
        AppointmentResponseDto result = appointmentService.cancelAppointment(1L, cancelReason);

        // Then
        assertThat(result).isNotNull();
        verify(appointmentRepository).save(any());
        verify(eventPublisher).publishAppointmentCancelled(any());
        verify(notificationService).createNotification(any());
    }

    @Test
    void testCancelAppointment_AlreadyCancelled() {
        // Given
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

        // When/Then
        assertThatThrownBy(() -> appointmentService.cancelAppointment(1L, "reason"))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Không thể hủy lịch hẹn");
    }

    @Test
    void testCompleteAppointment_Success() {
        // Given
        appointment.setStatus(Appointment.AppointmentStatus.CONFIRMED);
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any())).thenReturn(appointment);
        when(appointmentMapper.toDto(any())).thenReturn(responseDto);

        // When
        AppointmentResponseDto result = appointmentService.completeAppointment(1L);

        // Then
        assertThat(result).isNotNull();
        verify(appointmentRepository).save(any());
        verify(eventPublisher).publishAppointmentUpdated(any());
        verify(eventPublisher).publishAppointmentCompleted(any());
        verify(notificationService, times(2)).createNotification(any());
    }

    @Test
    void testSearchAppointments_WithAllFilters() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Appointment> appointmentPage = new PageImpl<>(List.of(appointment));
        when(appointmentRepository.searchAppointments(
                any(), any(), any(), any(), any(), any()))
                .thenReturn(appointmentPage);
        when(appointmentMapper.toDto(any())).thenReturn(responseDto);

        // When
        Page<AppointmentResponseDto> result = appointmentService.searchAppointments(
                1L, 2L, "PENDING", LocalDate.now(), LocalDate.now().plusDays(7), pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void testSearchAppointments_WithNullFilters() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Appointment> appointmentPage = new PageImpl<>(List.of(appointment));
        when(appointmentRepository.searchAppointments(
                isNull(), isNull(), isNull(), isNull(), isNull(), any()))
                .thenReturn(appointmentPage);
        when(appointmentMapper.toDto(any())).thenReturn(responseDto);

        // When
        Page<AppointmentResponseDto> result = appointmentService.searchAppointments(
                null, null, null, null, null, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void testDeleteAppointment_Success() {
        // Given
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any())).thenReturn(appointment);

        // When
        appointmentService.deleteAppointment(1L);

        // Then
        verify(appointmentRepository).save(any());
        verify(eventPublisher).publishAppointmentCancelled(any());
    }

    @Test
    void testDeleteAppointment_NotFound() {
        // Given
        when(appointmentRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> appointmentService.deleteAppointment(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
