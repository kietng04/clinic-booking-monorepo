# API Gateway - JWT Token Forwarding Guide

## Overview

Giải pháp JWT Token Forwarding trong API Gateway để cho phép frontend bypass gateway issue.

**Problem:** Frontend đang gọi thẳng port 8081, 8082 vì gateway không forward JWT token đúng.

**Solution:** Implement JWT forwarding filters và configuration để:
1. Extract JWT từ Authorization header
2. Validate JWT (optional, gateway level)
3. Forward original JWT tới downstream services
4. Thêm user context headers cho convenience
5. Support correlation ID cho tracing

## Architecture

```
┌─────────────────┐
│    Frontend     │ (Port 3000/3001/5173)
└────────┬────────┘
         │ Authorization: Bearer {JWT}
         │
┌────────▼────────────────────────────┐
│      API Gateway (Port 8080)         │
├──────────────────────────────────────┤
│ JwtForwardingFilter (GlobalFilter)   │
│ - Extract JWT từ Authorization       │
│ - Validate JWT                       │
│ - Forward Authorization header       │
│ - Add X-User-* headers               │
│ - Generate Correlation ID            │
└────────┬────────────────────────────┘
         │ Authorization: Bearer {JWT}
         │ X-User-Id: {userId}
         │ X-User-Email: {email}
         │ X-User-Role: {role}
         │ X-Correlation-Id: {id}
         │
    ┌────┼────┬────────────┐
    │    │    │            │
┌───▼──┐ │  ┌─▼──────┐  ┌─▼────────────┐
│User  │ │  │Medical  │  │Consultation  │
│Svc   │ │  │Service  │  │Service       │
│8081  │ │  │8082     │  │8083          │
└──────┘ │  └────────┘  └──────────────┘
         │
      ┌──▼─────────┐
      │Appointment │
      │Service 8084│
      └────────────┘
```

## Components

### 1. JwtForwardingFilter (Global Filter)

**File:** `src/main/java/com/clinicbooking/gateway/filter/JwtForwardingFilter.java`

**Chức năng:**
- Implement GlobalFilter interface (chạy cho tất cả requests)
- Extract JWT từ Authorization header
- Validate JWT token (dùng JwtService)
- Forward original Authorization header
- Thêm user context headers (X-User-Id, X-User-Email, X-User-Role)
- Generate Correlation ID cho distributed tracing
- Log requests với correlation ID

**Key Features:**
- Stateless JWT validation
- Non-blocking (reactive) processing
- Graceful error handling
- Correlation ID generation và forwarding
- Support cho requests without JWT

### 2. AuthenticationFilter (Route-specific Filter)

**File:** `src/main/java/com/clinicbooking/gateway/filter/AuthenticationFilter.java`

**Updates:**
- Now forwards original Authorization header
- Added correlation ID logging
- Improved error messages

**Chức năng:**
- Apply cho specific routes (configured via application.yml)
- Strict JWT validation (returns 401 nếu token invalid)
- Only applies to protected routes

### 3. GatewayConfig (Configuration)

**File:** `src/main/java/com/clinicbooking/gateway/config/GatewayConfig.java`

**Chức năng:**
- Configure CORS để allow Authorization header
- Expose custom headers (X-Correlation-Id, X-User-*, etc.)
- Support preflight requests
- Allow credentials

### 4. JwtService (JWT Validation)

**File:** `src/main/java/com/clinicbooking/gateway/security/JwtService.java`

**Supports:**
- Token validation
- Extract userId, email, role từ JWT claims
- JJWT library (0.12.6)
- Base64 encoded secret key

## Configuration

### application.yml

