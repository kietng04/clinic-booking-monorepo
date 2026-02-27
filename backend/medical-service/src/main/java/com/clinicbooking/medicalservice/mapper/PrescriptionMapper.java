package com.clinicbooking.medicalservice.mapper;

import com.clinicbooking.medicalservice.dto.prescription.PrescriptionCreateDto;
import com.clinicbooking.medicalservice.dto.prescription.PrescriptionResponseDto;
import com.clinicbooking.medicalservice.dto.prescription.PrescriptionUpdateDto;
import com.clinicbooking.medicalservice.entity.Prescription;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PrescriptionMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "medicalRecord", ignore = true)
    @Mapping(target = "medication", ignore = true)
    @Mapping(target = "doctorName", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Prescription toEntity(PrescriptionCreateDto dto);

    @Mapping(target = "medicalRecordId", source = "medicalRecord.id")
    @Mapping(target = "medicationId", source = "medication.id")
    PrescriptionResponseDto toDto(Prescription entity);

    List<PrescriptionResponseDto> toDtoList(List<Prescription> entities);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "medicalRecord", ignore = true)
    @Mapping(target = "medication", ignore = true)
    @Mapping(target = "doctorId", ignore = true)
    @Mapping(target = "doctorName", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntityFromDto(PrescriptionUpdateDto dto, @MappingTarget Prescription entity);
}
