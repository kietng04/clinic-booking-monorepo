package com.clinicbooking.clinic_booking_system.dto.aianalysis;

import com.clinicbooking.clinic_booking_system.entity.AIAnalysis;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIAnalysisUpdateDto {
    private AIAnalysis.Severity severity;
    private String resultData;
    private String recommendations;
}
