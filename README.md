# Clinic Booking Microservices

## Architecture Overview

This is the microservices version of the Clinic Booking System, split into 4 domain-driven services:

1. **User Service** (Port 8081) - User authentication, profiles, family members
2. **Appointment Service** (Port 8082) - Appointments, scheduling, notifications
3. **Medical Service** (Port 8083) - Medical records, prescriptions, health metrics
4. **Consultation Service** (Port 8084) - Real-time consultations, messaging

## Infrastructure Components

### Service Discovery
- **Eureka Server** (Port 8761) - Service registry and discovery

### API Gateway
- **Spring Cloud Gateway** (Port 8080) - Single entry point, JWT validation, routing

### Message Broker
- **Kafka** (Port 9092) - Event-driven communication
- **Zookeeper** (Port 2181) - Kafka coordination

### Databases
- **PostgreSQL - User Service** (Port 5433)
- **PostgreSQL - Appointment Service** (Port 5434)
- **PostgreSQL - Medical Service** (Port 5435)
- **PostgreSQL - Consultation Service** (Port 5436)

### Cache
- **Redis** (Port 6379) - Shared cache cluster

### Email (Development)
- **MailHog** (SMTP: 1025, UI: 8025) - Email testing

## Prerequisites

- Java 21
- Docker & Docker Compose
- Maven 3.9+
- At least 8GB RAM available for Docker

## Quick Start

### 1. Build All Services

```bash
cd microservices
mvn clean package -DskipTests
```

### 2. Start Infrastructure

Start all infrastructure services (Eureka, Gateway, Kafka, PostgreSQL, Redis, MailHog):

```bash
docker-compose up -d
```

### 3. Verify Services

Check that all services are healthy:

```bash
docker-compose ps
```

### 4. Access Services

- **Eureka Dashboard**: http://localhost:8761
- **API Gateway Health**: http://localhost:8080/actuator/health
- **MailHog UI**: http://localhost:8025

## Phase 0: Infrastructure Setup ✅

Phase 0 is complete! The following services are now running:

- ✅ Eureka Server (Service Discovery)
- ✅ API Gateway (with JWT validation, circuit breakers, CORS)
- ✅ Kafka + Zookeeper (Message Broker)
- ✅ 4 PostgreSQL databases (ready for microservices)
- ✅ Redis (Shared cache)
- ✅ MailHog (Email testing)

## Next Steps

### Phase 1: User Service (Weeks 2-3)

Create the User & Authentication microservice:

1. Create user-service Spring Boot project
2. Migrate User and FamilyMember entities
3. Implement AuthService, UserService
4. Set up Kafka producers for user events
5. Register with Eureka
6. Test via API Gateway

### Phase 2: Appointment Service (Weeks 4-5)

Create the Appointment & Scheduling microservice with Kafka consumers.

### Phase 3: Medical Service (Weeks 6-7)

Create the Medical Records microservice.

### Phase 4: Consultation Service (Week 8)

Create the Consultation & Messaging microservice with WebSocket support.

### Phase 5: Integration & Testing (Week 9)

End-to-end testing and production cutover.

## Useful Commands

### Stop all services
```bash
docker-compose down
```

### Stop and remove volumes (clean slate)
```bash
docker-compose down -v
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f eureka-server
docker-compose logs -f api-gateway
docker-compose logs -f kafka
```

### Restart a specific service
```bash
docker-compose restart eureka-server
docker-compose restart api-gateway
```

### Access PostgreSQL databases
```bash
# User service database
docker exec -it clinic_postgres_user psql -U postgres -d user_service_db

# Appointment service database
docker exec -it clinic_postgres_appointment psql -U postgres -d appointment_service_db

# Medical service database
docker exec -it clinic_postgres_medical psql -U postgres -d medical_service_db

# Consultation service database
docker exec -it clinic_postgres_consultation psql -U postgres -d consultation_service_db
```

### Access Redis
```bash
docker exec -it clinic_redis redis-cli
```

### Check Kafka topics
```bash
docker exec -it clinic_kafka kafka-topics --list --bootstrap-server localhost:9092
```

## Troubleshooting

### Eureka Server not starting
- Check if port 8761 is available
- View logs: `docker-compose logs eureka-server`

### API Gateway cannot connect to Eureka
- Ensure Eureka is healthy: http://localhost:8761
- Check gateway logs: `docker-compose logs api-gateway`

### Kafka connection issues
- Ensure Zookeeper is running first
- Check logs: `docker-compose logs kafka`

### Database connection refused
- Check if PostgreSQL containers are healthy: `docker-compose ps`
- Verify ports are not in use: `lsof -i :5433` (or 5434, 5435, 5436)

## Project Structure

```
microservices/
├── pom.xml                 # Parent POM
├── docker-compose.yml      # Infrastructure orchestration
├── eureka-server/          # Service Discovery
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
├── api-gateway/            # API Gateway
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
├── user-service/           # (Phase 1 - To be created)
├── appointment-service/    # (Phase 2 - To be created)
├── medical-service/        # (Phase 3 - To be created)
└── consultation-service/   # (Phase 4 - To be created)
```

## Environment Variables

### API Gateway
- `EUREKA_URL`: Eureka server URL (default: http://localhost:8761/eureka/)
- `JWT_SECRET`: Base64-encoded JWT secret key

### All Microservices (when created)
- `SPRING_DATASOURCE_URL`: PostgreSQL connection URL
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password
- `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE`: Eureka server URL
- `SPRING_KAFKA_BOOTSTRAP_SERVERS`: Kafka bootstrap servers
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port

## Testing the Infrastructure

### 1. Test Eureka Server
```bash
curl http://localhost:8761/eureka/apps
```

Expected: XML response showing registered applications (currently empty)

### 2. Test API Gateway
```bash
curl http://localhost:8080/actuator/health
```

Expected: `{"status":"UP"}`

### 3. Test Kafka
```bash
docker exec -it clinic_kafka kafka-topics --create --topic test-topic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1

docker exec -it clinic_kafka kafka-topics --list --bootstrap-server localhost:9092
```

Expected: `test-topic` appears in the list

### 4. Test PostgreSQL
```bash
docker exec -it clinic_postgres_user psql -U postgres -d user_service_db -c "SELECT version();"
```

Expected: PostgreSQL version information

### 5. Test Redis
```bash
docker exec -it clinic_redis redis-cli ping
```

Expected: `PONG`

## Monitoring

### Health Checks
- Eureka: http://localhost:8761/actuator/health
- Gateway: http://localhost:8080/actuator/health

### Metrics
- Gateway metrics: http://localhost:8080/actuator/metrics

### Gateway Routes
- View all routes: http://localhost:8080/actuator/gateway/routes

## Notes

- All passwords are set to defaults (postgres/postgres, etc.) - **Change in production!**
- JWT secret is hardcoded - **Use environment variable in production!**
- MailHog is for development only - **Configure real SMTP in production!**
- Redis has no authentication - **Enable AUTH in production!**

## References

- Migration Plan: `/Users/kietnguyen/.claude/plans/elegant-chasing-unicorn.md`
- Original Monolith: `/Users/kietnguyen/Documents/clinic-booking-system/`
