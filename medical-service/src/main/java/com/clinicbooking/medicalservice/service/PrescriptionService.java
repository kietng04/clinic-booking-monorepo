package com.clinicbooking.medicalservice.service;

import com.clinicbooking.medicalservice.dto.prescription.PrescriptionCreateDto;
import com.clinicbooking.medicalservice.dto.prescription.PrescriptionResponseDto;
import com.clinicbooking.medicalservice.dto.prescription.PrescriptionUpdateDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PrescriptionService {

    PrescriptionResponseDto addPrescription(Long medicalRecordId, PrescriptionCreateDto dto);

    PrescriptionResponseDto getPrescriptionById(Long id);

    Page<PrescriptionResponseDto> getPrescriptionsByMedicalRecordId(Long medicalRecordId, Pageable pageable);

    PrescriptionResponseDto updatePrescription(Long id, PrescriptionUpdateDto dto);

    void deletePrescription(Long id);
}
