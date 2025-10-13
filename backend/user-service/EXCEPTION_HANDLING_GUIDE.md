# Exception Handling Framework - User Service

Complete production-ready exception handling framework for the User Service microservice.

## Overview

This framework provides:
- Unified exception handling across all API endpoints
- Consistent error response format
- Automatic logging with correlation IDs
- Detailed field-level validation error messages
- HTTP status code mapping
- Support for custom error codes

## Files Created

### 1. Base Exception Classes

#### `ApiException.java`
Base exception class for all custom exceptions. Extends `RuntimeException` with HTTP status and error code support.

```java
public class ApiException extends RuntimeException {
    private final HttpStatus status;
    private final String errorCode;

    public ApiException(String message, HttpStatus status)
    public ApiException(String message, HttpStatus status, String errorCode)
    public ApiException(String message, HttpStatus status, String errorCode, Throwable cause)

    public HttpStatus getStatus()
    public String getErrorCode()
}
```

### 2. Specific Exception Classes

#### `ResourceNotFoundException.java`
Thrown when a requested resource is not found (HTTP 404)

```java
throw new ResourceNotFoundException("User not found");

// Or using factory methods:
throw ResourceNotFoundException.notFound("User", 123);
throw ResourceNotFoundException.notFoundByField("User", "email", "user@example.com");
```

#### `ValidationException.java`
Thrown when validation fails (HTTP 400)

```java
throw new ValidationException("Invalid input data");
throw ValidationException.fieldValidation("email", "must be a valid email");
```

#### `UnauthorizedException.java`
Thrown when a user is not authorized (HTTP 401)

```java
throw UnauthorizedException.authenticationFailed();
throw UnauthorizedException.missingToken();
throw UnauthorizedException.invalidToken();
throw UnauthorizedException.insufficientPermissions("ADMIN");
```

#### `DuplicateResourceException.java`
Thrown when trying to create a duplicate resource (HTTP 409)

```java
throw DuplicateResourceException.emailAlreadyExists("user@example.com");
throw DuplicateResourceException.usernameAlreadyExists("john_doe");
throw DuplicateResourceException.duplicate("User", "email", "user@example.com");
```

### 3. Error Response DTO

#### `ErrorResponse.java`
Standard API error response format with fields:
- `timestamp`: ISO 8601 format (e.g., "2024-01-08T10:30:00")
- `status`: HTTP status code (int)
- `error`: HTTP status reason phrase (e.g., "Not Found")
- `message`: Human-readable error message
- `path`: Request URI that caused the error
- `errorCode`: Optional custom error code
- `details`: Optional map of additional details (e.g., field validation errors)
- `correlationId`: Unique request correlation ID for tracing

```java
// Using builder
ErrorResponse errorResponse = ErrorResponse.builder()
    .withCurrentTimestamp()
    .status(404)
    .error("Not Found")
    .message("User with ID 123 not found")
    .path("/api/users/123")
    .errorCode("RESOURCE_NOT_FOUND")
    .correlationId("550e8400-e29b-41d4-a716-446655440000")
    .build();

// Adding details
errorResponse.addDetail("userId", 123);
```

### 4. Global Exception Handler

#### `GlobalExceptionHandler.java`
REST controller advice that handles all exceptions uniformly.

**Features:**
- Handles all custom exceptions (ResourceNotFoundException, ValidationException, etc.)
- Handles Spring validation exceptions (ConstraintViolationException, MethodArgumentNotValidException)
- Handles generic exceptions with proper logging
- Automatic correlation ID generation (creates UUID if not provided)
- SLF4J logging with correlation IDs
- Field-level validation error details

**Handled Exceptions:**
1. `ResourceNotFoundException` - HTTP 404
2. `ValidationException` - HTTP 400
3. `UnauthorizedException` - HTTP 401
4. `DuplicateResourceException` - HTTP 409
5. `ConstraintViolationException` - HTTP 400 (path/query param validation)
6. `MethodArgumentNotValidException` - HTTP 400 (request body validation)
7. Generic `Exception` - HTTP 500

## Usage Examples

### Example 1: Using in Service Layer

```java
@Service
public class UserService {

    public UserResponseDto getUserById(Long userId) {
        return userRepository.findById(userId)
            .map(user -> userMapper.toDto(user))
            .orElseThrow(() -> ResourceNotFoundException.notFound("User", userId));
    }

    public UserResponseDto registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw DuplicateResourceException.emailAlreadyExists(request.getEmail());
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw DuplicateResourceException.usernameAlreadyExists(request.getUsername());
        }

        User user = User.builder()
            .email(request.getEmail())
            .username(request.getUsername())
            .password(passwordEncoder.encode(request.getPassword()))
            .build();

        return userMapper.toDto(userRepository.save(user));
    }
}
```

### Example 2: Error Response Examples

