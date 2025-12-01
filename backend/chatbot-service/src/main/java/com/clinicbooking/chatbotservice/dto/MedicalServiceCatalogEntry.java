package com.clinicbooking.chatbotservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MedicalServiceCatalogEntry(
        Long id,
        Long clinicId,
        String name,
        String category,
        Boolean isActive,
        BigDecimal currentPrice
) {
}
