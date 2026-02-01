package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.*;
import com.clinicbooking.appointmentservice.entity.MedicalService;
import com.clinicbooking.appointmentservice.entity.ServicePrice;
import com.clinicbooking.appointmentservice.exception.ResourceNotFoundException;
import com.clinicbooking.appointmentservice.repository.ClinicRepository;
import com.clinicbooking.appointmentservice.repository.MedicalServiceRepository;
import com.clinicbooking.appointmentservice.repository.ServicePriceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicalServiceServiceImpl implements MedicalServiceService {

    private final MedicalServiceRepository medicalServiceRepository;
    private final ServicePriceRepository servicePriceRepository;
    private final ClinicRepository clinicRepository;

    @Override
    @Transactional
    public MedicalServiceResponseDto createService(MedicalServiceCreateDto dto) {
        clinicRepository.findById(dto.getClinicId())
                .orElseThrow(() -> new ResourceNotFoundException("Phòng khám không tìm thấy"));
        MedicalService service = MedicalService.builder()
                .clinicId(dto.getClinicId())
                .name(dto.getName())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .durationMinutes(dto.getDurationMinutes())
                .isActive(true)
                .build();
        service = medicalServiceRepository.save(service);
        log.info("Created medical service: {}", service.getName());
        return mapToResponse(service);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicalServiceResponseDto getServiceById(Long id) {
        MedicalService service = medicalServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dịch vụ không tìm thấy"));
        return mapToResponse(service);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalServiceResponseDto> getServicesByClinic(Long clinicId) {
        return medicalServiceRepository.findByClinicIdAndIsActiveTrue(clinicId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MedicalServiceResponseDto updateService(Long id, MedicalServiceCreateDto dto) {
        MedicalService service = medicalServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dịch vụ không tìm thấy"));
        service.setName(dto.getName());
        service.setDescription(dto.getDescription());
        service.setCategory(dto.getCategory());
        service.setDurationMinutes(dto.getDurationMinutes());
        return mapToResponse(medicalServiceRepository.save(service));
    }

    @Override
    @Transactional
    public void deleteService(Long id) {
        medicalServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dịch vụ không tìm thấy"));
        medicalServiceRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void toggleServiceStatus(Long id) {
        MedicalService service = medicalServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dịch vụ không tìm thấy"));
        service.setIsActive(!service.getIsActive());
        medicalServiceRepository.save(service);
    }

    @Override
    @Transactional
    public ServicePriceResponseDto addPrice(ServicePriceCreateDto dto) {
        medicalServiceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Dịch vụ không tìm thấy"));
        ServicePrice price = ServicePrice.builder()
                .serviceId(dto.getServiceId())
                .doctorId(dto.getDoctorId())
                .price(dto.getPrice())
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "VND")
                .effectiveFrom(dto.getEffectiveFrom())
                .effectiveTo(dto.getEffectiveTo())
                .build();
        price = servicePriceRepository.save(price);
        return mapPriceToResponse(price);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServicePriceResponseDto> getPrices(Long serviceId) {
        return servicePriceRepository.findByServiceId(serviceId).stream()
                .map(this::mapPriceToResponse)
                .collect(Collectors.toList());
    }

    private MedicalServiceResponseDto mapToResponse(MedicalService service) {
        ServicePrice currentPrice = servicePriceRepository
                .findCurrentPrice(service.getId(), 0L, LocalDate.now())
                .orElse(null);
        return MedicalServiceResponseDto.builder()
                .id(service.getId())
                .clinicId(service.getClinicId())
                .name(service.getName())
                .description(service.getDescription())
                .category(service.getCategory())
                .durationMinutes(service.getDurationMinutes())
                .isActive(service.getIsActive())
                .currentPrice(currentPrice != null ? currentPrice.getPrice() : null)
                .createdAt(service.getCreatedAt())
                .updatedAt(service.getUpdatedAt())
                .build();
    }

    private ServicePriceResponseDto mapPriceToResponse(ServicePrice price) {
        return ServicePriceResponseDto.builder()
                .id(price.getId())
                .serviceId(price.getServiceId())
                .doctorId(price.getDoctorId())
                .price(price.getPrice())
                .currency(price.getCurrency())
                .effectiveFrom(price.getEffectiveFrom())
                .effectiveTo(price.getEffectiveTo())
                .createdAt(price.getCreatedAt())
                .build();
    }
}
