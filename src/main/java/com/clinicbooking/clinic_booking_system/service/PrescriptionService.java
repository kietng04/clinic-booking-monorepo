package com.clinicbooking.clinic_booking_system.service;

import com.clinicbooking.clinic_booking_system.dto.common.PageResponse;
import com.clinicbooking.clinic_booking_system.dto.prescription.PrescriptionCreateDto;
import com.clinicbooking.clinic_booking_system.dto.prescription.PrescriptionResponseDto;
import com.clinicbooking.clinic_booking_system.entity.Medication;
import com.clinicbooking.clinic_booking_system.entity.Prescription;
import com.clinicbooking.clinic_booking_system.exception.ResourceNotFoundException;
import com.clinicbooking.clinic_booking_system.mapper.PrescriptionMapper;
import com.clinicbooking.clinic_booking_system.repository.MedicalRecordRepository;
import com.clinicbooking.clinic_booking_system.repository.MedicationRepository;
import com.clinicbooking.clinic_booking_system.repository.PrescriptionRepository;
import com.clinicbooking.clinic_booking_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class PrescriptionService {
    private final PrescriptionRepository prescriptionRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;
    private final MedicationRepository medicationRepository;
    private final PrescriptionMapper mapper;

    public PrescriptionResponseDto create(PrescriptionCreateDto dto) {
        var medicalRecord = medicalRecordRepository.findById(dto.getMedicalRecordId())
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", "id", dto.getMedicalRecordId()));
        var doctor = userRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", dto.getDoctorId()));

        Prescription prescription = Prescription.builder()
                .medicalRecord(medicalRecord)
                .doctor(doctor)
                .notes(dto.getNotes())
                .build();

        Prescription saved = prescriptionRepository.save(prescription);

        if (dto.getMedications() != null) {
            List<Medication> medications = dto.getMedications().stream()
                    .map(m -> Medication.builder()
                            .prescription(saved)
                            .medicationName(m.getMedicationName())
                            .dosage(m.getDosage())
                            .frequency(m.getFrequency())
                            .duration(m.getDuration())
                            .instructions(m.getInstructions())
                            .build())
                    .collect(Collectors.toList());
            medicationRepository.saveAll(medications);
            saved.setMedications(medications);
        }

        return mapper.toResponseDto(saved);
    }

    public PrescriptionResponseDto getById(Long id) {
        return mapper.toResponseDto(findByIdOrThrow(id));
    }

    public PageResponse<PrescriptionResponseDto> getAllByMedicalRecord(Long medicalRecordId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Prescription> page1 = prescriptionRepository.findByMedicalRecordId(medicalRecordId, pageable);
        return buildPageResponse(page1);
    }

    public PageResponse<PrescriptionResponseDto> getAllByDoctor(Long doctorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Prescription> page1 = prescriptionRepository.findByDoctorId(doctorId, pageable);
        return buildPageResponse(page1);
    }

    public void delete(Long id) {
        prescriptionRepository.deleteById(id);
    }

    private Prescription findByIdOrThrow(Long id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", "id", id));
    }

    private PageResponse<PrescriptionResponseDto> buildPageResponse(Page<Prescription> page) {
        List<PrescriptionResponseDto> content = mapper.toResponseDtoList(page.getContent());
        return PageResponse.<PrescriptionResponseDto>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isLast(page.isLast())
                .isFirst(page.isFirst())
                .build();
    }
}
