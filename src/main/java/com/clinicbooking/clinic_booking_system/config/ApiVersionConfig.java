package com.clinicbooking.clinic_booking_system.config;

import org.springframework.context.annotation.Configuration;

/**
 * API Versioning Configuration
 *
 * Current API version strategy:
 * - All current controllers are version 1 (implicit)
 * - Endpoints are accessible at /api/users, /api/appointments, etc.
 *
 * Future versioning:
 * - New versions can be created in controller.v2, controller.v3 packages
 * - Use @RequestMapping("/api/v2/...") for version 2 endpoints
 * - Version 1 endpoints remain at /api/... for backward compatibility
 *
 * Example:
 * - V1: /api/users (current)
 * - V2: /api/v2/users (future breaking changes)
 *
 * Versioning strategy options:
 * 1. URL versioning (current): /api/v1/, /api/v2/
 * 2. Header versioning: Accept-Version: v1
 * 3. Query parameter: ?version=1
 *
 * We use URL versioning for simplicity and clarity.
 */
@Configuration
public class ApiVersionConfig {

    public static final String API_V1_BASE_PATH = "/api";
    public static final String API_V2_BASE_PATH = "/api/v2";

    // Add version constants as needed
    public static final String CURRENT_VERSION = "1.0.0";
}
