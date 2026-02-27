package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.ClinicCreateDto;
import com.clinicbooking.appointmentservice.dto.ClinicResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ClinicService {
    ClinicResponseDto createClinic(ClinicCreateDto dto);
    ClinicResponseDto getClinicById(Long id);
    List<ClinicResponseDto> getAllClinics();
    Page<ClinicResponseDto> searchClinics(String name, Pageable pageable);
    ClinicResponseDto updateClinic(Long id, ClinicCreateDto dto);
    void deleteClinic(Long id);
    void toggleClinicStatus(Long id);
}
