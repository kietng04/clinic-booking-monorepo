package com.clinicbooking.paymentservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MomoCallbackResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    
    @JsonProperty("resultCode")
    private Integer resultCode;

    
    @JsonProperty("message")
    private String message;

    
    @JsonProperty("orderId")
    private String orderId;

    
    @JsonProperty("transId")
    private Long transactionId;

    
    @JsonProperty("requestId")
    private String requestId;

    
    @JsonProperty("amount")
    private Long amount;

    
    @JsonProperty("partnerCode")
    private String partnerCode;

    
    @JsonProperty("orderType")
    private String orderType;

    
    @JsonProperty("orderInfo")
    private String orderInfo;

    
    @JsonProperty("payType")
    private String payType;

    
    @JsonProperty("extraData")
    private String extraData;

    
    @JsonProperty("responseTime")
    private String responseTime;

    
    @JsonProperty("signature")
    private String signature;

    
    private LocalDateTime processedAt;

    
    private Boolean signatureVerified;

    
    private Boolean alreadyProcessed;

    
    public boolean isSuccessful() {
        return resultCode != null && resultCode == 0;
    }

    
    public boolean isFailed() {
        return resultCode != null && resultCode != 0;
    }

    
    public boolean isAuthenticated() {
        return Boolean.TRUE.equals(signatureVerified);
    }
}
