package com.clinicbooking.clinic_booking_system.mapper;

import com.clinicbooking.clinic_booking_system.dto.consultation.ConsultationCreateDto;
import com.clinicbooking.clinic_booking_system.dto.consultation.ConsultationResponseDto;
import com.clinicbooking.clinic_booking_system.dto.consultation.ConsultationUpdateDto;
import com.clinicbooking.clinic_booking_system.entity.Consultation;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ConsultationMapper {

    public Consultation toEntity(ConsultationCreateDto dto) {
        return Consultation.builder()
                .type(dto.getType())
                .status(Consultation.ConsultationStatus.PENDING)
                .build();
    }

    public void updateEntity(Consultation consultation, ConsultationUpdateDto dto) {
        if (dto.getStatus() != null) consultation.setStatus(dto.getStatus());
        if (dto.getRecordingUrl() != null) consultation.setRecordingUrl(dto.getRecordingUrl());
        if (dto.getSummary() != null) consultation.setSummary(dto.getSummary());
    }

    public ConsultationResponseDto toResponseDto(Consultation consultation) {
        String familyMemberName = null;
        if (consultation.getFamilyMember() != null) {
            familyMemberName = consultation.getFamilyMember().getFullName();
        }

        return ConsultationResponseDto.builder()
                .id(consultation.getId())
                .patientId(consultation.getPatient().getId())
                .patientName(consultation.getPatient().getFullName())
                .doctorId(consultation.getDoctor().getId())
                .doctorName(consultation.getDoctor().getFullName())
                .familyMemberId(consultation.getFamilyMember() != null ? consultation.getFamilyMember().getId() : null)
                .familyMemberName(familyMemberName)
                .type(consultation.getType())
                .status(consultation.getStatus())
                .startedAt(consultation.getStartedAt())
                .endedAt(consultation.getEndedAt())
                .recordingUrl(consultation.getRecordingUrl())
                .summary(consultation.getSummary())
                .createdAt(consultation.getCreatedAt())
                .build();
    }

    public List<ConsultationResponseDto> toResponseDtoList(List<Consultation> consultations) {
        return consultations.stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }
}
