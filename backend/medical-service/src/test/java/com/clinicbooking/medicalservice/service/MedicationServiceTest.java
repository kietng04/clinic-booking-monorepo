package com.clinicbooking.medicalservice.service;

import com.clinicbooking.medicalservice.dto.medication.MedicationCreateDto;
import com.clinicbooking.medicalservice.dto.medication.MedicationResponseDto;
import com.clinicbooking.medicalservice.dto.medication.MedicationUpdateDto;
import com.clinicbooking.medicalservice.entity.Medication;
import com.clinicbooking.medicalservice.exception.ResourceNotFoundException;
import com.clinicbooking.medicalservice.exception.ValidationException;
import com.clinicbooking.medicalservice.mapper.MedicationMapper;
import com.clinicbooking.medicalservice.repository.MedicationRepository;
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

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Medication Service Tests")
class MedicationServiceTest {

    @Mock
    private MedicationRepository medicationRepository;

    @Mock
    private MedicationMapper medicationMapper;

    @InjectMocks
    private MedicationServiceImpl medicationService;

    private Medication medication;
    private MedicationCreateDto createDto;
    private MedicationUpdateDto updateDto;
    private MedicationResponseDto responseDto;

    @BeforeEach
    void setUp() {
        medication = Medication.builder()
                .id(1L)
                .name("Lisinopril")
                .genericName("Lisinopril")
                .category("Antihypertensive")
                .unit("mg")
                .defaultDosage("10mg")
                .defaultFrequency("Once daily")
                .defaultDuration("30 days")
                .instructions("Take in the morning")
                .isActive(true)
                .build();

        createDto = MedicationCreateDto.builder()
                .name("Lisinopril")
                .genericName("Lisinopril")
                .category("Antihypertensive")
                .defaultDosage("10mg")
                .defaultFrequency("Once daily")
                .defaultDuration("30 days")
                .build();

        updateDto = MedicationUpdateDto.builder()
                .defaultDosage("20mg")
                .instructions("Take in the evening")
                .build();

        responseDto = new MedicationResponseDto();
        responseDto.setId(1L);
        responseDto.setName("Lisinopril");
    }

    @Test
    @DisplayName("Should create medication successfully")
    void testCreateMedicationSuccess() {
        when(medicationRepository.existsByNameIgnoreCase(anyString())).thenReturn(false);
        when(medicationMapper.toEntity(any())).thenReturn(medication);
        when(medicationRepository.save(any())).thenReturn(medication);
        when(medicationMapper.toResponseDto(any())).thenReturn(responseDto);

        MedicationResponseDto result = medicationService.createMedication(createDto);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Lisinopril");
        verify(medicationRepository).save(any(Medication.class));
    }

