# Inter-Service Communication

## Synchronous Communication (Feign Clients)

```mermaid
graph TB
    subgraph "Appointment Service"
        AS[Appointment Service]
        UC1[UserServiceClient]
        UCF1[UserServiceClientFallback]
    end

    subgraph "Medical Service"
        MS[Medical Service]
        UC2[UserServiceClient]
        UCF2[UserServiceClientFallback]
        AC[AppointmentServiceClient]
        ACF[AppointmentServiceClientFallback]
    end

    subgraph "User Service"
        US[User Service]
        UserAPI[User API Endpoints]
    end

    subgraph "Appointment API"
        AppAPI[Appointment API Endpoints]
    end

    AS -->|Feign Client| UC1
    UC1 -->|REST Call| UserAPI
    UC1 -.->|Fallback on error| UCF1

    MS -->|Feign Client| UC2
    UC2 -->|REST Call| UserAPI
    UC2 -.->|Fallback on error| UCF2

    MS -->|Feign Client| AC
    AC -->|REST Call| AppAPI
    AC -.->|Fallback on error| ACF

    AS --> AppAPI

    style AS fill:#e8f5e9
    style MS fill:#fff9c4
    style US fill:#f3e5f5
    style UC1 fill:#b3e5fc
    style UC2 fill:#b3e5fc
    style AC fill:#b3e5fc
    style UCF1 fill:#ffccbc
    style UCF2 fill:#ffccbc
    style ACF fill:#ffccbc
```

## Feign Client Details

### From Appointment Service to User Service

```mermaid
sequenceDiagram
    participant AppSvc as Appointment Service
    participant Feign as UserServiceClient
    participant Fallback as Fallback Handler
    participant CB as Circuit Breaker
    participant UserAPI as User Service API

    AppSvc->>Feign: getUserById(userId)
    Feign->>CB: Check circuit state

    alt Circuit OPEN (too many failures)
        CB-->>Fallback: Trigger fallback immediately
        Fallback-->>AppSvc: Fallback UserDto<br/>(empty/default values)
    else Circuit CLOSED
        CB->>UserAPI: GET /api/users/{userId}
        UserAPI-->>CB: Response

        alt Success
            CB-->>Feign: UserDto
            Feign-->>AppSvc: UserDto
        else Timeout/Error
            CB->>CB: Record failure
            CB-->>Fallback: Trigger fallback
            Fallback-->>AppSvc: Fallback UserDto
        end
    end
```

**UserServiceClient Methods:**
- `getUserById(Long userId)` → `UserDto`
- `getUserStatistics()` → `UserStatisticsDto`

**Fallback Behavior:**
```java
// UserServiceClientFallback
@Override
public UserDto getUserById(Long userId) {
    log.warn("Fallback: User service unavailable for userId: {}", userId);
    return UserDto.builder()
        .id(userId)
        .fullName("Unknown User")
        .email("unavailable@service.com")
        .role(UserRole.PATIENT)
        .build();
}

@Override
public UserStatisticsDto getUserStatistics() {
    log.warn("Fallback: User service unavailable. Returning empty statistics");
    return UserStatisticsDto.builder()
        .totalUsers(0L)
        .totalPatients(0L)
        .totalDoctors(0L)
        // ... all 0 values
        .build();
}
```

### From Medical Service to User Service

```mermaid
sequenceDiagram
    participant MedSvc as Medical Service
    participant Feign as UserServiceClient
    participant Fallback as Fallback Handler
    participant UserAPI as User Service API

    MedSvc->>Feign: getUserById(userId)

    alt User Service Available
        Feign->>UserAPI: GET /api/users/{userId}
        UserAPI-->>Feign: UserDto
        Feign-->>MedSvc: UserDto
    else User Service Down/Timeout
        Feign->>Fallback: Trigger fallback
        Fallback-->>MedSvc: Fallback UserDto<br/>(minimal data)
        Note over MedSvc: May return 503 Service Unavailable<br/>or proceed with cached data
    end
```

### From Medical Service to Appointment Service

```mermaid
sequenceDiagram
    participant MedSvc as Medical Service
    participant Feign as AppointmentServiceClient
    participant Fallback as Fallback Handler
    participant AppAPI as Appointment Service API

    MedSvc->>Feign: getAppointmentById(appointmentId)

    alt Appointment Service Available
        Feign->>AppAPI: GET /api/appointments/{id}
        AppAPI-->>Feign: AppointmentDto
        Feign-->>MedSvc: AppointmentDto
    else Appointment Service Down/Timeout
        Feign->>Fallback: Trigger fallback
        Fallback-->>MedSvc: Fallback AppointmentDto<br/>(status=UNKNOWN)
        Note over MedSvc: May reject medical record creation<br/>if appointment validation required
    end
```

