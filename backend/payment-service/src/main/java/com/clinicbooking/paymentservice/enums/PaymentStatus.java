package com.clinicbooking.paymentservice.enums;

public enum PaymentStatus {
    
    PENDING("Chờ thanh toán"),

    
    PROCESSING("Đang xử lý"),

    
    COMPLETED("Hoàn tất"),

    
    FAILED("Thất bại"),

    
    EXPIRED("Hết hạn"),

    
    REFUNDED("Hoàn tiền"),

    
    PARTIALLY_REFUNDED("Hoàn tiền một phần");

    private final String displayName;

    PaymentStatus(String displayName) {
        this.displayName = displayName;
    }

    
    public String getDisplayName() {
        return displayName;
    }

    
    public boolean isTerminal() {
        return this == COMPLETED || this == FAILED || this == EXPIRED ||
               this == REFUNDED || this == PARTIALLY_REFUNDED;
    }

    
    public boolean isSuccessful() {
        return this == COMPLETED;
    }

    
    public boolean isFailed() {
        return this == FAILED || this == EXPIRED;
    }
}
