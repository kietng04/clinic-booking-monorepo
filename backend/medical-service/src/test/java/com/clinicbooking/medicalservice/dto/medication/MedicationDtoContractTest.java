package com.clinicbooking.medicalservice.dto.medication;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class MedicationDtoContractTest {

    @Test
    void createDtoSupportsBuilderAndMutators() {
        MedicationCreateDto dto = MedicationCreateDto.builder()
                .name("Paracetamol")
                .genericName("Acetaminophen")
                .category("Pain Relief")
                .unit("tablet")
                .defaultDosage("500mg")
                .defaultFrequency("Twice daily")
                .defaultDuration("5 days")
                .instructions("After meals")
                .build();

        MedicationCreateDto copy = new MedicationCreateDto();
        copy.setName("Paracetamol");
        copy.setGenericName("Acetaminophen");
        copy.setCategory("Pain Relief");
        copy.setUnit("tablet");
        copy.setDefaultDosage("500mg");
        copy.setDefaultFrequency("Twice daily");
        copy.setDefaultDuration("5 days");
        copy.setInstructions("After meals");

        assertThat(copy).isEqualTo(dto);
        assertThat(copy.hashCode()).isEqualTo(dto.hashCode());
        assertThat(dto.toString()).contains("Paracetamol", "500mg");
    }

    @Test
    void responseDtoSupportsAllArgsConstructorAndEquality() {
        LocalDateTime timestamp = LocalDateTime.of(2026, 4, 19, 9, 0);
        MedicationResponseDto dto = new MedicationResponseDto(
                1L, "Cetirizine", "Cetirizine", "Allergy", "tablet",
                "10mg", "Once daily", "7 days", "Before sleep", true,
                timestamp, timestamp
        );
        MedicationResponseDto copy = MedicationResponseDto.builder()
                .id(1L)
                .name("Cetirizine")
                .genericName("Cetirizine")
                .category("Allergy")
                .unit("tablet")
                .defaultDosage("10mg")
                .defaultFrequency("Once daily")
                .defaultDuration("7 days")
                .instructions("Before sleep")
                .isActive(true)
                .createdAt(timestamp)
                .updatedAt(timestamp)
                .build();

        assertThat(copy).isEqualTo(dto);
        assertThat(copy.hashCode()).isEqualTo(dto.hashCode());
        assertThat(dto.toString()).contains("Cetirizine", "Allergy");
    }

    @Test
    void updateDtoSupportsBuilderAndMutators() {
        MedicationUpdateDto dto = MedicationUpdateDto.builder()
                .name("Ibuprofen")
                .genericName("Ibuprofen")
                .category("Pain Relief")
                .unit("capsule")
                .defaultDosage("200mg")
                .defaultFrequency("Three times daily")
                .defaultDuration("3 days")
                .instructions("After meals")
                .isActive(false)
                .build();

        MedicationUpdateDto copy = new MedicationUpdateDto();
        copy.setName("Ibuprofen");
        copy.setGenericName("Ibuprofen");
        copy.setCategory("Pain Relief");
        copy.setUnit("capsule");
        copy.setDefaultDosage("200mg");
        copy.setDefaultFrequency("Three times daily");
        copy.setDefaultDuration("3 days");
        copy.setInstructions("After meals");
        copy.setIsActive(false);

        assertThat(copy).isEqualTo(dto);
        assertThat(copy.hashCode()).isEqualTo(dto.hashCode());
        assertThat(dto.toString()).contains("Ibuprofen", "false");
    }
}
