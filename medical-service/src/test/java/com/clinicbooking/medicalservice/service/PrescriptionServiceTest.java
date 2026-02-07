package com.clinicbooking.medicalservice.service;

import com.clinicbooking.medicalservice.client.UserServiceClient;
import com.clinicbooking.medicalservice.dto.UserDto;
import com.clinicbooking.medicalservice.dto.prescription.PrescriptionCreateDto;
import com.clinicbooking.medicalservice.dto.prescription.PrescriptionResponseDto;
import com.clinicbooking.medicalservice.dto.prescription.PrescriptionUpdateDto;
import com.clinicbooking.medicalservice.entity.MedicalRecord;
import com.clinicbooking.medicalservice.entity.Medication;
import com.clinicbooking.medicalservice.entity.Prescription;
import com.clinicbooking.medicalservice.mapper.PrescriptionMapper;
import com.clinicbooking.medicalservice.repository.MedicalRecordRepository;
import com.clinicbooking.medicalservice.repository.MedicationRepository;
import com.clinicbooking.medicalservice.repository.PrescriptionRepository;
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

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Prescription Service Tests")
class PrescriptionServiceTest {

    @Mock
    private PrescriptionRepository prescriptionRepository;

    @Mock
    private MedicalRecordRepository medicalRecordRepository;

    @Mock
    private MedicationRepository medicationRepository;

    @Mock
    private PrescriptionMapper prescriptionMapper;

    @Mock
    private UserServiceClient userServiceClient;

    @InjectMocks
    private PrescriptionServiceImpl prescriptionService;

    private MedicalRecord medicalRecord;
    private UserDto doctorDto;
    private Medication medication;
    private PrescriptionCreateDto createDto;
    private Prescription prescription;
    private PrescriptionResponseDto responseDto;

    @BeforeEach
    void setUp() {
        medicalRecord = MedicalRecord.builder()
                .id(1L)
                .patientId(100L)
                .doctorId(200L)
                .patientName("Patient Name")
                .doctorName("Doctor Name")
                .diagnosis("Test Diagnosis")
                .build();

        doctorDto = new UserDto();
        doctorDto.setId(200L);
        doctorDto.setFullName("Doctor Name");
        doctorDto.setRole("DOCTOR");

        medication = Medication.builder()
                .id(10L)
                .name("Lisinopril")
                .genericName("Lisinopril")
                .defaultDosage("10mg")
                .defaultFrequency("Once daily")
                .defaultDuration("30 days")
                .instructions("Take in the morning")
                .isActive(true)
                .build();

        createDto = PrescriptionCreateDto.builder()
                .doctorId(200L)
                .medicationId(10L)
                .build();

        prescription = Prescription.builder()
                .id(1L)
                .medicalRecord(medicalRecord)
                .doctorId(200L)
                .doctorName("Doctor Name")
                .medication(medication)
                .medicationName("Lisinopril")
                .dosage("10mg")
                .frequency("Once daily")
                .duration("30 days")
                .instructions("Take in the morning")
                .build();

        responseDto = new PrescriptionResponseDto();
        responseDto.setId(1L);
        responseDto.setMedicationName("Lisinopril");
    }

    @Test
    @DisplayName("Should create prescription with medication from catalog")
    void testAddPrescriptionWithMedicationId() {
        when(medicalRecordRepository.findById(1L)).thenReturn(Optional.of(medicalRecord));
        when(userServiceClient.getUserById(200L)).thenReturn(doctorDto);
        when(medicationRepository.findById(10L)).thenReturn(Optional.of(medication));
        when(prescriptionMapper.toEntity(any())).thenReturn(prescription);
        when(prescriptionRepository.save(any())).thenReturn(prescription);
        when(prescriptionMapper.toDto(any())).thenReturn(responseDto);

        PrescriptionResponseDto result = prescriptionService.addPrescription(1L, createDto);

        assertThat(result).isNotNull();
        assertThat(result.getMedicationName()).isEqualTo("Lisinopril");
        verify(prescriptionRepository).save(any(Prescription.class));
        verify(medicationRepository).findById(10L);
    }

