# JWT Authentication Filter Implementation

## Overview
Đã thực hiện JWT Authentication Filter cho User Service, cho phép xác thực các requests dựa trên JWT tokens trong Authorization header.

## Files Tạo Mới / Cập Nhật

### 1. JwtAuthenticationFilter.java (TẠO MỚI)
**Đường dẫn:** `/Users/kietnguyen/Documents/kltn/clinic-booking-system/user-service/src/main/java/com/clinicbooking/userservice/security/JwtAuthenticationFilter.java`

**Chức năng chính:**
- Extends `OncePerRequestFilter` - đảm bảo filter chạy đúng một lần trên mỗi request
- Extract JWT từ Authorization header (Bearer token format)
- Validate token bằng JwtService (kiểm tra signature và expiration)
- Load user từ database bằng email extract từ token
- Set Authentication vào SecurityContext
- Graceful error handling

**Key Features:**
```java
// Extract token từ header
String authHeader = request.getHeader("Authorization");
String jwt = authHeader.substring(7); // Remove "Bearer "

// Validate token
if (jwtService.isTokenValid(token)) {
    // Load user and set authentication
}

// Whitelist paths - không cần authentication
- /api/auth/**
- /actuator/**
- /swagger-ui/**
- /v3/api-docs/**
- /webjars/**
```

**Flow Process:**
1. Check if path is whitelisted → Skip authentication
2. Extract JWT từ Authorization header
3. Extract email từ token claims (subject)
4. Validate token (signature + expiration)
5. Load user từ database by email
6. Check if user is active
7. Create UsernamePasswordAuthenticationToken with authorities
8. Set vào SecurityContext

**Error Handling:**
- All exceptions caught gracefully
- Logging at appropriate levels (DEBUG, WARN, ERROR)
- Filter continues even if JWT processing fails
- Security enforced at endpoint level using @PreAuthorize

### 2. SecurityConfig.java (CẬP NHẬT)
**Đường dẫn:** `/Users/kietnguyen/Documents/kltn/clinic-booking-system/user-service/src/main/java/com/clinicbooking/userservice/config/SecurityConfig.java`

**Changes Made:**
- ✅ Added JwtAuthenticationFilter injection
- ✅ Added UserRepository injection
- ✅ Created custom UserDetailsService bean (load user by email)
- ✅ Created AuthenticationProvider bean (DaoAuthenticationProvider)
- ✅ Created AuthenticationManager bean
- ✅ Updated SecurityFilterChain:
  - Added filter before UsernamePasswordAuthenticationFilter
  - Changed from `permitAll()` to proper role-based authorization
  - Whitelisted specific paths
  - Protected all other endpoints with `authenticated()`

**Configuration Details:**

```java
// UserDetailsService - Load user by email
@Bean
public UserDetailsService userDetailsService() {
    return email -> {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException(...));
        return User.builder()
            .username(user.getEmail())
            .password(user.getPassword())
            .authorities("ROLE_" + user.getRole().name())
            .accountLocked(!user.getIsActive())
            .build();
    };
}

// AuthenticationProvider
@Bean
public AuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
    authProvider.setUserDetailsService(userDetailsService());
    authProvider.setPasswordEncoder(passwordEncoder());
    return authProvider;
}

// SecurityFilterChain
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) {
    http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/actuator/**").permitAll()
            .requestMatchers("/swagger-ui/**", "/swagger-ui.html").permitAll()
            .requestMatchers("/v3/api-docs/**").permitAll()
            .requestMatchers("/webjars/**").permitAll()
            .anyRequest().authenticated()  // All other endpoints require authentication
        )
        .authenticationProvider(authenticationProvider())
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
        .httpBasic(httpBasic -> httpBasic.disable())
        .formLogin(formLogin -> formLogin.disable());

    return http.build();
}
```

## Dependencies Required (Already in pom.xml)

```xml
<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>

<!-- Lombok & Validation -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

## JwtService Integration

JwtService methods used:
```java
// Extract email (subject) từ token
String email = jwtService.extractUsername(token);

// Validate token signature and expiration
boolean isValid = jwtService.isTokenValid(token);

// Optional: Extract additional claims
Long userId = jwtService.extractUserId(token);
String role = jwtService.extractRole(token);
```

## User Entity Integration

Fields used:
```java
User user = userRepository.findByEmail(userEmail).get();
- user.getId()              // User ID for details
- user.getEmail()           // Email as principal
- user.getPassword()        // Not used in JWT flow
- user.getIsActive()        // Check if user account is active
- user.getRole()            // Convert to GrantedAuthority
```

## Role-Based Authorities

Authorities format: `ROLE_{ENUM_NAME}`
- ROLE_PATIENT
- ROLE_DOCTOR
- ROLE_ADMIN

Can be used with @PreAuthorize:
```java
@PreAuthorize("hasRole('DOCTOR')")
public ResponseEntity<?> getDoctorData() { ... }

@PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
public ResponseEntity<?> getUsers() { ... }
```

## Whitelist Paths (No Authentication Required)

### Authentication Endpoints
- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/refresh-token`
- `/api/auth/verify-email`
- `/api/auth/forgot-password`
- `/api/auth/reset-password`

