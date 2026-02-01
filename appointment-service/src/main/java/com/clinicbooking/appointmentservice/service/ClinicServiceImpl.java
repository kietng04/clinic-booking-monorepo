package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.ClinicCreateDto;
import com.clinicbooking.appointmentservice.dto.ClinicResponseDto;
import com.clinicbooking.appointmentservice.entity.Clinic;
import com.clinicbooking.appointmentservice.exception.ResourceNotFoundException;
import com.clinicbooking.appointmentservice.repository.ClinicRepository;
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
public class ClinicServiceImpl implements ClinicService {

    private final ClinicRepository clinicRepository;

    @Override
    @Transactional
    public ClinicResponseDto createClinic(ClinicCreateDto dto) {
        Clinic clinic = Clinic.builder()
                .name(dto.getName())
                .address(dto.getAddress())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .description(dto.getDescription())
                .openingHours(dto.getOpeningHours())
                .isActive(true)
                .build();
        clinic = clinicRepository.save(clinic);
        log.info("Created clinic: {}", clinic.getName());
        return mapToResponse(clinic);
    }

    @Override
    @Transactional(readOnly = true)
    public ClinicResponseDto getClinicById(Long id) {
        Clinic clinic = clinicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng khám không tìm thấy"));
        return mapToResponse(clinic);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClinicResponseDto> getAllClinics() {
        return clinicRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ClinicResponseDto> searchClinics(String name, Pageable pageable) {
        return clinicRepository.findByNameContainingIgnoreCase(name, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public ClinicResponseDto updateClinic(Long id, ClinicCreateDto dto) {
        Clinic clinic = clinicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng khám không tìm thấy"));
        clinic.setName(dto.getName());
        clinic.setAddress(dto.getAddress());
        clinic.setPhone(dto.getPhone());
        clinic.setEmail(dto.getEmail());
        clinic.setDescription(dto.getDescription());
        clinic.setOpeningHours(dto.getOpeningHours());
        return mapToResponse(clinicRepository.save(clinic));
    }

    @Override
    @Transactional
    public void deleteClinic(Long id) {
        clinicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng khám không tìm thấy"));
        clinicRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void toggleClinicStatus(Long id) {
        Clinic clinic = clinicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng khám không tìm thấy"));
        clinic.setIsActive(!clinic.getIsActive());
        clinicRepository.save(clinic);
        log.info("Toggled clinic {} status to {}", id, clinic.getIsActive());
    }

    private ClinicResponseDto mapToResponse(Clinic clinic) {
        return ClinicResponseDto.builder()
                .id(clinic.getId())
                .name(clinic.getName())
                .address(clinic.getAddress())
                .phone(clinic.getPhone())
                .email(clinic.getEmail())
                .description(clinic.getDescription())
                .openingHours(clinic.getOpeningHours())
                .isActive(clinic.getIsActive())
                .createdAt(clinic.getCreatedAt())
                .updatedAt(clinic.getUpdatedAt())
                .build();
    }
}
