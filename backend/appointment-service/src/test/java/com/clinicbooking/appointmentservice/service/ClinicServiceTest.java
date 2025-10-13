package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.ClinicCreateDto;
import com.clinicbooking.appointmentservice.dto.ClinicResponseDto;
import com.clinicbooking.appointmentservice.entity.Clinic;
import com.clinicbooking.appointmentservice.exception.ResourceNotFoundException;
import com.clinicbooking.appointmentservice.repository.ClinicRepository;
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
class ClinicServiceTest {

    @Mock
    private ClinicRepository clinicRepository;

    private ClinicServiceImpl clinicService;

    private Clinic clinic;
    private ClinicCreateDto createDto;

    @BeforeEach
    void setUp() {
        clinicService = new ClinicServiceImpl(clinicRepository);

        clinic = Clinic.builder()
                .id(1L)
                .name("City Medical Center")
                .address("123 Main St")
                .phone("0123456789")
                .email("contact@citymedical.com")
                .description("General healthcare")
                .openingHours("Mon-Fri: 8:00-18:00")
                .isActive(true)
                .build();

        createDto = new ClinicCreateDto();
        createDto.setName("City Medical Center");
        createDto.setAddress("123 Main St");
        createDto.setPhone("0123456789");
        createDto.setEmail("contact@citymedical.com");
        createDto.setDescription("General healthcare");
        createDto.setOpeningHours("Mon-Fri: 8:00-18:00");
    }

    @Test
    void testCreateClinic_Success() {
        // Given
        when(clinicRepository.save(any())).thenReturn(clinic);

        // When
        ClinicResponseDto result = clinicService.createClinic(createDto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("City Medical Center");
        verify(clinicRepository).save(any());
    }

    @Test
    void testGetClinicById_Success() {
        // Given
        when(clinicRepository.findById(1L)).thenReturn(Optional.of(clinic));

        // When
        ClinicResponseDto result = clinicService.getClinicById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(clinicRepository).findById(1L);
    }

    @Test
    void testGetClinicById_NotFound() {
        // Given
        when(clinicRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> clinicService.getClinicById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Phòng khám không tìm thấy");
    }

    @Test
    void testGetAllClinics() {
        // Given
        when(clinicRepository.findByIsActiveTrue()).thenReturn(List.of(clinic));

        // When
        List<ClinicResponseDto> result = clinicService.getAllClinics();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(clinicRepository).findByIsActiveTrue();
    }

    @Test
    void testSearchClinics() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Clinic> clinicPage = new PageImpl<>(List.of(clinic));
        when(clinicRepository.findByNameContainingIgnoreCase("medical", pageable))
                .thenReturn(clinicPage);

        // When
        Page<ClinicResponseDto> result = clinicService.searchClinics("medical", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(clinicRepository).findByNameContainingIgnoreCase("medical", pageable);
    }

    @Test
    void testUpdateClinic_Success() {
        // Given
        ClinicCreateDto updateDto = new ClinicCreateDto();
        updateDto.setName("Updated Medical Center");
        updateDto.setPhone("0987654321");

        when(clinicRepository.findById(1L)).thenReturn(Optional.of(clinic));
        when(clinicRepository.save(any())).thenReturn(clinic);

        // When
        ClinicResponseDto result = clinicService.updateClinic(1L, updateDto);

        // Then
        assertThat(result).isNotNull();
        verify(clinicRepository).findById(1L);
        verify(clinicRepository).save(any());
    }

    @Test
    void testUpdateClinic_NotFound() {
        // Given
        when(clinicRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> clinicService.updateClinic(999L, createDto))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void testDeleteClinic_Success() {
        // Given
        when(clinicRepository.findById(1L)).thenReturn(Optional.of(clinic));

        // When
        clinicService.deleteClinic(1L);

        // Then
        verify(clinicRepository).findById(1L);
        verify(clinicRepository).deleteById(1L);
    }

    @Test
    void testDeleteClinic_NotFound() {
        // Given
        when(clinicRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> clinicService.deleteClinic(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void testToggleClinicStatus_Success() {
        // Given
        when(clinicRepository.findById(1L)).thenReturn(Optional.of(clinic));
        when(clinicRepository.save(any())).thenReturn(clinic);

        // When
        clinicService.toggleClinicStatus(1L);

        // Then
        verify(clinicRepository).findById(1L);
        verify(clinicRepository).save(argThat(c -> !c.getIsActive()));
    }

    @Test
    void testToggleClinicStatus_NotFound() {
        // Given
        when(clinicRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> clinicService.toggleClinicStatus(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
