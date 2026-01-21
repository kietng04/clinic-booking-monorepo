# JWT Authentication Usage Examples

## 1. Login Endpoint (Generate JWT Token)

```java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // Authenticate user with username/password
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
                )
            );

            // Load user to get role and ID
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Generate JWT token
            String jwtToken = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
            );

            // Generate refresh token
            String refreshToken = jwtService.generateRefreshToken(
                user.getId(),
                user.getEmail()
            );

            return ResponseEntity.ok(new AuthResponse(
                jwtToken,
                refreshToken,
                "Bearer",
                3600 // expiration in seconds
            ));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401)
                .body(new ErrorResponse("Invalid email or password"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // Register user logic - doesn't need JWT
        // Returns user details
    }
}
```

## 2. Protected Endpoint Examples

### Example 1: Get User Profile
```java
@GetMapping("/api/users/profile")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<?> getProfile(
    @AuthenticationPrincipal UserDetails userDetails,
    Principal principal
) {
    String email = principal.getName(); // Or userDetails.getUsername()

    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    return ResponseEntity.ok(new UserProfileDTO(user));
}
```

**Request with JWT:**
```bash
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWQiOjEsInJvbGUiOiJQQVRJRU5UIiwiaWF0IjoxNjczNDU3Njk4LCJleHAiOjE2NzM0NjEyOTh9.signature..."
```

**Without JWT (401 Unauthorized):**
```bash
curl -X GET http://localhost:8080/api/users/profile
# Response: 401 Unauthorized - Full authentication is required
```

### Example 2: Admin-Only Endpoint
```java
@GetMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> getAllUsers(Pageable pageable) {
    Page<User> users = userRepository.findAll(pageable);
    return ResponseEntity.ok(users);
}
```

**Patient tries to access (403 Forbidden):**
```bash
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer <patient-jwt>"
# Response: 403 Forbidden - Access Denied
```

**Admin accesses (200 OK):**
```bash
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer <admin-jwt>"
# Response: 200 OK with user list
```

### Example 3: Doctor-Specific Endpoint
```java
@GetMapping("/api/doctors/{id}/schedule")
@PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
public ResponseEntity<?> getDoctorSchedule(@PathVariable Long id) {
    Doctor doctor = userRepository.findById(id)
        .map(user -> (Doctor) user)
        .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

    return ResponseEntity.ok(doctor.getSchedule());
}
```

### Example 4: Role-Based or Owner Check
```java
@PutMapping("/api/users/{id}")
@PreAuthorize("hasRole('ADMIN') or @authService.isOwner(#id, authentication)")
public ResponseEntity<?> updateUser(
    @PathVariable Long id,
    @RequestBody UserUpdateRequest request
) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    user.setFullName(request.getFullName());
    user.setPhone(request.getPhone());
    // ... other updates

    return ResponseEntity.ok(userRepository.save(user));
}
```

Supporting service:
```java
@Service
public class AuthorizationService {

    public boolean isOwner(Long userId, Authentication authentication) {
        // Extract user ID from authentication details
        UsernamePasswordAuthenticationToken token =
            (UsernamePasswordAuthenticationToken) authentication;
        Long authUserId = (Long) token.getDetails();
        return userId.equals(authUserId);
    }
}
```

## 3. Whitelisted Endpoints (No JWT Required)

### Register New User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securepassword123",
    "fullName": "New User",
    "phone": "0123456789"
  }'
# Response: 201 Created
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
# Response: 200 OK with JWT token
```

### Refresh Token
```bash
curl -X POST http://localhost:8080/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
# Response: 200 OK with new JWT token
```

### Actuator Health Check (Monitoring)
```bash
curl -X GET http://localhost:8080/actuator/health
# Response: 200 OK {"status":"UP"}
```

### Swagger Documentation
```bash
# Access at:
http://localhost:8080/swagger-ui.html
http://localhost:8080/v3/api-docs
```

## 4. Error Scenarios

### Invalid JWT Token
```bash
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer invalid.token.here"
# Response: 401 Unauthorized or 403 Forbidden
# (Depends on filter configuration - currently continues without auth)
```

### Expired JWT Token
```bash
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NzM0NTc2OTh9.signature"
# Response: 403 Forbidden
# (Token is expired, filter continues without auth)
```

### Wrong Authorization Header Format
```bash
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Basic dXNlcjpwYXNz"
# Response: 403 Forbidden
# (Header doesn't start with "Bearer ")
```

### Missing Authorization Header
```bash
curl -X GET http://localhost:8080/api/users/profile
# Response: 403 Forbidden
# (No token provided, not authenticated)
```

### User Account Deactivated
```bash
# Even with valid JWT for inactive user:
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer <valid-jwt-for-inactive-user>"
# Response: 403 Forbidden
# (Filter doesn't set authentication for inactive users)
```

## 5. Frontend JavaScript Example

### Making Authenticated Requests
```javascript
// Store JWT token from login response
const token = response.data.accessToken;
localStorage.setItem('authToken', token);

// Helper function to make authenticated requests
async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('authToken');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401) {
        // Token expired or invalid
        // Try refresh token
        await refreshToken();
        return authenticatedFetch(url, options);
    }

    return response;
}

// Get user profile
async function getUserProfile() {
    const response = await authenticatedFetch('/api/users/profile');
    if (response.ok) {
        const user = await response.json();
        console.log('User:', user);
    } else {
        console.error('Failed to fetch profile');
    }
}

// Update user
async function updateUser(userId, userData) {
    const response = await authenticatedFetch(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
    });

    if (response.ok) {
        console.log('User updated successfully');
    }
}
```

### Interceptor Pattern (with Axios)
```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080'
});

// Request interceptor - add token to all requests
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Response interceptor - handle token expiration
api.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            const token = localStorage.getItem('refreshToken');
            try {
                const { data } = await axios.post(
                    'http://localhost:8080/api/auth/refresh-token',
                    { refreshToken: token }
                );
                localStorage.setItem('authToken', data.accessToken);
                // Retry original request
                return api(error.config);
            } catch {
                // Refresh failed - redirect to login
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Usage
api.get('/api/users/profile').then(response => {
    console.log(response.data);
});
```

## 6. Testing with cURL

### Complete Login and Use Token Flow
```bash
# 1. Login
LOGIN_RESPONSE=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
echo "Token: $TOKEN"

# 2. Use token to access protected endpoint
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer $TOKEN"

# 3. Try to access admin endpoint (if not admin)
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer $TOKEN"
```

## 7. Configuration for application.properties

```properties
# JWT Configuration
jwt.secret=mySecretKeyThatIsAtLeast256BitsLongForHS256Algorithm
jwt.expiration=3600000
jwt.refresh-expiration=604800000

# Server Configuration
server.port=8080
server.servlet.context-path=/

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/clinic_db
spring.datasource.username=postgres
spring.datasource.password=password

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# Logging
logging.level.com.clinicbooking.userservice.security=DEBUG
```

## Summary

The JWT authentication system provides:
1. Stateless authentication using JWT tokens
2. Role-based access control (RBAC)
3. User status verification
4. Graceful error handling
5. Whitelisted public endpoints
6. Seamless integration with Spring Security
