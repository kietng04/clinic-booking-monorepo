package com.clinicbooking.chatbotservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record DoctorSearchResponse(
        List<DoctorDirectoryEntry> content,
        long totalElements
) {
}
