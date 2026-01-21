package com.clinicbooking.userservice.controller;

import com.clinicbooking.userservice.dto.request.LoginRequest;
import com.clinicbooking.userservice.dto.request.RegisterRequest;
import com.clinicbooking.userservice.dto.response.AuthResponse;
import com.clinicbooking.userservice.dto.response.UserResponse;
import com.clinicbooking.userservice.entity.User;
import com.clinicbooking.userservice.repository.UserRepository;
import com.clinicbooking.userservice.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller Example
 *
 * This is an example implementation of how to use JwtService and the new
 * JwtAuthenticationFilter with SecurityConfig.
 *
 * NOTE: This is NOT a complete implementation - it's provided as a reference
 * for how to integrate with the JWT authentication system.
 *
 * Key points:
 * 1. POST /api/auth/login - Authenticate user and return JWT token
 * 2. POST /api/auth/register - Register new user (public endpoint)
 * 3. POST /api/auth/refresh-token - Refresh JWT token
 * 4. GET /api/auth/me - Get current user profile (protected)
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Login endpoint - Generate JWT token
     *
     * Request:
     * {
     *   "email": "user@example.com",
     *   "password": "password123"
     * }
     *
     * Response (200 OK):
     * {
     *   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *   "type": "Bearer",
     *   "expiresIn": 3600
     * }
     *
     * Response (401 Unauthorized):
     * {
     *   "message": "Invalid email or password"
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            log.info("Login attempt for user: {}", request.getEmail());

            // Step 1: Authenticate with AuthenticationManager
            // This uses the UserDetailsService and PasswordEncoder configured in SecurityConfig
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
                )
            );

            log.debug("User authenticated: {}", request.getEmail());

            // Step 2: Load user from database to get role and ID
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found after authentication"));

            // Step 3: Generate JWT access token
            // JwtService encodes: email (subject), userId, and role in claims
            String accessToken = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
            );

            // Step 4: Generate refresh token (for token refresh endpoint)
            // Refresh token is longer-lived and only contains userId
            String refreshToken = jwtService.generateRefreshToken(
                user.getId(),
                user.getEmail()
            );

            log.info("JWT token generated for user: {}", request.getEmail());

            // Step 5: Return tokens to client
            // Client should store both tokens (accessToken in memory, refreshToken in httpOnly cookie)
            return ResponseEntity.ok(new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                3600 // Expiration in seconds (must match jwt.expiration / 1000)
            ));

        } catch (BadCredentialsException e) {
            log.warn("Login failed - invalid credentials for user: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Invalid email or password"));
        } catch (Exception e) {
            log.error("Login error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Login failed"));
        }
    }

    /**
     * Register endpoint - Create new user
     *
     * Request:
     * {
     *   "email": "newuser@example.com",
     *   "password": "securepassword123",
     *   "fullName": "New User Name",
     *   "phone": "0123456789",
     *   "role": "PATIENT"
     * }
     *
     * Response (201 Created):
     * {
     *   "id": 1,
     *   "email": "newuser@example.com",
     *   "fullName": "New User Name",
     *   "phone": "0123456789",
     *   "role": "PATIENT",
     *   "isActive": true
     * }
     *
     * Response (400 Bad Request):
     * {
     *   "message": "Email already exists"
     * }
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            log.info("Registration attempt for email: {}", request.getEmail());

            // Check if user already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                log.warn("Registration failed - email already exists: {}", request.getEmail());
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Email already registered"));
            }

            // Create new user entity
            User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(request.getRole())
                .isActive(true)
                .emailVerified(false)
                .build();

            // Save user to database
            User savedUser = userRepository.save(user);
            log.info("User registered successfully: {}", request.getEmail());

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new UserResponse(savedUser));

        } catch (Exception e) {
            log.error("Registration error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Registration failed"));
        }
    }

    /**
     * Refresh token endpoint - Generate new access token using refresh token
     *
     * Request:
     * {
     *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     * }
     *
     * Response (200 OK):
     * {
     *   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *   "type": "Bearer",
     *   "expiresIn": 3600
     * }
     *
     * Response (401 Unauthorized):
     * {
     *   "message": "Invalid refresh token"
     * }
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            String refreshToken = request.getRefreshToken();

            // Validate refresh token
            if (!jwtService.isTokenValid(refreshToken)) {
                log.warn("Refresh token validation failed");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid or expired refresh token"));
            }

            // Extract email from refresh token
            String userEmail = jwtService.extractUsername(refreshToken);

            // Load user from database
            User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Generate new access token
            String accessToken = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
            );

            log.info("Token refreshed for user: {}", userEmail);

            return ResponseEntity.ok(new AuthResponse(
                accessToken,
                refreshToken, // Can generate new refresh token here too
                "Bearer",
                3600
            ));

        } catch (Exception e) {
            log.error("Token refresh error", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Token refresh failed"));
        }
    }

    /**
     * Get current user profile - Protected endpoint
     *
     * Requires: Valid JWT token in Authorization header
     * Header: Authorization: Bearer <jwt-token>
     *
     * Response (200 OK):
     * {
     *   "id": 1,
     *   "email": "user@example.com",
     *   "fullName": "User Name",
     *   "phone": "0123456789",
     *   "role": "PATIENT",
     *   "isActive": true,
     *   "createdAt": "2024-01-08T10:30:00Z"
     * }
     *
     * Response (403 Forbidden):
     * - No JWT token provided
     * - Invalid JWT token
     * - Expired JWT token
     * - User account is inactive
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            // Get authenticated user's email from SecurityContext
            String userEmail = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

            log.debug("Getting profile for user: {}", userEmail);

            // Load user from database
            User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(new UserResponse(user));

        } catch (Exception e) {
            log.error("Error getting current user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to get user profile"));
        }
    }

    /**
     * Logout endpoint - This is optional as JWTs don't require server-side logout
     * However, you may want to implement token blacklisting for additional security
     *
     * In a real implementation, you might:
     * 1. Add token to a blacklist in Redis with expiration
     * 2. Check blacklist in JwtAuthenticationFilter
     * 3. Prevent use of blacklisted tokens
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        log.info("Logout called - implementing token blacklisting is recommended");
        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }

    // ==================== DTOs ====================

    /**
     * DTO Classes - These would typically be in separate files
     * Included here for reference
     */

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class ErrorResponse {
        private String message;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class MessageResponse {
        private String message;
    }

    @lombok.Data
    public static class RefreshTokenRequest {
        private String refreshToken;
    }
}

