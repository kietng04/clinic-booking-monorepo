package com.clinicbooking.clinic_booking_system.mapper;

import com.clinicbooking.clinic_booking_system.dto.aianalysis.AIAnalysisCreateDto;
import com.clinicbooking.clinic_booking_system.dto.aianalysis.AIAnalysisResponseDto;
import com.clinicbooking.clinic_booking_system.dto.aianalysis.AIAnalysisUpdateDto;
import com.clinicbooking.clinic_booking_system.entity.AIAnalysis;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class AIAnalysisMapper {

    public AIAnalysis toEntity(AIAnalysisCreateDto dto) {
        return AIAnalysis.builder()
                .analysisType(dto.getAnalysisType())
                .severity(dto.getSeverity() != null ? dto.getSeverity() : AIAnalysis.Severity.LOW)
                .inputData(dto.getInputData())
                .resultData(dto.getResultData())
                .recommendations(dto.getRecommendations())
                .build();
    }

    public void updateEntity(AIAnalysis analysis, AIAnalysisUpdateDto dto) {
        if (dto.getSeverity() != null) analysis.setSeverity(dto.getSeverity());
        if (dto.getResultData() != null) analysis.setResultData(dto.getResultData());
        if (dto.getRecommendations() != null) analysis.setRecommendations(dto.getRecommendations());
    }

    public AIAnalysisResponseDto toResponseDto(AIAnalysis analysis) {
        return AIAnalysisResponseDto.builder()
                .id(analysis.getId())
                .familyMemberId(analysis.getFamilyMember().getId())
                .familyMemberName(analysis.getFamilyMember().getFullName())
                .analysisType(analysis.getAnalysisType())
                .severity(analysis.getSeverity())
                .inputData(analysis.getInputData())
                .resultData(analysis.getResultData())
                .recommendations(analysis.getRecommendations())
                .createdAt(analysis.getCreatedAt())
                .build();
    }

    public List<AIAnalysisResponseDto> toResponseDtoList(List<AIAnalysis> analyses) {
        return analyses.stream().map(this::toResponseDto).collect(Collectors.toList());
    }
}
