package com.clinicbooking.medicalservice.controller;

import com.clinicbooking.medicalservice.dto.medication.MedicationCreateDto;
import com.clinicbooking.medicalservice.dto.medication.MedicationResponseDto;
import com.clinicbooking.medicalservice.dto.medication.MedicationUpdateDto;
import com.clinicbooking.medicalservice.service.MedicationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MedicationControllerTest {

    @Mock
    private MedicationService medicationService;

    @InjectMocks
    private MedicationController medicationController;

    @Test
    void createMedicationReturnsCreatedResponse() {
        MedicationCreateDto dto = new MedicationCreateDto();
        MedicationResponseDto responseDto = MedicationResponseDto.builder().id(1L).name("Paracetamol").build();
        when(medicationService.createMedication(dto)).thenReturn(responseDto);

        ResponseEntity<MedicationResponseDto> response = medicationController.createMedication(dto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(responseDto);
    }

    @Test
    void searchMedicationsDelegatesToService() {
        List<MedicationResponseDto> responseDtos = List.of(
                MedicationResponseDto.builder().id(2L).name("Amoxicillin").build()
        );
        when(medicationService.searchMedications("amox")).thenReturn(responseDtos);

        ResponseEntity<List<MedicationResponseDto>> response = medicationController.searchMedications("amox");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactlyElementsOf(responseDtos);
    }

    @Test
    void getMedicationByIdReturnsOk() {
        MedicationResponseDto responseDto = MedicationResponseDto.builder().id(4L).name("Ibuprofen").build();
        when(medicationService.getMedicationById(4L)).thenReturn(responseDto);

        ResponseEntity<MedicationResponseDto> response = medicationController.getMedicationById(4L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(responseDto);
    }

    @Test
    void getMedicationsReturnsFilteredPage() {
        PageRequest pageable = PageRequest.of(0, 10);
        Page<MedicationResponseDto> page = new PageImpl<>(
                List.of(MedicationResponseDto.builder().id(5L).name("Vitamin C").build()),
                pageable,
                1
        );
        when(medicationService.getMedicationsWithFilters("vit", "supplement", true, pageable)).thenReturn(page);

        ResponseEntity<Page<MedicationResponseDto>> response =
                medicationController.getMedications("vit", "supplement", true, pageable);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(page);
    }

    @Test
    void getAllActiveMedicationsReturnsOk() {
        List<MedicationResponseDto> responseDtos = List.of(
                MedicationResponseDto.builder().id(6L).name("Cetirizine").build()
        );
        when(medicationService.getAllActiveMedications()).thenReturn(responseDtos);

        ResponseEntity<List<MedicationResponseDto>> response = medicationController.getAllActiveMedications();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactlyElementsOf(responseDtos);
    }

    @Test
    void getMedicationsByCategoryReturnsOk() {
        List<MedicationResponseDto> responseDtos = List.of(
                MedicationResponseDto.builder().id(7L).name("Loratadine").build()
        );
        when(medicationService.getMedicationsByCategory("allergy")).thenReturn(responseDtos);

        ResponseEntity<List<MedicationResponseDto>> response = medicationController.getMedicationsByCategory("allergy");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactlyElementsOf(responseDtos);
    }

    @Test
    void getAllCategoriesReturnsOk() {
        when(medicationService.getAllCategories()).thenReturn(List.of("Pain Relief", "Antibiotic"));

        ResponseEntity<List<String>> response = medicationController.getAllCategories();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly("Pain Relief", "Antibiotic");
    }

    @Test
    void updateMedicationReturnsOk() {
        MedicationUpdateDto dto = MedicationUpdateDto.builder().name("Updated Name").build();
        MedicationResponseDto responseDto = MedicationResponseDto.builder().id(8L).name("Updated Name").build();
        when(medicationService.updateMedication(8L, dto)).thenReturn(responseDto);

        ResponseEntity<MedicationResponseDto> response = medicationController.updateMedication(8L, dto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(responseDto);
    }

    @Test
    void deleteMedicationReturnsNoContent() {
        ResponseEntity<Void> response = medicationController.deleteMedication(9L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(medicationService).deleteMedication(9L);
    }
}
