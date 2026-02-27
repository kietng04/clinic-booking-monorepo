package com.clinicbooking.medicalservice.mapper;

import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordCreateDto;
import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordResponseDto;
import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordUpdateDto;
import com.clinicbooking.medicalservice.entity.MedicalRecord;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PrescriptionMapper.class})
public interface MedicalRecordMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "patientName", ignore = true)
    @Mapping(target = "doctorName", ignore = true)
    @Mapping(target = "prescriptions", ignore = true)
    MedicalRecord toEntity(MedicalRecordCreateDto dto);

    MedicalRecordResponseDto toDto(MedicalRecord entity);

    List<MedicalRecordResponseDto> toDtoList(List<MedicalRecord> entities);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "appointmentId", ignore = true)
    @Mapping(target = "patientId", ignore = true)
    @Mapping(target = "doctorId", ignore = true)
    @Mapping(target = "patientName", ignore = true)
    @Mapping(target = "doctorName", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "prescriptions", ignore = true)
    void updateEntityFromDto(MedicalRecordUpdateDto dto, @MappingTarget MedicalRecord entity);
}
