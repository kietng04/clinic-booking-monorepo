package com.clinicbooking.medicalservice.mapper;

import com.clinicbooking.medicalservice.dto.medication.MedicationCreateDto;
import com.clinicbooking.medicalservice.dto.medication.MedicationResponseDto;
import com.clinicbooking.medicalservice.dto.medication.MedicationUpdateDto;
import com.clinicbooking.medicalservice.entity.Medication;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface MedicationMapper {

    MedicationResponseDto toResponseDto(Medication medication);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Medication toEntity(MedicationCreateDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget Medication medication, MedicationUpdateDto dto);
}
