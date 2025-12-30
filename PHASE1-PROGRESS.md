# Phase 1: User Service - Implementation Progress

## ✅ Completed (60%)

### Project Structure
- ✅ Created user-service project directory structure
- ✅ Created pom.xml with all dependencies (Spring Boot 3.2.1, Spring Cloud, Kafka, PostgreSQL, JWT, etc.)
- ✅ Added user-service to parent pom.xml
- ✅ Created main application class (UserServiceApplication.java)

### Entities
- ✅ User entity (refactored - removed cross-service relationships)
- ✅ FamilyMember entity (refactored - removed cross-service relationships)
- Key change: Removed @OneToMany to Appointment, DoctorSchedule, Notification, MedicalRecord, etc.

### Repositories
- ✅ UserRepository with all query methods
- ✅ FamilyMemberRepository with all query methods

### Configuration
- ✅ application.yml with Eureka, Kafka, PostgreSQL, Redis configuration
- ✅ Flyway migration V1__init_schema.sql (creates users and family_members tables)

## 🚧 Remaining (40%)

### Services & Security (Critical Path)

1. **JWT Service** - Create `src/main/java/com/clinicbooking/userservice/security/JwtService.java`
   - Copy from monolith: `/src/main/java/com/clinicbooking/clinic_booking_system/security/JwtService.java`
   - No changes needed, just update package name

2. **Security Config** - Create `src/main/java/com/clinicbooking/userservice/config/SecurityConfig.java`
   - Copy from monolith: `/src/main/java/com/clinicbooking/clinic_booking_system/config/SecurityConfig.java`
   - Update package names
   - Remove endpoint-specific security (handled by API Gateway)
   - Allow all requests from API Gateway (trust X-User-Id headers)

