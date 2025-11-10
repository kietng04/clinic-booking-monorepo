package com.clinicbooking.clinic_booking_system.service;

import com.clinicbooking.clinic_booking_system.dto.appointment.AppointmentCreateDto;
import com.clinicbooking.clinic_booking_system.dto.appointment.AppointmentResponseDto;
import com.clinicbooking.clinic_booking_system.entity.Appointment;
import com.clinicbooking.clinic_booking_system.entity.User;
import com.clinicbooking.clinic_booking_system.exception.BadRequestException;
import com.clinicbooking.clinic_booking_system.exception.ResourceNotFoundException;
import com.clinicbooking.clinic_booking_system.mapper.AppointmentMapper;
import com.clinicbooking.clinic_booking_system.repository.AppointmentRepository;
import com.clinicbooking.clinic_booking_system.repository.FamilyMemberRepository;
import com.clinicbooking.clinic_booking_system.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FamilyMemberRepository familyMemberRepository;

    @Mock
    private AppointmentMapper mapper;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AppointmentService appointmentService;

    private User patient;
    private User doctor;
    private Appointment appointment;
    private AppointmentCreateDto createDto;
    private AppointmentResponseDto responseDto;

    @BeforeEach
    void setUp() {
        patient = User.builder()
                .id(1L)
                .email("patient@example.com")
                .fullName("Patient User")
                .role(User.UserRole.PATIENT)
                .build();

        doctor = User.builder()
                .id(2L)
                .email("doctor@example.com")
                .fullName("Doctor User")
                .role(User.UserRole.DOCTOR)
                .build();

        appointment = Appointment.builder()
                .id(1L)
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(LocalDate.now().plusDays(1))
                .appointmentTime(LocalTime.of(10, 0))
                .status(Appointment.AppointmentStatus.PENDING)
                .build();

        createDto = AppointmentCreateDto.builder()
                .patientId(1L)
                .doctorId(2L)
                .appointmentDate(LocalDate.now().plusDays(1))
                .appointmentTime(LocalTime.of(10, 0))
                .build();

        responseDto = AppointmentResponseDto.builder()
                .id(1L)
                .patientId(1L)
                .doctorId(2L)
                .patientName("Patient User")
                .doctorName("Doctor User")
                .status(Appointment.AppointmentStatus.PENDING)
                .build();
    }

    @Nested
    @DisplayName("Create Appointment Tests")
    class CreateAppointmentTests {

        @Test
        @DisplayName("Should create appointment successfully")
        void shouldCreateAppointmentSuccessfully() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(patient));
            when(userRepository.findById(2L)).thenReturn(Optional.of(doctor));
            when(mapper.toEntity(createDto)).thenReturn(appointment);
            when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);
            when(mapper.toResponseDto(appointment)).thenReturn(responseDto);
            when(notificationService.create(any())).thenReturn(null);

            AppointmentResponseDto result = appointmentService.create(createDto);

            assertThat(result).isNotNull();
            assertThat(result.getPatientId()).isEqualTo(1L);
            assertThat(result.getDoctorId()).isEqualTo(2L);
            verify(appointmentRepository).save(any(Appointment.class));
        }

        @Test
        @DisplayName("Should throw exception when doctor is not a doctor")
        void shouldThrowExceptionWhenNotDoctor() {
            doctor.setRole(User.UserRole.PATIENT);
            when(userRepository.findById(1L)).thenReturn(Optional.of(patient));
            when(userRepository.findById(2L)).thenReturn(Optional.of(doctor));

            assertThatThrownBy(() -> appointmentService.create(createDto))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("không phải là bác sĩ");
        }

        @Test
        @DisplayName("Should throw exception when appointment date is in the past")
        void shouldThrowExceptionWhenDateInPast() {
            createDto.setAppointmentDate(LocalDate.now().minusDays(1));
            when(userRepository.findById(1L)).thenReturn(Optional.of(patient));
            when(userRepository.findById(2L)).thenReturn(Optional.of(doctor));

            assertThatThrownBy(() -> appointmentService.create(createDto))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("phải trong tương lai");
        }
    }

    @Nested
    @DisplayName("Confirm Appointment Tests")
    class ConfirmAppointmentTests {

        @Test
        @DisplayName("Should confirm appointment successfully")
        void shouldConfirmAppointmentSuccessfully() {
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
            when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);
            when(mapper.toResponseDto(appointment)).thenReturn(responseDto);
            when(notificationService.create(any())).thenReturn(null);

            AppointmentResponseDto result = appointmentService.confirm(1L);

            assertThat(result).isNotNull();
            assertThat(appointment.getStatus()).isEqualTo(Appointment.AppointmentStatus.CONFIRMED);
        }

        @Test
        @DisplayName("Should throw exception when appointment already confirmed")
        void shouldThrowExceptionWhenAlreadyConfirmed() {
            appointment.setStatus(Appointment.AppointmentStatus.CONFIRMED);
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

            assertThatThrownBy(() -> appointmentService.confirm(1L))
                    .isInstanceOf(BadRequestException.class);
        }
    }

    @Nested
    @DisplayName("Cancel Appointment Tests")
    class CancelAppointmentTests {

        @Test
        @DisplayName("Should cancel appointment successfully")
        void shouldCancelAppointmentSuccessfully() {
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
            when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);
            when(mapper.toResponseDto(appointment)).thenReturn(responseDto);
            when(notificationService.create(any())).thenReturn(null);

            AppointmentResponseDto result = appointmentService.cancel(1L, "Lý do hủy");

            assertThat(result).isNotNull();
            assertThat(appointment.getStatus()).isEqualTo(Appointment.AppointmentStatus.CANCELLED);
            assertThat(appointment.getCancelReason()).isEqualTo("Lý do hủy");
        }

        @Test
        @DisplayName("Should throw exception when appointment cannot be cancelled")
        void shouldThrowExceptionWhenCannotCancel() {
            appointment.setStatus(Appointment.AppointmentStatus.COMPLETED);
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

            assertThatThrownBy(() -> appointmentService.cancel(1L, "Reason"))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Không thể hủy");
        }
    }

    @Nested
    @DisplayName("Get Appointment Tests")
    class GetAppointmentTests {

        @Test
        @DisplayName("Should get appointment by id successfully")
        void shouldGetAppointmentByIdSuccessfully() {
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
            when(mapper.toResponseDto(appointment)).thenReturn(responseDto);

            AppointmentResponseDto result = appointmentService.getById(1L);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("Should throw exception when appointment not found")
        void shouldThrowExceptionWhenNotFound() {
            when(appointmentRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> appointmentService.getById(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