    @Test
    @DisplayName("Should create prescription with custom medication name")
    void testAddPrescriptionWithCustomMedicationName() {
        PrescriptionCreateDto customDto = PrescriptionCreateDto.builder()
                .doctorId(200L)
                .medicationName("Custom Medicine")
                .dosage("5mg")
                .frequency("Twice daily")
                .duration("14 days")
                .build();

        Prescription customPrescription = Prescription.builder()
                .id(1L)
                .medicalRecord(medicalRecord)
                .doctorId(200L)
                .doctorName("Doctor Name")
                .medicationName("Custom Medicine")
                .dosage("5mg")
                .frequency("Twice daily")
                .duration("14 days")
                .build();

        when(medicalRecordRepository.findById(1L)).thenReturn(Optional.of(medicalRecord));
        when(userServiceClient.getUserById(200L)).thenReturn(doctorDto);
        when(prescriptionMapper.toEntity(any())).thenReturn(customPrescription);
        when(prescriptionRepository.save(any())).thenReturn(customPrescription);
        when(prescriptionMapper.toDto(any())).thenReturn(responseDto);

        PrescriptionResponseDto result = prescriptionService.addPrescription(1L, customDto);

        assertThat(result).isNotNull();
        verify(prescriptionRepository).save(any(Prescription.class));
        verify(medicationRepository, never()).findById(anyLong());
    }

