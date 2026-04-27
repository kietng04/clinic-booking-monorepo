package com.clinicbooking.medicalservice.mapper;

import com.clinicbooking.medicalservice.dto.prescription.PrescriptionCreateDto;
import com.clinicbooking.medicalservice.dto.prescription.PrescriptionResponseDto;
import com.clinicbooking.medicalservice.dto.prescription.PrescriptionUpdateDto;
import com.clinicbooking.medicalservice.entity.MedicalRecord;
import com.clinicbooking.medicalservice.entity.Medication;
import com.clinicbooking.medicalservice.entity.Prescription;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import static org.assertj.core.api.Assertions.assertThat;

class PrescriptionMapperTest {

    private final PrescriptionMapper mapper = Mappers.getMapper(PrescriptionMapper.class);

    @Test
    void toEntityMapsCreateDtoWithoutManagedAssociations() {
        PrescriptionCreateDto dto = PrescriptionCreateDto.builder()
                .doctorId(12L)
                .medicationId(30L)
                .medicationName("Ignored Name")
                .dosage("1 pill")
                .frequency("daily")
                .duration("5 days")
                .instructions("After lunch")
                .notes("Note")
                .build();

        Prescription entity = mapper.toEntity(dto);

        assertThat(entity.getId()).isNull();
        assertThat(entity.getMedicalRecord()).isNull();
        assertThat(entity.getMedication()).isNull();
        assertThat(entity.getDoctorId()).isEqualTo(12L);
        assertThat(entity.getDosage()).isEqualTo("1 pill");
    }

    @Test
    void toDtoMapsNestedIdentifiers() {
        Prescription entity = Prescription.builder()
                .id(3L)
                .medicalRecord(MedicalRecord.builder().id(15L).build())
                .doctorId(12L)
                .doctorName("Doctor")
                .medication(Medication.builder().id(30L).build())
                .medicationName("Ibuprofen")
                .dosage("200mg")
                .build();

        PrescriptionResponseDto dto = mapper.toDto(entity);

        assertThat(dto.getId()).isEqualTo(3L);
        assertThat(dto.getMedicalRecordId()).isEqualTo(15L);
        assertThat(dto.getMedicationId()).isEqualTo(30L);
        assertThat(dto.getMedicationName()).isEqualTo("Ibuprofen");
    }

    @Test
    void updateEntityFromDtoIgnoresDoctorAndAssociations() {
        Prescription entity = Prescription.builder()
                .doctorId(12L)
                .doctorName("Original Doctor")
                .medicalRecord(MedicalRecord.builder().id(15L).build())
                .medication(Medication.builder().id(30L).build())
                .dosage("200mg")
                .notes("Before")
                .build();
        PrescriptionUpdateDto dto = PrescriptionUpdateDto.builder()
                .dosage("400mg")
                .notes("After")
                .build();

        mapper.updateEntityFromDto(dto, entity);

        assertThat(entity.getDoctorId()).isEqualTo(12L);
        assertThat(entity.getDoctorName()).isEqualTo("Original Doctor");
        assertThat(entity.getMedicalRecord().getId()).isEqualTo(15L);
        assertThat(entity.getMedication().getId()).isEqualTo(30L);
        assertThat(entity.getDosage()).isEqualTo("400mg");
        assertThat(entity.getNotes()).isEqualTo("After");
    }
}
