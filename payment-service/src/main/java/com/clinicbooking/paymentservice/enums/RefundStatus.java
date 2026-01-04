package com.clinicbooking.paymentservice.enums;

public enum RefundStatus {
    
    PENDING("Chờ xử lý"),

    
    COMPLETED("Hoàn tất"),

    
    FAILED("Thất bại");

    private final String displayName;

    RefundStatus(String displayName) {
        this.displayName = displayName;
    }

    
    public String getDisplayName() {
        return displayName;
    }

    
    public boolean isTerminal() {
        return this == COMPLETED || this == FAILED;
    }

    
    public boolean isPending() {
        return this == PENDING;
    }

    
    public boolean isSuccessful() {
        return this == COMPLETED;
    }
}
