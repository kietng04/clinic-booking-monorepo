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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class HealthMetricServiceImpl implements HealthMetricService {

    private final HealthMetricRepository healthMetricRepository;
    private final HealthMetricMapper healthMetricMapper;
    private final UserServiceClient userServiceClient;
    private final SecurityContext securityContext;

    // Validation patterns for metric values
    private static final Pattern BLOOD_PRESSURE_PATTERN = Pattern.compile("^\\d{2,3}/\\d{2,3}$");
    private static final Pattern NUMERIC_PATTERN = Pattern.compile("^\\d+(\\.\\d+)?$");

    @Override
    @Transactional
    public HealthMetricResponseDto createHealthMetric(HealthMetricCreateDto dto) {
        log.info("Creating health metric for patient ID: {}", dto.getPatientId());

        // Authorization: Patient can create their own, doctors can create for patients
        Long currentUserId = securityContext.getCurrentUserId();
        if (securityContext.isPatient() && !dto.getPatientId().equals(currentUserId)) {
            throw new AccessDeniedException("Bạn chỉ có thể tạo chỉ số sức khỏe cho mình");
        }

        // Validate metric value format
        validateMetricValue(dto.getMetricType(), dto.getValue());

        // Fetch patient information
        UserDto patient = userServiceClient.getUserById(dto.getPatientId());

        // Create health metric
        HealthMetric healthMetric = healthMetricMapper.toEntity(dto);
        healthMetric.setPatientName(patient.getFullName());

        healthMetric = healthMetricRepository.save(healthMetric);
        log.info("Health metric created with ID: {}", healthMetric.getId());

        return healthMetricMapper.toDto(healthMetric);
    }

    @Override
    @Transactional(readOnly = true)
    public HealthMetricResponseDto getHealthMetricById(Long id) {
        log.info("Fetching health metric with ID: {}", id);
        HealthMetric healthMetric = healthMetricRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chỉ số sức khỏe"));

        // Authorization check
        checkReadAccess(healthMetric);

        return healthMetricMapper.toDto(healthMetric);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HealthMetricResponseDto> getHealthMetricsByPatientId(Long patientId, Pageable pageable) {
        log.info("Fetching health metrics for patient ID: {}", patientId);

        // Authorization: Patient can only see their own, doctors/admins can see all
        Long currentUserId = securityContext.getCurrentUserId();
        if (securityContext.isPatient() && !patientId.equals(currentUserId)) {
            throw new AccessDeniedException("Bạn chỉ có thể xem chỉ số sức khỏe của mình");
        }

        Page<HealthMetric> healthMetrics = healthMetricRepository.findByPatientId(patientId, pageable);
        return healthMetrics.map(healthMetricMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HealthMetricResponseDto> getHealthMetricsByPatientIdAndType(Long patientId, String metricType) {
        log.info("Fetching health metrics for patient ID: {} and type: {}", patientId, metricType);

        // Authorization check
        Long currentUserId = securityContext.getCurrentUserId();
        if (securityContext.isPatient() && !patientId.equals(currentUserId)) {
            throw new AccessDeniedException("Bạn chỉ có thể xem chỉ số sức khỏe của mình");
        }

        List<HealthMetric> healthMetrics = healthMetricRepository.findByPatientIdAndMetricType(patientId, metricType);
        return healthMetricMapper.toDtoList(healthMetrics);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HealthMetricResponseDto> getHealthMetricsByPatientIdAndDateRange(
            Long patientId, LocalDateTime start, LocalDateTime end) {
        log.info("Fetching health metrics for patient ID: {} between {} and {}", patientId, start, end);

        // Authorization check
        Long currentUserId = securityContext.getCurrentUserId();
        if (securityContext.isPatient() && !patientId.equals(currentUserId)) {
            throw new AccessDeniedException("Bạn chỉ có thể xem chỉ số sức khỏe của mình");
        }

        List<HealthMetric> healthMetrics = healthMetricRepository.findByPatientIdAndMeasuredAtBetween(
                patientId, start, end);
        return healthMetricMapper.toDtoList(healthMetrics);
    }

    @Override
    @Transactional
    public HealthMetricResponseDto updateHealthMetric(Long id, HealthMetricUpdateDto dto) {
        log.info("Updating health metric with ID: {}", id);

        HealthMetric healthMetric = healthMetricRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chỉ số sức khỏe"));

        // Authorization: Only the patient or admin can update
        Long currentUserId = securityContext.getCurrentUserId();
        if (!securityContext.isAdmin() && !healthMetric.getPatientId().equals(currentUserId)) {
            throw new AccessDeniedException("Bạn không có quyền cập nhật chỉ số sức khỏe này");
        }

        // Validate metric value if provided
        String metricType = dto.getMetricType() != null ? dto.getMetricType() : healthMetric.getMetricType();
        if (dto.getValue() != null) {
            validateMetricValue(metricType, dto.getValue());
        }

        healthMetricMapper.updateEntityFromDto(dto, healthMetric);
        healthMetric = healthMetricRepository.save(healthMetric);
        log.info("Health metric updated successfully: {}", id);

        return healthMetricMapper.toDto(healthMetric);
    }

    @Override
    @Transactional
    public void deleteHealthMetric(Long id) {
        log.info("Deleting health metric with ID: {}", id);

        HealthMetric healthMetric = healthMetricRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chỉ số sức khỏe"));

        // Authorization: Only the patient or admin can delete
        Long currentUserId = securityContext.getCurrentUserId();
        if (!securityContext.isAdmin() && !healthMetric.getPatientId().equals(currentUserId)) {
            throw new AccessDeniedException("Bạn không có quyền xóa chỉ số sức khỏe này");
        }

        healthMetricRepository.deleteById(id);
        log.info("Health metric deleted with ID: {}", id);
    }

    private void checkReadAccess(HealthMetric healthMetric) {
        Long currentUserId = securityContext.getCurrentUserId();

        // Admin can access all
        if (securityContext.isAdmin()) {
            return;
        }

        // Doctor can access all patient metrics
        if (securityContext.isDoctor()) {
            return;
        }

        // Patient can only access their own
        if (securityContext.isPatient() && healthMetric.getPatientId().equals(currentUserId)) {
            return;
        }

        throw new AccessDeniedException("Bạn không có quyền truy cập chỉ số sức khỏe này");
    }

    private void validateMetricValue(String metricType, String value) {
        if (metricType == null || value == null) {
            return;
        }

        switch (metricType.toLowerCase()) {
            case "blood_pressure" -> {
                if (!BLOOD_PRESSURE_PATTERN.matcher(value).matches()) {
                    throw new ValidationException("Định dạng huyết áp không hợp lệ. Vui lòng nhập theo định dạng: 120/80");
                }
                // Validate ranges
                String[] parts = value.split("/");
                int systolic = Integer.parseInt(parts[0]);
                int diastolic = Integer.parseInt(parts[1]);
                if (systolic < 50 || systolic > 300 || diastolic < 30 || diastolic > 200) {
                    throw new ValidationException("Giá trị huyết áp nằm ngoài phạm vi cho phép");
                }
                if (systolic <= diastolic) {
                    throw new ValidationException("Huyết áp tâm thu phải lớn hơn huyết áp tâm trương");
                }
            }
            case "heart_rate" -> {
                if (!NUMERIC_PATTERN.matcher(value).matches()) {
                    throw new ValidationException("Nhịp tim phải là số");
                }
                int heartRate = Integer.parseInt(value);
                if (heartRate < 20 || heartRate > 300) {
                    throw new ValidationException("Nhịp tim phải từ 20-300 bpm");
                }
            }
            case "blood_sugar" -> {
                if (!NUMERIC_PATTERN.matcher(value).matches()) {
                    throw new ValidationException("Đường huyết phải là số");
                }
                double bloodSugar = Double.parseDouble(value);
                if (bloodSugar < 20 || bloodSugar > 800) {
                    throw new ValidationException("Đường huyết phải từ 20-800 mg/dL");
                }
            }
            case "temperature" -> {
                if (!NUMERIC_PATTERN.matcher(value).matches()) {
                    throw new ValidationException("Nhiệt độ phải là số");
                }
                double temp = Double.parseDouble(value);
                if (temp < 30 || temp > 45) {
                    throw new ValidationException("Nhiệt độ phải từ 30-45°C");
                }
            }
            case "weight" -> {
                if (!NUMERIC_PATTERN.matcher(value).matches()) {
                    throw new ValidationException("Cân nặng phải là số");
                }
                double weight = Double.parseDouble(value);
                if (weight < 1 || weight > 500) {
                    throw new ValidationException("Cân nặng phải từ 1-500 kg");
                }
            }
            case "height" -> {
                if (!NUMERIC_PATTERN.matcher(value).matches()) {
                    throw new ValidationException("Chiều cao phải là số");
                }
                double height = Double.parseDouble(value);
                if (height < 30 || height > 300) {
                    throw new ValidationException("Chiều cao phải từ 30-300 cm");
                }
            }
            case "oxygen_saturation" -> {
                if (!NUMERIC_PATTERN.matcher(value).matches()) {
                    throw new ValidationException("SpO2 phải là số");
                }
                double spo2 = Double.parseDouble(value);
                if (spo2 < 50 || spo2 > 100) {
                    throw new ValidationException("SpO2 phải từ 50-100%");
                }
            }
            default -> {
                // For unknown metric types, just ensure it's not empty
                if (value.isBlank()) {
                    throw new ValidationException("Giá trị chỉ số không được để trống");
                }
            }
        }
    }
}
