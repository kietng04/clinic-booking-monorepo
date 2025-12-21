package com.clinicbooking.clinic_booking_system.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    // Different rate limits for different endpoints
    private static final int STANDARD_REQUESTS_PER_MINUTE = 60;
    private static final int AUTH_REQUESTS_PER_MINUTE = 10;
    private static final int SENSITIVE_REQUESTS_PER_MINUTE = 30;

    public Bucket resolveBucket(String key, RateLimitType type) {
        return buckets.computeIfAbsent(key, k -> createBucket(type));
    }

    private Bucket createBucket(RateLimitType type) {
        Bandwidth limit = switch (type) {
            case STANDARD -> Bandwidth.classic(
                    STANDARD_REQUESTS_PER_MINUTE,
                    Refill.greedy(STANDARD_REQUESTS_PER_MINUTE, Duration.ofMinutes(1))
            );
            case AUTH -> Bandwidth.classic(
                    AUTH_REQUESTS_PER_MINUTE,
                    Refill.greedy(AUTH_REQUESTS_PER_MINUTE, Duration.ofMinutes(1))
            );
            case SENSITIVE -> Bandwidth.classic(
                    SENSITIVE_REQUESTS_PER_MINUTE,
                    Refill.greedy(SENSITIVE_REQUESTS_PER_MINUTE, Duration.ofMinutes(1))
            );
        };

        return Bucket.builder().addLimit(limit).build();
    }

    public boolean tryConsume(String key, RateLimitType type) {
        Bucket bucket = resolveBucket(key, type);
        return bucket.tryConsume(1);
    }

    public enum RateLimitType {
        STANDARD,   // Normal endpoints - 60/min
        AUTH,       // Auth endpoints - 10/min (prevent brute force)
        SENSITIVE   // Sensitive operations - 30/min
    }
}
