package com.clinicbooking.chatbotservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MedicalServiceCatalogPageResponse(
        List<MedicalServiceCatalogEntry> content,
        long totalElements
) {
}
