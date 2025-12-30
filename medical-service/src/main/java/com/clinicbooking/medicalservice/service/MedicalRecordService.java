package com.clinicbooking.medicalservice.service;

import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordCreateDto;
import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordResponseDto;
import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordUpdateDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MedicalRecordService {

    MedicalRecordResponseDto createMedicalRecord(MedicalRecordCreateDto dto);

    MedicalRecordResponseDto getMedicalRecordById(Long id);

    Page<MedicalRecordResponseDto> getMedicalRecordsByPatientId(Long patientId, Pageable pageable);

    Page<MedicalRecordResponseDto> getMedicalRecordsByDoctorId(Long doctorId, Pageable pageable);

    MedicalRecordResponseDto updateMedicalRecord(Long id, MedicalRecordUpdateDto dto);

    void deleteMedicalRecord(Long id);
}
