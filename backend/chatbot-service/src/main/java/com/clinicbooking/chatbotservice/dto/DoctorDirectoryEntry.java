package com.clinicbooking.chatbotservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record DoctorDirectoryEntry(
        Long id,
        String fullName,
        String specialization,
        String workplace,
        BigDecimal rating,
        BigDecimal consultationFee
) {
}
