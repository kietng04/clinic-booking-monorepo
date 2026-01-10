# Payment Service

Payment Processing Microservice for Clinic Booking System with Momo Integration.

## Project Overview

**Service Name**: payment-service
**Port**: 8084
**Database**: PostgreSQL (port 5436)
**Framework**: Spring Boot 3.2.1
**Java Version**: 21

## Responsibilities

- Process payments via Momo wallet
- Manage payment transactions and orders
- Handle payment callbacks from Momo
- Publish payment events to Kafka
- Query payment history and refunds

## Project Structure

```
payment-service/
├── pom.xml                                          # Maven configuration
├── Dockerfile                                       # Container build configuration
├── README.md                                        # This file
└── src/
    ├── main/
    │   ├── java/com/clinicbooking/paymentservice/
    │   │   ├── PaymentServiceApplication.java       # Main application class
    │   │   ├── config/                              # Spring configuration classes
    │   │   │   ├── MomoConfig.java                  # Momo SDK configuration
    │   │   │   ├── KafkaConfig.java                 # Kafka producer config
    │   │   │   ├── SecurityConfig.java              # JWT + Security configuration
    │   │   │   ├── CacheConfig.java                 # Redis cache configuration
    │   │   │   └── ResilienceConfig.java            # Circuit breaker configuration
    │   │   │
    │   │   ├── entity/                              # JPA entities
    │   │   │   ├── PaymentOrder.java                # Main payment order entity
    │   │   │   ├── PaymentTransaction.java          # Momo transaction details
    │   │   │   └── RefundTransaction.java           # Refund transaction records
    │   │   │
    │   │   ├── dto/                                 # Data Transfer Objects
    │   │   │   ├── request/                         # Request DTOs
    │   │   │   │   ├── CreatePaymentRequest.java
    │   │   │   │   ├── QueryPaymentRequest.java
    │   │   │   │   └── RefundPaymentRequest.java
    │   │   │   │
    │   │   │   ├── response/                        # Response DTOs
    │   │   │   │   ├── PaymentResponse.java
    │   │   │   │   ├── PaymentStatusResponse.java
    │   │   │   │   └── MomoCallbackResponse.java
    │   │   │   │
    │   │   │   └── event/                           # Kafka event DTOs
    │   │   │       ├── PaymentEvent.java
    │   │   │       ├── PaymentCreatedEvent.java
    │   │   │       ├── PaymentCompletedEvent.java
    │   │   │       ├── PaymentFailedEvent.java
    │   │   │       └── PaymentRefundedEvent.java
    │   │   │
    │   │   ├── repository/                          # Spring Data JPA repositories
    │   │   │   ├── PaymentOrderRepository.java
    │   │   │   ├── PaymentTransactionRepository.java
    │   │   │   └── RefundTransactionRepository.java
    │   │   │
    │   │   ├── service/                             # Business logic layer
    │   │   │   ├── PaymentService.java              # Core payment service interface
    │   │   │   ├── PaymentServiceImpl.java           # Payment service implementation
    │   │   │   ├── MomoPaymentService.java          # Momo integration interface
    │   │   │   ├── MomoPaymentServiceImpl.java       # Momo SDK integration
    │   │   │   ├── PaymentEventPublisher.java       # Kafka event publishing
    │   │   │   └── RefundService.java               # Refund processing
    │   │   │
    │   │   ├── controller/                          # REST endpoints
    │   │   │   ├── PaymentController.java           # Main payment endpoints (auth required)
    │   │   │   └── MomoCallbackController.java      # Webhook endpoints (public)
    │   │   │
    │   │   ├── exception/                           # Exception handling
    │   │   │   ├── PaymentException.java
    │   │   │   ├── MomoException.java
    │   │   │   ├── InvalidSignatureException.java
    │   │   │   ├── PaymentNotFoundException.java
    │   │   │   └── GlobalExceptionHandler.java
    │   │   │
    │   │   ├── enums/                               # Enum types
    │   │   │   ├── PaymentStatus.java
    │   │   │   ├── PaymentMethod.java
    │   │   │   └── RefundStatus.java
    │   │   │
    │   │   └── util/                                # Utility classes
    │   │       ├── SignatureUtil.java               # HMAC-SHA256 signature
    │   │       ├── OrderIdGenerator.java
    │   │       ├── PaymentValidator.java
    │   │       └── DateTimeUtil.java
    │   │
    │   └── resources/
    │       ├── application.yml                      # Main configuration
    │       ├── application-dev.yml                  # Development configuration
    │       ├── application-prod.yml                 # Production configuration (optional)
    │       └── db/migration/
    │           ├── V1__create_payment_orders_table.sql
    │           ├── V2__create_payment_transactions_table.sql
    │           └── V3__create_refund_transactions_table.sql
    │
    └── test/
        └── java/com/clinicbooking/paymentservice/
            ├── service/
            │   ├── PaymentServiceTest.java
            │   ├── MomoPaymentServiceTest.java
            │   └── SignatureUtilTest.java
            │
            └── controller/
                ├── PaymentControllerTest.java
                └── MomoCallbackControllerTest.java
```

## Key Dependencies

### Spring Boot 3.2.1
- spring-boot-starter-web
- spring-boot-starter-data-jpa
- spring-boot-starter-security
- spring-boot-starter-actuator
- spring-boot-starter-validation
- spring-boot-starter-cache
- spring-boot-starter-data-redis

### Spring Cloud
- spring-cloud-starter-netflix-eureka-client
- spring-cloud-starter-openfeign
- spring-cloud-openfeign.circuitbreaker.enabled

