package com.clinicbooking.medicalservice.event;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

class EventDataContractTest {

    @Test
    void appointmentEventSupportsBuilderAndAccessors() {
        AppointmentEvent event = AppointmentEvent.builder()
                .appointmentId(1L)
                .patientId(2L)
                .doctorId(3L)
                .patientName("Patient A")
                .doctorName("Doctor B")
                .patientPhone("0909")
                .appointmentDate(LocalDate.of(2026, 4, 20))
                .appointmentTime(LocalTime.of(14, 0))
                .status("COMPLETED")
                .reason("Follow-up")
                .notes("Bring report")
                .createdAt(LocalDateTime.of(2026, 4, 19, 10, 0))
                .updatedAt(LocalDateTime.of(2026, 4, 19, 11, 0))
                .eventType("UPDATED")
                .build();

        AppointmentEvent copy = new AppointmentEvent();
        copy.setAppointmentId(1L);
        copy.setPatientId(2L);
        copy.setDoctorId(3L);
        copy.setPatientName("Patient A");
        copy.setDoctorName("Doctor B");
        copy.setPatientPhone("0909");
        copy.setAppointmentDate(LocalDate.of(2026, 4, 20));
        copy.setAppointmentTime(LocalTime.of(14, 0));
        copy.setStatus("COMPLETED");
        copy.setReason("Follow-up");
        copy.setNotes("Bring report");
        copy.setCreatedAt(LocalDateTime.of(2026, 4, 19, 10, 0));
        copy.setUpdatedAt(LocalDateTime.of(2026, 4, 19, 11, 0));
        copy.setEventType("UPDATED");

        assertThat(copy).isEqualTo(event);
        assertThat(copy.hashCode()).isEqualTo(event.hashCode());
        assertThat(event.toString()).contains("COMPLETED", "UPDATED");
    }

    @Test
    void userEventSupportsBuilderAndAccessors() {
        UserEvent event = UserEvent.builder()
                .userId(10L)
                .email("patient@example.com")
                .fullName("Patient One")
                .phone("0908")
                .address("456 Example Rd")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .gender("FEMALE")
                .role("PATIENT")
                .createdAt(LocalDateTime.of(2026, 4, 19, 9, 0))
                .updatedAt(LocalDateTime.of(2026, 4, 19, 9, 30))
                .eventType("DELETED")
                .build();

        UserEvent copy = new UserEvent(
                10L,
                "patient@example.com",
                "Patient One",
                "0908",
                "456 Example Rd",
                LocalDate.of(1990, 1, 1),
                "FEMALE",
                "PATIENT",
                LocalDateTime.of(2026, 4, 19, 9, 0),
                LocalDateTime.of(2026, 4, 19, 9, 30),
                "DELETED"
        );

        assertThat(copy).isEqualTo(event);
        assertThat(copy.hashCode()).isEqualTo(event.hashCode());
        assertThat(event.toString()).contains("Patient One", "DELETED");
    }

    @Test
    void medicalRecordEventSupportsBuilderAndAccessors() {
        MedicalRecordEvent event = MedicalRecordEvent.builder()
                .medicalRecordId(50L)
                .appointmentId(60L)
                .patientId(70L)
                .doctorId(80L)
                .patientName("Patient A")
                .doctorName("Doctor B")
                .diagnosis("Migraine")
                .symptoms("Headache")
                .treatmentPlan("Rest")
                .followUpDate(LocalDate.of(2026, 5, 1))
                .createdAt(LocalDateTime.of(2026, 4, 18, 10, 0))
                .updatedAt(LocalDateTime.of(2026, 4, 19, 10, 0))
                .eventType("CREATED")
                .build();

        MedicalRecordEvent copy = new MedicalRecordEvent();
        copy.setMedicalRecordId(50L);
        copy.setAppointmentId(60L);
        copy.setPatientId(70L);
        copy.setDoctorId(80L);
        copy.setPatientName("Patient A");
        copy.setDoctorName("Doctor B");
        copy.setDiagnosis("Migraine");
        copy.setSymptoms("Headache");
        copy.setTreatmentPlan("Rest");
        copy.setFollowUpDate(LocalDate.of(2026, 5, 1));
        copy.setCreatedAt(LocalDateTime.of(2026, 4, 18, 10, 0));
        copy.setUpdatedAt(LocalDateTime.of(2026, 4, 19, 10, 0));
        copy.setEventType("CREATED");

        assertThat(copy).isEqualTo(event);
        assertThat(copy.hashCode()).isEqualTo(event.hashCode());
        assertThat(event.toString()).contains("Migraine", "CREATED");
    }
}