```yaml
spring:
  cloud:
    gateway:
      # Routes with AuthenticationFilter
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
          filters:
            - AuthenticationFilter  # Strict validation for protected routes

        - id: medical-service
          uri: lb://medical-service
          predicates:
            - Path=/api/medical-records/**
          filters:
            - AuthenticationFilter

      # Default filters apply to all routes
      default-filters:
        - DedupeResponseHeader=Access-Control-Allow-Credentials Access-Control-Allow-Origin
        - AddRequestHeader=X-Gateway-Source, api-gateway
        - name: PreserveHostHeader

      # CORS configuration
      globalcors:
        cors-configurations:
          '[/**]':
            allowed-origins:
              - "http://localhost:3000"
              - "http://localhost:3001"
              - "http://localhost:4200"
              - "http://localhost:5173"
              - "http://localhost:8080"
            allowed-methods:
              - GET
              - POST
              - PUT
              - DELETE
              - PATCH
              - OPTIONS
            allowed-headers:
              - "Authorization"  # Explicitly allow JWT
              - "Content-Type"
              - "X-Correlation-Id"
              - "X-User-Id"
              - "X-User-Email"
              - "X-User-Role"
              - "*"
            expose-headers:
              - "Authorization"
              - "X-Correlation-Id"
              - "X-User-Id"
              - "X-User-Email"
              - "X-User-Role"
            allow-credentials: true
            max-age: 3600

# JWT Configuration - MUST match user-service
jwt:
  secret: ${JWT_SECRET:dGhpc2lzYXZlcnlsb25nc2VjcmV0a2V5Zm9yand0dG9rZW5nZW5lcmF0aW9uYW5kdmFsaWRhdGlvbjEyMzQ1Njc4OTA=}
```

**Key Points:**
- JWT secret MUST match user-service
- Default secret là base64 encoded
- CORS explicitly allows Authorization header
- Expose headers configured para sa client-side access

## How It Works

### Request Flow

1. **Client sends request:**
   ```
   GET /api/users/profile HTTP/1.1
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Content-Type: application/json
   ```

2. **API Gateway receives:**
   - JwtForwardingFilter (GlobalFilter) executes first
   - Extract JWT từ Authorization header
   - Validate JWT using JwtService
   - Extract user claims: userId, email, role
   - Generate Correlation ID (nếu chưa có)

3. **Add headers:**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  (forwarded)
   X-User-Id: 123
   X-User-Email: user@example.com
   X-User-Role: PATIENT
   X-Correlation-Id: 550e8400-e29b-41d4-a716-446655440000
   X-Gateway-Source: api-gateway
   ```

4. **For protected routes:**
   - AuthenticationFilter also validates (stricter check)
   - Returns 401 if invalid

5. **Forward to downstream service:**
   - User Service receives request
   - Can extract user info từ headers hoặc validate JWT again
   - MDC (Mapped Diagnostic Context) sử dụng X-Correlation-Id cho logging

### Token Validation

**At Gateway Level (JwtForwardingFilter):**
- Optional validation (best-effort)
- Logs warning nếu token invalid nhưng forward request anyway
- Non-blocking - doesn't stop request

**At Route Level (AuthenticationFilter):**
- Strict validation (required cho protected routes)
- Returns 401 nếu token invalid
- Uses same JwtService để consistency

**At Downstream Service Level:**
- Mỗi service có thể validate JWT again
- Có thể extract claims từ JWT hoặc từ X-User-* headers
- Recommended: validate JWT lại trong service (defense in depth)

## JWT Claims Structure

Based on user-service:

```json
{
  "userId": 123,           // Long type
  "role": "PATIENT",       // String - User role
  "sub": "user@example.com", // Subject - Email
  "iat": 1704067200,       // Issued at
  "exp": 1704153600        // Expiration
}
```

**Claims Extracted by Gateway:**
- `userId` - Added as `X-User-Id` header
- `sub` (subject/email) - Added as `X-User-Email` header
- `role` - Added as `X-User-Role` header

## Downstream Service Integration

### User Service (Port 8081)

**Option 1: Trust gateway headers (faster)**
```java
@RestController
public class UserController {
    @GetMapping("/api/users/profile")
    public UserDTO getProfile(
        @RequestHeader("X-User-Id") Long userId,
        @RequestHeader("X-User-Email") String email,
        @RequestHeader("X-Correlation-Id") String correlationId) {
        // Use userId directly from header
        return userService.getProfile(userId);
    }
}
```

**Option 2: Validate JWT again (recommended - defense in depth)**
```java
@RestController
public class UserController {
    @GetMapping("/api/users/profile")
    public UserDTO getProfile(
        @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
        @RequestHeader("X-Correlation-Id") String correlationId) {

        String token = authHeader.substring(7); // Remove "Bearer "
        Long userId = jwtService.extractUserId(token);

        return userService.getProfile(userId);
    }
}
```

**Option 3: Support both (flexible)**
```java
@RestController
public class UserController {
    @GetMapping("/api/users/profile")
    public UserDTO getProfile(
        @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
        @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
        @RequestHeader("X-Correlation-Id") String correlationId) {

        Long userId = headerUserId;

        // Validate JWT if present
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            Long jwtUserId = jwtService.extractUserId(token);

            if (userId != null && !userId.equals(jwtUserId)) {
                throw new SecurityException("User ID mismatch");
            }
            userId = jwtUserId;
        }

