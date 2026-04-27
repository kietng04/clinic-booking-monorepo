package com.clinicbooking.medicalservice.controller;

import com.clinicbooking.medicalservice.dto.prescription.PrescriptionCreateDto;
import com.clinicbooking.medicalservice.dto.prescription.PrescriptionResponseDto;
import com.clinicbooking.medicalservice.dto.prescription.PrescriptionUpdateDto;
import com.clinicbooking.medicalservice.service.PrescriptionService;
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
class PrescriptionControllerTest {

    @Mock
    private PrescriptionService prescriptionService;

    @InjectMocks
    private PrescriptionController prescriptionController;

    @Test
    void addPrescriptionReturnsCreatedResponse() {
        PrescriptionCreateDto dto = PrescriptionCreateDto.builder().doctorId(10L).medicationName("Paracetamol").build();
        PrescriptionResponseDto responseDto = PrescriptionResponseDto.builder().id(1L).medicationName("Paracetamol").build();
        when(prescriptionService.addPrescription(5L, dto)).thenReturn(responseDto);

        ResponseEntity<PrescriptionResponseDto> response = prescriptionController.addPrescription(5L, dto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(responseDto);
    }

    @Test
    void getPrescriptionByIdReturnsOkResponse() {
        PrescriptionResponseDto responseDto = PrescriptionResponseDto.builder().id(2L).medicationName("Amoxicillin").build();
        when(prescriptionService.getPrescriptionById(2L)).thenReturn(responseDto);

        ResponseEntity<PrescriptionResponseDto> response = prescriptionController.getPrescriptionById(2L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(responseDto);
    }

    @Test
    void getPrescriptionsByMedicalRecordIdReturnsPagedResponse() {
        PageRequest pageable = PageRequest.of(0, 5);
        Page<PrescriptionResponseDto> page = new PageImpl<>(
                List.of(PrescriptionResponseDto.builder().id(3L).medicationName("Vitamin C").build()),
                pageable,
                1
        );
        when(prescriptionService.getPrescriptionsByMedicalRecordId(8L, pageable)).thenReturn(page);

        ResponseEntity<Page<PrescriptionResponseDto>> response =
                prescriptionController.getPrescriptionsByMedicalRecordId(8L, pageable);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(page);
    }

    @Test
    void updatePrescriptionReturnsOkResponse() {
        PrescriptionUpdateDto dto = PrescriptionUpdateDto.builder().dosage("2 tablets").build();
        PrescriptionResponseDto responseDto = PrescriptionResponseDto.builder().id(9L).dosage("2 tablets").build();
        when(prescriptionService.updatePrescription(9L, dto)).thenReturn(responseDto);

        ResponseEntity<PrescriptionResponseDto> response = prescriptionController.updatePrescription(9L, dto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(responseDto);
    }

    @Test
    void deletePrescriptionReturnsNoContent() {
        ResponseEntity<Void> response = prescriptionController.deletePrescription(11L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(prescriptionService).deletePrescription(11L);
    }
}
