package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.AppointmentCreateDto;
import com.clinicbooking.appointmentservice.dto.AppointmentFeedbackDto;
import com.clinicbooking.appointmentservice.dto.AppointmentPaymentLinkDto;
import com.clinicbooking.appointmentservice.dto.AppointmentRescheduleDto;
import com.clinicbooking.appointmentservice.dto.AppointmentResponseDto;
import com.clinicbooking.appointmentservice.dto.AppointmentUpdateDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface AppointmentService {
    AppointmentResponseDto createAppointment(AppointmentCreateDto dto);
    AppointmentResponseDto getAppointmentById(Long id);
    AppointmentResponseDto updateAppointment(Long id, AppointmentUpdateDto dto);
    void deleteAppointment(Long id);
    Page<AppointmentResponseDto> getAppointmentsByPatient(Long patientId, Pageable pageable);
    Page<AppointmentResponseDto> getAppointmentsByDoctor(Long doctorId, Pageable pageable);
    AppointmentResponseDto confirmAppointment(Long id);
    AppointmentResponseDto cancelAppointment(Long id, String reason);
    AppointmentResponseDto rescheduleAppointment(Long id, AppointmentRescheduleDto dto);
    AppointmentResponseDto checkInAppointment(Long id);
    AppointmentResponseDto completeAppointment(Long id);
    AppointmentResponseDto linkPaymentToAppointment(Long id, AppointmentPaymentLinkDto dto);
    AppointmentResponseDto markPaymentCompleted(Long appointmentId, String paymentOrderId, String paymentMethod, LocalDateTime paidAt);
    AppointmentResponseDto submitFeedback(Long appointmentId, Long patientId, AppointmentFeedbackDto dto);
    Page<AppointmentResponseDto> searchAppointments(Long patientId, Long doctorId, String status, LocalDate fromDate, LocalDate toDate, Pageable pageable);
}