### Payment & Integration
- Momo SDK: io.github.momo-wallet:momopayment:1.0
- OkHttp 3 for HTTP requests
- Gson for JSON processing

### Data & Caching
- PostgreSQL driver
- Flyway for database migrations
- Spring Data Redis
- Spring Cache

### Messaging
- spring-kafka

### Utilities
- MapStruct 1.5.5 for DTO mapping
- Lombok for code generation
- Resilience4j 2.1.0 for circuit breaker patterns

### Documentation
- springdoc-openapi 2.3.0 for Swagger/OpenAPI

## Configuration

### Environment Variables

```bash
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5436
POSTGRES_DB=payment_db
POSTGRES_USER=payment_user
POSTGRES_PASSWORD=payment123

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Service Discovery
EUREKA_URL=http://localhost:8761/eureka/

# Momo Configuration
MOMO_PARTNER_CODE=MOMOBKUN20180529
MOMO_ACCESS_KEY=klm05TvNBzhg7h7j
MOMO_SECRET_KEY=at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa
MOMO_PUBLIC_KEY=
MOMO_ENDPOINT=https://test-payment.momo.vn
MOMO_REDIRECT_URL=http://localhost:3000/payment/result
MOMO_IPN_URL=http://localhost:8084/api/payments/momo/callback

# JWT
JWT_SECRET=your-secret-key-here
```

### application.yml
Main configuration with database, Kafka, Redis, Eureka, and Momo settings.

### application-dev.yml
Development configuration with debug logging and local service URLs.

## Building the Project

### Prerequisites
- Java 21
- Maven 3.9+
- PostgreSQL 16
- Kafka 3.5+
- Redis 7.0+

### Build Commands

```bash
# Build the service
mvn clean package

# Build with tests skipped
mvn clean package -DskipTests

# Build only this module
cd payment-service
mvn clean package

# Run the application
java -jar target/payment-service.jar

# Run with specific profile
java -jar target/payment-service.jar --spring.profiles.active=dev
```

## Docker Build

```bash
# Build Docker image
docker build -t payment-service:latest .

# Run Docker container
docker run -d \
  --name payment-service \
  -p 8084:8084 \
  --env-file .env \
  payment-service:latest
```

## API Endpoints

### Payment Management (Authenticated)

- `POST /api/payments` - Create new payment order
- `GET /api/payments/{orderId}` - Get payment details
- `GET /api/payments/appointment/{appointmentId}` - Get payment by appointment
- `GET /api/payments/user/{userId}` - Get user payment history
- `POST /api/payments/{orderId}/query` - Query payment status from Momo
- `POST /api/payments/{orderId}/refund` - Request refund
- `GET /api/payments/{orderId}/refunds` - Get refund history

### Momo Webhook (Public - No Authentication)

- `POST /api/payments/momo/callback` - Momo IPN webhook
- `GET /api/payments/momo/return` - Return URL after payment

## Kafka Topics

- `payment.created` - Payment order created
- `payment.completed` - Payment successful
- `payment.failed` - Payment failed
- `payment.refunded` - Payment refunded

## Database Schema

### payment_orders
Stores payment order information with denormalized customer and doctor details.

### payment_transactions
Stores Momo transaction details and API responses.

### refund_transactions
Stores refund request and completion records.

## Key Features

1. **Momo Integration**: Full integration with Momo payment gateway via SDK
2. **Signature Verification**: HMAC-SHA256 signature validation for security
3. **Event Publishing**: Kafka event publishing for order and payment lifecycle
4. **Caching**: Redis caching for payment history and frequently accessed data
5. **Resilience**: Circuit breaker patterns with Resilience4j for Momo API calls
6. **Database Migrations**: Flyway for versioned schema migrations
7. **OpenAPI Documentation**: Swagger/OpenAPI documentation for REST APIs
8. **Centralized Exception Handling**: Global exception handler for consistent error responses

## Security

- JWT token validation for authenticated endpoints
- Momo signature verification for webhook callbacks
- Spring Security integration
- Non-root Docker user execution
- SQL injection prevention through parameterized queries

## Monitoring

- Actuator endpoints: `/actuator/health`, `/actuator/metrics`, `/actuator/prometheus`
- Structured logging with SLF4J
- Prometheus metrics integration
- Health checks in Docker

## Development Workflow

1. Create feature branch
2. Implement classes in appropriate packages
3. Write unit tests in src/test
4. Update database migrations if needed
5. Test with development configuration
6. Create pull request with changes

## Troubleshooting

See `/Users/kietnguyen/Documents/kltn/MOMO_TROUBLESHOOTING.md` for common issues and solutions.

## References

- Payment Service Architecture: `/Users/kietnguyen/Documents/kltn/PAYMENT_SERVICE_ARCHITECTURE.md`
- Momo Documentation: `/Users/kietnguyen/Documents/kltn/`
- Spring Boot Docs: https://spring.io/projects/spring-boot
- Spring Cloud: https://spring.io/projects/spring-cloud

## Next Steps

1. Implement entity classes (PaymentOrder, PaymentTransaction, RefundTransaction)
2. Create repository interfaces
3. Develop service layer with business logic
4. Create REST controllers with endpoints
5. Implement Momo SDK integration
6. Write comprehensive unit and integration tests
7. Set up monitoring and alerting
8. Deploy to test environment

---

**Version**: 1.0.0
**Created**: 2026-01-08
**Status**: Infrastructure Ready
