package com.clinicbooking.medicalservice.event;

import com.clinicbooking.medicalservice.entity.HealthMetric;
import com.clinicbooking.medicalservice.entity.MedicalRecord;
import com.clinicbooking.medicalservice.repository.HealthMetricRepository;
import com.clinicbooking.medicalservice.repository.MedicalRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventConsumer {

    private final MedicalRecordRepository medicalRecordRepository;
    private final HealthMetricRepository healthMetricRepository;

    @KafkaListener(topics = "${kafka.topics.user-updated}", groupId = "${spring.kafka.consumer.group-id}")
    @Transactional
    public void handleUserUpdated(UserEvent event) {
        log.info("Received user updated event: userId={}", event.getUserId());

        // Update denormalized patient name in medical records
        List<MedicalRecord> patientRecords = medicalRecordRepository.findByPatientId(event.getUserId(), org.springframework.data.domain.Pageable.unpaged()).getContent();
        patientRecords.forEach(record -> record.setPatientName(event.getFullName()));
        medicalRecordRepository.saveAll(patientRecords);

        // Update denormalized doctor name in medical records
        List<MedicalRecord> doctorRecords = medicalRecordRepository.findByDoctorId(event.getUserId(), org.springframework.data.domain.Pageable.unpaged()).getContent();
        doctorRecords.forEach(record -> record.setDoctorName(event.getFullName()));
        medicalRecordRepository.saveAll(doctorRecords);

        // Update denormalized patient name in health metrics
        List<HealthMetric> healthMetrics = healthMetricRepository.findByPatientId(event.getUserId(), org.springframework.data.domain.Pageable.unpaged()).getContent();
        healthMetrics.forEach(metric -> metric.setPatientName(event.getFullName()));
        healthMetricRepository.saveAll(healthMetrics);

        log.info("Updated denormalized user data: userId={}", event.getUserId());
    }

    @KafkaListener(topics = "${kafka.topics.user-deleted}", groupId = "${spring.kafka.consumer.group-id}")
    @Transactional
    public void handleUserDeleted(UserEvent event) {
        log.info("Received user deleted event: userId={}", event.getUserId());

        // When a user is deleted, we might want to anonymize their data
        // rather than delete it (for medical record retention requirements)
        List<MedicalRecord> patientRecords = medicalRecordRepository.findByPatientId(event.getUserId(), org.springframework.data.domain.Pageable.unpaged()).getContent();
        patientRecords.forEach(record -> record.setPatientName("Đã xóa"));
        medicalRecordRepository.saveAll(patientRecords);

        List<HealthMetric> healthMetrics = healthMetricRepository.findByPatientId(event.getUserId(), org.springframework.data.domain.Pageable.unpaged()).getContent();
        healthMetrics.forEach(metric -> metric.setPatientName("Đã xóa"));
        healthMetricRepository.saveAll(healthMetrics);

        log.info("Anonymized medical records for deleted user: userId={}", event.getUserId());
    }
}
