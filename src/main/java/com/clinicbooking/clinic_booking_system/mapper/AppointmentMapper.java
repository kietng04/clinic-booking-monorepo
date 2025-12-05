package com.clinicbooking.clinic_booking_system.mapper;

import com.clinicbooking.clinic_booking_system.dto.appointment.AppointmentCreateDto;
import com.clinicbooking.clinic_booking_system.dto.appointment.AppointmentResponseDto;
import com.clinicbooking.clinic_booking_system.dto.appointment.AppointmentUpdateDto;
import com.clinicbooking.clinic_booking_system.entity.Appointment;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class AppointmentMapper {

    public Appointment toEntity(AppointmentCreateDto dto) {
        return Appointment.builder()
                .appointmentDate(dto.getAppointmentDate())
                .appointmentTime(dto.getAppointmentTime())
                .durationMinutes(dto.getDurationMinutes() != null ? dto.getDurationMinutes() : 30)
                .type(dto.getType())
                .symptoms(dto.getSymptoms())
                .notes(dto.getNotes())
                .priority(dto.getPriority() != null ? dto.getPriority() : Appointment.Priority.NORMAL)
                .status(Appointment.AppointmentStatus.PENDING)
                .build();
    }

    public void updateEntity(Appointment appointment, AppointmentUpdateDto dto) {
        if (dto.getAppointmentDate() != null) appointment.setAppointmentDate(dto.getAppointmentDate());
        if (dto.getAppointmentTime() != null) appointment.setAppointmentTime(dto.getAppointmentTime());
        if (dto.getDurationMinutes() != null) appointment.setDurationMinutes(dto.getDurationMinutes());
        if (dto.getStatus() != null) appointment.setStatus(dto.getStatus());
        if (dto.getSymptoms() != null) appointment.setSymptoms(dto.getSymptoms());
        if (dto.getNotes() != null) appointment.setNotes(dto.getNotes());
        if (dto.getCancelReason() != null) appointment.setCancelReason(dto.getCancelReason());
    }

    public AppointmentResponseDto toResponseDto(Appointment appointment) {
        String familyMemberName = null;
        if (appointment.getFamilyMember() != null) {
            familyMemberName = appointment.getFamilyMember().getFullName();
        }

        return AppointmentResponseDto.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatient().getFullName())
                .doctorId(appointment.getDoctor().getId())
                .doctorName(appointment.getDoctor().getFullName())
                .doctorSpecialization(appointment.getDoctor().getSpecialization())
                .familyMemberId(appointment.getFamilyMember() != null ? appointment.getFamilyMember().getId() : null)
                .familyMemberName(familyMemberName)
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .durationMinutes(appointment.getDurationMinutes())
                .type(appointment.getType())
                .status(appointment.getStatus())
                .symptoms(appointment.getSymptoms())
                .notes(appointment.getNotes())
                .cancelReason(appointment.getCancelReason())
                .priority(appointment.getPriority())
                .createdAt(appointment.getCreatedAt())
                .updatedAt(appointment.getUpdatedAt())
                .build();
    }

    public List<AppointmentResponseDto> toResponseDtoList(List<Appointment> appointments) {
        return appointments.stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }
}
