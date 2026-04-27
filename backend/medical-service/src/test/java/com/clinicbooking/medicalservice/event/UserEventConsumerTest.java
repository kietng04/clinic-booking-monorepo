package com.clinicbooking.medicalservice.event;

import com.clinicbooking.medicalservice.entity.HealthMetric;
import com.clinicbooking.medicalservice.entity.MedicalRecord;
import com.clinicbooking.medicalservice.repository.HealthMetricRepository;
import com.clinicbooking.medicalservice.repository.MedicalRecordRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserEventConsumerTest {

    @Mock
    private MedicalRecordRepository medicalRecordRepository;

    @Mock
    private HealthMetricRepository healthMetricRepository;

    @InjectMocks
    private UserEventConsumer userEventConsumer;

    @Test
    void handleUserUpdatedRefreshesDenormalizedNames() {
        MedicalRecord patientRecord = MedicalRecord.builder().id(1L).patientId(100L).patientName("Old Patient").build();
        MedicalRecord doctorRecord = MedicalRecord.builder().id(2L).doctorId(100L).doctorName("Old Doctor").build();
        HealthMetric metric = HealthMetric.builder().id(3L).patientId(100L).patientName("Old Patient").build();
        UserEvent event = UserEvent.builder().userId(100L).fullName("New Full Name").build();

        when(medicalRecordRepository.findByPatientId(100L, Pageable.unpaged()))
                .thenReturn(new PageImpl<>(List.of(patientRecord)));
        when(medicalRecordRepository.findByDoctorId(100L, Pageable.unpaged()))
                .thenReturn(new PageImpl<>(List.of(doctorRecord)));
        when(healthMetricRepository.findByPatientId(100L, Pageable.unpaged()))
                .thenReturn(new PageImpl<>(List.of(metric)));

        userEventConsumer.handleUserUpdated(event);

        assertThat(patientRecord.getPatientName()).isEqualTo("New Full Name");
        assertThat(doctorRecord.getDoctorName()).isEqualTo("New Full Name");
        assertThat(metric.getPatientName()).isEqualTo("New Full Name");
        verify(medicalRecordRepository).saveAll(List.of(patientRecord));
        verify(medicalRecordRepository).saveAll(List.of(doctorRecord));
        verify(healthMetricRepository).saveAll(List.of(metric));
    }

    @Test
    void handleUserDeletedAnonymizesPatientData() {
        MedicalRecord patientRecord = MedicalRecord.builder().id(4L).patientId(200L).patientName("Will Remove").build();
        HealthMetric metric = HealthMetric.builder().id(5L).patientId(200L).patientName("Will Remove").build();
        UserEvent event = UserEvent.builder().userId(200L).build();

        when(medicalRecordRepository.findByPatientId(200L, Pageable.unpaged()))
                .thenReturn(new PageImpl<>(List.of(patientRecord)));
        when(healthMetricRepository.findByPatientId(200L, Pageable.unpaged()))
                .thenReturn(new PageImpl<>(List.of(metric)));

        userEventConsumer.handleUserDeleted(event);

        assertThat(patientRecord.getPatientName()).isEqualTo("Đã xóa");
        assertThat(metric.getPatientName()).isEqualTo("Đã xóa");
        verify(medicalRecordRepository).saveAll(any());
        verify(healthMetricRepository).saveAll(any());
    }
}
