package com.clinicbooking.appointmentservice.repository;

import com.clinicbooking.appointmentservice.entity.Appointment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Testcontainers(disabledWithoutDocker = true)
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class AppointmentRepositoryOverlapConstraintPostgresTest {

    private static final LocalDate APPOINTMENT_DATE = LocalDate.of(2099, 2, 10);

    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", postgres::getDriverClassName);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.PostgreSQLDialect");
        registry.add("spring.flyway.enabled", () -> "false");
        registry.add("spring.cache.type", () -> "none");
        registry.add("spring.cloud.discovery.enabled", () -> "false");
        registry.add("eureka.client.enabled", () -> "false");
    }

    @Autowired
    AppointmentRepository appointmentRepository;

    @Autowired
    JdbcTemplate jdbcTemplate;

    @BeforeEach
    void addOverlapConstraint() {
        jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS btree_gist");
        jdbcTemplate.execute("""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = 'appointments_no_active_overlap'
                    ) THEN
                        ALTER TABLE appointments
                        ADD CONSTRAINT appointments_no_active_overlap
                        EXCLUDE USING gist (
                            doctor_id WITH =,
                            tsrange(
                                appointment_date + appointment_time,
                                appointment_date + appointment_time + ((COALESCE(duration_minutes, 30)::text || ' minutes')::interval),
                                '[)'
                            ) WITH &&
                        )
                        WHERE (status IN ('PENDING', 'CONFIRMED'));
                    END IF;
                END $$;
                """);
        appointmentRepository.deleteAll();
    }

    @Test
    void activeAppointments_withOverlappingRangesForSameDoctor_shouldBeRejectedByDatabase() {
        appointmentRepository.saveAndFlush(appointment(1L, 900L, LocalTime.of(9, 0), 30,
                Appointment.AppointmentStatus.PENDING));

        assertThatThrownBy(() -> appointmentRepository.saveAndFlush(appointment(2L, 900L, LocalTime.of(9, 15), 30,
                Appointment.AppointmentStatus.PENDING)))
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("appointments_no_active_overlap");
    }

    @Test
    void activeAppointments_withBackToBackRangesForSameDoctor_shouldBeAllowed() {
        appointmentRepository.saveAndFlush(appointment(1L, 901L, LocalTime.of(9, 0), 30,
                Appointment.AppointmentStatus.PENDING));
        appointmentRepository.saveAndFlush(appointment(2L, 901L, LocalTime.of(9, 30), 30,
                Appointment.AppointmentStatus.PENDING));

        assertThat(appointmentRepository.findByDoctorIdAndAppointmentDate(901L, APPOINTMENT_DATE)).hasSize(2);
    }

    @Test
    void cancelledAppointments_shouldNotBlockTheSameRange() {
        appointmentRepository.saveAndFlush(appointment(1L, 902L, LocalTime.of(10, 0), 30,
                Appointment.AppointmentStatus.CANCELLED));
        appointmentRepository.saveAndFlush(appointment(2L, 902L, LocalTime.of(10, 0), 30,
                Appointment.AppointmentStatus.PENDING));

        assertThat(appointmentRepository.findByDoctorIdAndAppointmentDate(902L, APPOINTMENT_DATE)).hasSize(2);
    }

    private Appointment appointment(Long patientId, Long doctorId, LocalTime time, int durationMinutes,
                                    Appointment.AppointmentStatus status) {
        return Appointment.builder()
                .patientId(patientId)
                .doctorId(doctorId)
                .patientName("Patient " + patientId)
                .doctorName("Doctor " + doctorId)
                .appointmentDate(APPOINTMENT_DATE)
                .appointmentTime(time)
                .durationMinutes(durationMinutes)
                .type(Appointment.AppointmentType.IN_PERSON)
                .status(status)
                .priority(Appointment.Priority.NORMAL)
                .build();
    }
}
