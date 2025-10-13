package com.clinicbooking.appointmentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientDemographicsDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private List<AgeDistributionItem> ageDistribution;
    private List<GenderRatioItem> genderRatio;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgeDistributionItem implements Serializable {
        private static final long serialVersionUID = 1L;

        private String range;
        private Integer count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenderRatioItem implements Serializable {
        private static final long serialVersionUID = 1L;

        private String gender;
        private Integer count;
        private Integer percentage;
    }
}
