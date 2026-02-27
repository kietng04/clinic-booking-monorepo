# Downstream Service Integration - JWT Forwarding

This guide explains how to integrate JWT token forwarding in downstream services (user-service, medical-service, etc.).

## Overview

When a request passes through API Gateway:

```
Frontend (with JWT)
    ↓
API Gateway
    ├─ Validates JWT
    ├─ Extracts userId, email, role
    ├─ Forwards Authorization header
    ├─ Adds X-User-Id, X-User-Email, X-User-Role headers
    ├─ Generates/forwards X-Correlation-Id
    ↓
Downstream Service
    ├─ Option A: Trust gateway headers (fast)
    ├─ Option B: Validate JWT again (secure)
    └─ Option C: Support both (flexible)
```

## Option A: Trust Gateway Headers (Fastest)

Use the headers added by the gateway directly. Best for internal service-to-service calls.

### Controller Implementation

```java
@RestController
@RequestMapping("/api/users")
@Slf4j
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("X-Correlation-Id") String correlationId) {

        // Set correlation ID for MDC logging
        MDC.put("correlationId", correlationId);

        log.info("Getting profile for user: {}", userId);

        try {
            UserDTO profile = userService.getProfileById(userId);
            return ResponseEntity.ok(profile);
        } finally {
            MDC.clear();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-Correlation-Id") String correlationId) {

        MDC.put("correlationId", correlationId);

        // Check authorization
        if (!role.equals("ADMIN") && !id.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            UserDTO user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } finally {
            MDC.clear();
        }
    }
}
```

### Advantages
- Fastest (no JWT validation overhead)
- Simple implementation
- Works well for trusted internal calls

### Disadvantages
- Gateway compromise = security bypass
- Can't validate JWT signature
- Trust is implicit

## Option B: Validate JWT Again (Most Secure)

Extract and validate JWT at each service. Defense in depth.

### Controller Implementation

```java
@RestController
@RequestMapping("/api/users")
@Slf4j
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestHeader("X-Correlation-Id") String correlationId) {

        MDC.put("correlationId", correlationId);

        try {
            // Extract and validate JWT
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String token = authHeader.substring(7);

            if (!jwtService.isTokenValid(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            Long userId = jwtService.extractUserId(token);

            log.info("Getting profile for user: {}", userId);

            UserDTO profile = userService.getProfileById(userId);
            return ResponseEntity.ok(profile);

        } finally {
            MDC.clear();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(
            @PathVariable Long id,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestHeader("X-Correlation-Id") String correlationId) {

        MDC.put("correlationId", correlationId);

        try {
            // Validate JWT
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String token = authHeader.substring(7);
            if (!jwtService.isTokenValid(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            Long userId = jwtService.extractUserId(token);
            String role = jwtService.extractRole(token);

            // Check authorization
            if (!role.equals("ADMIN") && !id.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            log.info("Getting user: {} by user: {}", id, userId);

            UserDTO user = userService.getUserById(id);
            return ResponseEntity.ok(user);

        } finally {
            MDC.clear();
        }
    }
}
```

### Advantages
- Defense in depth
- Detects man-in-the-middle attacks
- JWT signature validation
- Independent security

### Disadvantages
- Slower (extra JWT validation)
- Duplicates gateway validation
- More complex implementation

## Option C: Support Both (Flexible & Recommended)

Try to use header first, fall back to JWT validation. Best of both worlds.

### Controller Implementation

