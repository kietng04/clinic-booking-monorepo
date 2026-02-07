package com.clinicbooking.medicalservice.service;

import com.clinicbooking.medicalservice.client.AppointmentServiceClient;
import com.clinicbooking.medicalservice.client.UserServiceClient;
import com.clinicbooking.medicalservice.dto.AppointmentDto;
import com.clinicbooking.medicalservice.dto.UserDto;
import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordCreateDto;
import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordResponseDto;
import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordUpdateDto;
import com.clinicbooking.medicalservice.entity.MedicalRecord;
import com.clinicbooking.medicalservice.event.MedicalRecordEventPublisher;
import com.clinicbooking.medicalservice.exception.AccessDeniedException;
import com.clinicbooking.medicalservice.exception.ResourceNotFoundException;
import com.clinicbooking.medicalservice.exception.ValidationException;
import com.clinicbooking.medicalservice.mapper.MedicalRecordMapper;
import com.clinicbooking.medicalservice.mapper.PrescriptionMapper;
import com.clinicbooking.medicalservice.repository.MedicalRecordRepository;
import com.clinicbooking.medicalservice.security.SecurityContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("MedicalRecord Service Tests")
class MedicalRecordServiceTest {

    @Mock
    private MedicalRecordRepository medicalRecordRepository;

    @Mock
    private MedicalRecordMapper medicalRecordMapper;

    @Mock
    private PrescriptionMapper prescriptionMapper;

    @Mock
    private UserServiceClient userServiceClient;

    @Mock
    private AppointmentServiceClient appointmentServiceClient;

    @Mock
    private MedicalRecordEventPublisher eventPublisher;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private MedicalRecordServiceImpl medicalRecordService;

    private UserDto patientDto;
    private UserDto doctorDto;
    private AppointmentDto appointmentDto;
    private MedicalRecordCreateDto createDto;
    private MedicalRecord medicalRecord;
    private MedicalRecordResponseDto responseDto;

    @BeforeEach
    void setUp() {
        patientDto = new UserDto();
        patientDto.setId(100L);
        patientDto.setFullName("Patient Name");
        patientDto.setRole("PATIENT");

        doctorDto = new UserDto();
        doctorDto.setId(200L);
        doctorDto.setFullName("Doctor Name");
        doctorDto.setRole("DOCTOR");

        appointmentDto = new AppointmentDto();
        appointmentDto.setId(1000L);
        appointmentDto.setPatientId(100L);
        appointmentDto.setDoctorId(200L);
        appointmentDto.setStatus("COMPLETED");

        createDto = MedicalRecordCreateDto.builder()
                .patientId(100L)
                .doctorId(200L)
                .appointmentId(1000L)
                .diagnosis("Test Diagnosis")
                .symptoms("Test Symptoms")
                .treatmentPlan("Test Treatment")
                .prescriptions(new ArrayList<>())
                .build();

        medicalRecord = MedicalRecord.builder()
                .id(1L)
                .patientId(100L)
                .doctorId(200L)
                .patientName("Patient Name")
                .doctorName("Doctor Name")
                .diagnosis("Test Diagnosis")
                .symptoms("Test Symptoms")
                .treatmentPlan("Test Treatment")
                .build();

        responseDto = new MedicalRecordResponseDto();
        responseDto.setId(1L);
        responseDto.setPatientId(100L);
        responseDto.setDoctorId(200L);
    }

    @Test
    @DisplayName("Should create medical record successfully when user is doctor")
    void testCreateMedicalRecordSuccess() {
        when(securityContext.getCurrentUserId()).thenReturn(200L);
        when(securityContext.isDoctor()).thenReturn(true);
        when(securityContext.isAdmin()).thenReturn(false);
        when(userServiceClient.getUserById(100L)).thenReturn(patientDto);
        when(userServiceClient.getUserById(200L)).thenReturn(doctorDto);
        when(appointmentServiceClient.getAppointmentById(1000L)).thenReturn(appointmentDto);
        when(medicalRecordMapper.toEntity(any())).thenReturn(medicalRecord);
        when(medicalRecordRepository.save(any())).thenReturn(medicalRecord);
        when(medicalRecordMapper.toDto(any())).thenReturn(responseDto);

        MedicalRecordResponseDto result = medicalRecordService.createMedicalRecord(createDto);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(medicalRecordRepository).save(any(MedicalRecord.class));
        verify(eventPublisher).publishMedicalRecordCreated(any());
    }