### Monitoring & Documentation
- `/actuator/**`
- `/swagger-ui/**`
- `/v3/api-docs/**`
- `/webjars/**`

## Request Flow Example

### Protected Endpoint (Requires JWT)
```
GET /api/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Flow:
1. JwtAuthenticationFilter.doFilterInternal() called
2. Extract JWT from Authorization header
3. Call jwtService.extractUsername(jwt) → email
4. Call jwtService.isTokenValid(jwt) → validate
5. Call userRepository.findByEmail(email) → load user
6. Check user.getIsActive() → true
7. Create Authentication with ROLE_{role}
8. Set in SecurityContext
9. Endpoint receives authenticated request
10. @PreAuthorize checks pass (if any)
11. Handler executed
```

### Whitelist Endpoint (No Authentication)
```
POST /api/auth/login
{
    "email": "user@example.com",
    "password": "password123"
}

Flow:
1. JwtAuthenticationFilter.doFilterInternal() called
2. Check isWhitelistedPath("/api/auth/login") → true
3. Skip authentication, proceed to handler
4. Handler authenticates user and returns JWT token
```

## Error Handling Strategy

| Scenario | Action | Logging |
|----------|--------|---------|
| No Authorization header | Continue without auth | DEBUG: "No valid JWT token found" |
| Invalid JWT format | Continue without auth | DEBUG: "Error extracting email" |
| Token expired | Continue without auth | WARN: "Token validation failed" |
| User not found | Continue without auth | WARN: "User not found in database" |
| User inactive | Continue without auth | WARN: "User account is inactive" |
| Exception during processing | Continue without auth | ERROR: "Error processing JWT auth" |
| Filter exception | Continue chain | ERROR: "Error processing JWT auth" |

Note: Even if filter doesn't set authentication, the endpoint will return 403 Forbidden if authentication is required.

## Security Features

1. **Token Validation**
   - JWT signature verification
   - Token expiration check
   - Email claim validation

2. **User Status Check**
   - Verify user exists in database
   - Check if user account is active
   - Prevent authentication of deactivated users

3. **Authority Assignment**
   - Extract role from User entity
   - Convert to Spring Security GrantedAuthority
   - Support for @PreAuthorize role checks

4. **Graceful Error Handling**
   - All exceptions caught and logged
   - Filter continues regardless of errors
   - Security enforced at endpoint level

5. **Whitelisting**
   - Configurable whitelist paths
   - Public endpoints accessible without JWT
   - Easy to modify for future requirements

## Testing Considerations

### Unit Tests
```java
// Test token extraction
// Test whitelist path checking
// Test user loading
// Test authority creation
```

### Integration Tests
```java
// Test protected endpoint with valid JWT
// Test protected endpoint with invalid JWT
// Test protected endpoint with expired JWT
// Test protected endpoint without JWT
// Test whitelisted endpoint without JWT
// Test whitelisted endpoint with JWT
```

## Configuration Notes

No additional configuration needed in application.properties/yaml.
The following are already expected to be configured:

```properties
jwt.secret=<base64-encoded-secret>
jwt.expiration=<expiration-in-milliseconds>
jwt.refresh-expiration=<refresh-expiration-in-milliseconds>
```

## Production Checklist

- [x] OncePerRequestFilter usage (ensures single execution)
- [x] Bearer token extraction from Authorization header
- [x] JwtService integration for token validation
- [x] Database user loading with UserRepository
- [x] User active status verification
- [x] Role-based GrantedAuthority creation
- [x] SecurityContext authentication setting
- [x] Comprehensive exception handling
- [x] Appropriate logging levels
- [x] Whitelist configuration for public endpoints
- [x] STATELESS session management
- [x] CSRF protection disabled (appropriate for stateless API)
- [x] Proper filter chain ordering
- [x] UserDetailsService bean creation
- [x] AuthenticationProvider bean creation
- [x] AuthenticationManager bean creation

## Next Steps / Integration Points

1. **Authentication Controller**
   - Inject AuthenticationManager
   - Use for login endpoint: authenticate user → generate JWT

2. **Refresh Token Endpoint**
   - Validate refresh token
   - Generate new JWT token

3. **User Service Endpoints**
   - Add @PreAuthorize annotations
   - Leverage authenticated user from SecurityContext

4. **Error Response Handler**
   - Create @ControllerAdvice for 403 Forbidden
   - Return appropriate error responses

5. **Optional: ExceptionHandler**
   - Create custom AuthenticationException handler
   - Return consistent error format

## Example Usage in Controllers

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getProfile(Principal principal) {
        String email = principal.getName(); // Authenticated user's email
        // Load and return user profile
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        // Only admins can access this
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('DOCTOR') or @authorizationService.isOwner(#id, authentication)")
    public ResponseEntity<?> activateUser(@PathVariable Long id) {
        // Doctors can activate or user can activate their own
    }
}
```

## Summary

This implementation provides production-ready JWT authentication for the User Service with:
- Robust token validation and error handling
- User status verification
- Role-based authorization support
- Whitelisted public endpoints
- Comprehensive logging
- Clean integration with Spring Security
