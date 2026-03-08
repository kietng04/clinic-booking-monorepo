package com.clinicbooking.appointmentservice.mapper;

import com.clinicbooking.appointmentservice.dto.AppointmentCreateDto;
import com.clinicbooking.appointmentservice.dto.AppointmentResponseDto;
import com.clinicbooking.appointmentservice.entity.Appointment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "patientName", ignore = true)
    @Mapping(target = "doctorName", ignore = true)
    @Mapping(target = "patientPhone", ignore = true)
    @Mapping(target = "familyMemberName", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "cancelReason", ignore = true)
    @Mapping(target = "patientRating", ignore = true)
    @Mapping(target = "patientReview", ignore = true)
    @Mapping(target = "reviewedAt", ignore = true)
    @Mapping(target = "paymentOrderId", ignore = true)
    @Mapping(target = "paymentStatus", ignore = true)
    @Mapping(target = "paymentMethod", ignore = true)
    @Mapping(target = "paymentExpiresAt", ignore = true)
    @Mapping(target = "paymentCompletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Appointment toEntity(AppointmentCreateDto dto);

    @Mapping(target = "type", expression = "java(appointment.getType() != null ? appointment.getType().toString() : null)")
    @Mapping(target = "status", expression = "java(appointment.getStatus() != null ? appointment.getStatus().toString() : null)")
    @Mapping(target = "priority", expression = "java(appointment.getPriority() != null ? appointment.getPriority().toString() : null)")
    AppointmentResponseDto toDto(Appointment appointment);
}
