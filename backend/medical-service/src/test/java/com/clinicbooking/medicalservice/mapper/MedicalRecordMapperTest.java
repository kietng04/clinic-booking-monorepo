package com.clinicbooking.medicalservice.mapper;

import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordCreateDto;
import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordResponseDto;
import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordUpdateDto;
import com.clinicbooking.medicalservice.dto.prescription.PrescriptionCreateDto;
import com.clinicbooking.medicalservice.entity.MedicalRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class MedicalRecordMapperTest {

    private MedicalRecordMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = Mappers.getMapper(MedicalRecordMapper.class);
        ReflectionTestUtils.setField(mapper, "prescriptionMapper", Mappers.getMapper(PrescriptionMapper.class));
    }

    @Test
    void toEntityMapsCreateDtoAndIgnoresManagedFields() {
        MedicalRecordCreateDto dto = MedicalRecordCreateDto.builder()
                .appointmentId(99L)
                .patientId(10L)
                .doctorId(20L)
                .diagnosis("Flu")
                .symptoms("Fever")
                .treatmentPlan("Rest")
                .notes("Initial")
                .followUpDate(LocalDate.of(2026, 4, 25))
                .attachments("xray.pdf")
                .prescriptions(List.of(PrescriptionCreateDto.builder().doctorId(20L).medicationName("Med A").build()))
                .build();

        MedicalRecord entity = mapper.toEntity(dto);

        assertThat(entity.getId()).isNull();
        assertThat(entity.getAppointmentId()).isEqualTo(99L);
        assertThat(entity.getPatientName()).isNull();
        assertThat(entity.getDoctorName()).isNull();
        assertThat(entity.getPrescriptions()).isEmpty();
    }

    @Test
    void toDtoMapsEntityFields() {
        MedicalRecord entity = MedicalRecord.builder()
                .id(5L)
                .appointmentId(90L)
                .patientId(10L)
                .doctorId(20L)
                .patientName("Patient A")
                .doctorName("Doctor B")
                .diagnosis("Migraine")
                .build();

        MedicalRecordResponseDto dto = mapper.toDto(entity);

        assertThat(dto.getId()).isEqualTo(5L);
        assertThat(dto.getAppointmentId()).isEqualTo(90L);
        assertThat(dto.getPatientName()).isEqualTo("Patient A");
        assertThat(dto.getDiagnosis()).isEqualTo("Migraine");
    }

    @Test
    void updateEntityFromDtoOnlyMutatesEditableFields() {
        MedicalRecord entity = MedicalRecord.builder()
                .appointmentId(90L)
                .patientId(10L)
                .doctorId(20L)
                .patientName("Patient A")
                .doctorName("Doctor B")
                .diagnosis("Old Diagnosis")
                .attachments("old.pdf")
                .build();
        MedicalRecordUpdateDto dto = MedicalRecordUpdateDto.builder()
                .diagnosis("New Diagnosis")
                .attachments("new.pdf")
                .build();

        mapper.updateEntityFromDto(dto, entity);

        assertThat(entity.getAppointmentId()).isEqualTo(90L);
        assertThat(entity.getPatientId()).isEqualTo(10L);
        assertThat(entity.getDoctorId()).isEqualTo(20L);
        assertThat(entity.getDiagnosis()).isEqualTo("New Diagnosis");
        assertThat(entity.getAttachments()).isEqualTo("new.pdf");
    }
}