    @Test
    @DisplayName("Should throw AccessDeniedException when patient tries to create record")
    void testCreateMedicalRecordAccessDeniedForPatient() {
        when(securityContext.isDoctor()).thenReturn(false);
        when(securityContext.isAdmin()).thenReturn(false);

        assertThatThrownBy(() -> medicalRecordService.createMedicalRecord(createDto))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Chỉ bác sĩ mới có thể tạo hồ sơ y tế");

        verify(medicalRecordRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw AccessDeniedException when doctor creates record for another doctor")
    void testCreateMedicalRecordDoctorMismatch() {
        when(securityContext.getCurrentUserId()).thenReturn(201L); // Different doctor
        when(securityContext.isDoctor()).thenReturn(true);
        when(securityContext.isAdmin()).thenReturn(false);

        assertThatThrownBy(() -> medicalRecordService.createMedicalRecord(createDto))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Bác sĩ chỉ có thể tạo hồ sơ y tế của mình");

        verify(medicalRecordRepository, never()).save(any());
        verify(userServiceClient, never()).getUserById(anyLong());
    }

    @Test
    @DisplayName("Should throw ValidationException when user is not a doctor")
    void testCreateMedicalRecordInvalidDoctorRole() {
        UserDto notDoctor = new UserDto();
        notDoctor.setId(200L);
        notDoctor.setFullName("Not Doctor");
        notDoctor.setRole("PATIENT");

        when(securityContext.getCurrentUserId()).thenReturn(200L);
        when(securityContext.isDoctor()).thenReturn(true);
        when(securityContext.isAdmin()).thenReturn(false);
        when(userServiceClient.getUserById(100L)).thenReturn(patientDto);
        when(userServiceClient.getUserById(200L)).thenReturn(notDoctor);

        assertThatThrownBy(() -> medicalRecordService.createMedicalRecord(createDto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Người dùng không phải là bác sĩ");

        verify(medicalRecordRepository, never()).save(any());
        verify(appointmentServiceClient, never()).getAppointmentById(anyLong());
    }

    @Test
    @DisplayName("Should throw ValidationException when appointment does not match patient and doctor")
    void testCreateMedicalRecordInvalidAppointment() {
        AppointmentDto wrongAppointment = new AppointmentDto();
        wrongAppointment.setId(1000L);
        wrongAppointment.setPatientId(999L); // Wrong patient
        wrongAppointment.setDoctorId(200L);
        wrongAppointment.setStatus("COMPLETED");

        when(securityContext.getCurrentUserId()).thenReturn(200L);
        when(securityContext.isDoctor()).thenReturn(true);
        when(securityContext.isAdmin()).thenReturn(false);
        when(userServiceClient.getUserById(100L)).thenReturn(patientDto);
        when(userServiceClient.getUserById(200L)).thenReturn(doctorDto);
        when(appointmentServiceClient.getAppointmentById(1000L)).thenReturn(wrongAppointment);

        assertThatThrownBy(() -> medicalRecordService.createMedicalRecord(createDto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Cuộc hẹn không hợp lệ");

        verify(medicalRecordRepository, never()).save(any());
        verify(medicalRecordMapper, never()).toEntity(any());
    }

    @Test
    @DisplayName("Should throw ValidationException when appointment status is not completed or confirmed")
    void testCreateMedicalRecordInvalidAppointmentStatus() {
        AppointmentDto pendingAppointment = new AppointmentDto();
        pendingAppointment.setId(1000L);
        pendingAppointment.setPatientId(100L);
        pendingAppointment.setDoctorId(200L);
        pendingAppointment.setStatus("PENDING");

        when(securityContext.getCurrentUserId()).thenReturn(200L);
        when(securityContext.isDoctor()).thenReturn(true);
        when(securityContext.isAdmin()).thenReturn(false);
        when(userServiceClient.getUserById(100L)).thenReturn(patientDto);
        when(userServiceClient.getUserById(200L)).thenReturn(doctorDto);
        when(appointmentServiceClient.getAppointmentById(1000L)).thenReturn(pendingAppointment);

        assertThatThrownBy(() -> medicalRecordService.createMedicalRecord(createDto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Chỉ có thể tạo hồ sơ y tế cho cuộc hẹn đã xác nhận hoặc đã hoàn thành");

        verify(medicalRecordRepository, never()).save(any());
        verify(medicalRecordMapper, never()).toEntity(any());
    }

    @Test
    @DisplayName("Should get medical record by ID successfully")
    void testGetMedicalRecordByIdSuccess() {
        when(medicalRecordRepository.findById(1L)).thenReturn(Optional.of(medicalRecord));
        when(securityContext.getCurrentUserId()).thenReturn(100L);
        when(securityContext.isPatient()).thenReturn(true);
        when(medicalRecordMapper.toDto(any())).thenReturn(responseDto);

        MedicalRecordResponseDto result = medicalRecordService.getMedicalRecordById(1L);

        assertThat(result).isNotNull();
        verify(medicalRecordRepository).findById(1L);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when medical record not found")
    void testGetMedicalRecordByIdNotFound() {
        when(medicalRecordRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> medicalRecordService.getMedicalRecordById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Không tìm thấy hồ sơ y tế");
    }

    @Test
    @DisplayName("Should throw AccessDeniedException when unauthorized user tries to access record")
    void testGetMedicalRecordByIdAccessDenied() {
        when(medicalRecordRepository.findById(1L)).thenReturn(Optional.of(medicalRecord));
        when(securityContext.getCurrentUserId()).thenReturn(999L); // Different user
        when(securityContext.isPatient()).thenReturn(true);
        when(securityContext.isDoctor()).thenReturn(false);
        when(securityContext.isAdmin()).thenReturn(false);

        assertThatThrownBy(() -> medicalRecordService.getMedicalRecordById(1L))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Bạn không có quyền truy cập hồ sơ y tế này");
    }

    @Test
    @DisplayName("Should get medical records by patient ID successfully")
    void testGetMedicalRecordsByPatientId() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<MedicalRecord> page = new PageImpl<>(List.of(medicalRecord));

        when(securityContext.getCurrentUserId()).thenReturn(100L);
        when(securityContext.isPatient()).thenReturn(true);
        when(medicalRecordRepository.findByPatientId(100L, pageable)).thenReturn(page);
        when(medicalRecordMapper.toDto(any())).thenReturn(responseDto);

        Page<MedicalRecordResponseDto> result = medicalRecordService.getMedicalRecordsByPatientId(100L, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(medicalRecordRepository).findByPatientId(100L, pageable);
    }

    @Test
    @DisplayName("Should throw AccessDeniedException when patient tries to access other patient records")
    void testGetMedicalRecordsByPatientIdAccessDenied() {
        Pageable pageable = PageRequest.of(0, 10);

        when(securityContext.getCurrentUserId()).thenReturn(999L); // Different patient
        when(securityContext.isPatient()).thenReturn(true);

        assertThatThrownBy(() -> medicalRecordService.getMedicalRecordsByPatientId(100L, pageable))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Bạn chỉ có thể xem hồ sơ y tế của mình");
    }

    @Test
    @DisplayName("Should get medical records by doctor ID successfully")
    void testGetMedicalRecordsByDoctorId() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<MedicalRecord> page = new PageImpl<>(List.of(medicalRecord));

        when(securityContext.getCurrentUserId()).thenReturn(200L);
        when(securityContext.isDoctor()).thenReturn(true);
        when(securityContext.isPatient()).thenReturn(false);
        when(medicalRecordRepository.findByDoctorId(200L, pageable)).thenReturn(page);
        when(medicalRecordMapper.toDto(any())).thenReturn(responseDto);

        Page<MedicalRecordResponseDto> result = medicalRecordService.getMedicalRecordsByDoctorId(200L, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(medicalRecordRepository).findByDoctorId(200L, pageable);
    }

    @Test
    @DisplayName("Should throw AccessDeniedException when patient tries to access doctor records")
    void testGetMedicalRecordsByDoctorIdPatientAccessDenied() {
        Pageable pageable = PageRequest.of(0, 10);

        when(securityContext.isPatient()).thenReturn(true);

        assertThatThrownBy(() -> medicalRecordService.getMedicalRecordsByDoctorId(200L, pageable))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Bệnh nhân không có quyền truy cập endpoint này");
    }

    @Test
    @DisplayName("Should update medical record successfully")
    void testUpdateMedicalRecordSuccess() {
        MedicalRecordUpdateDto updateDto = new MedicalRecordUpdateDto();
        updateDto.setDiagnosis("Updated Diagnosis");
        updateDto.setTreatmentPlan("Updated Treatment");

        when(medicalRecordRepository.findById(1L)).thenReturn(Optional.of(medicalRecord));
        when(securityContext.getCurrentUserId()).thenReturn(200L);
        when(securityContext.isAdmin()).thenReturn(false);
        when(medicalRecordRepository.save(any())).thenReturn(medicalRecord);
        when(medicalRecordMapper.toDto(any())).thenReturn(responseDto);

        MedicalRecordResponseDto result = medicalRecordService.updateMedicalRecord(1L, updateDto);

        assertThat(result).isNotNull();
        verify(medicalRecordRepository).save(any(MedicalRecord.class));
        verify(eventPublisher).publishMedicalRecordUpdated(any());
    }

    @Test
    @DisplayName("Should throw AccessDeniedException when unauthorized user tries to update")
    void testUpdateMedicalRecordAccessDenied() {
        MedicalRecordUpdateDto updateDto = new MedicalRecordUpdateDto();

        when(medicalRecordRepository.findById(1L)).thenReturn(Optional.of(medicalRecord));
        when(securityContext.getCurrentUserId()).thenReturn(999L); // Different user
        when(securityContext.isAdmin()).thenReturn(false);

        assertThatThrownBy(() -> medicalRecordService.updateMedicalRecord(1L, updateDto))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Chỉ bác sĩ tạo hồ sơ hoặc admin mới có thể cập nhật");

        verify(medicalRecordRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should delete medical record successfully when admin")
    void testDeleteMedicalRecordSuccess() {
        when(securityContext.isAdmin()).thenReturn(true);
        when(medicalRecordRepository.existsById(1L)).thenReturn(true);

        medicalRecordService.deleteMedicalRecord(1L);

        verify(medicalRecordRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw AccessDeniedException when non-admin tries to delete")
    void testDeleteMedicalRecordAccessDenied() {
        when(securityContext.isAdmin()).thenReturn(false);

        assertThatThrownBy(() -> medicalRecordService.deleteMedicalRecord(1L))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Chỉ admin mới có thể xóa hồ sơ y tế");

        verify(medicalRecordRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when deleting non-existent record")
    void testDeleteMedicalRecordNotFound() {
        when(securityContext.isAdmin()).thenReturn(true);
        when(medicalRecordRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> medicalRecordService.deleteMedicalRecord(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Không tìm thấy hồ sơ y tế");

        verify(medicalRecordRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("Should allow admin to access any medical record")
    void testAdminCanAccessAnyRecord() {
        when(medicalRecordRepository.findById(1L)).thenReturn(Optional.of(medicalRecord));
        when(securityContext.isAdmin()).thenReturn(true);
        when(medicalRecordMapper.toDto(any())).thenReturn(responseDto);

        MedicalRecordResponseDto result = medicalRecordService.getMedicalRecordById(1L);

        assertThat(result).isNotNull();
        verify(medicalRecordRepository).findById(1L);
    }

    @Test
    @DisplayName("Should allow doctor to access their own records")
    void testDoctorCanAccessOwnRecords() {
        when(medicalRecordRepository.findById(1L)).thenReturn(Optional.of(medicalRecord));
        when(securityContext.getCurrentUserId()).thenReturn(200L);
        when(securityContext.isDoctor()).thenReturn(true);
        when(securityContext.isAdmin()).thenReturn(false);
        when(medicalRecordMapper.toDto(any())).thenReturn(responseDto);

        MedicalRecordResponseDto result = medicalRecordService.getMedicalRecordById(1L);

        assertThat(result).isNotNull();
    }
}