        return userService.getProfile(userId);
    }
}
```

## Troubleshooting

### Issue 1: Frontend still getting 401

**Check:**
1. Verify JWT_SECRET environment variable matches user-service
   ```bash
   echo $JWT_SECRET
   ```

2. Check if token is actually being sent
   ```bash
   curl -v -H "Authorization: Bearer {token}" http://localhost:8080/api/users/profile
   ```

3. Check gateway logs
   ```bash
   grep "JwtForwardingFilter" gateway.log
   ```

### Issue 2: CORS error on Authorization header

**Solution:**
- GatewayConfig bean should be registered
- Check if globalcors config is properly loaded
- Verify allowed-headers includes "Authorization"

### Issue 3: Correlation ID not in logs

**Check:**
- MDC is configured in logging pattern:
  ```yaml
  logging:
    pattern:
      console: "%d{yyyy-MM-dd HH:mm:ss} [%X{correlationId}] %logger{36} - %msg%n"
  ```

- Downstream services should populate MDC from header
  ```java
  @Component
  public class CorrelationIdFilter implements Filter {
      @Override
      public void doFilter(ServletRequest request, ServletResponse response,
                          FilterChain chain) throws IOException, ServletException {
          String correlationId = ((HttpServletRequest) request)
              .getHeader("X-Correlation-Id");
          if (correlationId != null) {
              MDC.put("correlationId", correlationId);
          }
          try {
              chain.doFilter(request, response);
          } finally {
              MDC.clear();
          }
      }
  }
  ```

### Issue 4: WebSocket connections

WebSocket routes don't use JwtForwardingFilter by default. For WebSocket:

```yaml
routes:
  - id: websocket-service
    uri: lb:ws://consultation-service
    predicates:
      - Path=/ws/**
    filters:
      # JWT validation not applied to WebSocket
      # Handle JWT in WebSocket handler instead
```

For WebSocket JWT validation:
1. Client sends JWT in query parameter: `/ws?token={jwt}`
2. WebSocket handler extracts and validates token
3. Or use handshake interceptor to extract from headers

## Testing

### 1. Test JWT Forwarding

```bash
# Generate a test token (via user-service login)
TOKEN=$(curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.accessToken')

# Call via gateway
curl -v -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/users/profile

# Should see:
# - X-User-Id, X-User-Email, X-User-Role in request
# - Authorization header forwarded
# - 200 OK (not 401)
```

### 2. Test CORS Preflight

```bash
curl -v -X OPTIONS http://localhost:8080/api/users/profile \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization"

# Should see:
# - 200 OK
# - Access-Control-Allow-Origin: http://localhost:3000
# - Access-Control-Allow-Headers: Authorization, ...
```

### 3. Test Correlation ID

```bash
TOKEN=$(curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.accessToken')

curl -v -H "Authorization: Bearer $TOKEN" \
  -H "X-Correlation-Id: test-123" \
  http://localhost:8080/api/users/profile

# Check logs for [test-123]
```

### 4. Test Invalid Token

```bash
curl -v -H "Authorization: Bearer invalid.token.here" \
  http://localhost:8080/api/users/profile

# For protected routes:
# - Should get 401 Unauthorized
#
# For non-protected routes:
# - Should pass through (JwtForwardingFilter is lenient)
```

## Deployment

### Environment Variables

```bash
# Must be same as user-service
export JWT_SECRET=dGhpc2lzYXZlcnlsb25nc2VjcmV0a2V5Zm9yand0dG9rZW5nZW5lcmF0aW9uYW5kdmFsaWRhdGlvbjEyMzQ1Njc4OTA=

# Eureka
export EUREKA_URL=http://eureka:8761/eureka/

# Optional - for production JWT secret (must be base64 encoded)
export JWT_SECRET=$(echo -n "your-very-long-secret-key-for-jwt-token-generation-and-validation-12345678" | base64)
```

### Docker Deployment

```dockerfile
FROM openjdk:17-slim
ARG JAR_FILE=target/api-gateway.jar
COPY ${JAR_FILE} app.jar

ENV JWT_SECRET=dGhpc2lzYXZlcnlsb25nc2VjcmV0a2V5Zm9yand0dG9rZW5nZW5lcmF0aW9uYW5kdmFsaWRhdGlvbjEyMzQ1Njc4OTA=
ENV EUREKA_URL=http://eureka:8761/eureka/

EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
```

### Kubernetes Deployment

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-gateway-config
data:
  application.yml: |
    spring:
      application:
        name: api-gateway
      cloud:
        gateway:
          globalcors:
            cors-configurations:
              '[/**]':
                allowed-origins:
                  - "http://localhost:3000"
                  - "http://localhost:3001"
                allowed-headers:
                  - "Authorization"
                  - "*"
                expose-headers:
                  - "Authorization"
                  - "X-Correlation-Id"

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: clinic-booking/api-gateway:latest
        ports:
        - containerPort: 8080
        env:
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        - name: EUREKA_URL
          value: "http://eureka:8761/eureka/"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
```

## Security Considerations

### 1. Secret Key Management
- Never hardcode JWT secret
- Use environment variables hoặc secret management (Vault, K8s Secrets)
- Secret should be 256+ bits (43+ base64 characters)
- Rotate secrets regularly

### 2. Token Validation
- Always validate JWT signature at gateway
- Validate expiration time
- Optional: validate issuer (iss claim)
- Optional: validate audience (aud claim)

### 3. Header Injection
- Be careful with X-User-* headers
- Only trust headers from gateway itself
- Don't allow client to set X-User-* headers

### 4. CORS
- Explicit allowed-origins instead of "*"
- Don't allow "allow-credentials: true" with "*" origins
- Validate Origin header on each request

### 5. Rate Limiting
- Implement rate limiting at gateway level
- Use different rates for authenticated vs anonymous
- Support rate limiting by userId hoặc API key

### 6. Logging
- Log authentication failures
- Use correlation ID để trace requests
- Never log sensitive data (passwords, tokens)
- Monitor for suspicious patterns

## Performance Optimization

### 1. JWT Validation Caching
```java
@Service
@Slf4j
public class JwtService {
    @Cacheable(value = "jwt-validation", key = "#token")
    public boolean validateToken(String token) {
        // Cached validation result
        return isTokenValid(token);
    }
}
```

### 2. Connection Pooling
```yaml
spring:
  cloud:
    gateway:
      httpserver:
        connect-timeout: 5000
        idle-timeout: 60000
      httpclient:
        pool:
          max-idle-time: 60000
          pending-acquire-timeout: 45000
```

### 3. Circuit Breaker
- Already configured in application.yml
- Prevents cascading failures

## Monitoring

### Metrics to Track
- JWT validation success/failure rates
- Request latency (with/without JWT)
- CORS preflight requests
- Correlation ID tracking

### Example Prometheus Metrics
```yaml
# JWT validation metrics
api_gateway_jwt_validation_total{status="success"}
api_gateway_jwt_validation_total{status="failure"}
api_gateway_jwt_validation_duration_seconds

# Request metrics
api_gateway_request_total{route="user-service", status="200"}
api_gateway_request_total{route="user-service", status="401"}
api_gateway_request_duration_seconds{route="user-service"}
```

## References

- [Spring Cloud Gateway Documentation](https://spring.io/projects/spring-cloud-gateway)
- [JJWT (JWT for Java)](https://github.com/jwtk/jjwt)
- [RFC 7519 - JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)
- [CORS Specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Last Updated:** 2024-01-08
**Version:** 1.0.0
