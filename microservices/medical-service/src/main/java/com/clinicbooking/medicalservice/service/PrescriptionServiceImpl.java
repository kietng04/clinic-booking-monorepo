package com.clinicbooking.medicalservice.service;

import com.clinicbooking.medicalservice.client.UserServiceClient;
import com.clinicbooking.medicalservice.dto.UserDto;
import com.clinicbooking.medicalservice.dto.prescription.PrescriptionCreateDto;
import com.clinicbooking.medicalservice.dto.prescription.PrescriptionResponseDto;
import com.clinicbooking.medicalservice.dto.prescription.PrescriptionUpdateDto;
import com.clinicbooking.medicalservice.entity.MedicalRecord;
import com.clinicbooking.medicalservice.entity.Prescription;
import com.clinicbooking.medicalservice.mapper.PrescriptionMapper;
import com.clinicbooking.medicalservice.repository.MedicalRecordRepository;
import com.clinicbooking.medicalservice.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrescriptionServiceImpl implements PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PrescriptionMapper prescriptionMapper;
    private final UserServiceClient userServiceClient;

    @Override
    @Transactional
    public PrescriptionResponseDto addPrescription(Long medicalRecordId, PrescriptionCreateDto dto) {
        log.info("Adding prescription to medical record ID: {}", medicalRecordId);

        // Fetch medical record
        MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ y tế"));

        // Fetch doctor information
        UserDto doctor = userServiceClient.getUserById(dto.getDoctorId());
        if (!"DOCTOR".equals(doctor.getRole())) {
            throw new RuntimeException("Người kê đơn không phải là bác sĩ");
        }

        // Create prescription
        Prescription prescription = prescriptionMapper.toEntity(dto);
        prescription.setDoctorName(doctor.getFullName());
        prescription.setMedicalRecord(medicalRecord);

        prescription = prescriptionRepository.save(prescription);
        log.info("Prescription created with ID: {}", prescription.getId());

        return prescriptionMapper.toDto(prescription);
    }

    @Override
    @Transactional(readOnly = true)
    public PrescriptionResponseDto getPrescriptionById(Long id) {
        log.info("Fetching prescription with ID: {}", id);
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn thuốc"));
        return prescriptionMapper.toDto(prescription);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PrescriptionResponseDto> getPrescriptionsByMedicalRecordId(Long medicalRecordId, Pageable pageable) {
        log.info("Fetching prescriptions for medical record ID: {}", medicalRecordId);
        Page<Prescription> prescriptions = prescriptionRepository.findByMedicalRecordId(medicalRecordId, pageable);
        return prescriptions.map(prescriptionMapper::toDto);
    }

    @Override
    @Transactional
    public PrescriptionResponseDto updatePrescription(Long id, PrescriptionUpdateDto dto) {
        log.info("Updating prescription with ID: {}", id);

        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn thuốc"));

        prescriptionMapper.updateEntityFromDto(dto, prescription);
        prescription = prescriptionRepository.save(prescription);
        log.info("Prescription updated successfully: {}", id);

        return prescriptionMapper.toDto(prescription);
    }

    @Override
    @Transactional
    public void deletePrescription(Long id) {
        log.info("Deleting prescription with ID: {}", id);

        if (!prescriptionRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy đơn thuốc");
        }

        prescriptionRepository.deleteById(id);
        log.info("Prescription deleted with ID: {}", id);
    }
}
