# User Registration and Authentication Flow

## User Registration Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant GW as API Gateway
    participant Auth as AuthController
    participant AuthS as AuthService
    participant UserS as UserService
    participant UserR as UserRepository
    participant Pass as PasswordEncoder
    participant EventP as EventPublisher
    participant Kafka
    participant JWT as JwtService
    participant DB as PostgreSQL

    User->>UI: Fill registration form
    UI->>GW: POST /api/auth/register<br/>{email, password, fullName, role}
    GW->>Auth: Forward request
    Auth->>AuthS: register(RegisterRequest)

    AuthS->>UserR: existsByEmail(email)
    UserR->>DB: SELECT * FROM users WHERE email=?
    DB-->>UserR: Result
    UserR-->>AuthS: boolean

    alt Email exists
        AuthS-->>Auth: throw RuntimeException
        Auth-->>GW: 400 Bad Request
        GW-->>UI: Error: Email đã tồn tại
    end

    AuthS->>UserR: existsByPhone(phone)
    UserR->>DB: SELECT * FROM users WHERE phone=?
    DB-->>UserR: Result
    UserR-->>AuthS: boolean

    alt Phone exists
        AuthS-->>Auth: throw RuntimeException
        Auth-->>GW: 400 Bad Request
        GW-->>UI: Error: Số điện thoại đã tồn tại
    end

    alt Role is DOCTOR
        AuthS->>AuthS: Validate specialization required
        AuthS->>AuthS: Validate licenseNumber required
        alt Missing required fields
            AuthS-->>Auth: throw RuntimeException
            Auth-->>GW: 400 Bad Request
            GW-->>UI: Error: Doctor credentials required
        end
    end

    AuthS->>Pass: encode(password)
    Pass-->>AuthS: hashedPassword

    AuthS->>UserS: createUser(User entity)
    UserS->>UserR: save(user)
    UserR->>DB: INSERT INTO users
    DB-->>UserR: User saved
    UserR-->>UserS: User entity with ID

    UserS->>EventP: publishUserCreated(user)
    EventP->>Kafka: Publish "user.created" event

    UserS-->>AuthS: User entity

    AuthS->>JWT: generateToken(userId, email, role)
    JWT-->>AuthS: JWT token

    AuthS->>JWT: generateRefreshToken(userId)
    JWT-->>AuthS: Refresh token

    AuthS-->>Auth: AuthResponse<br/>{token, refreshToken, userId, email, role}
    Auth-->>GW: 201 Created
    GW-->>UI: AuthResponse
    UI-->>User: Registration successful<br/>Redirect to dashboard
```

## User Login Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant GW as API Gateway
    participant Auth as AuthController
    participant AuthS as AuthService
    participant UserR as UserRepository
    participant Pass as PasswordEncoder
    participant JWT as JwtService
    participant DB as PostgreSQL

    User->>UI: Enter email & password
    UI->>GW: POST /api/auth/login<br/>{email, password}
    GW->>Auth: Forward request
    Auth->>AuthS: login(LoginRequest)

    AuthS->>UserR: findByEmail(email)
    UserR->>DB: SELECT * FROM users WHERE email=?
    DB-->>UserR: User or null
    UserR-->>AuthS: Optional<User>

    alt User not found
        AuthS-->>Auth: throw RuntimeException
        Auth-->>GW: 401 Unauthorized
        GW-->>UI: Error: Email hoặc mật khẩu không đúng
    end

    alt User is not active (isActive=false)
        AuthS-->>Auth: throw RuntimeException
        Auth-->>GW: 403 Forbidden
        GW-->>UI: Error: Tài khoản đã bị khóa
    end

    AuthS->>Pass: matches(rawPassword, encodedPassword)
    Pass-->>AuthS: boolean

    alt Password incorrect
        AuthS-->>Auth: throw RuntimeException
        Auth-->>GW: 401 Unauthorized
        GW-->>UI: Error: Email hoặc mật khẩu không đúng
    end

    AuthS->>JWT: generateToken(userId, email, role)
    JWT-->>AuthS: JWT token

    AuthS->>JWT: generateRefreshToken(userId)
    JWT-->>AuthS: Refresh token

    AuthS-->>Auth: AuthResponse<br/>{token, refreshToken, userId, email, role}
    Auth-->>GW: 200 OK
    GW-->>UI: AuthResponse
    UI-->>User: Login successful<br/>Store token & redirect
```

## Token Refresh Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant GW as API Gateway
    participant Auth as AuthController
    participant JWT as JwtService
    participant UserR as UserRepository
    participant DB as PostgreSQL

    User->>UI: Access expired (401)
    UI->>GW: POST /api/auth/refresh<br/>{refreshToken}
    GW->>Auth: Forward request
    Auth->>JWT: validateRefreshToken(refreshToken)
    JWT-->>Auth: userId

    alt Invalid refresh token
        JWT-->>Auth: throw JwtException
        Auth-->>GW: 401 Unauthorized
        GW-->>UI: Redirect to login
    end

    Auth->>UserR: findById(userId)
    UserR->>DB: SELECT * FROM users WHERE id=?
    DB-->>UserR: User
    UserR-->>Auth: User

    Auth->>JWT: generateToken(userId, email, role)
    JWT-->>Auth: New JWT token

    Auth->>JWT: generateRefreshToken(userId)
    JWT-->>Auth: New refresh token

    Auth-->>GW: 200 OK<br/>{token, refreshToken}
    GW-->>UI: New tokens
    UI-->>User: Continue with new token
```

## Event: User Created

```mermaid
graph LR
    A[User Service] -->|Publish| B[Kafka: user.created]
    B -->|Subscribe| C[Appointment Service]
    B -->|Subscribe| D[Medical Service]

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#ff9,stroke:#333,stroke-width:2px
    style C fill:#9f9,stroke:#333,stroke-width:2px
    style D fill:#9ff,stroke:#333,stroke-width:2px
```

**Event Payload:**
```json
{
  "userId": 123,
  "email": "user@example.com",
  "fullName": "Nguyen Van A",
  "phone": "0901234567",
  "role": "PATIENT",
  "timestamp": "2026-01-21T10:00:00",
  "eventType": "CREATED"
}
```

## Error Handling Summary

| Error | HTTP Status | Message |
|-------|-------------|---------|
| Email exists | 400 Bad Request | Email đã tồn tại |
| Phone exists | 400 Bad Request | Số điện thoại đã tồn tại |
| Missing doctor credentials | 400 Bad Request | Chuyên khoa/Số giấy phép không được để trống cho bác sĩ |
| User not found | 401 Unauthorized | Email hoặc mật khẩu không đúng |
| Wrong password | 401 Unauthorized | Email hoặc mật khẩu không đúng |
| Account locked | 403 Forbidden | Tài khoản đã bị khóa |
| Invalid token | 401 Unauthorized | Token không hợp lệ hoặc đã hết hạn |
