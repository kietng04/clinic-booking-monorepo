package com.clinicbooking.userservice.security;

import com.clinicbooking.userservice.entity.User;
import com.clinicbooking.userservice.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

/**
 * JWT Authentication Filter that validates JWT tokens from incoming requests.
 * Extends OncePerRequestFilter to ensure the filter is executed only once per request.
 *
 * Key responsibilities:
 * - Extract JWT token from Authorization header (Bearer token)
 * - Validate token expiration and signature using JwtService
 * - Load user details from database using email from token
 * - Set authenticated user in SecurityContext
 * - Handle exceptions gracefully
 * - Skip authentication for whitelisted paths
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    /**
     * Paths that don't require JWT authentication
     */
    private static final String[] WHITELIST_PATHS = {
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/refresh-token",
            "/api/auth/verify-email",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/actuator",
            "/actuator/health",
            "/actuator/health/live",
            "/actuator/health/ready",
            "/swagger-ui",
            "/swagger-ui.html",
            "/swagger-ui/**",
            "/v3/api-docs",
            "/v3/api-docs/**",
            "/webjars/**"
    };

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        try {
            // Check if the request path should skip authentication
            if (isWhitelistedPath(request.getRequestURI())) {
                filterChain.doFilter(request, response);
                return;
            }

            // Extract JWT token from Authorization header
            String authHeader = request.getHeader("Authorization");
            String jwt = null;
            String userEmail = null;

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwt = authHeader.substring(7);
                userEmail = extractEmailFromToken(jwt);
            }

            // If no valid JWT found, continue without authentication
            if (jwt == null || userEmail == null) {
                log.debug("No valid JWT token found in request");
                filterChain.doFilter(request, response);
                return;
            }

            // Validate token and load user
            if (validateTokenAndLoadUser(jwt, userEmail)) {
                // If we reach here, authentication was successful and set in SecurityContext
                log.debug("Successfully authenticated user: {}", userEmail);
            } else {
                log.warn("Invalid or expired token for user: {}", userEmail);
            }

        } catch (Exception e) {
            log.error("Error processing JWT authentication", e);
            // Continue the filter chain even if there's an error
            // The @PreAuthorize annotations on endpoints will enforce security
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Checks if the request path is in the whitelist and should skip authentication
     */
    private boolean isWhitelistedPath(String requestUri) {
        for (String whitelist : WHITELIST_PATHS) {
            if (requestUri.startsWith(whitelist)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Safely extracts email from JWT token
     * Returns null if token is invalid or expired
     */
    private String extractEmailFromToken(String token) {
        try {
            return jwtService.extractUsername(token);
        } catch (Exception e) {
            log.debug("Error extracting email from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Validates token and loads user into SecurityContext
     * Returns true if successful, false otherwise
     */
    private boolean validateTokenAndLoadUser(String token, String userEmail) {
        try {
            // Validate token (checks signature and expiration)
            if (!jwtService.isTokenValid(token)) {
                log.warn("Token validation failed - invalid or expired token");
                return false;
            }

            // Load user from database
            Optional<User> userOptional = userRepository.findByEmail(userEmail);
            if (userOptional.isEmpty()) {
                log.warn("User not found in database: {}", userEmail);
                return false;
            }

            User user = userOptional.get();

            // Check if user is active
            if (!user.getIsActive()) {
                log.warn("User account is inactive: {}", userEmail);
                return false;
            }

            // Create authentication token with user details and authorities
            Authentication authentication = createAuthenticationToken(user);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.info("User authenticated successfully: {} with role: {}", userEmail, user.getRole());
            return true;

        } catch (Exception e) {
            log.error("Error validating token or loading user: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Creates UsernamePasswordAuthenticationToken with user authorities based on their role
     */
    private Authentication createAuthenticationToken(User user) {
        // Convert user role to GrantedAuthority
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        null,
                        Collections.singleton(authority)
                );

        // Set additional details for reference
        authentication.setDetails(user.getId());

        return authentication;
    }
}
