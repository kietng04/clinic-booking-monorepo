package com.clinicbooking.appointmentservice.repository;

import com.clinicbooking.appointmentservice.entity.Appointment;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers(disabledWithoutDocker = true)
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class AppointmentRepositorySearchAppointmentsPostgresTest {

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

        // Keep schema management in Hibernate for this test.
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.PostgreSQLDialect");
        registry.add("spring.flyway.enabled", () -> "false");
        registry.add("spring.cache.type", () -> "none");
        registry.add("spring.cloud.discovery.enabled", () -> "false");
        registry.add("eureka.client.enabled", () -> "false");
    }

    @Autowired
    AppointmentRepository appointmentRepository;

    @Test
    void searchAppointments_withFromDateAndToDate_shouldNotErrorOnPostgres() {
        // Arrange: one appointment on the requested date for a given doctor.
        appointmentRepository.save(Appointment.builder()
                .patientId(953L)
                .doctorId(801L)
                .appointmentDate(LocalDate.of(2026, 2, 12))
                .appointmentTime(LocalTime.of(8, 0))
                .status(Appointment.AppointmentStatus.PENDING)
                .type(Appointment.AppointmentType.IN_PERSON)
                .durationMinutes(30)
                .build());

        // Act
        var page = appointmentRepository.searchAppointments(
                null,
                801L,
                null,
                LocalDate.of(2026, 2, 12),
                LocalDate.of(2026, 2, 12),
                PageRequest.of(0, 5)
        );

        // Assert
        assertThat(page.getTotalElements()).isGreaterThanOrEqualTo(1);
    }
}
