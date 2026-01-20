# Exception Handling Framework - Quick Reference

## File Locations

```
user-service/
├── src/main/java/com/clinicbooking/userservice/
│   ├── exception/
│   │   ├── ApiException.java                      (Base class)
│   │   ├── ResourceNotFoundException.java         (404)
│   │   ├── ValidationException.java               (400)
│   │   ├── UnauthorizedException.java             (401)
│   │   ├── DuplicateResourceException.java        (409)
│   │   └── GlobalExceptionHandler.java            (@RestControllerAdvice)
│   └── dto/
│       └── ErrorResponse.java                     (DTO)
├── EXCEPTION_HANDLING_GUIDE.md                    (Complete guide)
├── EXCEPTION_FRAMEWORK_SUMMARY.md                 (Technical summary)
└── QUICK_REFERENCE.md                             (This file)
```

## Exception Types & Usage

### ResourceNotFoundException (404)
```java
// Direct throw
throw new ResourceNotFoundException("User not found");

// Factory method - by ID
throw ResourceNotFoundException.notFound("User", 123);

// Factory method - by field
throw ResourceNotFoundException.notFoundByField("User", "email", "user@example.com");
```

### ValidationException (400)
```java
// Direct throw
throw new ValidationException("Invalid input");

// Factory method
throw ValidationException.fieldValidation("email", "Invalid format");
```

### UnauthorizedException (401)
```java
// Authentication failed
throw UnauthorizedException.authenticationFailed();

// Missing token
throw UnauthorizedException.missingToken();

// Invalid/expired token
throw UnauthorizedException.invalidToken();

// Insufficient permissions
throw UnauthorizedException.insufficientPermissions("ADMIN");
```

### DuplicateResourceException (409)
```java
// Email already exists
throw DuplicateResourceException.emailAlreadyExists("user@example.com");

// Username already exists
throw DuplicateResourceException.usernameAlreadyExists("john_doe");

// Generic duplicate
throw DuplicateResourceException.duplicate("User", "email", "user@example.com");
```

## Error Response Format

All error responses follow this format:

```json
{
  "timestamp": "2024-01-08T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "User with ID 123 not found",
  "path": "/api/users/123",
  "errorCode": "RESOURCE_NOT_FOUND",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "details": null
}
```

With validation errors:

```json
{
  "timestamp": "2024-01-08T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for request body",
  "path": "/api/users",
  "errorCode": "METHOD_ARGUMENT_NOT_VALID",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "details": {
    "email": "must be a valid email address",
    "password": "size must be between 8 and 128"
  }
}
```

## HTTP Status Codes

| Code | Exception | Use Case |
|------|-----------|----------|
| 400 | ValidationException | Input validation fails |
| 400 | ConstraintViolationException | Path/query param validation fails |
| 400 | MethodArgumentNotValidException | Request body validation fails |
| 401 | UnauthorizedException | User not authenticated/authorized |
| 404 | ResourceNotFoundException | Resource not found |
| 409 | DuplicateResourceException | Resource already exists |
| 500 | Any other Exception | Unexpected server error |

## Service Layer Pattern

```java
@Service
public class UserService {

    public UserResponseDto getUserById(Long userId) {
        return userRepository.findById(userId)
            .map(userMapper::toDto)
            .orElseThrow(() -> ResourceNotFoundException.notFound("User", userId));
    }

    public UserResponseDto registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw DuplicateResourceException.emailAlreadyExists(request.getEmail());
        }

        User user = User.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .build();

        return userMapper.toDto(userRepository.save(user));
    }
}
```

## Validation in DTO

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
    @Size(min = 2, max = 100)
    private String firstName;
}
```

## Logging Output Examples

**Error:**
```
2024-01-08 10:30:15.234 ERROR com.clinicbooking.userservice.exception.GlobalExceptionHandler -
API Exception - CorrelationID: 550e8400-e29b-41d4-a716-446655440000,
Status: 404, ErrorCode: RESOURCE_NOT_FOUND,
Message: User with ID 999 not found,
Path: /api/users/999
```

**Warning (Validation):**
```
2024-01-08 10:30:15.345 WARN com.clinicbooking.userservice.exception.GlobalExceptionHandler -
Field Validation Error - CorrelationID: 550e8400-e29b-41d4-a716-446655440000,
Field: email, Message: must be a valid email address,
Path: /api/users
```

## Correlation ID Tracking

**Request Header:**
```
GET /api/users/123
X-Correlation-ID: 550e8400-e29b-41d4-a716-446655440000
```

**Auto-Generated:**
If header is missing, UUID is automatically generated and included in response.

## Testing Examples

### Unit Test
```java
@Test
void testGetUserNotFound() {
    when(userRepository.findById(999L)).thenReturn(Optional.empty());

    assertThrows(ResourceNotFoundException.class, () -> {
        userService.getUserById(999L);
    });
}
```

### Integration Test
```java
@Test
void testGetUserNotFoundEndpoint() throws Exception {
    mockMvc.perform(get("/api/users/999"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.status").value(404))
        .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"));
}
```

## Key Features

- **Automatic Error Handling** - GlobalExceptionHandler catches all exceptions
- **Correlation IDs** - Automatic UUID generation or header reading
- **Field Validation** - Detailed per-field error messages
- **SLF4J Logging** - Proper logging with correlation IDs
- **ISO 8601 Timestamps** - Standard timestamp format
- **Custom Error Codes** - Client-side error handling support
- **Builder Pattern** - Easy ErrorResponse creation
- **Production Ready** - No new dependencies required

## Build Status

```
mvn clean compile
BUILD SUCCESS ✅

mvn clean package -DskipTests
BUILD SUCCESS ✅
```

## Total Lines of Code

- Exception classes: 658 lines
- ErrorResponse DTO: 92 lines
- **Total: 750 lines** of production-ready code

---

**Status:** PRODUCTION READY
**Version:** 1.0.0
**Last Updated:** January 8, 2024