    @Test
    @DisplayName("Should throw exception when medical record not found")
    void testAddPrescriptionMedicalRecordNotFound() {
        when(medicalRecordRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> prescriptionService.addPrescription(999L, createDto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Không tìm thấy hồ sơ y tế");

        verify(prescriptionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when doctor user not found")
    void testAddPrescriptionDoctorNotFound() {
        when(medicalRecordRepository.findById(1L)).thenReturn(Optional.of(medicalRecord));
        when(userServiceClient.getUserById(200L)).thenThrow(new RuntimeException("User not found"));

        assertThatThrownBy(() -> prescriptionService.addPrescription(1L, createDto))
                .isInstanceOf(RuntimeException.class);

        verify(prescriptionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when prescriber is not a doctor")
    void testAddPrescriptionInvalidDoctorRole() {
        UserDto notDoctor = new UserDto();
        notDoctor.setId(200L);
        notDoctor.setFullName("Not Doctor");
        notDoctor.setRole("PATIENT");

        when(medicalRecordRepository.findById(1L)).thenReturn(Optional.of(medicalRecord));
        when(userServiceClient.getUserById(200L)).thenReturn(notDoctor);

        assertThatThrownBy(() -> prescriptionService.addPrescription(1L, createDto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Người kê đơn không phải là bác sĩ");

        verify(prescriptionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when medication not found in catalog")
    void testAddPrescriptionMedicationNotFound() {
        when(medicalRecordRepository.findById(1L)).thenReturn(Optional.of(medicalRecord));
        when(userServiceClient.getUserById(200L)).thenReturn(doctorDto);
        when(medicationRepository.findById(10L)).thenReturn(Optional.empty());
        when(prescriptionMapper.toEntity(any())).thenReturn(prescription);

        assertThatThrownBy(() -> prescriptionService.addPrescription(1L, createDto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Không tìm thấy thuốc trong danh mục");

        verify(prescriptionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when neither medicationId nor medicationName provided")
    void testAddPrescriptionMissingMedication() {
        PrescriptionCreateDto invalidDto = PrescriptionCreateDto.builder()
                .doctorId(200L)
                .build();

        Prescription emptyPrescription = Prescription.builder()
                .medicalRecord(medicalRecord)
                .doctorId(200L)
                .doctorName("Doctor Name")
                .build();

        when(medicalRecordRepository.findById(1L)).thenReturn(Optional.of(medicalRecord));
        when(userServiceClient.getUserById(200L)).thenReturn(doctorDto);
        when(prescriptionMapper.toEntity(any())).thenReturn(emptyPrescription);

        assertThatThrownBy(() -> prescriptionService.addPrescription(1L, invalidDto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Phải chọn thuốc từ danh mục hoặc nhập tên thuốc");

        verify(prescriptionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should use medication defaults when not provided in DTO")
    void testAddPrescriptionUseMedicationDefaults() {
        PrescriptionCreateDto minimalDto = PrescriptionCreateDto.builder()
                .doctorId(200L)
                .medicationId(10L)
                .build();

        Prescription prescriptionWithDefaults = Prescription.builder()
                .medicalRecord(medicalRecord)
                .doctorId(200L)
                .doctorName("Doctor Name")
                .medication(medication)
                .medicationName("Lisinopril")
                .build();

        when(medicalRecordRepository.findById(1L)).thenReturn(Optional.of(medicalRecord));
        when(userServiceClient.getUserById(200L)).thenReturn(doctorDto);
        when(medicationRepository.findById(10L)).thenReturn(Optional.of(medication));
        when(prescriptionMapper.toEntity(any())).thenReturn(prescriptionWithDefaults);
        when(prescriptionRepository.save(any())).thenAnswer(invocation -> {
            Prescription saved = invocation.getArgument(0);
            // Verify defaults were applied
            assertThat(saved.getDosage()).isEqualTo("10mg");
            assertThat(saved.getFrequency()).isEqualTo("Once daily");
            assertThat(saved.getDuration()).isEqualTo("30 days");
            assertThat(saved.getInstructions()).isEqualTo("Take in the morning");
            return saved;
        });
        when(prescriptionMapper.toDto(any())).thenReturn(responseDto);

        prescriptionService.addPrescription(1L, minimalDto);

        verify(prescriptionRepository).save(any(Prescription.class));
    }

    @Test
    @DisplayName("Should get prescription by ID successfully")
    void testGetPrescriptionByIdSuccess() {
        when(prescriptionRepository.findById(1L)).thenReturn(Optional.of(prescription));
        when(prescriptionMapper.toDto(any())).thenReturn(responseDto);

        PrescriptionResponseDto result = prescriptionService.getPrescriptionById(1L);

        assertThat(result).isNotNull();
        verify(prescriptionRepository).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when prescription not found")
    void testGetPrescriptionByIdNotFound() {
        when(prescriptionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> prescriptionService.getPrescriptionById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Không tìm thấy đơn thuốc");
    }

    @Test
    @DisplayName("Should get prescriptions by medical record ID with pagination")
    void testGetPrescriptionsByMedicalRecordId() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Prescription> page = new PageImpl<>(List.of(prescription));

        when(prescriptionRepository.findByMedicalRecordId(1L, pageable)).thenReturn(page);
        when(prescriptionMapper.toDto(any())).thenReturn(responseDto);

        Page<PrescriptionResponseDto> result = prescriptionService.getPrescriptionsByMedicalRecordId(1L, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(prescriptionRepository).findByMedicalRecordId(1L, pageable);
    }

    @Test
    @DisplayName("Should update prescription successfully")
    void testUpdatePrescriptionSuccess() {
        PrescriptionUpdateDto updateDto = new PrescriptionUpdateDto();
        updateDto.setDosage("20mg");
        updateDto.setFrequency("Twice daily");

        when(prescriptionRepository.findById(1L)).thenReturn(Optional.of(prescription));
        when(prescriptionRepository.save(any())).thenReturn(prescription);
        when(prescriptionMapper.toDto(any())).thenReturn(responseDto);

        PrescriptionResponseDto result = prescriptionService.updatePrescription(1L, updateDto);

        assertThat(result).isNotNull();
        verify(prescriptionRepository).save(any(Prescription.class));
        verify(prescriptionMapper).updateEntityFromDto(updateDto, prescription);
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent prescription")
    void testUpdatePrescriptionNotFound() {
        PrescriptionUpdateDto updateDto = new PrescriptionUpdateDto();

        when(prescriptionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> prescriptionService.updatePrescription(999L, updateDto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Không tìm thấy đơn thuốc");

        verify(prescriptionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should delete prescription successfully")
    void testDeletePrescriptionSuccess() {
        when(prescriptionRepository.existsById(1L)).thenReturn(true);

        prescriptionService.deletePrescription(1L);

        verify(prescriptionRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent prescription")
    void testDeletePrescriptionNotFound() {
        when(prescriptionRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> prescriptionService.deletePrescription(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Không tìm thấy đơn thuốc");

        verify(prescriptionRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("Should handle prescription creation with all fields from DTO")
    void testAddPrescriptionWithAllFieldsProvided() {
        PrescriptionCreateDto fullDto = PrescriptionCreateDto.builder()
                .doctorId(200L)
                .medicationId(10L)
                .dosage("15mg")
                .frequency("Three times daily")
                .duration("60 days")
                .instructions("Take with food")
                .notes("Monitor blood pressure")
                .build();

        when(medicalRecordRepository.findById(1L)).thenReturn(Optional.of(medicalRecord));
        when(userServiceClient.getUserById(200L)).thenReturn(doctorDto);
        when(medicationRepository.findById(10L)).thenReturn(Optional.of(medication));
        when(prescriptionMapper.toEntity(any())).thenReturn(prescription);
        when(prescriptionRepository.save(any())).thenReturn(prescription);
        when(prescriptionMapper.toDto(any())).thenReturn(responseDto);

        PrescriptionResponseDto result = prescriptionService.addPrescription(1L, fullDto);

        assertThat(result).isNotNull();
        verify(prescriptionRepository).save(any(Prescription.class));
    }

    @Test
    @DisplayName("Should validate empty list when no prescriptions for medical record")
    void testGetPrescriptionsByMedicalRecordIdEmpty() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Prescription> emptyPage = new PageImpl<>(List.of());

        when(prescriptionRepository.findByMedicalRecordId(999L, pageable)).thenReturn(emptyPage);

        Page<PrescriptionResponseDto> result = prescriptionService.getPrescriptionsByMedicalRecordId(999L, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEmpty();
    }
}