**AppointmentServiceClient Methods:**
- `getAppointmentById(Long appointmentId)` → `AppointmentDto`

**Fallback Behavior:**
```java
// AppointmentServiceClientFallback
@Override
public AppointmentDto getAppointmentById(Long appointmentId) {
    log.warn("Fallback: Appointment service unavailable for appointmentId: {}", appointmentId);
    return AppointmentDto.builder()
        .id(appointmentId)
        .status("UNKNOWN")
        .build();
}
```

## Feign Configuration

```yaml
feign:
  client:
    config:
      default:
        connectTimeout: 5000      # 5 seconds
        readTimeout: 5000         # 5 seconds
        loggerLevel: BASIC
  circuitbreaker:
    enabled: true

resilience4j:
  circuitbreaker:
    instances:
      userService:
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
        permittedNumberOfCallsInHalfOpenState: 3
      appointmentService:
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
```

## Error Handling Flow

```mermaid
flowchart TD
    Start([Feign Client Call]) --> Try[Send REST request]
    Try --> Wait{Response<br/>within timeout?}

    Wait -->|Yes| CheckStatus{HTTP Status}
    Wait -->|No| Timeout[Timeout Exception]

    CheckStatus -->|2xx| Success[Return response]
    CheckStatus -->|4xx/5xx| Error[HTTP Error]

    Timeout --> CB[Circuit Breaker<br/>records failure]
    Error --> CB

    CB --> Check{Failure rate<br/>> threshold?}
    Check -->|Yes| Open[Open Circuit]
    Check -->|No| Fallback[Trigger Fallback]

    Open --> Fallback
    Fallback --> Return[Return fallback response]

    Success --> Done([Success])
    Return --> Warn([Warn + Degraded Response])

    style Start fill:#e1f5ff
    style Success fill:#c8e6c9
    style Done fill:#c8e6c9
    style Open fill:#ffcdd2
    style Timeout fill:#ffcdd2
    style Error fill:#ffcdd2
    style Fallback fill:#ffecb3
    style Return fill:#ffe082
    style Warn fill:#fff9c4
```

## Service Dependencies Graph

```mermaid
graph LR
    subgraph External
        MOMO[MoMo API]
        VNPAY[VNPay API]
    end

    subgraph Core Services
        US[User Service<br/>Independent]
        AS[Appointment Service<br/>Depends on: User]
        MS[Medical Service<br/>Depends on: User, Appointment]
        PS[Payment Service<br/>Depends on: None]
    end

    AS -->|Feign| US
    MS -->|Feign| US
    MS -->|Feign| AS
    PS -->|HTTPS| MOMO
    PS -->|HTTPS| VNPAY

    style US fill:#4caf50,color:#fff
    style AS fill:#ff9800,color:#fff
    style MS fill:#f44336,color:#fff
    style PS fill:#2196f3,color:#fff
```

**Dependency Levels:**
- **Level 0** (No dependencies): User Service, Payment Service
- **Level 1** (Depends on Level 0): Appointment Service
- **Level 2** (Depends on Level 1): Medical Service

**Startup Order:**
1. Start User Service
2. Start Appointment Service & Payment Service (can be parallel)
3. Start Medical Service

## Circuit Breaker States

```mermaid
stateDiagram-v2
    [*] --> CLOSED: Initial state

    CLOSED --> OPEN: Failure rate > 50%
    CLOSED --> CLOSED: Successful calls

    OPEN --> HALF_OPEN: Wait duration elapsed (10s)

    HALF_OPEN --> CLOSED: Permitted calls succeed
    HALF_OPEN --> OPEN: Any call fails

    note right of CLOSED
        Normal operation
        All requests pass through
        Monitor failure rate
    end note

    note right of OPEN
        Fast fail
        All requests go to fallback
        Wait 10 seconds before retry
    end note

    note right of HALF_OPEN
        Test recovery
        Allow 3 calls to test service
        If successful: return to CLOSED
        If failed: return to OPEN
    end note
```

## Retry Strategy

