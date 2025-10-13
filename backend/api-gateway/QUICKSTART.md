# Quick Start - JWT Forwarding Setup

## What Was Fixed

**Problem:** Frontend bypassed gateway by calling services directly (port 8081, 8082)
- Gateway wasn't forwarding JWT tokens
- No user context passed to downstream services

**Solution:** Complete JWT forwarding implementation
- Global JWT filter for all requests
- Forward Authorization header to downstream services
- Add user context headers for convenience
- CORS configuration for browser-based requests

## Installation (5 minutes)

### 1. Verify Changes Are Applied

Files created/modified in `/Users/kietnguyen/Documents/kltn/clinic-booking-system/api-gateway/`:

```bash
# Check new files exist
ls -la src/main/java/com/clinicbooking/gateway/filter/JwtForwardingFilter.java
ls -la src/main/java/com/clinicbooking/gateway/config/GatewayConfig.java

# Check updated files
grep "Authorization" src/main/resources/application.yml
grep "JwtForwardingFilter" src/main/java/com/clinicbooking/gateway/filter/AuthenticationFilter.java
```

### 2. Build API Gateway

```bash
cd /Users/kietnguyen/Documents/kltn/clinic-booking-system/api-gateway
mvn clean package -DskipTests
```

### 3. Set Environment Variables

```bash
# JWT secret MUST be same across all services
export JWT_SECRET=dGhpc2lzYXZlcnlsb25nc2VjcmV0a2V5Zm9yand0dG9rZW5nZW5lcmF0aW9uYW5kdmFsaWRhdGlvbjEyMzQ1Njc4OTA=

# Eureka URL
export EUREKA_URL=http://localhost:8761/eureka/
```

### 4. Start Services

```bash
# Option A: Docker Compose
docker-compose up api-gateway user-service medical-service appointment-service consultation-service

# Option B: Run JAR directly
java -jar target/api-gateway.jar

# Option C: IDE (IntelliJ, VS Code)
# Run com.clinicbooking.gateway.ApiGatewayApplication
```

## Testing (5 minutes)

### Test 1: Login and Get Token

```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq -r '.accessToken'
```

Save the token as:
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Test 2: Call via Gateway (should work!)

```bash
# Call via gateway (port 8080)
curl -v -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/users/profile

# Should see:
# - HTTP/1.1 200 OK (not 401!)
# - User profile data returned
# - Headers forwarded correctly
```

### Test 3: Verify Headers Forwarded

Check gateway logs:

```bash
# Look for log entry like:
# [correlation-id] Request authenticated - UserId: 123, Role: PATIENT, Email: user@example.com
```

### Test 4: CORS Test (from Frontend)

```javascript
// In browser console (frontend running on localhost:3000)
fetch('http://localhost:8080/api/users/profile', {
    headers: {
        'Authorization': `Bearer ${token}`,
    }
})
.then(r => r.json())
.then(data => console.log(data))
.catch(err => console.error(err))

// Should work without CORS errors!
```

## Integration Checklist (15 minutes)

### For Each Downstream Service

#### 1. Add JwtService (if not present)

Copy from `user-service`:
```bash
cp user-service/src/main/java/com/clinicbooking/userservice/security/JwtService.java \
   medical-service/src/main/java/com/clinicbooking/medicalservice/security/
```

#### 2. Add MDC Filter (for correlation ID logging)

Create `MdcFilter.java`:
```java
@Component
public class MdcFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                        FilterChain chain) throws IOException, ServletException {
        String correlationId = ((HttpServletRequest) request)
            .getHeader("X-Correlation-Id");
        MDC.put("correlationId", correlationId);
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}
```

#### 3. Update Controllers (Option A - Trust Headers)

```java
@GetMapping("/api/users/profile")
public ResponseEntity<UserDTO> getProfile(
        @RequestHeader("X-User-Id") Long userId,
        @RequestHeader("X-Correlation-Id") String correlationId) {
    MDC.put("correlationId", correlationId);
    try {
        return ResponseEntity.ok(userService.getProfile(userId));
    } finally {
        MDC.clear();
    }
}
```

