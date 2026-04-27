package com.clinicbooking.medicalservice.entity;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class EntityBehaviorTest {

    @Test
    void medicalRecordFollowUpHelpersReflectDatePosition() {
        MedicalRecord upcoming = MedicalRecord.builder()
                .patientId(1L)
                .doctorId(2L)
                .followUpDate(LocalDate.now().plusDays(2))
                .build();
        MedicalRecord overdue = MedicalRecord.builder()
                .patientId(1L)
                .doctorId(2L)
                .followUpDate(LocalDate.now().minusDays(2))
                .build();

        assertThat(upcoming.hasFollowUp()).isTrue();
        assertThat(upcoming.isFollowUpOverdue()).isFalse();
        assertThat(overdue.hasFollowUp()).isFalse();
        assertThat(overdue.isFollowUpOverdue()).isTrue();
    }

    @Test
    void healthMetricHelpersParseBloodPressureAndAbnormalRanges() {
        HealthMetric bloodPressure = HealthMetric.builder()
                .patientId(1L)
                .metricType("blood_pressure")
                .value("150/95")
                .measuredAt(LocalDateTime.now())
                .build();
        HealthMetric heartRate = HealthMetric.builder()
                .patientId(1L)
                .metricType("heart_rate")
                .value("120")
                .measuredAt(LocalDateTime.now())
                .build();
        HealthMetric invalid = HealthMetric.builder()
                .patientId(1L)
                .metricType("blood_pressure")
                .value("bad")
                .measuredAt(LocalDateTime.now())
                .build();

        assertThat(bloodPressure.isBloodPressure()).isTrue();
        assertThat(bloodPressure.getSystolic()).isEqualTo(150);
        assertThat(bloodPressure.getDiastolic()).isEqualTo(95);
        assertThat(bloodPressure.isAbnormal()).isTrue();
        assertThat(heartRate.isHeartRate()).isTrue();
        assertThat(heartRate.isAbnormal()).isTrue();
        assertThat(invalid.isAbnormal()).isFalse();
    }

    @Test
    void medicationBuilderAppliesDefaultsAndValueSemantics() {
        Medication medication = Medication.builder()
                .name("Paracetamol")
                .genericName("Acetaminophen")
                .category("Pain Relief")
                .build();
        Medication copy = new Medication();
        copy.setName("Paracetamol");
        copy.setGenericName("Acetaminophen");
        copy.setCategory("Pain Relief");
        copy.setUnit("viên");
        copy.setIsActive(true);

        assertThat(medication.getUnit()).isEqualTo("viên");
        assertThat(medication.getIsActive()).isTrue();
        assertThat(copy).isEqualTo(medication);
        assertThat(copy.hashCode()).isEqualTo(medication.hashCode());
    }

    @Test
    void prescriptionSupportsValueSemantics() {
        Prescription prescription = Prescription.builder()
                .id(5L)
                .medicalRecord(MedicalRecord.builder().id(10L).patientId(1L).doctorId(2L).build())
                .doctorId(2L)
                .doctorName("Doctor A")
                .medication(Medication.builder().id(7L).name("Ibuprofen").build())
                .medicationName("Ibuprofen")
                .dosage("200mg")
                .frequency("Twice daily")
                .duration("5 days")
                .instructions("After meals")
                .notes("Monitor pain")
                .build();
        Prescription copy = new Prescription();
        copy.setId(5L);
        copy.setMedicalRecord(MedicalRecord.builder().id(10L).patientId(1L).doctorId(2L).build());
        copy.setDoctorId(2L);
        copy.setDoctorName("Doctor A");
        copy.setMedication(Medication.builder().id(7L).name("Ibuprofen").build());
        copy.setMedicationName("Ibuprofen");
        copy.setDosage("200mg");
        copy.setFrequency("Twice daily");
        copy.setDuration("5 days");
        copy.setInstructions("After meals");
        copy.setNotes("Monitor pain");

        assertThat(copy).isEqualTo(prescription);
        assertThat(copy.hashCode()).isEqualTo(prescription.hashCode());
        assertThat(prescription.toString()).contains("Ibuprofen", "200mg");
    }
}
