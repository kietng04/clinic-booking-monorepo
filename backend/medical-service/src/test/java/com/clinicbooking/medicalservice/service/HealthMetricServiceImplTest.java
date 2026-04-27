package com.clinicbooking.medicalservice.service;

import com.clinicbooking.medicalservice.client.UserServiceClient;
import com.clinicbooking.medicalservice.dto.UserDto;
import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricCreateDto;
import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricResponseDto;
import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricUpdateDto;
import com.clinicbooking.medicalservice.entity.HealthMetric;
import com.clinicbooking.medicalservice.exception.AccessDeniedException;
import com.clinicbooking.medicalservice.exception.ResourceNotFoundException;
import com.clinicbooking.medicalservice.exception.ValidationException;
import com.clinicbooking.medicalservice.mapper.HealthMetricMapper;
import com.clinicbooking.medicalservice.repository.HealthMetricRepository;
import com.clinicbooking.medicalservice.security.SecurityContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HealthMetricServiceImplTest {

    @Mock
    private HealthMetricRepository healthMetricRepository;

    @Mock
    private HealthMetricMapper healthMetricMapper;

    @Mock
    private UserServiceClient userServiceClient;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private HealthMetricServiceImpl healthMetricService;

    private HealthMetricCreateDto createDto;
    private HealthMetric healthMetric;
    private HealthMetricResponseDto responseDto;
    private UserDto patient;

    @BeforeEach
    void setUp() {
        createDto = HealthMetricCreateDto.builder()
                .patientId(100L)
                .metricType("heart_rate")
                .value("80")
                .unit("bpm")
                .measuredAt(LocalDateTime.of(2026, 4, 19, 9, 30))
                .notes("Morning reading")
                .build();

        healthMetric = HealthMetric.builder()
                .id(1L)
                .patientId(100L)
                .patientName("Patient One")
                .metricType("heart_rate")
                .value("80")
                .unit("bpm")
                .measuredAt(createDto.getMeasuredAt())
                .notes("Morning reading")
                .build();

        responseDto = HealthMetricResponseDto.builder()
                .id(1L)
                .patientId(100L)
                .patientName("Patient One")
                .metricType("heart_rate")
                .value("80")
                .build();

        patient = new UserDto();
        patient.setId(100L);
        patient.setFullName("Patient One");
        patient.setRole("PATIENT");
    }

    @Test
    void createHealthMetricPersistsMetricForAuthorizedPatient() {
        when(securityContext.getCurrentUserId()).thenReturn(100L);
        when(securityContext.isPatient()).thenReturn(true);
        when(userServiceClient.getUserById(100L)).thenReturn(patient);
        when(healthMetricMapper.toEntity(createDto)).thenReturn(healthMetric);
        when(healthMetricRepository.save(any(HealthMetric.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(healthMetricMapper.toDto(any(HealthMetric.class))).thenReturn(responseDto);

        HealthMetricResponseDto result = healthMetricService.createHealthMetric(createDto);

        assertThat(result).isEqualTo(responseDto);
        assertThat(healthMetric.getPatientName()).isEqualTo("Patient One");
        verify(healthMetricRepository).save(healthMetric);
    }

    @Test
    void createHealthMetricRejectsPatientCreatingForSomeoneElse() {
        when(securityContext.getCurrentUserId()).thenReturn(999L);
        when(securityContext.isPatient()).thenReturn(true);

        assertThatThrownBy(() -> healthMetricService.createHealthMetric(createDto))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Bạn chỉ có thể tạo chỉ số sức khỏe cho mình");

        verify(healthMetricRepository, never()).save(any());
    }

    @ParameterizedTest(name = "{index}: {0}={1} -> {2}")
    @MethodSource("invalidCreateCases")
    @DisplayName("Create health metric validates invalid values")
    void createHealthMetricRejectsInvalidValues(String metricType, String value, String expectedMessage) {
        when(securityContext.getCurrentUserId()).thenReturn(500L);

        HealthMetricCreateDto invalidDto = HealthMetricCreateDto.builder()
                .patientId(100L)
                .metricType(metricType)
                .value(value)
                .measuredAt(LocalDateTime.of(2026, 4, 19, 11, 0))
                .build();

        assertThatThrownBy(() -> healthMetricService.createHealthMetric(invalidDto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining(expectedMessage);

        verify(userServiceClient, never()).getUserById(any());
    }

    @Test
    void getHealthMetricByIdReturnsMetricForDoctor() {
        when(healthMetricRepository.findById(1L)).thenReturn(Optional.of(healthMetric));
        when(securityContext.getCurrentUserId()).thenReturn(300L);
        when(securityContext.isAdmin()).thenReturn(false);
        when(securityContext.isDoctor()).thenReturn(true);
        when(healthMetricMapper.toDto(healthMetric)).thenReturn(responseDto);

        HealthMetricResponseDto result = healthMetricService.getHealthMetricById(1L);

        assertThat(result).isEqualTo(responseDto);
    }

    @Test
    void getHealthMetricByIdRejectsUnauthorizedPatient() {
        when(healthMetricRepository.findById(1L)).thenReturn(Optional.of(healthMetric));
        when(securityContext.getCurrentUserId()).thenReturn(101L);
        when(securityContext.isAdmin()).thenReturn(false);
        when(securityContext.isDoctor()).thenReturn(false);
        when(securityContext.isPatient()).thenReturn(true);

        assertThatThrownBy(() -> healthMetricService.getHealthMetricById(1L))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Bạn không có quyền truy cập chỉ số sức khỏe này");
    }

    @Test
    void getHealthMetricByIdThrowsWhenMissing() {
        when(healthMetricRepository.findById(44L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> healthMetricService.getHealthMetricById(44L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Không tìm thấy chỉ số sức khỏe");
    }

    @Test
    void getHealthMetricsByPatientIdReturnsMappedPage() {
        PageRequest pageable = PageRequest.of(0, 10);
        Page<HealthMetric> page = new PageImpl<>(List.of(healthMetric), pageable, 1);

        when(securityContext.getCurrentUserId()).thenReturn(100L);
        when(securityContext.isPatient()).thenReturn(true);
        when(healthMetricRepository.findByPatientId(100L, pageable)).thenReturn(page);
        when(healthMetricMapper.toDto(healthMetric)).thenReturn(responseDto);

        Page<HealthMetricResponseDto> result = healthMetricService.getHealthMetricsByPatientId(100L, pageable);

        assertThat(result.getContent()).containsExactly(responseDto);
    }

    @Test
    void getHealthMetricsByPatientIdRejectsOtherPatients() {
        when(securityContext.getCurrentUserId()).thenReturn(101L);
        when(securityContext.isPatient()).thenReturn(true);

        assertThatThrownBy(() -> healthMetricService.getHealthMetricsByPatientId(100L, PageRequest.of(0, 5)))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Bạn chỉ có thể xem chỉ số sức khỏe của mình");
    }

    @Test
    void getHealthMetricsByPatientIdAndTypeReturnsMappedList() {
        when(securityContext.getCurrentUserId()).thenReturn(1L);
        when(healthMetricRepository.findByPatientIdAndMetricType(100L, "heart_rate")).thenReturn(List.of(healthMetric));
        when(healthMetricMapper.toDtoList(List.of(healthMetric))).thenReturn(List.of(responseDto));

        List<HealthMetricResponseDto> result =
                healthMetricService.getHealthMetricsByPatientIdAndType(100L, "heart_rate");

        assertThat(result).containsExactly(responseDto);
    }

    @Test
    void getHealthMetricsByPatientIdAndDateRangeReturnsMappedList() {
        LocalDateTime start = LocalDateTime.of(2026, 4, 1, 0, 0);
        LocalDateTime end = LocalDateTime.of(2026, 4, 30, 23, 59);

        when(securityContext.getCurrentUserId()).thenReturn(1L);
        when(healthMetricRepository.findByPatientIdAndMeasuredAtBetween(100L, start, end))
                .thenReturn(List.of(healthMetric));
        when(healthMetricMapper.toDtoList(List.of(healthMetric))).thenReturn(List.of(responseDto));

        List<HealthMetricResponseDto> result =
                healthMetricService.getHealthMetricsByPatientIdAndDateRange(100L, start, end);

        assertThat(result).containsExactly(responseDto);
    }

    @Test
    void updateHealthMetricUsesExistingMetricTypeWhenDtoTypeMissing() {
        HealthMetricUpdateDto updateDto = HealthMetricUpdateDto.builder().value("85").notes("After exercise").build();

        when(healthMetricRepository.findById(1L)).thenReturn(Optional.of(healthMetric));
        when(securityContext.getCurrentUserId()).thenReturn(999L);
        when(securityContext.isAdmin()).thenReturn(true);
        when(healthMetricRepository.save(healthMetric)).thenReturn(healthMetric);
        when(healthMetricMapper.toDto(healthMetric)).thenReturn(responseDto);

        HealthMetricResponseDto result = healthMetricService.updateHealthMetric(1L, updateDto);

        assertThat(result).isEqualTo(responseDto);
        verify(healthMetricMapper).updateEntityFromDto(updateDto, healthMetric);
    }

    @Test
    void updateHealthMetricRejectsUnauthorizedUser() {
        HealthMetricUpdateDto updateDto = HealthMetricUpdateDto.builder().value("82").build();

        when(healthMetricRepository.findById(1L)).thenReturn(Optional.of(healthMetric));
        when(securityContext.getCurrentUserId()).thenReturn(999L);
        when(securityContext.isAdmin()).thenReturn(false);

        assertThatThrownBy(() -> healthMetricService.updateHealthMetric(1L, updateDto))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Bạn không có quyền cập nhật chỉ số sức khỏe này");
    }

    @Test
    void updateHealthMetricRejectsInvalidReplacementValue() {
        HealthMetricUpdateDto updateDto = HealthMetricUpdateDto.builder().value("999").build();

        when(healthMetricRepository.findById(1L)).thenReturn(Optional.of(healthMetric));
        when(securityContext.getCurrentUserId()).thenReturn(100L);
        when(securityContext.isAdmin()).thenReturn(false);

        assertThatThrownBy(() -> healthMetricService.updateHealthMetric(1L, updateDto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Nhịp tim phải từ 20-300 bpm");
    }

    @Test
    void deleteHealthMetricDeletesOwnedMetric() {
        when(healthMetricRepository.findById(1L)).thenReturn(Optional.of(healthMetric));
        when(securityContext.getCurrentUserId()).thenReturn(100L);
        when(securityContext.isAdmin()).thenReturn(false);

        healthMetricService.deleteHealthMetric(1L);

        verify(healthMetricRepository).deleteById(1L);
    }

    @Test
    void deleteHealthMetricRejectsUnauthorizedUser() {
        when(healthMetricRepository.findById(1L)).thenReturn(Optional.of(healthMetric));
        when(securityContext.getCurrentUserId()).thenReturn(999L);
        when(securityContext.isAdmin()).thenReturn(false);

        assertThatThrownBy(() -> healthMetricService.deleteHealthMetric(1L))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Bạn không có quyền xóa chỉ số sức khỏe này");
    }

    private static Stream<Arguments> invalidCreateCases() {
        return Stream.of(
                Arguments.of("blood_pressure", "120", "Định dạng huyết áp không hợp lệ"),
                Arguments.of("blood_pressure", "80/120", "Huyết áp tâm thu phải lớn hơn huyết áp tâm trương"),
                Arguments.of("heart_rate", "abc", "Nhịp tim phải là số"),
                Arguments.of("heart_rate", "10", "Nhịp tim phải từ 20-300 bpm"),
                Arguments.of("blood_sugar", "bad", "Đường huyết phải là số"),
                Arguments.of("blood_sugar", "900", "Đường huyết phải từ 20-800 mg/dL"),
                Arguments.of("temperature", "50", "Nhiệt độ phải từ 30-45"),
                Arguments.of("weight", "0.5", "Cân nặng phải từ 1-500 kg"),
                Arguments.of("height", "500", "Chiều cao phải từ 30-300 cm"),
                Arguments.of("oxygen_saturation", "40", "SpO2 phải từ 50-100%"),
                Arguments.of("custom_metric", " ", "Giá trị chỉ số không được để trống")
        );
    }
}