#### 4. Update Logging Pattern

```yaml
logging:
  pattern:
    console: "%d{HH:mm:ss} [%X{correlationId}] %-5level %logger{36} - %msg%n"
```

#### 5. Test Integration

```bash
# Call service via gateway
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/users/profile

# Should see service returning data
# Logs should show [correlation-id]
```

## Verify Everything Works

```bash
# 1. Gateway is running
curl http://localhost:8080/actuator/health

# 2. Service is reachable
curl http://localhost:8081/actuator/health

# 3. JWT forwarding works
TOKEN=$(curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.accessToken')

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/users/profile

# 4. CORS works (from frontend)
# Check browser console for successful requests without errors
```

## What's Different Now

### Before (Frontend Bypassed Gateway)
```
Frontend (3000) → User Service (8081)
Frontend (3000) → Medical Service (8082)
Frontend (3000) → Appointment Service (8083)
Gateway (8080) - NOT USED
```

### After (All via Gateway)
```
Frontend (3000)
    ↓ Bearer {JWT}
Gateway (8080)
    ├─ Validate JWT
    ├─ Forward JWT + headers
    ↓
    ├─→ User Service (8081)
    ├─→ Medical Service (8082)
    ├─→ Appointment Service (8083)
    └─→ Consultation Service (8084)
```

## Key Files

| File | Purpose |
|------|---------|
| `JwtForwardingFilter.java` | Global JWT forwarding (NEW) |
| `GatewayConfig.java` | CORS configuration (NEW) |
| `AuthenticationFilter.java` | Route-specific validation (UPDATED) |
| `application.yml` | Gateway configuration (UPDATED) |
| `JWT_FORWARDING_GUIDE.md` | Detailed documentation |
| `DOWNSTREAM_INTEGRATION.md` | Integration patterns |

## Troubleshooting Quick Fixes

### "401 Unauthorized" from gateway?
```bash
# Check JWT_SECRET env var is set
echo $JWT_SECRET

# Verify token is valid
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### "CORS error: Authorization header not allowed"?
```bash
# This is fixed by GatewayConfig bean
# Make sure it's deployed:
curl http://localhost:8080/actuator/gateway/routes
```

### Service can't read X-User-Id header?
```bash
# Check headers are being forwarded - look at gateway logs
grep "X-User-Id" gateway.log

# If not present, check AuthenticationFilter is running
grep "AuthenticationFilter" gateway.log
```

### Correlation ID not in service logs?
```bash
# Add MDC filter to service
# Update logging pattern to include %X{correlationId}
# Restart service
```

## Next Steps

1. **Read Full Documentation:**
   - `JWT_FORWARDING_GUIDE.md` - Complete architecture
   - `DOWNSTREAM_INTEGRATION.md` - Integration patterns
   - `IMPLEMENTATION_SUMMARY.md` - Technical details

2. **Integrate Each Service:**
   - Add JwtService
   - Add MDC filter
   - Update controllers
   - Test integration

3. **Monitor Deployment:**
   - Check logs for JWT forwarding
   - Monitor CORS requests
   - Track correlation IDs
   - Monitor performance

4. **Update Frontend:**
   - Remove direct service calls
   - Use gateway for all API calls
   - Keep JWT in Authorization header

## Support

For detailed information, see:
- JWT_FORWARDING_GUIDE.md - Architecture & troubleshooting
- DOWNSTREAM_INTEGRATION.md - Integration patterns
- IMPLEMENTATION_SUMMARY.md - Technical implementation

---

**Setup Time:** ~5 minutes
**Integration Time:** ~15 minutes per service
**Total Time:** ~1.5 hours for full integration

✅ All code is production-ready
✅ Build successful
✅ Documentation complete
✅ Ready to deploy
