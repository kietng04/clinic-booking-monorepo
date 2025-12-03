package com.clinicbooking.medicalservice.event;

import com.clinicbooking.medicalservice.entity.MedicalRecord;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MedicalRecordEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topics.medical-record-created}")
    private String medicalRecordCreatedTopic;

    @Value("${kafka.topics.medical-record-updated}")
    private String medicalRecordUpdatedTopic;

    public void publishMedicalRecordCreated(MedicalRecord medicalRecord) {
        MedicalRecordEvent event = buildEvent(medicalRecord, "CREATED");
        kafkaTemplate.send(medicalRecordCreatedTopic, medicalRecord.getId().toString(), event);
        log.info("Published medical record created event: medicalRecordId={}", medicalRecord.getId());
    }

    public void publishMedicalRecordUpdated(MedicalRecord medicalRecord) {
        MedicalRecordEvent event = buildEvent(medicalRecord, "UPDATED");
        kafkaTemplate.send(medicalRecordUpdatedTopic, medicalRecord.getId().toString(), event);
        log.info("Published medical record updated event: medicalRecordId={}", medicalRecord.getId());
    }

    private MedicalRecordEvent buildEvent(MedicalRecord medicalRecord, String eventType) {
        return MedicalRecordEvent.builder()
                .medicalRecordId(medicalRecord.getId())
                .appointmentId(medicalRecord.getAppointmentId())
                .patientId(medicalRecord.getPatientId())
                .doctorId(medicalRecord.getDoctorId())
                .patientName(medicalRecord.getPatientName())
                .doctorName(medicalRecord.getDoctorName())
                .diagnosis(medicalRecord.getDiagnosis())
                .symptoms(medicalRecord.getSymptoms())
                .treatmentPlan(medicalRecord.getTreatmentPlan())
                .followUpDate(medicalRecord.getFollowUpDate())
                .createdAt(medicalRecord.getCreatedAt())
                .updatedAt(medicalRecord.getUpdatedAt())
                .eventType(eventType)
                .build();
    }
}
