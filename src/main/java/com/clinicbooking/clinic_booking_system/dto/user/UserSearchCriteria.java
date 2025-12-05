package com.clinicbooking.clinic_booking_system.dto.user;

import com.clinicbooking.clinic_booking_system.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchCriteria {
    private String email;
    private String phone;
    private String fullName;
    private User.UserRole role;
    private User.Gender gender;
    private Boolean isActive;
    private String specialization;
    private BigDecimal minRating;
    private BigDecimal maxConsultationFee;
}