/**
 * How the JwtAuthenticationFilter works with this Controller:
 *
 * 1. USER LOGS IN:
 *    POST /api/auth/login
 *    ├─> AuthController.login() is called (no filter auth needed)
 *    ├─> AuthenticationManager.authenticate() validates credentials
 *    ├─> User role is loaded from database
 *    ├─> JwtService generates token with email, userId, role
 *    └─> Token returned to client
 *
 * 2. USER USES TOKEN:
 *    GET /api/users/profile with "Authorization: Bearer <token>"
 *    ├─> JwtAuthenticationFilter.doFilterInternal() intercepts
 *    ├─> Extract token from Authorization header
 *    ├─> Extract email from token using JwtService.extractUsername()
 *    ├─> Validate token signature and expiration
 *    ├─> Load user from database by email
 *    ├─> Check user is active
 *    ├─> Create UsernamePasswordAuthenticationToken with ROLE_
 *    ├─> Set authentication in SecurityContext
 *    └─> Request proceeds to controller with authenticated user
 *
 * 3. ENDPOINT WITH @PreAuthorize:
 *    @PreAuthorize("hasRole('DOCTOR')")
 *    GET /api/doctors/schedule
 *    ├─> JwtAuthenticationFilter sets authentication (as shown above)
 *    ├─> @PreAuthorize checks if user has ROLE_DOCTOR
 *    ├─> If authorized: 200 OK with data
 *    └─> If not authorized: 403 Forbidden
 *
 * 4. WHITELISTED ENDPOINT:
 *    POST /api/auth/register
 *    ├─> JwtAuthenticationFilter.doFilterInternal() checks whitelist
 *    ├─> Path matches "/api/auth/**"
 *    ├─> Filter returns early, no authentication needed
 *    └─> Request proceeds without authentication
 */
