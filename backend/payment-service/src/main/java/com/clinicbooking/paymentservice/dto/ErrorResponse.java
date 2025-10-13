package com.clinicbooking.paymentservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    
    private String timestamp;

    
    private int status;

    
    private String error;

    
    private String message;

    
    private String path;

    
    private String errorCode;

    
    private Map<String, Object> details;

    
    private String correlationId;

    
    public void addDetail(String key, Object value) {
        if (this.details == null) {
            this.details = new HashMap<>();
        }
        this.details.put(key, value);
    }

    
    public static class ErrorResponseBuilder {
        
        public ErrorResponseBuilder withCurrentTimestamp() {
            this.timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            return this;
        }
    }
}
