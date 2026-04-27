package com.clinicbooking.medicalservice.event;

import com.clinicbooking.medicalservice.entity.MedicalRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MedicalRecordEventPublisherTest {

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private MedicalRecordEventPublisher publisher;

    @BeforeEach
    void setUp() {
        publisher = new MedicalRecordEventPublisher(kafkaTemplate);
        ReflectionTestUtils.setField(publisher, "medicalRecordCreatedTopic", "medical.created");
        ReflectionTestUtils.setField(publisher, "medicalRecordUpdatedTopic", "medical.updated");
    }

    @Test
    void publishMedicalRecordCreatedBuildsCreatedEvent() {
        MedicalRecord medicalRecord = sampleRecord();

        publisher.publishMedicalRecordCreated(medicalRecord);

        ArgumentCaptor<Object> eventCaptor = ArgumentCaptor.forClass(Object.class);
        verify(kafkaTemplate).send(org.mockito.Mockito.eq("medical.created"), org.mockito.Mockito.eq("12"), eventCaptor.capture());

        MedicalRecordEvent event = (MedicalRecordEvent) eventCaptor.getValue();
        assertThat(event.getMedicalRecordId()).isEqualTo(12L);
        assertThat(event.getPatientName()).isEqualTo("Patient A");
        assertThat(event.getEventType()).isEqualTo("CREATED");
    }

    @Test
    void publishMedicalRecordUpdatedBuildsUpdatedEvent() {
        MedicalRecord medicalRecord = sampleRecord();

        publisher.publishMedicalRecordUpdated(medicalRecord);

        ArgumentCaptor<Object> eventCaptor = ArgumentCaptor.forClass(Object.class);
        verify(kafkaTemplate).send(org.mockito.Mockito.eq("medical.updated"), org.mockito.Mockito.eq("12"), eventCaptor.capture());

        MedicalRecordEvent event = (MedicalRecordEvent) eventCaptor.getValue();
        assertThat(event.getDoctorId()).isEqualTo(9L);
        assertThat(event.getFollowUpDate()).isEqualTo(LocalDate.of(2026, 5, 1));
        assertThat(event.getEventType()).isEqualTo("UPDATED");
    }

    private MedicalRecord sampleRecord() {
        return MedicalRecord.builder()
                .id(12L)
                .appointmentId(30L)
                .patientId(7L)
                .doctorId(9L)
                .patientName("Patient A")
                .doctorName("Doctor B")
                .diagnosis("Flu")
                .symptoms("Cough")
                .treatmentPlan("Rest")
                .followUpDate(LocalDate.of(2026, 5, 1))
                .createdAt(LocalDateTime.of(2026, 4, 1, 9, 0))
                .updatedAt(LocalDateTime.of(2026, 4, 2, 10, 0))
                .build();
    }
}
