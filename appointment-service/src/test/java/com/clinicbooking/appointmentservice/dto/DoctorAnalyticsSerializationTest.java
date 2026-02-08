package com.clinicbooking.appointmentservice.dto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.ObjectOutputStream;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThatCode;

@DisplayName("Doctor Analytics Serialization Tests")
class DoctorAnalyticsSerializationTest {

    @Test
    @DisplayName("Doctor analytics dashboard DTO graph should be serializable")
    void doctorAnalyticsDashboardDtoShouldBeSerializable() {
        DoctorAnalyticsDashboardDto dto = DoctorAnalyticsDashboardDto.builder()
                .appointments(List.of(MonthlyAppointmentDto.builder()
                        .month("2026-02")
                        .count(12)
                        .completed(9)
                        .build()))
                .appointmentTypes(List.of(AppointmentTypeBreakdownDto.builder()
                        .name("IN_PERSON")
                        .value(8)
                        .count(8)
                        .build()))
                .timeSlots(List.of(TimeSlotStatsDto.builder()
                        .time("09:00")
                        .bookings(5)
                        .build()))
                .patientDemographics(PatientDemographicsDto.builder()
                        .genderRatio(List.of(PatientDemographicsDto.GenderRatioItem.builder()
                                .gender("FEMALE")
                                .count(12)
                                .percentage(60)
                                .build()))
                        .ageDistribution(List.of(PatientDemographicsDto.AgeDistributionItem.builder()
                                .range("18-30")
                                .count(7)
                                .build()))
                        .build())
                .generatedAt(LocalDateTime.now())
                .build();

        assertThatCode(() -> {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            ObjectOutputStream out = new ObjectOutputStream(bos);
            out.writeObject(dto);
            out.flush();
        }).doesNotThrowAnyException();
    }
}
