package com.clinicbooking.clinic_booking_system.mapper;

import com.clinicbooking.clinic_booking_system.dto.familymember.FamilyMemberCreateDto;
import com.clinicbooking.clinic_booking_system.dto.familymember.FamilyMemberResponseDto;
import com.clinicbooking.clinic_booking_system.dto.familymember.FamilyMemberUpdateDto;
import com.clinicbooking.clinic_booking_system.entity.FamilyMember;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class FamilyMemberMapper {

    public FamilyMember toEntity(FamilyMemberCreateDto dto) {
        return FamilyMember.builder()
                .fullName(dto.getFullName())
                .dateOfBirth(dto.getDateOfBirth())
                .gender(dto.getGender())
                .relationship(dto.getRelationship())
                .bloodType(dto.getBloodType())
                .height(dto.getHeight())
                .weight(dto.getWeight())
                .allergies(dto.getAllergies())
                .chronicDiseases(dto.getChronicDiseases())
                .avatarUrl(dto.getAvatarUrl())
                .isDeleted(false)
                .build();
    }

    public void updateEntity(FamilyMember member, FamilyMemberUpdateDto dto) {
        if (dto.getFullName() != null) member.setFullName(dto.getFullName());
        if (dto.getDateOfBirth() != null) member.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getGender() != null) member.setGender(dto.getGender());
        if (dto.getRelationship() != null) member.setRelationship(dto.getRelationship());
        if (dto.getBloodType() != null) member.setBloodType(dto.getBloodType());
        if (dto.getHeight() != null) member.setHeight(dto.getHeight());
        if (dto.getWeight() != null) member.setWeight(dto.getWeight());
        if (dto.getAllergies() != null) member.setAllergies(dto.getAllergies());
        if (dto.getChronicDiseases() != null) member.setChronicDiseases(dto.getChronicDiseases());
        if (dto.getAvatarUrl() != null) member.setAvatarUrl(dto.getAvatarUrl());
    }

    public FamilyMemberResponseDto toResponseDto(FamilyMember member) {
        Integer age = member.getDateOfBirth() != null ?
                LocalDate.now().getYear() - member.getDateOfBirth().getYear() : null;

        BigDecimal bmi = null;
        if (member.getHeight() != null && member.getWeight() != null &&
            member.getHeight().compareTo(BigDecimal.ZERO) > 0) {
            // BMI = weight (kg) / (height (m))^2
            BigDecimal heightInMeters = member.getHeight().divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            bmi = member.getWeight().divide(heightInMeters.multiply(heightInMeters), 2, RoundingMode.HALF_UP);
        }

        return FamilyMemberResponseDto.builder()
                .id(member.getId())
                .userId(member.getUser().getId())
                .userFullName(member.getUser().getFullName())
                .fullName(member.getFullName())
                .dateOfBirth(member.getDateOfBirth())
                .gender(member.getGender())
                .relationship(member.getRelationship())
                .bloodType(member.getBloodType())
                .height(member.getHeight())
                .weight(member.getWeight())
                .allergies(member.getAllergies())
                .chronicDiseases(member.getChronicDiseases())
                .avatarUrl(member.getAvatarUrl())
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .age(age)
                .bmi(bmi)
                .build();
    }

    public List<FamilyMemberResponseDto> toResponseDtoList(List<FamilyMember> members) {
        return members.stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }
}
