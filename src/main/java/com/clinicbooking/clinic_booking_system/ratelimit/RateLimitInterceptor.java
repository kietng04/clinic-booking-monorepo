package com.clinicbooking.clinic_booking_system.ratelimit;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimitingService rateLimitingService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String clientIP = getClientIP(request);
        String path = request.getRequestURI();

        RateLimitingService.RateLimitType type = determineRateLimitType(path);
        String key = clientIP + ":" + type.name();

        if (!rateLimitingService.tryConsume(key, type)) {
            log.warn("Rate limit exceeded for IP: {} on path: {}", clientIP, path);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Too many requests. Please try again later.\", \"status\": 429}");
            return false;
        }

        return true;
    }

    private RateLimitingService.RateLimitType determineRateLimitType(String path) {
        if (path.startsWith("/api/auth/")) {
            return RateLimitingService.RateLimitType.AUTH;
        } else if (path.contains("/password") || path.contains("/delete")) {
            return RateLimitingService.RateLimitType.SENSITIVE;
        }
        return RateLimitingService.RateLimitType.STANDARD;
    }

    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