3. **DTOs** - Create in `src/main/java/com/clinicbooking/userservice/dto/`
   - **auth/** folder:
     - `RegisterRequest.java` - user registration
     - `LoginRequest.java` - user login
     - `AuthResponse.java` - JWT tokens response
   - **user/** folder:
     - `UserResponseDto.java` - user data response
     - `UserCreateDto.java` - create user
     - `UserUpdateDto.java` - update user
   - **familymember/** folder:
     - `FamilyMemberResponseDto.java`
     - `FamilyMemberCreateDto.java`
     - `FamilyMemberUpdateDto.java`

4. **Mappers** - Create in `src/main/java/com/clinicbooking/userservice/mapper/`
   - `UserMapper.java` - MapStruct mapper
   - `FamilyMemberMapper.java` - MapStruct mapper

5. **Services** - Create in `src/main/java/com/clinicbooking/userservice/service/`
   - **AuthService.java** (interface) and **AuthServiceImpl.java**
     - register(RegisterRequest)
     - login(LoginRequest)
     - refreshToken(String)
   - **UserService.java**
     - CRUD operations
     - search methods
   - **FamilyMemberService.java**
     - CRUD operations
     - search by user

6. **Kafka Event Publishers** - Create in `src/main/java/com/clinicbooking/userservice/event/`
   - `UserEventPublisher.java`
     - publishUserCreated(User)
     - publishUserUpdated(User)
     - publishUserDeleted(Long userId)
   - `UserEvent.java` - event DTO

7. **Controllers** - Create in `src/main/java/com/clinicbooking/userservice/controller/`
   - `AuthController.java` - /api/auth/** endpoints
   - `UserController.java` - /api/users/** endpoints
   - `FamilyMemberController.java` - /api/family-members/** endpoints

### Docker & Deployment

8. **Dockerfile** - Create `microservices/user-service/Dockerfile`
   ```dockerfile
   FROM eclipse-temurin:21-jre-alpine
   WORKDIR /app
   RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup
   COPY target/user-service.jar app.jar
   RUN chown -R appuser:appgroup /app
   USER appuser
   EXPOSE 8081
   HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
     CMD wget --no-verbose --tries=1 --spider http://localhost:8081/actuator/health || exit 1
   ENTRYPOINT ["java", "-jar", "app.jar"]
   ```

9. **Update docker-compose.yml** - Add user-service:
   ```yaml
   user-service:
     build:
       context: ./user-service
       dockerfile: Dockerfile
     container_name: clinic_user_service
     ports:
       - "8081:8081"
     environment:
       POSTGRES_HOST: postgres-user
       POSTGRES_PORT: 5432
       POSTGRES_DB: user_service_db
       POSTGRES_USER: postgres
       POSTGRES_PASSWORD: postgres
       EUREKA_URL: http://eureka-server:8761/eureka/
       KAFKA_BOOTSTRAP_SERVERS: kafka:29092
       REDIS_HOST: redis
       REDIS_PORT: 6379
       JWT_SECRET: dGhpc2lzYXZlcnlsb25nc2VjcmV0a2V5Zm9yand0dG9rZW5nZW5lcmF0aW9uYW5kdmFsaWRhdGlvbjEyMzQ1Njc4OTA=
     depends_on:
       postgres-user:
         condition: service_healthy
       eureka-server:
         condition: service_healthy
       kafka:
         condition: service_healthy
       redis:
         condition: service_healthy
     networks:
       - clinic-network
     healthcheck:
       test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8081/actuator/health"]
       interval: 30s
       timeout: 10s
       retries: 5
       start_period: 90s
     restart: unless-stopped
   ```

## 📋 Testing Checklist

### 1. Build & Start
```bash
cd microservices
mvn clean package -DskipTests
docker-compose up -d user-service
```

### 2. Verify Service is Up
```bash
# Check logs
docker logs -f clinic_user_service

# Check health
curl http://localhost:8081/actuator/health

# Check Eureka registration
curl http://localhost:8761
# Should see user-service registered
```

### 3. Test Registration
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "phone": "0123456789",
    "role": "PATIENT"
  }'
```

### 4. Test Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 5. Test User Retrieval via Gateway
```bash
TOKEN="<access_token_from_login>"

curl -X GET http://localhost:8080/api/users/1 \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Verify Kafka Events
```bash
# Check if topics are created
docker exec -it clinic_kafka kafka-topics --list --bootstrap-server localhost:9092

# Should see: user.created, user.updated, user.deleted

# Consume events
docker exec -it clinic_kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic user.created \
  --from-beginning
```

## 🔗 Key Reference Files from Monolith

Copy these files and update package names:

1. `/src/main/java/com/clinicbooking/clinic_booking_system/security/JwtService.java`
2. `/src/main/java/com/clinicbooking/clinic_booking_system/config/SecurityConfig.java`
3. `/src/main/java/com/clinicbooking/clinic_booking_system/service/AuthService.java`
4. `/src/main/java/com/clinicbooking/clinic_booking_system/service/AuthServiceImpl.java`
5. `/src/main/java/com/clinicbooking/clinic_booking_system/service/UserService.java`
6. `/src/main/java/com/clinicbooking/clinic_booking_system/service/FamilyMemberService.java`
7. `/src/main/java/com/clinicbooking/clinic_booking_system/controller/AuthController.java`
8. `/src/main/java/com/clinicbooking/clinic_booking_system/controller/UserController.java`
9. `/src/main/java/com/clinicbooking/clinic_booking_system/controller/FamilyMemberController.java`
10. All DTO files from `/src/main/java/com/clinicbooking/clinic_booking_system/dto/`
11. All Mapper files from `/src/main/java/com/clinicbooking/clinic_booking_system/mapper/`

##  Quick Copy Command Template

```bash
# From microservices directory
# Copy a file from monolith to user-service
cp ../src/main/java/com/clinicbooking/clinic_booking_system/security/JwtService.java \
   user-service/src/main/java/com/clinicbooking/userservice/security/

# Then update package name
sed -i '' 's/clinic_booking_system/userservice/g' user-service/src/main/java/com/clinicbooking/userservice/security/JwtService.java
```

## 📊 Progress Tracking

- [x] Project structure - 100%
- [x] Entities - 100%
- [x] Repositories - 100%
- [x] Configuration - 100%
- [x] Database migration - 100%
- [ ] Security (JWT, Config) - 0%
- [ ] DTOs - 0%
- [ ] Mappers - 0%
- [ ] Services - 0%
- [ ] Event Publishers - 0%
- [ ] Controllers - 0%
- [ ] Docker setup - 0%
- [ ] Testing - 0%

**Overall: 60% Complete**

## ⏭️ Next Steps

1. Copy and adapt JWT & Security files (15 minutes)
2. Copy DTOs and Mappers (20 minutes)
3. Copy and adapt Services (30 minutes)
4. Copy Controllers (15 minutes)
5. Create Kafka Event Publishers (15 minutes)
6. Create Dockerfile and update docker-compose (10 minutes)
7. Build, deploy, and test (20 minutes)

**Estimated time to complete**: ~2 hours

## 🎯 Success Criteria for Phase 1

- ✅ User service runs on port 8081
- ✅ Registers with Eureka
- ✅ User registration works
- ✅ User login returns JWT token
- ✅ Token validation works via API Gateway
- ✅ Kafka events published on user create/update/delete
- ✅ PostgreSQL database has users and family_members tables
- ✅ Redis caching works for user lookups
- ✅ Health checks pass
- ✅ Accessible via API Gateway at http://localhost:8080/api/auth/** and /api/users/**