    @Test
    @DisplayName("Should throw ValidationException when medication name already exists")
    void testCreateMedicationDuplicateName() {
        when(medicationRepository.existsByNameIgnoreCase("Lisinopril")).thenReturn(true);

        assertThatThrownBy(() -> medicationService.createMedication(createDto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("đã tồn tại");

        verify(medicationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should set default unit when not provided")
    void testCreateMedicationDefaultUnit() {
        Medication medicationWithoutUnit = Medication.builder()
                .name("Test Med")
                .isActive(true)
                .build();

        when(medicationRepository.existsByNameIgnoreCase(anyString())).thenReturn(false);
        when(medicationMapper.toEntity(any())).thenReturn(medicationWithoutUnit);
        when(medicationRepository.save(any())).thenAnswer(invocation -> {
            Medication saved = invocation.getArgument(0);
            assertThat(saved.getUnit()).isEqualTo("viên");
            return saved;
        });
        when(medicationMapper.toResponseDto(any())).thenReturn(responseDto);

        medicationService.createMedication(createDto);

        verify(medicationRepository).save(any(Medication.class));
    }

    @Test
    @DisplayName("Should get medication by ID successfully")
    void testGetMedicationByIdSuccess() {
        when(medicationRepository.findById(1L)).thenReturn(Optional.of(medication));
        when(medicationMapper.toResponseDto(any())).thenReturn(responseDto);

        MedicationResponseDto result = medicationService.getMedicationById(1L);

        assertThat(result).isNotNull();
        verify(medicationRepository).findById(1L);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when medication not found")
    void testGetMedicationByIdNotFound() {
        when(medicationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> medicationService.getMedicationById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Không tìm thấy thuốc");
    }

    @Test
    @DisplayName("Should get all active medications")
    void testGetAllActiveMedications() {
        List<Medication> medications = Arrays.asList(medication);

        when(medicationRepository.findByIsActiveTrueOrderByNameAsc()).thenReturn(medications);
        when(medicationMapper.toResponseDto(any())).thenReturn(responseDto);

        List<MedicationResponseDto> result = medicationService.getAllActiveMedications();

        assertThat(result).hasSize(1);
        verify(medicationRepository).findByIsActiveTrueOrderByNameAsc();
    }

    @Test
    @DisplayName("Should get medications by category")
    void testGetMedicationsByCategory() {
        List<Medication> medications = Arrays.asList(medication);

        when(medicationRepository.findByCategoryAndIsActiveTrueOrderByNameAsc("Antihypertensive"))
                .thenReturn(medications);
        when(medicationMapper.toResponseDto(any())).thenReturn(responseDto);

        List<MedicationResponseDto> result = medicationService.getMedicationsByCategory("Antihypertensive");

        assertThat(result).hasSize(1);
        verify(medicationRepository).findByCategoryAndIsActiveTrueOrderByNameAsc("Antihypertensive");
    }

    @Test
    @DisplayName("Should search medications by name or generic name")
    void testSearchMedications() {
        List<Medication> medications = Arrays.asList(medication);

        when(medicationRepository.searchByNameOrGenericName("lisin")).thenReturn(medications);
        when(medicationMapper.toResponseDto(any())).thenReturn(responseDto);

        List<MedicationResponseDto> result = medicationService.searchMedications("lisin");

        assertThat(result).hasSize(1);
        verify(medicationRepository).searchByNameOrGenericName("lisin");
    }

    @Test
    @DisplayName("Should return all active medications when search is null")
    void testSearchMedicationsNullSearch() {
        List<Medication> medications = Arrays.asList(medication);

        when(medicationRepository.findByIsActiveTrueOrderByNameAsc()).thenReturn(medications);
        when(medicationMapper.toResponseDto(any())).thenReturn(responseDto);

        List<MedicationResponseDto> result = medicationService.searchMedications(null);

        assertThat(result).hasSize(1);
        verify(medicationRepository).findByIsActiveTrueOrderByNameAsc();
        verify(medicationRepository, never()).searchByNameOrGenericName(anyString());
    }

    @Test
    @DisplayName("Should return all active medications when search is blank")
    void testSearchMedicationsBlankSearch() {
        List<Medication> medications = Arrays.asList(medication);

        when(medicationRepository.findByIsActiveTrueOrderByNameAsc()).thenReturn(medications);
        when(medicationMapper.toResponseDto(any())).thenReturn(responseDto);

        List<MedicationResponseDto> result = medicationService.searchMedications("  ");

        assertThat(result).hasSize(1);
        verify(medicationRepository).findByIsActiveTrueOrderByNameAsc();
    }

    @Test
    @DisplayName("Should get medications with filters")
    void testGetMedicationsWithFilters() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Medication> page = new PageImpl<>(Arrays.asList(medication));

        when(medicationRepository.findWithFilters("lisin", "Antihypertensive", true, pageable))
                .thenReturn(page);
        when(medicationMapper.toResponseDto(any())).thenReturn(responseDto);

        Page<MedicationResponseDto> result = medicationService.getMedicationsWithFilters(
                "lisin", "Antihypertensive", true, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(medicationRepository).findWithFilters("lisin", "Antihypertensive", true, pageable);
    }

    @Test
    @DisplayName("Should get all distinct categories")
    void testGetAllCategories() {
        List<String> categories = Arrays.asList("Antihypertensive", "Antidiabetic", "Analgesic");

        when(medicationRepository.findDistinctCategories()).thenReturn(categories);

        List<String> result = medicationService.getAllCategories();

        assertThat(result).hasSize(3);
        assertThat(result).containsExactlyInAnyOrder("Antihypertensive", "Antidiabetic", "Analgesic");
        verify(medicationRepository).findDistinctCategories();
    }

    @Test
    @DisplayName("Should update medication successfully")
    void testUpdateMedicationSuccess() {
        when(medicationRepository.findById(1L)).thenReturn(Optional.of(medication));
        when(medicationRepository.save(any())).thenReturn(medication);
        when(medicationMapper.toResponseDto(any())).thenReturn(responseDto);

        MedicationResponseDto result = medicationService.updateMedication(1L, updateDto);

        assertThat(result).isNotNull();
        verify(medicationRepository).save(any(Medication.class));
        verify(medicationMapper).updateEntity(medication, updateDto);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when updating non-existent medication")
    void testUpdateMedicationNotFound() {
        when(medicationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> medicationService.updateMedication(999L, updateDto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Không tìm thấy thuốc");

        verify(medicationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw ValidationException when updating name to existing name")
    void testUpdateMedicationDuplicateName() {
        MedicationUpdateDto nameUpdateDto = MedicationUpdateDto.builder()
                .name("Existing Medication")
                .build();

        when(medicationRepository.findById(1L)).thenReturn(Optional.of(medication));
        when(medicationRepository.existsByNameIgnoreCase("Existing Medication")).thenReturn(true);

        assertThatThrownBy(() -> medicationService.updateMedication(1L, nameUpdateDto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("đã tồn tại");

        verify(medicationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should allow updating name to same name with different case")
    void testUpdateMedicationSameNameDifferentCase() {
        MedicationUpdateDto nameUpdateDto = MedicationUpdateDto.builder()
                .name("LISINOPRIL") // Same name, different case
                .build();

        when(medicationRepository.findById(1L)).thenReturn(Optional.of(medication));
        when(medicationRepository.save(any())).thenReturn(medication);
        when(medicationMapper.toResponseDto(any())).thenReturn(responseDto);

        MedicationResponseDto result = medicationService.updateMedication(1L, nameUpdateDto);

        assertThat(result).isNotNull();
        verify(medicationRepository).save(any(Medication.class));
        verify(medicationRepository, never()).existsByNameIgnoreCase(anyString());
    }

    @Test
    @DisplayName("Should soft delete medication (set isActive to false)")
    void testDeleteMedicationSoftDelete() {
        when(medicationRepository.findById(1L)).thenReturn(Optional.of(medication));
        when(medicationRepository.save(any())).thenAnswer(invocation -> {
            Medication saved = invocation.getArgument(0);
            assertThat(saved.getIsActive()).isFalse();
            return saved;
        });

        medicationService.deleteMedication(1L);

        verify(medicationRepository).save(medication);
        verify(medicationRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when deleting non-existent medication")
    void testDeleteMedicationNotFound() {
        when(medicationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> medicationService.deleteMedication(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Không tìm thấy thuốc");

        verify(medicationRepository, never()).save(any());
        verify(medicationRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Should validate data integrity when creating medication")
    void testCreateMedicationDataValidation() {
        when(medicationRepository.existsByNameIgnoreCase(anyString())).thenReturn(false);
        when(medicationMapper.toEntity(any())).thenReturn(medication);
        when(medicationRepository.save(any())).thenReturn(medication);
        when(medicationMapper.toResponseDto(any())).thenReturn(responseDto);

        MedicationResponseDto result = medicationService.createMedication(createDto);

        assertThat(result).isNotNull();
        verify(medicationRepository).existsByNameIgnoreCase("Lisinopril");
    }

    @Test
    @DisplayName("Should handle empty search results")
    void testSearchMedicationsEmpty() {
        when(medicationRepository.searchByNameOrGenericName("nonexistent")).thenReturn(Arrays.asList());

        List<MedicationResponseDto> result = medicationService.searchMedications("nonexistent");

        assertThat(result).isEmpty();
        verify(medicationRepository).searchByNameOrGenericName("nonexistent");
    }

    @Test
    @DisplayName("Should handle empty category list")
    void testGetAllCategoriesEmpty() {
        when(medicationRepository.findDistinctCategories()).thenReturn(Arrays.asList());

        List<String> result = medicationService.getAllCategories();

        assertThat(result).isEmpty();
        verify(medicationRepository).findDistinctCategories();
    }

    @Test
    @DisplayName("Should handle pagination correctly")
    void testPaginationHandling() {
        Pageable pageable = PageRequest.of(0, 5);
        Page<Medication> page = new PageImpl<>(Arrays.asList(medication), pageable, 10);

        when(medicationRepository.findWithFilters(null, null, null, pageable)).thenReturn(page);
        when(medicationMapper.toResponseDto(any())).thenReturn(responseDto);

        Page<MedicationResponseDto> result = medicationService.getMedicationsWithFilters(
                null, null, null, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(10);
        assertThat(result.getContent()).hasSize(1);
    }
}
