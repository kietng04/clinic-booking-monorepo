package com.clinicbooking.clinic_booking_system.mapper;

import com.clinicbooking.clinic_booking_system.dto.medicalrecord.MedicalRecordCreateDto;
import com.clinicbooking.clinic_booking_system.dto.medicalrecord.MedicalRecordResponseDto;
import com.clinicbooking.clinic_booking_system.dto.medicalrecord.MedicalRecordUpdateDto;
import com.clinicbooking.clinic_booking_system.entity.MedicalRecord;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class MedicalRecordMapper {

    public MedicalRecord toEntity(MedicalRecordCreateDto dto) {
        return MedicalRecord.builder()
                .diagnosis(dto.getDiagnosis())
                .symptoms(dto.getSymptoms())
                .treatmentPlan(dto.getTreatmentPlan())
                .followUpDate(dto.getFollowUpDate())
                .attachments(dto.getAttachments())
                .build();
    }

    public void updateEntity(MedicalRecord record, MedicalRecordUpdateDto dto) {
        if (dto.getDiagnosis() != null) record.setDiagnosis(dto.getDiagnosis());
        if (dto.getSymptoms() != null) record.setSymptoms(dto.getSymptoms());
        if (dto.getTreatmentPlan() != null) record.setTreatmentPlan(dto.getTreatmentPlan());
        if (dto.getFollowUpDate() != null) record.setFollowUpDate(dto.getFollowUpDate());
        if (dto.getAttachments() != null) record.setAttachments(dto.getAttachments());
    }

    public MedicalRecordResponseDto toResponseDto(MedicalRecord record) {
        return MedicalRecordResponseDto.builder()
                .id(record.getId())
                .appointmentId(record.getAppointment() != null ? record.getAppointment().getId() : null)
                .familyMemberId(record.getFamilyMember().getId())
                .familyMemberName(record.getFamilyMember().getFullName())
                .doctorId(record.getDoctor().getId())
                .doctorName(record.getDoctor().getFullName())
                .diagnosis(record.getDiagnosis())
                .symptoms(record.getSymptoms())
                .treatmentPlan(record.getTreatmentPlan())
                .followUpDate(record.getFollowUpDate())
                .attachments(record.getAttachments())
                .createdAt(record.getCreatedAt())
                .build();
    }

    public List<MedicalRecordResponseDto> toResponseDtoList(List<MedicalRecord> records) {
        return records.stream().map(this::toResponseDto).collect(Collectors.toList());
    }
}
