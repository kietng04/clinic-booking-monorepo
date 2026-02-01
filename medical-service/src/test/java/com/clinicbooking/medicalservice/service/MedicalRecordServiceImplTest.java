package com.clinicbooking.medicalservice.service;

import com.clinicbooking.medicalservice.client.AppointmentServiceClient;
import com.clinicbooking.medicalservice.client.UserServiceClient;
import com.clinicbooking.medicalservice.dto.AppointmentDto;
import com.clinicbooking.medicalservice.dto.UserDto;
import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordCreateDto;
import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordResponseDto;
import com.clinicbooking.medicalservice.entity.MedicalRecord;
import com.clinicbooking.medicalservice.event.MedicalRecordEventPublisher;
import com.clinicbooking.medicalservice.mapper.MedicalRecordMapper;
import com.clinicbooking.medicalservice.mapper.PrescriptionMapper;
import com.clinicbooking.medicalservice.repository.MedicalRecordRepository;
import com.clinicbooking.medicalservice.security.SecurityContext;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MedicalRecordServiceImplTest {
    @Mock private MedicalRecordRepository medicalRecordRepository;
    @Mock private MedicalRecordMapper medicalRecordMapper;
    @Mock private PrescriptionMapper prescriptionMapper;
    @Mock private UserServiceClient userServiceClient;
    @Mock private AppointmentServiceClient appointmentServiceClient;
    @Mock private MedicalRecordEventPublisher eventPublisher;
    @Mock private SecurityContext securityContext;

    @InjectMocks private MedicalRecordServiceImpl medicalRecordService;

    @Test
    void createMedicalRecord_allowsConfirmedAppointment() {
        MedicalRecordCreateDto dto = MedicalRecordCreateDto.builder()
            .appointmentId(11L)
            .patientId(15L)
            .doctorId(12L)
            .diagnosis("Test")
            .build();

        AppointmentDto appointment = AppointmentDto.builder()
            .id(11L)
            .patientId(15L)
            .doctorId(12L)
            .status("CONFIRMED")
            .build();

        UserDto doctor = UserDto.builder().id(12L).role("DOCTOR").fullName("Demo Doctor").build();
        UserDto patient = UserDto.builder().id(15L).role("PATIENT").fullName("Test Patient").build();

        MedicalRecord record = new MedicalRecord();

        when(securityContext.isDoctor()).thenReturn(true);
        when(securityContext.isAdmin()).thenReturn(false);
        when(securityContext.getCurrentUserId()).thenReturn(12L);
        when(appointmentServiceClient.getAppointmentById(11L)).thenReturn(appointment);
        when(userServiceClient.getUserById(12L)).thenReturn(doctor);
        when(userServiceClient.getUserById(15L)).thenReturn(patient);
        when(medicalRecordMapper.toEntity(dto)).thenReturn(record);
        when(medicalRecordRepository.save(record)).thenReturn(record);
        when(medicalRecordMapper.toDto(record)).thenReturn(MedicalRecordResponseDto.builder().id(1L).build());

        securityContext.isAdmin();

        assertDoesNotThrow(() -> medicalRecordService.createMedicalRecord(dto));
    }
}
