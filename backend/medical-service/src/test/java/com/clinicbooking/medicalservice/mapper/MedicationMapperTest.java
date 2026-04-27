package com.clinicbooking.medicalservice.mapper;

import com.clinicbooking.medicalservice.dto.medication.MedicationCreateDto;
import com.clinicbooking.medicalservice.dto.medication.MedicationResponseDto;
import com.clinicbooking.medicalservice.dto.medication.MedicationUpdateDto;
import com.clinicbooking.medicalservice.entity.Medication;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import static org.assertj.core.api.Assertions.assertThat;

class MedicationMapperTest {

    private final MedicationMapper mapper = Mappers.getMapper(MedicationMapper.class);

    @Test
    void toResponseDtoMapsEntityFields() {
        Medication medication = Medication.builder()
                .id(7L)
                .name("Paracetamol")
                .genericName("Acetaminophen")
                .category("Pain Relief")
                .unit("tablet")
                .defaultDosage("500mg")
                .isActive(true)
                .build();

        MedicationResponseDto dto = mapper.toResponseDto(medication);

        assertThat(dto.getId()).isEqualTo(7L);
        assertThat(dto.getName()).isEqualTo("Paracetamol");
        assertThat(dto.getGenericName()).isEqualTo("Acetaminophen");
        assertThat(dto.getIsActive()).isTrue();
    }

    @Test
    void toEntitySetsDefaultActiveFlag() {
        MedicationCreateDto dto = MedicationCreateDto.builder()
                .name("Cetirizine")
                .genericName("Cetirizine")
                .category("Allergy")
                .unit("tablet")
                .build();

        Medication entity = mapper.toEntity(dto);

        assertThat(entity.getId()).isNull();
        assertThat(entity.getName()).isEqualTo("Cetirizine");
        assertThat(entity.getIsActive()).isTrue();
    }

    @Test
    void updateEntityIgnoresNullValues() {
        Medication medication = Medication.builder()
                .name("Old Name")
                .genericName("Old Generic")
                .category("Pain")
                .isActive(true)
                .build();
        MedicationUpdateDto dto = MedicationUpdateDto.builder()
                .name("New Name")
                .isActive(false)
                .build();

        mapper.updateEntity(medication, dto);

        assertThat(medication.getName()).isEqualTo("New Name");
        assertThat(medication.getGenericName()).isEqualTo("Old Generic");
        assertThat(medication.getIsActive()).isFalse();
    }
}
