package com.clinicbooking.paymentservice.util;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SignatureUtilTest {

    @Test
    void generateHmacSha256ReturnsHexDigest() {
        String signature = SignatureUtil.generateHmacSHA256("abc", "key");

        assertThat(signature).isEqualTo("9c196e32dc0175f86f4b1cb89289d6619de6bee699e4c378e68309ed97a1a6ab");
    }
}
