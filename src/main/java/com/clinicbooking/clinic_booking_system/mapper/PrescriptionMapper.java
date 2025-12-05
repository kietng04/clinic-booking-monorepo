package com.clinicbooking.clinic_booking_system.mapper;

import com.clinicbooking.clinic_booking_system.dto.medication.MedicationResponseDto;
import com.clinicbooking.clinic_booking_system.dto.prescription.PrescriptionCreateDto;
import com.clinicbooking.clinic_booking_system.dto.prescription.PrescriptionResponseDto;
import com.clinicbooking.clinic_booking_system.entity.Medication;
import com.clinicbooking.clinic_booking_system.entity.Prescription;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PrescriptionMapper {

    public Prescription toEntity(PrescriptionCreateDto dto) {
        return Prescription.builder()
                .notes(dto.getNotes())
                .build();
    }

    public PrescriptionResponseDto toResponseDto(Prescription prescription) {
        List<MedicationResponseDto> medications = prescription.getMedications().stream()
                .map(m -> MedicationResponseDto.builder()
                        .id(m.getId())
                        .prescriptionId(m.getPrescription().getId())
                        .medicationName(m.getMedicationName())
                        .dosage(m.getDosage())
                        .frequency(m.getFrequency())
                        .duration(m.getDuration())
                        .instructions(m.getInstructions())
                        .build())
                .collect(Collectors.toList());

        return PrescriptionResponseDto.builder()
                .id(prescription.getId())
                .medicalRecordId(prescription.getMedicalRecord().getId())
                .doctorId(prescription.getDoctor().getId())
                .doctorName(prescription.getDoctor().getFullName())
                .notes(prescription.getNotes())
                .medications(medications)
                .createdAt(prescription.getCreatedAt())
                .build();
    }

    public List<PrescriptionResponseDto> toResponseDtoList(List<Prescription> prescriptions) {
        return prescriptions.stream().map(this::toResponseDto).collect(Collectors.toList());
    }
}
