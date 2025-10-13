package com.clinicbooking.paymentservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MomoRefundResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    
    @JsonProperty("resultCode")
    private Integer resultCode;

    
    @JsonProperty("message")
    private String message;

    
    @JsonProperty("orderId")
    private String orderId;

    
    @JsonProperty("requestId")
    private String requestId;

    
    @JsonProperty("transId")
    private Long transId;

    
    @JsonProperty("refundTransId")
    private Long refundTransId;

    
    @JsonProperty("amount")
    private Long amount;

    
    @JsonProperty("partnerCode")
    private String partnerCode;

    
    @JsonProperty("responseTime")
    private Long responseTime;

    
    public boolean isSuccessful() {
        return resultCode != null && resultCode == 0;
    }

    
    public boolean isSuccess() {
        return isSuccessful();
    }

    
    public boolean hasRefundTransId() {
        return refundTransId != null;
    }
}
