package com.clinicbooking.clinic_booking_system.dto.aianalysis;

import com.clinicbooking.clinic_booking_system.entity.AIAnalysis;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIAnalysisCreateDto {
    @NotNull
    private Long familyMemberId;
    @NotNull
    private String analysisType;
    private AIAnalysis.Severity severity;
    private String inputData;
    private String resultData;
    private String recommendations;
}
