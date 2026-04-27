package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.MedicalServiceCreateDto;
import com.clinicbooking.appointmentservice.dto.MedicalServiceResponseDto;
import com.clinicbooking.appointmentservice.entity.Clinic;
import com.clinicbooking.appointmentservice.entity.MedicalService;
import com.clinicbooking.appointmentservice.exception.ResourceNotFoundException;
import com.clinicbooking.appointmentservice.repository.MedicalServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedicalServiceServiceTest {

    @Mock
    private MedicalServiceRepository medicalServiceRepository;

    @Mock
    private com.clinicbooking.appointmentservice.repository.ServicePriceRepository servicePriceRepository;

    @Mock
    private com.clinicbooking.appointmentservice.repository.ClinicRepository clinicRepository;

    private MedicalServiceServiceImpl medicalServiceService;

    private MedicalService medicalService;
    private MedicalServiceCreateDto createDto;

    @BeforeEach
    void setUp() {
        medicalServiceService = new MedicalServiceServiceImpl(medicalServiceRepository, servicePriceRepository, clinicRepository);

        medicalService = MedicalService.builder()
                .id(1L)
                .clinicId(1L)
                .name("General Consultation")
                .description("General medical consultation")
                .category(MedicalService.ServiceCategory.GENERAL)
                .durationMinutes(30)
                .isActive(true)
                .build();

        createDto = new MedicalServiceCreateDto();
        createDto.setClinicId(1L);
        createDto.setName("General Consultation");
        createDto.setDescription("General medical consultation");
        createDto.setCategory(MedicalService.ServiceCategory.GENERAL);
        createDto.setDurationMinutes(30);
    }

    @Test
    void testCreateService_Success() {
        // Given
        when(clinicRepository.findById(1L)).thenReturn(Optional.of(Clinic.builder().id(1L).name("Clinic").build()));
        when(medicalServiceRepository.save(any())).thenReturn(medicalService);

        // When
        MedicalServiceResponseDto result = medicalServiceService.createService(createDto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("General Consultation");
        verify(medicalServiceRepository).save(any());
    }

    @Test
    void testGetServiceById_Success() {
        // Given
        when(medicalServiceRepository.findById(1L)).thenReturn(Optional.of(medicalService));

        // When
        MedicalServiceResponseDto result = medicalServiceService.getServiceById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(medicalServiceRepository).findById(1L);
    }

    @Test
    void testGetServiceById_NotFound() {
        // Given
        when(medicalServiceRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> medicalServiceService.getServiceById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Dịch vụ không tìm thấy");
    }

    @Test
    void testGetServicesByClinic() {
        // Given
        when(medicalServiceRepository.findByClinicIdAndIsActiveTrue(1L))
                .thenReturn(List.of(medicalService));

        // When
        List<MedicalServiceResponseDto> result = medicalServiceService.getServicesByClinic(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(medicalServiceRepository).findByClinicIdAndIsActiveTrue(1L);
    }

    @Test
    void testGetAllServices_WithNameOnly() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<MedicalService> servicePage = new PageImpl<>(List.of(medicalService));
        when(medicalServiceRepository.findByNameContainingIgnoreCase("consultation", pageable))
                .thenReturn(servicePage);

        // When
        Page<MedicalServiceResponseDto> result = medicalServiceService
                .getAllServices("consultation", null, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(medicalServiceRepository).findByNameContainingIgnoreCase("consultation", pageable);
    }

    @Test
    void testGetAllServices_WithCategoryOnly() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<MedicalService> servicePage = new PageImpl<>(List.of(medicalService));
        when(medicalServiceRepository.findByNameContainingIgnoreCaseAndCategory(
                "", MedicalService.ServiceCategory.GENERAL, pageable))
                .thenReturn(servicePage);

        // When
        Page<MedicalServiceResponseDto> result = medicalServiceService
                .getAllServices(null, "GENERAL", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(medicalServiceRepository).findByNameContainingIgnoreCaseAndCategory(
                "", MedicalService.ServiceCategory.GENERAL, pageable);
    }

    @Test
    void testGetAllServices_WithNameAndCategory() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<MedicalService> servicePage = new PageImpl<>(List.of(medicalService));
        when(medicalServiceRepository.findByNameContainingIgnoreCaseAndCategory(
                "consultation", MedicalService.ServiceCategory.GENERAL, pageable))
                .thenReturn(servicePage);

        // When
        Page<MedicalServiceResponseDto> result = medicalServiceService
                .getAllServices("consultation", "GENERAL", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(medicalServiceRepository).findByNameContainingIgnoreCaseAndCategory(
                "consultation", MedicalService.ServiceCategory.GENERAL, pageable);
    }

    @Test
    void testGetAllServices_NoFilters() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<MedicalService> servicePage = new PageImpl<>(List.of(medicalService));
        when(medicalServiceRepository.findByNameContainingIgnoreCase("", pageable)).thenReturn(servicePage);

        // When
        Page<MedicalServiceResponseDto> result = medicalServiceService
                .getAllServices(null, null, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(medicalServiceRepository).findByNameContainingIgnoreCase("", pageable);
    }

    @Test
    void testUpdateService_Success() {
        // Given
        MedicalServiceCreateDto updateDto = new MedicalServiceCreateDto();
        updateDto.setName("Updated Consultation");
        updateDto.setDurationMinutes(45);

        when(medicalServiceRepository.findById(1L)).thenReturn(Optional.of(medicalService));
        when(medicalServiceRepository.save(any())).thenReturn(medicalService);

        // When
        MedicalServiceResponseDto result = medicalServiceService.updateService(1L, updateDto);

        // Then
        assertThat(result).isNotNull();
        verify(medicalServiceRepository).findById(1L);
        verify(medicalServiceRepository).save(any());
    }

    @Test
    void testUpdateService_NotFound() {
        // Given
        when(medicalServiceRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> medicalServiceService.updateService(999L, createDto))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void testDeleteService_Success() {
        // Given
        when(medicalServiceRepository.findById(1L)).thenReturn(Optional.of(medicalService));

        // When
        medicalServiceService.deleteService(1L);

        // Then
        verify(medicalServiceRepository).findById(1L);
        verify(medicalServiceRepository).deleteById(1L);
    }

    @Test
    void testDeleteService_NotFound() {
        // Given
        when(medicalServiceRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> medicalServiceService.deleteService(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void testToggleServiceStatus_Success() {
        // Given
        when(medicalServiceRepository.findById(1L)).thenReturn(Optional.of(medicalService));
        when(medicalServiceRepository.save(any())).thenReturn(medicalService);

        // When
        medicalServiceService.toggleServiceStatus(1L);

        // Then
        verify(medicalServiceRepository).findById(1L);
        verify(medicalServiceRepository).save(argThat(s -> !s.getIsActive()));
    }

    @Test
    void testToggleServiceStatus_NotFound() {
        // Given
        when(medicalServiceRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> medicalServiceService.toggleServiceStatus(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
