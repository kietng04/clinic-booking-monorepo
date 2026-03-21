package com.clinicbooking.paymentservice.util;

import com.clinicbooking.paymentservice.exception.InvalidSignatureException;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

@Slf4j
public final class SignatureUtil {

    private static final String ALGORITHM = "HmacSHA256";
    private SignatureUtil() {
        throw new AssertionError("Cannot instantiate utility class");
    }

    
    public static String generateHmacSHA256(String data, String secretKey) {
        if (data == null || data.isEmpty()) {
            throw new InvalidSignatureException("Data cannot be null or empty");
        }
        if (secretKey == null || secretKey.isEmpty()) {
            throw new InvalidSignatureException("Secret key cannot be null or empty");
        }

        try {
            Mac mac = Mac.getInstance(ALGORITHM);
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    secretKey.getBytes(StandardCharsets.UTF_8),
                    0,
                    secretKey.getBytes(StandardCharsets.UTF_8).length,
                    ALGORITHM
            );
            mac.init(secretKeySpec);

            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String signature = bytesToHex(rawHmac);

            log.debug("Generated HMAC-SHA256 signature successfully");
            return signature;

        } catch (NoSuchAlgorithmException e) {
            log.error("HMAC-SHA256 algorithm not available", e);
            throw new InvalidSignatureException(
                "Signature generation failed: algorithm not available",
                "SIGNATURE_ALGORITHM_ERROR",
                e
            );
        } catch (InvalidKeyException e) {
            log.error("Invalid secret key provided for signature generation", e);
            throw new InvalidSignatureException(
                "Signature generation failed: invalid key",
                "INVALID_SECRET_KEY",
                e
            );
        } catch (Exception e) {
            log.error("Unexpected error during signature generation", e);
            throw new InvalidSignatureException(
                "Signature generation failed: " + e.getMessage(),
                "SIGNATURE_GENERATION_ERROR",
                e
            );
        }
    }

    
    public static boolean verifySignature(String signature, String data, String secretKey) {
        if (signature == null || signature.isEmpty()) {
            log.warn("Signature verification failed: signature is null or empty");
            return false;
        }
        if (data == null || data.isEmpty()) {
            log.warn("Signature verification failed: data is null or empty");
            return false;
        }
        if (secretKey == null || secretKey.isEmpty()) {
            log.warn("Signature verification failed: secret key is null or empty");
            return false;
        }

        try {
            String expectedSignature = generateHmacSHA256(data, secretKey);

            boolean isValid = constantTimeEquals(signature, expectedSignature);

            if (!isValid) {
                log.warn("Signature verification failed: signature mismatch");
                log.trace("Expected signature and received signature do not match");
            } else {
                log.debug("Signature verification successful");
            }

            return isValid;

        } catch (InvalidSignatureException e) {
            log.error("Signature verification failed with exception", e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during signature verification", e);
            throw new InvalidSignatureException(
                "Signature verification failed: " + e.getMessage(),
                "SIGNATURE_VERIFICATION_ERROR",
                e
            );
        }
    }

    
    private static boolean constantTimeEquals(String a, String b) {
        if (a == null && b == null) {
            return true;
        }
        if (a == null || b == null) {
            return false;
        }

        byte[] aBytes = a.getBytes(StandardCharsets.UTF_8);
        byte[] bBytes = b.getBytes(StandardCharsets.UTF_8);

        return java.security.MessageDigest.isEqual(aBytes, bBytes);
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder hex = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) {
            hex.append(String.format("%02x", value));
        }
        return hex.toString();
    }
}