```java
@RestController
@RequestMapping("/api/users")
@Slf4j
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @RequestHeader("X-Correlation-Id") String correlationId) {

        MDC.put("correlationId", correlationId);

        try {
            Long userId = resolveUserId(headerUserId, authHeader);

            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            log.info("Getting profile for user: {}", userId);

            UserDTO profile = userService.getProfileById(userId);
            return ResponseEntity.ok(profile);

        } finally {
            MDC.clear();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerRole,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @RequestHeader("X-Correlation-Id") String correlationId) {

        MDC.put("correlationId", correlationId);

        try {
            Long userId = resolveUserId(headerUserId, authHeader);
            String role = resolveRole(headerRole, authHeader);

            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // Check authorization
            if (!role.equals("ADMIN") && !id.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            log.info("Getting user: {} by user: {}", id, userId);

            UserDTO user = userService.getUserById(id);
            return ResponseEntity.ok(user);

        } finally {
            MDC.clear();
        }
    }

    /**
     * Resolve userId from header or JWT token
     *
     * Priority:
     * 1. X-User-Id header (from gateway) - fastest
     * 2. JWT token validation - most secure
     * 3. null - not authenticated
     */
    private Long resolveUserId(Long headerUserId, String authHeader) {
        // Use header if available
        if (headerUserId != null) {
            log.debug("Using userId from X-User-Id header");
            return headerUserId;
        }

        // Fall back to JWT validation
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                if (jwtService.isTokenValid(token)) {
                    Long jwtUserId = jwtService.extractUserId(token);
                    log.debug("Using userId from JWT token");
                    return jwtUserId;
                }
            } catch (Exception e) {
                log.warn("Failed to extract userId from JWT: {}", e.getMessage());
            }
        }

        return null;
    }

    /**
     * Resolve role from header or JWT token
     */
    private String resolveRole(String headerRole, String authHeader) {
        // Use header if available
        if (headerRole != null && !headerRole.isEmpty()) {
            log.debug("Using role from X-User-Role header");
            return headerRole;
        }

        // Fall back to JWT validation
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                if (jwtService.isTokenValid(token)) {
                    String jwtRole = jwtService.extractRole(token);
                    log.debug("Using role from JWT token");
                    return jwtRole;
                }
            } catch (Exception e) {
                log.warn("Failed to extract role from JWT: {}", e.getMessage());
            }
        }

        return "GUEST";
    }
}
```

## MDC Integration (Correlation ID Logging)

All services should use MDC for correlation ID logging.

### Configure Logging Pattern

```yaml
# application.yml
logging:
  level:
    com.clinicbooking: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level [%X{correlationId}] [%X{userId}] %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level [%X{correlationId}] [%X{userId}] %logger{36} - %msg%n"
```

### Create MDC Filter (for Servlet-based services)

```java
@Component
@Slf4j
public class MdcFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                        FilterChain chain) throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String correlationId = httpRequest.getHeader("X-Correlation-Id");
        String userId = httpRequest.getHeader("X-User-Id");

        if (correlationId != null && !correlationId.isEmpty()) {
            MDC.put("correlationId", correlationId);
        } else {
            MDC.put("correlationId", UUID.randomUUID().toString());
        }

        if (userId != null && !userId.isEmpty()) {
            MDC.put("userId", userId);
        }

        try {
            chain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}
```

### Create MDC Filter (for Reactive services)

```java
@Component
@Slf4j
public class MdcWebFilter implements WebFilter {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        return Mono.deferContextual(ctx ->
                chain.filter(exchange)
        ).contextWrite(reactor.util.context.Context.of(
                "correlationId", exchange.getRequest().getHeaders()
                        .getFirst("X-Correlation-Id"),
                "userId", exchange.getRequest().getHeaders()
                        .getFirst("X-User-Id")
        ));
    }
}
```

## Service-to-Service Communication

When services call each other, they should forward the JWT.

### Example: Medical Service calling User Service

```java
@Service
@Slf4j
public class MedicalService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private HttpServletRequest currentRequest;

    public UserDTO getUserInfo(Long userId) {
        // Get original JWT from current request
        String authHeader = currentRequest.getHeader(HttpHeaders.AUTHORIZATION);

        HttpHeaders headers = new HttpHeaders();
        if (authHeader != null) {
            headers.set(HttpHeaders.AUTHORIZATION, authHeader);
        }

        // Forward correlation ID
        String correlationId = currentRequest.getHeader("X-Correlation-Id");
        if (correlationId != null) {
            headers.set("X-Correlation-Id", correlationId);
        }

        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<UserDTO> response = restTemplate.exchange(
                "http://user-service:8081/api/users/{id}",
                HttpMethod.GET,
                entity,
                UserDTO.class,
                userId
        );

        return response.getBody();
    }
}
```

Or using FeignClient with interceptor:

```java
@Configuration
public class FeignClientConfig {

    @Bean
    public RequestInterceptor requestInterceptor(HttpServletRequest request) {
        return template -> {
            // Forward JWT token
            String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (authHeader != null) {
                template.header(HttpHeaders.AUTHORIZATION, authHeader);
            }

            // Forward correlation ID
            String correlationId = request.getHeader("X-Correlation-Id");
            if (correlationId != null) {
                template.header("X-Correlation-Id", correlationId);
            }

            // Add user context
            String userId = request.getHeader("X-User-Id");
            if (userId != null) {
                template.header("X-User-Id", userId);
            }
        };
    }
}

@FeignClient(name = "user-service", configuration = FeignClientConfig.class)
public interface UserServiceClient {

    @GetMapping("/api/users/{id}")
    UserDTO getUserById(@PathVariable Long id);

    @GetMapping("/api/users/profile")
    UserDTO getProfile();
}
```

