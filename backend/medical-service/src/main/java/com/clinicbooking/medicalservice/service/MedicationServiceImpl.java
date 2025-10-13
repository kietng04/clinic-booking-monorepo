package com.clinicbooking.medicalservice.service;

import com.clinicbooking.medicalservice.dto.medication.MedicationCreateDto;
import com.clinicbooking.medicalservice.dto.medication.MedicationResponseDto;
import com.clinicbooking.medicalservice.dto.medication.MedicationUpdateDto;
import com.clinicbooking.medicalservice.entity.Medication;
import com.clinicbooking.medicalservice.exception.ResourceNotFoundException;
import com.clinicbooking.medicalservice.exception.ValidationException;
import com.clinicbooking.medicalservice.mapper.MedicationMapper;
import com.clinicbooking.medicalservice.repository.MedicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MedicationServiceImpl implements MedicationService {

    private final MedicationRepository medicationRepository;
    private final MedicationMapper medicationMapper;

    @Override
    public MedicationResponseDto createMedication(MedicationCreateDto dto) {
        log.info("Creating medication: {}", dto.getName());

        // Check if medication name already exists
        if (medicationRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new ValidationException("Thuốc với tên '" + dto.getName() + "' đã tồn tại");
        }

        Medication medication = medicationMapper.toEntity(dto);

        // Set default unit if not provided
        if (medication.getUnit() == null || medication.getUnit().isBlank()) {
            medication.setUnit("viên");
        }

        medication = medicationRepository.save(medication);
        log.info("Created medication with id: {}", medication.getId());

        return medicationMapper.toResponseDto(medication);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicationResponseDto getMedicationById(Long id) {
        Medication medication = findMedicationById(id);
        return medicationMapper.toResponseDto(medication);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicationResponseDto> getAllActiveMedications() {
        return medicationRepository.findByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(medicationMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicationResponseDto> getMedicationsByCategory(String category) {
        return medicationRepository.findByCategoryAndIsActiveTrueOrderByNameAsc(category)
                .stream()
                .map(medicationMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicationResponseDto> searchMedications(String search) {
        if (search == null || search.isBlank()) {
            return getAllActiveMedications();
        }
        return medicationRepository.searchByNameOrGenericName(search)
                .stream()
                .map(medicationMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MedicationResponseDto> getMedicationsWithFilters(
            String search, String category, Boolean isActive, Pageable pageable) {
        return medicationRepository.findWithFilters(search, category, isActive, pageable)
                .map(medicationMapper::toResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        return medicationRepository.findDistinctCategories();
    }

    @Override
    public MedicationResponseDto updateMedication(Long id, MedicationUpdateDto dto) {
        log.info("Updating medication with id: {}", id);

        Medication medication = findMedicationById(id);

        // Check if new name conflicts with existing
        if (dto.getName() != null && !dto.getName().equalsIgnoreCase(medication.getName())) {
            if (medicationRepository.existsByNameIgnoreCase(dto.getName())) {
                throw new ValidationException("Thuốc với tên '" + dto.getName() + "' đã tồn tại");
            }
        }

        medicationMapper.updateEntity(medication, dto);
        medication = medicationRepository.save(medication);

        log.info("Updated medication with id: {}", id);
        return medicationMapper.toResponseDto(medication);
    }

    @Override
    public void deleteMedication(Long id) {
        log.info("Deleting medication with id: {}", id);

        Medication medication = findMedicationById(id);

        // Soft delete - just set isActive to false
        medication.setIsActive(false);
        medicationRepository.save(medication);

        log.info("Soft deleted medication with id: {}", id);
    }

    private Medication findMedicationById(Long id) {
        return medicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thuốc với id: " + id));
    }
}
