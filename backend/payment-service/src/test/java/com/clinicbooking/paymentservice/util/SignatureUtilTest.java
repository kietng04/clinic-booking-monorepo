package com.clinicbooking.paymentservice.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("SignatureUtil Tests")
class SignatureUtilTest {

    @Test
    @DisplayName("Should generate lowercase hex HMAC SHA256 signature")
    void shouldGenerateLowercaseHexSignature() {
        String data = "accessKey=test&amount=200000";
        String secret = "secret-key";

        String signature = SignatureUtil.generateHmacSHA256(data, secret);

        assertThat(signature)
                .matches("^[0-9a-f]{64}$")
                .isEqualTo("655a2770a8f87b59dc6eddaf78db6ca5c5b9193c9a76b963c611de422225aeb4");
    }
}
