package com.clinicbooking.medicalservice.dto.prescription;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class PrescriptionDtoContractTest {

    @Test
    void createDtoSupportsBuilderAndMutators() {
        PrescriptionCreateDto dto = PrescriptionCreateDto.builder()
                .doctorId(9L)
                .medicationId(3L)
                .medicationName("Ibuprofen")
                .dosage("200mg")
                .frequency("Twice daily")
                .duration("5 days")
                .instructions("After meals")
                .notes("Observe pain")
                .build();

        PrescriptionCreateDto copy = new PrescriptionCreateDto();
        copy.setDoctorId(9L);
        copy.setMedicationId(3L);
        copy.setMedicationName("Ibuprofen");
        copy.setDosage("200mg");
        copy.setFrequency("Twice daily");
        copy.setDuration("5 days");
        copy.setInstructions("After meals");
        copy.setNotes("Observe pain");

        assertThat(copy).isEqualTo(dto);
        assertThat(copy.hashCode()).isEqualTo(dto.hashCode());
        assertThat(dto.toString()).contains("Ibuprofen", "200mg");
    }

    @Test
    void responseDtoSupportsAllArgsConstructorAndEquality() {
        LocalDateTime createdAt = LocalDateTime.of(2026, 4, 19, 10, 0);
        PrescriptionResponseDto dto = new PrescriptionResponseDto(
                1L, 2L, 3L, "Doctor A", 4L, "Amoxicillin",
                "500mg", "Three times daily", "7 days", "After meals",
                "Take full course", createdAt
        );
        PrescriptionResponseDto copy = PrescriptionResponseDto.builder()
                .id(1L)
                .medicalRecordId(2L)
                .doctorId(3L)
                .doctorName("Doctor A")
                .medicationId(4L)
                .medicationName("Amoxicillin")
                .dosage("500mg")
                .frequency("Three times daily")
                .duration("7 days")
                .instructions("After meals")
                .notes("Take full course")
                .createdAt(createdAt)
                .build();

        assertThat(copy).isEqualTo(dto);
        assertThat(copy.hashCode()).isEqualTo(dto.hashCode());
        assertThat(dto.toString()).contains("Doctor A", "Amoxicillin");
    }

    @Test
    void updateDtoSupportsBuilderAndMutators() {
        PrescriptionUpdateDto dto = PrescriptionUpdateDto.builder()
                .medicationName("Vitamin C")
                .dosage("1 tablet")
                .frequency("Daily")
                .duration("30 days")
                .instructions("Morning")
                .notes("Optional")
                .build();

        PrescriptionUpdateDto copy = new PrescriptionUpdateDto();
        copy.setMedicationName("Vitamin C");
        copy.setDosage("1 tablet");
        copy.setFrequency("Daily");
        copy.setDuration("30 days");
        copy.setInstructions("Morning");
        copy.setNotes("Optional");

        assertThat(copy).isEqualTo(dto);
        assertThat(copy.hashCode()).isEqualTo(dto.hashCode());
        assertThat(dto.toString()).contains("Vitamin C", "30 days");
    }
}
