package com.clinicbooking.medicalservice.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

class DtoDataContractTest {

    @Test
    void appointmentDtoSupportsBuilderAndValueSemantics() {
        AppointmentDto dto = AppointmentDto.builder()
                .id(1L)
                .patientId(2L)
                .doctorId(3L)
                .patientName("Patient A")
                .doctorName("Doctor B")
                .appointmentDate(LocalDate.of(2026, 4, 19))
                .appointmentTime(LocalTime.of(9, 30))
                .status("CONFIRMED")
                .reason("Checkup")
                .build();

        AppointmentDto copy = new AppointmentDto();
        copy.setId(1L);
        copy.setPatientId(2L);
        copy.setDoctorId(3L);
        copy.setPatientName("Patient A");
        copy.setDoctorName("Doctor B");
        copy.setAppointmentDate(LocalDate.of(2026, 4, 19));
        copy.setAppointmentTime(LocalTime.of(9, 30));
        copy.setStatus("CONFIRMED");
        copy.setReason("Checkup");

        assertThat(copy).isEqualTo(dto);
        assertThat(copy.hashCode()).isEqualTo(dto.hashCode());
        assertThat(dto.toString()).contains("Patient A", "CONFIRMED");
    }

    @Test
    void medicalStatisticsDtoSupportsBuilderConstructorsAndAccessors() {
        LocalDateTime generatedAt = LocalDateTime.of(2026, 4, 19, 10, 0);
        MedicalStatisticsDto dto = MedicalStatisticsDto.builder()
                .totalMedicalRecords(10L)
                .totalPrescriptions(15L)
                .medicalRecordsThisMonth(3L)
                .prescriptionsThisMonth(4L)
                .totalMedications(8L)
                .totalHealthMetrics(30L)
                .healthMetricsThisMonth(12L)
                .avgPrescriptionsPerRecord(1.5)
                .uniqueDoctorsCount(5L)
                .uniquePatientsCount(7L)
                .generatedAt(generatedAt)
                .cacheDurationMinutes(5)
                .build();

        MedicalStatisticsDto copy = new MedicalStatisticsDto(
                10L, 15L, 3L, 4L, 8L, 30L, 12L, 1.5, 5L, 7L, generatedAt, 5
        );

        assertThat(copy).isEqualTo(dto);
        assertThat(copy.hashCode()).isEqualTo(dto.hashCode());
        assertThat(dto.getGeneratedAt()).isEqualTo(generatedAt);
        assertThat(dto.toString()).contains("totalMedicalRecords=10", "cacheDurationMinutes=5");
    }

    @Test
    void patientMedicalSummaryDtoSupportsBuilderConstructorsAndAccessors() {
        LocalDateTime generatedAt = LocalDateTime.of(2026, 4, 19, 11, 0);
        PatientMedicalSummaryDto dto = PatientMedicalSummaryDto.builder()
                .patientId(99L)
                .totalMedicalRecords(4L)
                .totalPrescriptions(6L)
                .totalHealthMetrics(8L)
                .generatedAt(generatedAt)
                .cacheDurationMinutes(5)
                .build();

        PatientMedicalSummaryDto copy = new PatientMedicalSummaryDto();
        copy.setPatientId(99L);
        copy.setTotalMedicalRecords(4L);
        copy.setTotalPrescriptions(6L);
        copy.setTotalHealthMetrics(8L);
        copy.setGeneratedAt(generatedAt);
        copy.setCacheDurationMinutes(5);

        assertThat(copy).isEqualTo(dto);
        assertThat(dto.hashCode()).isEqualTo(copy.hashCode());
        assertThat(dto.toString()).contains("patientId=99");
    }

    @Test
    void userDtoSupportsBuilderAndMutators() {
        UserDto dto = UserDto.builder()
                .id(8L)
                .email("doctor@example.com")
                .fullName("Doctor Example")
                .phone("0123456789")
                .address("123 Test St")
                .role("DOCTOR")
                .build();

        UserDto copy = new UserDto();
        copy.setId(8L);
        copy.setEmail("doctor@example.com");
        copy.setFullName("Doctor Example");
        copy.setPhone("0123456789");
        copy.setAddress("123 Test St");
        copy.setRole("DOCTOR");

        assertThat(copy).isEqualTo(dto);
        assertThat(copy.hashCode()).isEqualTo(dto.hashCode());
        assertThat(dto.toString()).contains("Doctor Example", "DOCTOR");
    }
}
