package com.clinicbooking.clinic_booking_system.dto.aianalysis;

import com.clinicbooking.clinic_booking_system.entity.AIAnalysis;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIAnalysisResponseDto {
    private Long id;
    private Long familyMemberId;
    private String familyMemberName;
    private String analysisType;
    private AIAnalysis.Severity severity;
    private String inputData;
    private String resultData;
    private String recommendations;
    private LocalDateTime createdAt;
}
