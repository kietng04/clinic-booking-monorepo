package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.MedicalServiceCreateDto;
import com.clinicbooking.appointmentservice.dto.MedicalServiceResponseDto;
import com.clinicbooking.appointmentservice.dto.ServicePriceCreateDto;
import com.clinicbooking.appointmentservice.dto.ServicePriceResponseDto;
import com.clinicbooking.appointmentservice.entity.MedicalService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MedicalServiceService {
    MedicalServiceResponseDto createService(MedicalServiceCreateDto dto);

    MedicalServiceResponseDto getServiceById(Long id);

    List<MedicalServiceResponseDto> getServicesByClinic(Long clinicId);

    Page<MedicalServiceResponseDto> getAllServices(String name, String category, Pageable pageable);

    MedicalServiceResponseDto updateService(Long id, MedicalServiceCreateDto dto);

    void deleteService(Long id);

    void toggleServiceStatus(Long id);

    ServicePriceResponseDto addPrice(ServicePriceCreateDto dto);

    List<ServicePriceResponseDto> getPrices(Long serviceId);
}