**ResourceNotFoundException Response:**
```json
{
  "timestamp": "2024-01-08T10:30:15",
  "status": 404,
  "error": "Not Found",
  "message": "User with ID 123 not found",
  "path": "/api/users/123",
  "errorCode": "RESOURCE_NOT_FOUND",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**ValidationException with Field Details:**
```json
{
  "timestamp": "2024-01-08T10:30:15",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for request body",
  "path": "/api/users",
  "errorCode": "METHOD_ARGUMENT_NOT_VALID",
  "details": {
    "email": "must be a valid email address",
    "password": "size must be between 8 and 128",
    "firstName": "must not be blank"
  },
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**DuplicateResourceException Response:**
```json
{
  "timestamp": "2024-01-08T10:30:15",
  "status": 409,
  "error": "Conflict",
  "message": "User with email 'user@example.com' already exists",
  "path": "/api/users",
  "errorCode": "EMAIL_ALREADY_EXISTS",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**UnauthorizedException Response:**
```json
{
  "timestamp": "2024-01-08T10:30:15",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authorization token is invalid or expired",
  "path": "/api/users/profile",
  "errorCode": "INVALID_TOKEN",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Constraint Violation Response (Path/Query Parameters):**
```json
{
  "timestamp": "2024-01-08T10:30:15",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for request parameters",
  "path": "/api/users/search",
  "errorCode": "CONSTRAINT_VIOLATION",
  "details": {
    "page": "must be greater than or equal to 0",
    "size": "must be less than or equal to 100"
  },
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Internal Server Error Response:**
```json
{
  "timestamp": "2024-01-08T10:30:15",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred. Please contact support.",
  "path": "/api/users/profile",
  "errorCode": "INTERNAL_SERVER_ERROR",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Correlation ID Tracking

The framework automatically handles correlation IDs for tracing requests across services:

**1. From Request Header:**
If the request includes an `X-Correlation-ID` header, it will be used:
```
GET /api/users/123
X-Correlation-ID: 550e8400-e29b-41d4-a716-446655440000
```

**2. Auto-Generated:**
If no header is provided, a UUID is automatically generated and included in the error response.

**3. Logging:**
Every error is logged with the correlation ID for easy tracing:
```
2024-01-08 10:30:15.234 - ERROR [userService] CorrelationID: 550e8400-e29b-41d4-a716-446655440000,
Message: User with ID 123 not found, Path: /api/users/123
```

## Field Validation Error Handling

### Request Body Validation
Use Jakarta validation annotations on DTO fields:

```java
@Data
public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 128, message = "Password must be 8-128 characters")
    private String password;

    @NotBlank(message = "First name is required")
    private String firstName;
}
```

### Path/Query Parameter Validation
Use validation annotations on controller parameters:

```java
@GetMapping("/users/search")
public ResponseEntity<Page<UserResponseDto>> searchUsers(
    @Valid
    @ParameterObject
    UserSearchFilter filter
) {
    return ResponseEntity.ok(userService.searchUsers(filter));
}
```

## HTTP Status Code Mapping

| Exception | HTTP Status | Status Code |
|-----------|-------------|-------------|
| ResourceNotFoundException | 404 | NOT_FOUND |
| ValidationException | 400 | BAD_REQUEST |
| UnauthorizedException | 401 | UNAUTHORIZED |
| DuplicateResourceException | 409 | CONFLICT |
| ConstraintViolationException | 400 | BAD_REQUEST |
| MethodArgumentNotValidException | 400 | BAD_REQUEST |
| Generic Exception | 500 | INTERNAL_SERVER_ERROR |

## Logging Configuration

The framework uses SLF4J for logging. Configure logging levels in `application.yml`:

```yaml
logging:
  level:
    com.clinicbooking.userservice.exception: DEBUG
    com.clinicbooking.userservice: INFO
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

## Best Practices

1. **Use Specific Exceptions**: Use the most specific exception type rather than generic ApiException
2. **Provide Clear Messages**: Error messages should be understandable by API clients
3. **Use Factory Methods**: Use factory methods (e.g., `notFound()`, `emailAlreadyExists()`) for consistency
4. **Include Correlation IDs**: Always pass correlation IDs through inter-service calls
5. **Log at Appropriate Levels**:
   - Error level for exceptions
   - Warn level for validation failures
   - Debug level for detailed traces
6. **Handle at the Service Layer**: Throw exceptions in service layer, don't suppress them in controllers
7. **Custom Error Codes**: Use meaningful error codes for client-side error handling

## Testing Exception Handling

### Unit Test Example

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void testGetUserByIdNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            userService.getUserById(999L);
        });
    }

    @Test
    void testRegisterUserWithDuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("user@example.com");

        when(userRepository.existsByEmail("user@example.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> {
            userService.registerUser(request);
        });
    }
}
```

### Integration Test Example

```java
@SpringBootTest
@AutoConfigureMockMvc
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testGetUserNotFound() throws Exception {
        mockMvc.perform(get("/api/users/999"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.error").value("Not Found"))
            .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"))
            .andExpect(jsonPath("$.correlationId").isNotEmpty());
    }
}
```

## Performance Considerations

- **Correlation ID Generation**: UUID generation is minimal overhead (~1-2 microseconds)
- **Logging**: Async logging recommended for high-traffic services
- **Serialization**: Jackson serialization is fast and cached by Spring
- **Response Size**: Error responses are kept minimal (~500-1000 bytes)

## Future Enhancements

Potential improvements:
1. Custom error documentation per error code
2. Multi-language error messages
3. Error rate metrics collection
4. Automatic retry logic suggestions
5. Detailed API documentation with error codes
6. Client SDK error type generation from error codes

---

**Version**: 1.0.0
**Last Updated**: January 8, 2024
**Status**: Production Ready