```mermaid
flowchart TD
    Start([Request Failed]) --> Check{Retryable<br/>error?}

    Check -->|No| Fallback[Use Fallback]
    Check -->|Yes| Attempt{Attempt<br/>count?}

    Attempt -->|< 3| Wait[Wait with backoff:<br/>1s, 2s, 4s]
    Attempt -->|>= 3| Fallback

    Wait --> Retry[Retry request]
    Retry --> Success{Success?}

    Success -->|Yes| Done([Return response])
    Success -->|No| Attempt

    Fallback --> FallbackResponse([Return fallback response])

    style Start fill:#e1f5ff
    style Done fill:#c8e6c9
    style Fallback fill:#ffecb3
    style FallbackResponse fill:#ffe082
```

**Retryable Errors:**
- Connection timeout
- Socket timeout
- HTTP 503 (Service Unavailable)
- HTTP 504 (Gateway Timeout)

**Non-Retryable Errors:**
- HTTP 400 (Bad Request)
- HTTP 401 (Unauthorized)
- HTTP 403 (Forbidden)
- HTTP 404 (Not Found)

## Load Balancing

```mermaid
graph TB
    subgraph "Appointment Service Instances"
        AS1[Appointment Service<br/>Instance 1]
        AS2[Appointment Service<br/>Instance 2]
        AS3[Appointment Service<br/>Instance 3]
    end

    subgraph "User Service Client"
        Feign[Feign Client]
        LB[Load Balancer<br/>Round Robin]
    end

    Feign --> LB
    LB -->|Request 1| AS1
    LB -->|Request 2| AS2
    LB -->|Request 3| AS3
    LB -->|Request 4| AS1

    style Feign fill:#b3e5fc
    style LB fill:#fff9c4
    style AS1 fill:#e8f5e9
    style AS2 fill:#e8f5e9
    style AS3 fill:#e8f5e9
```

**Load Balancing Strategy:**
- **Algorithm**: Round Robin (default)
- **Service Discovery**: Can integrate with Eureka/Consul
- **Health Check**: Enabled (exclude unhealthy instances)

## Request/Response DTOs

### UserDto
```json
{
  "id": 123,
  "email": "user@example.com",
  "fullName": "Nguyen Van A",
  "phone": "0901234567",
  "role": "PATIENT",
  "specialization": "Cardiology",
  "licenseNumber": "MD12345",
  "isActive": true
}
```

### AppointmentDto
```json
{
  "id": 456,
  "patientId": 10,
  "doctorId": 5,
  "patientName": "Nguyen Van A",
  "doctorName": "Dr. Tran Thi B",
  "appointmentDate": "2026-02-15",
  "appointmentTime": "14:00:00",
  "status": "COMPLETED",
  "type": "IN_PERSON"
}
```

### UserStatisticsDto
```json
{
  "totalUsers": 1500,
  "totalPatients": 1200,
  "totalDoctors": 50,
  "activeUsers": 1450,
  "inactiveUsers": 50,
  "newUsersThisMonth": 120,
  "newPatientsThisMonth": 100,
  "newDoctorsThisMonth": 5,
  "emailVerifiedUsers": 1000,
  "phoneVerifiedUsers": 800
}
```

## Monitoring and Logging

```mermaid
flowchart TD
    Start([Feign Client Call]) --> Log1[Log: Request URL, Method, Headers]
    Log1 --> Send[Send Request]
    Send --> Receive[Receive Response]
    Receive --> Log2[Log: Status Code, Response Time]
    Log2 --> Metrics[Record Metrics:<br/>- Response time<br/>- Success/Failure rate<br/>- Circuit breaker state]

    Metrics --> Check{Success?}
    Check -->|Yes| Success[Log: Success]
    Check -->|No| Error[Log: Error details<br/>Stack trace]

    Success --> Done([Complete])
    Error --> Alert{Critical?}
    Alert -->|Yes| Notify[Send Alert]
    Alert -->|No| Done

    Notify --> Done

    style Start fill:#e1f5ff
    style Done fill:#c8e6c9
    style Error fill:#ffcdd2
    style Notify fill:#ff9800,color:#fff
```

## Best Practices Summary

1. **Always implement fallbacks** - Never let Feign client failures crash the service
2. **Use circuit breakers** - Prevent cascading failures
3. **Set appropriate timeouts** - 5 seconds for read/connect
4. **Enable retry with backoff** - For transient failures
5. **Log all Feign calls** - For debugging and monitoring
6. **Cache responses when possible** - Reduce inter-service calls
7. **Use DTOs for communication** - Don't expose internal entities
8. **Version your APIs** - Prevent breaking changes
9. **Implement health checks** - Monitor service availability
10. **Use service discovery** - For dynamic service location
