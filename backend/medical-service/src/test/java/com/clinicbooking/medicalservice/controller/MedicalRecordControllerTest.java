package com.clinicbooking.medicalservice.controller;

import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordCreateDto;
import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordResponseDto;
import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordUpdateDto;
import com.clinicbooking.medicalservice.service.MedicalRecordService;
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
class MedicalRecordControllerTest {

    @Mock
    private MedicalRecordService medicalRecordService;

    @InjectMocks
    private MedicalRecordController medicalRecordController;

    @Test
    void createMedicalRecordReturnsCreatedResponse() {
        MedicalRecordCreateDto dto = new MedicalRecordCreateDto();
        MedicalRecordResponseDto responseDto = MedicalRecordResponseDto.builder().id(1L).diagnosis("Flu").build();
        when(medicalRecordService.createMedicalRecord(dto)).thenReturn(responseDto);

        ResponseEntity<MedicalRecordResponseDto> response = medicalRecordController.createMedicalRecord(dto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(responseDto);
    }

    @Test
    void getMedicalRecordByIdReturnsOk() {
        MedicalRecordResponseDto responseDto = MedicalRecordResponseDto.builder().id(2L).diagnosis("Asthma").build();
        when(medicalRecordService.getMedicalRecordById(2L)).thenReturn(responseDto);

        ResponseEntity<MedicalRecordResponseDto> response = medicalRecordController.getMedicalRecordById(2L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(responseDto);
    }

    @Test
    void getMedicalRecordsByPatientIdReturnsPagedResponse() {
        PageRequest pageable = PageRequest.of(0, 10);
        Page<MedicalRecordResponseDto> page = new PageImpl<>(
                List.of(MedicalRecordResponseDto.builder().id(3L).diagnosis("Checkup").build()),
                pageable,
                1
        );
        when(medicalRecordService.getMedicalRecordsByPatientId(15L, pageable)).thenReturn(page);

        ResponseEntity<Page<MedicalRecordResponseDto>> response = medicalRecordController.getMedicalRecordsByPatientId(15L, pageable);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(page);
    }

    @Test
    void getMedicalRecordsByDoctorIdReturnsPagedResponse() {
        PageRequest pageable = PageRequest.of(0, 10);
        Page<MedicalRecordResponseDto> page = new PageImpl<>(
                List.of(MedicalRecordResponseDto.builder().id(4L).diagnosis("Dermatitis").build()),
                pageable,
                1
        );
        when(medicalRecordService.getMedicalRecordsByDoctorId(22L, pageable)).thenReturn(page);

        ResponseEntity<Page<MedicalRecordResponseDto>> response = medicalRecordController.getMedicalRecordsByDoctorId(22L, pageable);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(page);
    }

    @Test
    void updateMedicalRecordReturnsOk() {
        MedicalRecordUpdateDto dto = MedicalRecordUpdateDto.builder().diagnosis("Recovered").build();
        MedicalRecordResponseDto responseDto = MedicalRecordResponseDto.builder().id(5L).diagnosis("Recovered").build();
        when(medicalRecordService.updateMedicalRecord(5L, dto)).thenReturn(responseDto);

        ResponseEntity<MedicalRecordResponseDto> response = medicalRecordController.updateMedicalRecord(5L, dto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(responseDto);
    }

    @Test
    void deleteMedicalRecordReturnsNoContent() {
        ResponseEntity<Void> response = medicalRecordController.deleteMedicalRecord(7L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(medicalRecordService).deleteMedicalRecord(7L);
    }
}
