package com.clinicbooking.appointmentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientDemographicsDto {
    private List<AgeDistributionItem> ageDistribution;
    private List<GenderRatioItem> genderRatio;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgeDistributionItem {
        private String range;
        private Integer count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenderRatioItem {
        private String gender;
        private Integer count;
        private Integer percentage;
    }
}
