# Architecture Overview

```mermaid
graph TB
    subgraph "Frontend"
        UI[React Frontend<br/>Port: 3000]
    end

    subgraph "API Gateway"
        GW[API Gateway<br/>Port: 8080]
    end

    subgraph "Backend Microservices"
        US[User Service<br/>Port: 8081]
        AS[Appointment Service<br/>Port: 8082]
        MS[Medical Service<br/>Port: 8084]
        PS[Payment Service<br/>Port: 8083]
    end

    subgraph "Databases"
        DB1[(PostgreSQL<br/>User DB)]
        DB2[(PostgreSQL<br/>Appointment DB)]
        DB3[(PostgreSQL<br/>Medical DB)]
        DB4[(PostgreSQL<br/>Payment DB)]
    end

    subgraph "Infrastructure"
        REDIS[(Redis Cache)]
        KAFKA[Apache Kafka<br/>Event Bus]
    end

    subgraph "External Services"
        MOMO[MoMo Payment<br/>Gateway]
        VNPAY[VNPay Payment<br/>Gateway]
    end

    UI --> GW

    GW --> US
    GW --> AS
    GW --> MS
    GW --> PS

    US --> DB1
    AS --> DB2
    MS --> DB3
    PS --> DB4

    US --> REDIS
    AS --> REDIS
    PS --> REDIS

    US --> KAFKA
    AS --> KAFKA
    MS --> KAFKA
    PS --> KAFKA

    AS -->|Feign Client| US
    MS -->|Feign Client| US
    MS -->|Feign Client| AS

    PS -->|HTTPS API| MOMO
    PS -->|HTTPS API| VNPAY

    style UI fill:#e1f5ff
    style GW fill:#fff3e0
    style US fill:#f3e5f5
    style AS fill:#e8f5e9
    style MS fill:#fff9c4
    style PS fill:#ffe0b2
    style KAFKA fill:#ffccbc
    style REDIS fill:#ffcdd2
```

## Components

### Frontend
- **React Frontend**: User interface for patients, doctors, and admins
- Port: 3000

### API Gateway
- **API Gateway**: Routes requests to appropriate microservices
- Port: 8080
- Handles JWT authentication and authorization

### Backend Services
- **User Service** (Port 8081): User management, authentication, authorization
- **Appointment Service** (Port 8082): Appointment booking and scheduling
- **Medical Service** (Port 8084): Medical records, prescriptions, health metrics
- **Payment Service** (Port 8083): Payment processing with MoMo/VNPay

### Databases
- Each service has its own PostgreSQL database (Database per Service pattern)
- Schema isolation and independent scaling

### Infrastructure
- **Redis**: Distributed caching for performance
- **Apache Kafka**: Event-driven communication between services

### External Services
- **MoMo Payment Gateway**: Mobile payment processing
- **VNPay Gateway**: Bank card payment processing

## Communication Patterns

1. **Synchronous**:
   - Frontend ↔ Gateway ↔ Services (REST API)
   - Inter-service via Feign Clients

2. **Asynchronous**:
   - Services ↔ Kafka (Event publishing/consumption)

3. **Caching**:
   - Services ↔ Redis (Read-through cache)
