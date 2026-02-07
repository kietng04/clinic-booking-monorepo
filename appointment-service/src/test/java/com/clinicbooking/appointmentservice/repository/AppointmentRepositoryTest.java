package com.clinicbooking.appointmentservice.repository;

import com.clinicbooking.appointmentservice.entity.Appointment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class AppointmentRepositoryTest {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Appointment appointment1;
    private Appointment appointment2;
    private Appointment appointment3;

    @BeforeEach
    void setUp() {
        // Clear all appointments
        appointmentRepository.deleteAll();

        // Create test appointments
        appointment1 = Appointment.builder()
                .patientId(1L)
                .patientName("Patient One")
                .patientPhone("0123456789")
                .doctorId(1L)
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

        appointment2 = Appointment.builder()
                .patientId(2L)
                .patientName("Patient Two")
                .patientPhone("0987654321")
                .doctorId(1L)
                .doctorName("Dr. Smith")
                .appointmentDate(LocalDate.now().plusDays(1))
                .appointmentTime(LocalTime.of(10, 0))
                .durationMinutes(30)
                .type(Appointment.AppointmentType.ONLINE)
                .status(Appointment.AppointmentStatus.CONFIRMED)
                .priority(Appointment.Priority.URGENT)
                .symptoms("Fever")
                .serviceFee(BigDecimal.valueOf(150000))
                .build();

        appointment3 = Appointment.builder()
                .patientId(1L)
                .patientName("Patient One")
                .patientPhone("0123456789")
                .doctorId(2L)
                .doctorName("Dr. Johnson")
                .appointmentDate(LocalDate.now().plusDays(2))
                .appointmentTime(LocalTime.of(14, 0))
                .durationMinutes(30)
                .type(Appointment.AppointmentType.IN_PERSON)
                .status(Appointment.AppointmentStatus.COMPLETED)
                .priority(Appointment.Priority.NORMAL)
                .symptoms("Checkup")
                .serviceFee(BigDecimal.valueOf(200000))
                .build();

        appointment1 = entityManager.persistAndFlush(appointment1);
        appointment2 = entityManager.persistAndFlush(appointment2);
        appointment3 = entityManager.persistAndFlush(appointment3);
    }

    @Test
    void testFindByPatientId() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Appointment> result = appointmentRepository.findByPatientId(1L, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).extracting(Appointment::getPatientId)
                .containsOnly(1L);
    }

    @Test
    void testFindByDoctorId() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Appointment> result = appointmentRepository.findByDoctorId(1L, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).extracting(Appointment::getDoctorId)
                .containsOnly(1L);
    }

    @Test
    void testFindByStatus() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Appointment> result = appointmentRepository.findByStatus(
                Appointment.AppointmentStatus.PENDING, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getStatus())
                .isEqualTo(Appointment.AppointmentStatus.PENDING);
    }

    @Test
    void testFindByPatientIdAndStatus() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Appointment> result = appointmentRepository.findByPatientIdAndStatus(
                1L, Appointment.AppointmentStatus.PENDING, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getPatientId()).isEqualTo(1L);
        assertThat(result.getContent().get(0).getStatus())
                .isEqualTo(Appointment.AppointmentStatus.PENDING);
    }

    @Test
    void testFindByDoctorIdAndStatus() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Appointment> result = appointmentRepository.findByDoctorIdAndStatus(
                1L, Appointment.AppointmentStatus.CONFIRMED, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getDoctorId()).isEqualTo(1L);
        assertThat(result.getContent().get(0).getStatus())
                .isEqualTo(Appointment.AppointmentStatus.CONFIRMED);
    }

    @Test
    void testFindByAppointmentDate() {
        // Given
        LocalDate date = LocalDate.now().plusDays(1);

        // When
        List<Appointment> result = appointmentRepository.findByAppointmentDate(date);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).extracting(Appointment::getAppointmentDate)
                .containsOnly(date);
    }

    @Test
    void testFindByDoctorIdAndAppointmentDate() {
        // Given
        LocalDate date = LocalDate.now().plusDays(1);

        // When
        List<Appointment> result = appointmentRepository
                .findByDoctorIdAndAppointmentDate(1L, date);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).extracting(Appointment::getDoctorId).containsOnly(1L);
        assertThat(result).extracting(Appointment::getAppointmentDate).containsOnly(date);
    }

    @Test
    void testExistsByDoctorIdAndDateAndTime_Exists() {
        // Given
        LocalDate date = LocalDate.now().plusDays(1);
        LocalTime time = LocalTime.of(9, 0);

        // When
        boolean exists = appointmentRepository.existsByDoctorIdAndDateAndTime(1L, date, time);

        // Then
        assertThat(exists).isTrue();
    }

    @Test
    void testExistsByDoctorIdAndDateAndTime_NotExists() {
        // Given
        LocalDate date = LocalDate.now().plusDays(1);
        LocalTime time = LocalTime.of(11, 0);

        // When
        boolean exists = appointmentRepository.existsByDoctorIdAndDateAndTime(1L, date, time);

        // Then
        assertThat(exists).isFalse();
    }

    // Note: Native query tests are skipped in H2 due to SQL syntax differences
    // The native query uses PostgreSQL-specific interval syntax
    // In production, PostgreSQL is used and the native query works correctly

    @Test
    void testSearchAppointments_WithAllFilters() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        LocalDate fromDate = LocalDate.now();
        LocalDate toDate = LocalDate.now().plusDays(3);

        // When
        Page<Appointment> result = appointmentRepository.searchAppointments(
                1L, 1L, Appointment.AppointmentStatus.PENDING, fromDate, toDate, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getPatientId()).isEqualTo(1L);
        assertThat(result.getContent().get(0).getDoctorId()).isEqualTo(1L);
        assertThat(result.getContent().get(0).getStatus())
                .isEqualTo(Appointment.AppointmentStatus.PENDING);
    }

    @Test
    void testSearchAppointments_WithNullFilters() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Appointment> result = appointmentRepository.searchAppointments(
                null, null, null, null, null, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(3);
    }

    @Test
    void testCountByStatus() {
        // When
        long count = appointmentRepository.countByStatus(Appointment.AppointmentStatus.PENDING);

        // Then
        assertThat(count).isEqualTo(1);
    }

    @Test
    void testCountByType() {
        // When
        long count = appointmentRepository.countByType(Appointment.AppointmentType.IN_PERSON);

        // Then
        assertThat(count).isEqualTo(2);
    }

    @Test
    void testCountByPriority() {
        // When
        long count = appointmentRepository.countByPriority(Appointment.Priority.URGENT);

        // Then
        assertThat(count).isEqualTo(1);
    }

    @Test
    void testCountUpcomingAppointments() {
        // When
        long count = appointmentRepository.countUpcomingAppointments();

        // Then
        assertThat(count).isEqualTo(2); // PENDING and CONFIRMED appointments in the future
    }

    @Test
    void testGetStatusDistribution() {
        // When
        List<?> result = appointmentRepository.getStatusDistribution();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isNotEmpty();
        assertThat(result).hasSizeGreaterThanOrEqualTo(3); // At least 3 different statuses
    }

    @Test
    void testGetAppointmentTypeBreakdown() {
        // When
        List<?> result = appointmentRepository.getAppointmentTypeBreakdown(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isNotEmpty();
    }

    @Test
    void testGetRecentAppointments() {
        // Given
        Pageable pageable = PageRequest.of(0, 5);

        // When
        List<Appointment> result = appointmentRepository.getRecentAppointments(pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
    }

    @Test
    void testSaveAndFindById() {
        // Given
        Appointment newAppointment = Appointment.builder()
                .patientId(3L)
                .patientName("Patient Three")
                .patientPhone("0111222333")
                .doctorId(3L)
                .doctorName("Dr. Brown")
                .appointmentDate(LocalDate.now().plusDays(5))
                .appointmentTime(LocalTime.of(15, 0))
                .durationMinutes(45)
                .type(Appointment.AppointmentType.IN_PERSON)
                .status(Appointment.AppointmentStatus.PENDING)
                .priority(Appointment.Priority.NORMAL)
                .serviceFee(BigDecimal.valueOf(250000))
                .build();

        // When
        Appointment saved = appointmentRepository.save(newAppointment);
        Appointment found = appointmentRepository.findById(saved.getId()).orElse(null);

        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();
        assertThat(found).isNotNull();
        assertThat(found.getPatientId()).isEqualTo(3L);
        assertThat(found.getDoctorName()).isEqualTo("Dr. Brown");
    }

    @Test
    void testDeleteAppointment() {
        // Given
        Long appointmentId = appointment1.getId();

        // When
        appointmentRepository.deleteById(appointmentId);
        boolean exists = appointmentRepository.existsById(appointmentId);

        // Then
        assertThat(exists).isFalse();
    }
}
