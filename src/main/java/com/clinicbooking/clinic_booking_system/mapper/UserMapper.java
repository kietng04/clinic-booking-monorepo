package com.clinicbooking.clinic_booking_system.mapper;

import com.clinicbooking.clinic_booking_system.dto.user.UserCreateDto;
import com.clinicbooking.clinic_booking_system.dto.user.UserResponseDto;
import com.clinicbooking.clinic_booking_system.dto.user.UserUpdateDto;
import com.clinicbooking.clinic_booking_system.entity.User;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public User toEntity(UserCreateDto dto) {
        return User.builder()
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .fullName(dto.getFullName())
                .dateOfBirth(dto.getDateOfBirth())
                .gender(dto.getGender())
                .role(dto.getRole())
                .avatarUrl(dto.getAvatarUrl())
                .specialization(dto.getSpecialization())
                .licenseNumber(dto.getLicenseNumber())
                .workplace(dto.getWorkplace())
                .experienceYears(dto.getExperienceYears())
                .consultationFee(dto.getConsultationFee())
                .isActive(true)
                .emailVerified(false)
                .phoneVerified(false)
                .build();
    }

    public void updateEntity(User user, UserUpdateDto dto) {
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getDateOfBirth() != null) user.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getGender() != null) user.setGender(User.Gender.valueOf(dto.getGender()));
        if (dto.getAvatarUrl() != null) user.setAvatarUrl(dto.getAvatarUrl());
        if (dto.getSpecialization() != null) user.setSpecialization(dto.getSpecialization());
        if (dto.getWorkplace() != null) user.setWorkplace(dto.getWorkplace());
        if (dto.getExperienceYears() != null) user.setExperienceYears(dto.getExperienceYears());
        if (dto.getConsultationFee() != null) user.setConsultationFee(dto.getConsultationFee());
        if (dto.getIsActive() != null) user.setIsActive(dto.getIsActive());
        if (dto.getEmailVerified() != null) user.setEmailVerified(dto.getEmailVerified());
        if (dto.getPhoneVerified() != null) user.setPhoneVerified(dto.getPhoneVerified());
    }

    public UserResponseDto toResponseDto(User user) {
        Integer age = user.getDateOfBirth() != null ?
                LocalDate.now().getYear() - user.getDateOfBirth().getYear() : null;

        return UserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .phone(user.getPhone())
                .fullName(user.getFullName())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .isActive(user.getIsActive())
                .emailVerified(user.getEmailVerified())
                .phoneVerified(user.getPhoneVerified())
                .specialization(user.getSpecialization())
                .licenseNumber(user.getLicenseNumber())
                .workplace(user.getWorkplace())
                .experienceYears(user.getExperienceYears())
                .rating(user.getRating())
                .consultationFee(user.getConsultationFee())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .age(age)
                .build();
    }

    public List<UserResponseDto> toResponseDtoList(List<User> users) {
        return users.stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }
}
