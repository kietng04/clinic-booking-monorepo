package com.clinicbooking.paymentservice.enums;

public enum PaymentMethod {
    
    MOMO_WALLET("Ví Momo"),

    
    MOMO_ATM("Thẻ ATM"),

    
    MOMO_CREDIT("Thẻ tín dụng"),

    
    MOMO_QR("Quét mã QR");

    private final String displayName;

    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }

    
    public String getDisplayName() {
        return displayName;
    }

    
    public String getMomoRequestType() {
        return switch (this) {
            case MOMO_WALLET -> "captureWallet";
            case MOMO_ATM -> "payWithATM";
            case MOMO_CREDIT -> "payWithCredit";
            case MOMO_QR -> "payWithQRCode";
        };
    }

    
    public boolean requiresAuthentication() {
        return this == MOMO_ATM || this == MOMO_CREDIT;
    }
}
