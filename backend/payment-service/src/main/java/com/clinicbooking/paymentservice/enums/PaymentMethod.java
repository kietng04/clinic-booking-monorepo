package com.clinicbooking.paymentservice.enums;

public enum PaymentMethod {

    // Online payment methods
    MOMO_WALLET("Ví Momo"),
    MOMO_ATM("Thẻ ATM"),
    MOMO_CREDIT("Thẻ tín dụng"),
    MOMO_QR("Quét mã QR"),

    // Counter payment methods
    CASH("Tiền mặt"),
    BANK_TRANSFER("Chuyển khoản ngân hàng"),
    CARD_AT_COUNTER("Quẹt thẻ tại quầy");

    private final String displayName;

    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Check if this payment method is online payment (via Momo gateway)
     */
    public boolean isOnlinePayment() {
        return this.name().startsWith("MOMO_");
    }

    /**
     * Check if this payment method requires receptionist confirmation
     */
    public boolean requiresReceptionistConfirmation() {
        return this == CASH || this == BANK_TRANSFER || this == CARD_AT_COUNTER;
    }

    /**
     * Get Momo request type for online payments
     * Only applicable for MOMO_* payment methods
     */
    public String getMomoRequestType() {
        return switch (this) {
            case MOMO_WALLET -> "captureWallet";
            case MOMO_ATM -> "payWithATM";
            case MOMO_CREDIT -> "payWithCredit";
            case MOMO_QR -> "payWithQRCode";
            default -> throw new IllegalStateException("Not a Momo payment method: " + this);
        };
    }

    public boolean requiresAuthentication() {
        return this == MOMO_ATM || this == MOMO_CREDIT;
    }
}
