package com.clinicbooking.medicalservice.service;

import com.clinicbooking.medicalservice.dto.medication.MedicationCreateDto;
import com.clinicbooking.medicalservice.dto.medication.MedicationResponseDto;
import com.clinicbooking.medicalservice.dto.medication.MedicationUpdateDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MedicationService {

    MedicationResponseDto createMedication(MedicationCreateDto dto);

    MedicationResponseDto getMedicationById(Long id);

    List<MedicationResponseDto> getAllActiveMedications();

    List<MedicationResponseDto> getMedicationsByCategory(String category);

    List<MedicationResponseDto> searchMedications(String search);

    Page<MedicationResponseDto> getMedicationsWithFilters(
            String search, String category, Boolean isActive, Pageable pageable);

    List<String> getAllCategories();

    MedicationResponseDto updateMedication(Long id, MedicationUpdateDto dto);

    void deleteMedication(Long id);
}
