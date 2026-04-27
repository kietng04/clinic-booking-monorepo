package com.clinicbooking.medicalservice.dto.medicalrecord;

import com.clinicbooking.medicalservice.dto.prescription.PrescriptionCreateDto;
import com.clinicbooking.medicalservice.dto.prescription.PrescriptionResponseDto;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class MedicalRecordDtoContractTest {

    @Test
    void createDtoSupportsBuilderDefaultsAndMutators() {
        MedicalRecordCreateDto dto = MedicalRecordCreateDto.builder()
                .appointmentId(10L)
                .patientId(20L)
                .doctorId(30L)
                .diagnosis("Flu")
                .symptoms("Fever")
                .treatmentPlan("Rest")
                .notes("Initial visit")
                .followUpDate(LocalDate.of(2026, 4, 25))
                .attachments("lab.pdf")
                .prescriptions(List.of(PrescriptionCreateDto.builder().doctorId(30L).medicationName("Drug A").build()))
                .build();

        MedicalRecordCreateDto copy = new MedicalRecordCreateDto();
        copy.setAppointmentId(10L);
        copy.setPatientId(20L);
        copy.setDoctorId(30L);
        copy.setDiagnosis("Flu");
        copy.setSymptoms("Fever");
        copy.setTreatmentPlan("Rest");
        copy.setNotes("Initial visit");
        copy.setFollowUpDate(LocalDate.of(2026, 4, 25));
        copy.setAttachments("lab.pdf");
        copy.setPrescriptions(List.of(PrescriptionCreateDto.builder().doctorId(30L).medicationName("Drug A").build()));

        assertThat(copy).isEqualTo(dto);
        assertThat(copy.hashCode()).isEqualTo(dto.hashCode());
        assertThat(dto.toString()).contains("Flu", "lab.pdf");
    }

    @Test
    void responseDtoSupportsBuilderDefaultsAndMutators() {
        LocalDateTime timestamp = LocalDateTime.of(2026, 4, 19, 9, 0);
        MedicalRecordResponseDto dto = MedicalRecordResponseDto.builder()
                .id(1L)
                .appointmentId(10L)
                .patientId(20L)
                .doctorId(30L)
                .patientName("Patient A")
                .doctorName("Doctor B")
                .diagnosis("Migraine")
                .symptoms("Headache")
                .treatmentPlan("Rest")
                .notes("Follow-up")
                .followUpDate(LocalDate.of(2026, 4, 30))
                .attachments("scan.png")
                .createdAt(timestamp)
                .updatedAt(timestamp)
                .prescriptions(List.of(PrescriptionResponseDto.builder().id(99L).medicationName("Drug A").build()))
                .build();

        MedicalRecordResponseDto copy = new MedicalRecordResponseDto();
        copy.setId(1L);
        copy.setAppointmentId(10L);
        copy.setPatientId(20L);
        copy.setDoctorId(30L);
        copy.setPatientName("Patient A");
        copy.setDoctorName("Doctor B");
        copy.setDiagnosis("Migraine");
        copy.setSymptoms("Headache");
        copy.setTreatmentPlan("Rest");
        copy.setNotes("Follow-up");
        copy.setFollowUpDate(LocalDate.of(2026, 4, 30));
        copy.setAttachments("scan.png");
        copy.setCreatedAt(timestamp);
        copy.setUpdatedAt(timestamp);
        copy.setPrescriptions(List.of(PrescriptionResponseDto.builder().id(99L).medicationName("Drug A").build()));

        assertThat(copy).isEqualTo(dto);
        assertThat(copy.hashCode()).isEqualTo(dto.hashCode());
        assertThat(dto.toString()).contains("Migraine", "scan.png");
    }

    @Test
    void updateDtoSupportsBuilderAndMutators() {
        MedicalRecordUpdateDto dto = MedicalRecordUpdateDto.builder()
                .diagnosis("Recovered")
                .symptoms("None")
                .treatmentPlan("Observe")
                .notes("Closing note")
                .followUpDate(LocalDate.of(2026, 5, 1))
                .attachments("summary.pdf")
                .build();

        MedicalRecordUpdateDto copy = new MedicalRecordUpdateDto();
        copy.setDiagnosis("Recovered");
        copy.setSymptoms("None");
        copy.setTreatmentPlan("Observe");
        copy.setNotes("Closing note");
        copy.setFollowUpDate(LocalDate.of(2026, 5, 1));
        copy.setAttachments("summary.pdf");

        assertThat(copy).isEqualTo(dto);
        assertThat(copy.hashCode()).isEqualTo(dto.hashCode());
        assertThat(dto.toString()).contains("Recovered", "summary.pdf");
    }
}
