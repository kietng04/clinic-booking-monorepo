package com.clinicbooking.appointmentservice.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentCreateDto {

    @NotNull(message = "ID bệnh nhân không được để trống")
    private Long patientId;

    @NotNull(message = "ID bác sĩ không được để trống")
    private Long doctorId;

    private Long familyMemberId;
    private Long clinicId;
    private Long roomId;
    private Long serviceId;
    private BigDecimal serviceFee;

    @NotNull(message = "Ngày khám không được để trống")
    @Future(message = "Ngày khám phải là ngày trong tương lai")
    private LocalDate appointmentDate;

    @NotNull(message = "Giờ khám không được để trống")
    private LocalTime appointmentTime;

    private Integer durationMinutes;

    private String type; // IN_PERSON, ONLINE

    private String symptoms;

    private String notes;

    private String priority; // NORMAL, URGENT
}