## Testing JWT Forwarding

### Unit Test Example

```java
@SpringBootTest
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Test
    void testGetProfileWithValidJwt() throws Exception {
        // Generate valid JWT
        String token = jwtService.generateToken(1L, "user@example.com", "PATIENT");

        mockMvc.perform(get("/api/users/profile")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .header("X-Correlation-Id", "test-123"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetProfileWithoutJwt() throws Exception {
        mockMvc.perform(get("/api/users/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetProfileWithInvalidJwt() throws Exception {
        mockMvc.perform(get("/api/users/profile")
                .header(HttpHeaders.AUTHORIZATION, "Bearer invalid.token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetProfileWithGatewayHeaders() throws Exception {
        mockMvc.perform(get("/api/users/profile")
                .header("X-User-Id", "1")
                .header("X-User-Email", "user@example.com")
                .header("X-User-Role", "PATIENT")
                .header("X-Correlation-Id", "test-123"))
                .andExpect(status().isOk());
    }
}
```

### Integration Test Example

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class UserServiceIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void testGatewayForwardsJwt() throws Exception {
        // This test should run after gateway is running
        // It verifies end-to-end JWT forwarding

        String gatewayUrl = "http://localhost:8080/api/users/profile";
        String token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // Valid token

        ResponseEntity<UserDTO> response = restTemplate.exchange(
                gatewayUrl,
                HttpMethod.GET,
                new HttpEntity<>(new org.springframework.http.HttpHeaders() {{
                    set(HttpHeaders.AUTHORIZATION, "Bearer " + token);
                }}),
                UserDTO.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
```

## Troubleshooting

### Issue: "Missing required header X-User-Id"

**Cause:** JwtForwardingFilter not running or gateway not forwarding headers

**Solution:**
1. Check gateway logs
2. Verify JwtForwardingFilter is @Component
3. Check application.yml routes have correct predicates
4. Test gateway health: `curl http://localhost:8080/actuator/health`

### Issue: "Invalid JWT token"

**Cause:** JWT_SECRET mismatch between gateway and service

**Solution:**
```bash
# Verify secrets are same
echo $JWT_SECRET | base64 -d

# Check gateway config
grep "jwt.secret" api-gateway/src/main/resources/application.yml

# Check service config
grep "jwt.secret" user-service/src/main/resources/application.yml
```

### Issue: Correlation ID not in logs

**Cause:** MDC not configured in logging pattern

**Solution:**
```yaml
logging:
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%X{correlationId}] %logger{36} - %msg%n"
```

### Issue: CORS error "Authorization header not allowed"

**Cause:** CORS preflight failing

**Solution:**
1. Check GatewayConfig bean is registered
2. Verify globalcors config includes Authorization in allowed-headers
3. Test preflight:
```bash
curl -v -X OPTIONS http://localhost:8080/api/users/profile \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Headers: Authorization"
```

## Best Practices

1. **Always use correlation IDs** - Essential for distributed tracing
2. **Validate JWT at service boundary** - Defense in depth
3. **Log security events** - Unauthorized access attempts
4. **Don't trust client headers** - Only trust Authorization header
5. **Use HTTPS in production** - Protect tokens in transit
6. **Rotate secrets regularly** - Better security posture
7. **Monitor token usage** - Detect anomalies
8. **Use short expiration times** - Limit damage from leaked tokens
9. **Implement refresh tokens** - Don't keep long-lived access tokens
10. **Test all scenarios** - Valid token, invalid token, missing token, expired token

## Migration Checklist

When migrating from direct service calls to gateway:

- [ ] Add JwtForwardingFilter to gateway
- [ ] Update application.yml routes
- [ ] Configure CORS in GatewayConfig
- [ ] Update all controllers to accept X-User-* headers
- [ ] Add MDC filter to all services
- [ ] Update logging patterns to include correlationId
- [ ] Test JWT forwarding end-to-end
- [ ] Update service-to-service calls to forward JWT
- [ ] Update API documentation
- [ ] Test with real frontend application
- [ ] Monitor logs for any issues

---

**Last Updated:** 2024-01-08
**Version:** 1.0.0
