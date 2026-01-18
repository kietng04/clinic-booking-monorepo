# Statistics API Documentation

## Overview

This document describes the comprehensive Statistics API for the Clinic Booking System. The API is organized in two phases:

- **Phase 1**: Service-level statistics endpoints in each microservice
- **Phase 2**: Aggregated statistics endpoints in the API Gateway/Appointment Service

All endpoints use **Bearer Token Authentication** and support **5-minute caching** for optimal performance.

---

## Phase 1: Service-Level Statistics

### 1. User Service - User Statistics

#### Endpoint: `GET /api/statistics/users/summary`

**Purpose**: Get comprehensive user statistics including total users, patients, doctors, and monthly metrics.

**Service**: User Service (Port 8081)

**Response Schema**:
```json
{
  "totalUsers": 250,
  "totalPatients": 180,
  "totalDoctors": 45,
  "activeUsers": 240,
  "inactiveUsers": 10,
  "newUsersThisMonth": 25,
  "newPatientsThisMonth": 15,
  "newDoctorsThisMonth": 5,
  "emailVerifiedUsers": 235,
  "phoneVerifiedUsers": 210,
  "generatedAt": "2025-01-08T10:30:00",
  "cacheDurationMinutes": 5
}
```

**Key Metrics**:
- Total registered users count
- Breakdown by role (Patient/Doctor/Admin)
- Active vs Inactive users
- New registrations this month
- Email and phone verification status

**Implementation**:
- **File**: `/user-service/src/main/java/com/clinicbooking/userservice/controller/StatisticsController.java`
- **Service**: `StatisticsServiceImpl.java`
- **DTO**: `UserStatisticsDto.java`
- **Cache**: `@Cacheable("userStatistics")` with 5-minute TTL

**Repository Methods Added**:
```java
long countActiveUsers();
long countInactiveUsers();
long countEmailVerifiedUsers();
long countPhoneVerifiedUsers();
long countNewUsersByRoleThisMonth(User.UserRole role);
long countNewUsersThisMonth();
```

**Performance**: Uses pure COUNT queries, no entity loading

---

### 2. Appointment Service - Appointment Statistics

#### Endpoint: `GET /api/statistics/appointments/summary`

**Purpose**: Get comprehensive appointment statistics including totals by status, time periods, types, and calculated metrics.

**Service**: Appointment Service (Port 8082)

**Response Schema**:
```json
{
  "totalAppointments": 500,
  "pendingAppointments": 120,
  "confirmedAppointments": 250,
  "completedAppointments": 100,
  "cancelledAppointments": 30,
  "appointmentsToday": 15,
  "appointmentsThisWeek": 85,
  "appointmentsThisMonth": 350,
  "inPersonAppointments": 300,
  "onlineAppointments": 200,
  "urgentAppointments": 50,
  "normalAppointments": 450,
  "upcomingAppointments": 200,
  "completionRate": 20.0,
  "cancellationRate": 6.0,
  "avgAppointmentsPerDay": 11.67,
  "generatedAt": "2025-01-08T10:30:00",
  "cacheDurationMinutes": 5
}
```

**Key Metrics**:
- Total appointments and breakdown by status
- Time-based statistics (today, week, month)
- Appointment type analysis (In-person vs Online)
- Priority levels (Urgent vs Normal)
- Calculated rates (completion, cancellation)
- Average appointments per day

**Implementation**:
- **File**: `/appointment-service/src/main/java/com/clinicbooking/appointmentservice/controller/AppointmentStatisticsController.java`
- **Service**: `AppointmentStatisticsServiceImpl.java`
- **DTO**: `AppointmentStatisticsDto.java`
- **Cache**: `@Cacheable("appointmentStatistics")` with 5-minute TTL

**Repository Methods Added**:
```java
long countByStatus(Appointment.AppointmentStatus status);
long countByType(Appointment.AppointmentType type);
long countByPriority(Appointment.Priority priority);
long countUpcomingAppointments();
long countAppointmentsThisMonth();
long countAppointmentsThisWeek();
long countAppointmentsToday();
```

**Performance**: Uses optimized SQL COUNT queries with date functions

---

### 3. Medical Service - Medical Statistics

#### Endpoint: `GET /api/statistics/medical/summary`

**Purpose**: Get comprehensive medical statistics including records, prescriptions, medications, and health metrics.

**Service**: Medical Service (Port 8083)

**Response Schema**:
```json
{
  "totalMedicalRecords": 450,
  "totalPrescriptions": 680,
  "medicalRecordsThisMonth": 45,
  "prescriptionsThisMonth": 68,
  "totalMedications": 250,
  "totalHealthMetrics": 1200,
  "healthMetricsThisMonth": 120,
  "avgPrescriptionsPerRecord": 1.51,
  "uniqueDoctorsCount": 35,
  "uniquePatientsCount": 300,
  "generatedAt": "2025-01-08T10:30:00",
  "cacheDurationMinutes": 5
}
```

**Key Metrics**:
- Total medical records and this month's count
- Total prescriptions and this month's count
- Medication inventory count
- Health metrics tracking
- Unique doctors and patients with records
- Average prescriptions per record

**Implementation**:
- **File**: `/medical-service/src/main/java/com/clinicbooking/medicalservice/controller/MedicalStatisticsController.java`
- **Service**: `MedicalStatisticsServiceImpl.java`
- **DTO**: `MedicalStatisticsDto.java`
- **Cache**: `@Cacheable("medicalStatistics")` with 5-minute TTL

**Repository Methods Added**:
```java
long countUniqueDoctors();
long countUniquePatients();
long countRecordsThisMonth();
long countPrescriptionsThisMonth();
long countMetricsThisMonth();
```

**Performance**: Uses COUNT(DISTINCT) and COUNT with date filtering

---

### 4. Clear Statistics Cache

#### Endpoint (All Services): `POST /api/statistics/cache/clear`

**Purpose**: Manually clear the cached statistics to get fresh data immediately.

**Response**: 204 No Content

**Implementation**: `@CacheEvict(value = "serviceName", allEntries = true)`

---

## Phase 2: Aggregated Statistics

All aggregate endpoints are in the **Appointment Service** at `/api/statistics/aggregate/`

### 1. Admin Dashboard Statistics

#### Endpoint: `GET /api/statistics/aggregate/dashboard`

**Purpose**: Get comprehensive dashboard with aggregated statistics from all services plus system health metrics.

**Response Schema**:
```json
{
  "userStatistics": {
    "totalUsers": 250,
    "totalPatients": 180,
    "totalDoctors": 45,
    ...
  },
  "appointmentStatistics": {
    "totalAppointments": 500,
    "completionRate": 20.0,
    ...
  },
  "medicalStatistics": {
    "totalMedicalRecords": 450,
    "totalPrescriptions": 680,
    ...
  },
  "systemHealth": {
    "totalActiveUsers": 240,
    "completionRate": 20.0,
    "avgDailyAppointments": 11.67,
    "utilizationRate": 65.5,
    "doctorPatientRatio": 4.0,
    "pendingActionsCount": 5
  },
  "generatedAt": "2025-01-08T10:30:00",
  "cacheDurationMinutes": 5
}
```

**System Health Metrics**:
- Total active users
- Overall completion rate
- Average daily appointments
- System utilization percentage
- Doctor to patient ratio
- Pending actions needing attention

**Implementation**:
- **File**: `/appointment-service/src/main/java/com/clinicbooking/appointmentservice/controller/AggregateStatisticsController.java`
- **Service**: `AggregateStatisticsServiceImpl.java`
- **DTO**: `AggregatedDashboardStatisticsDto.java`
- **Cache**: `@Cacheable("dashboardStatistics")` with 5-minute TTL
- **Feign Clients**: `UserServiceClient.java`, `MedicalServiceClient.java`

---

### 2. Patient-Specific Statistics

#### Endpoint: `GET /api/statistics/aggregate/patient/{patientId}`

**Purpose**: Get patient-specific statistics including appointment history and medical data.

**Path Parameters**:
- `patientId` (Long): The patient's ID

**Response Schema**:
```json
{
  "patientId": 123,
  "totalAppointments": 25,
  "completedAppointments": 20,
  "upcomingAppointments": 3,
  "cancelledAppointments": 2,
  "totalMedicalRecords": 15,
  "totalPrescriptions": 35,
  "lastAppointmentDate": "2025-01-05",
  "frequentDoctorId": 5,
  "completionRate": 80.0,
  "avgAppointmentsPerMonth": 2.5,
  "generatedAt": "2025-01-08T10:30:00",
  "cacheDurationMinutes": 5
}
```

**Key Metrics**:
- Total and status-based appointment counts
- Medical records and prescriptions count
- Most frequent doctor
- Appointment completion rate
- Average appointments per month

**Implementation**:
- **Cache**: `@Cacheable("patientStatistics", key = "#patientId")`
- **Data Source**: Local appointment data only
- **Performance**: Single database query on appointments table

---

### 3. Doctor-Specific Statistics

#### Endpoint: `GET /api/statistics/aggregate/doctor/{doctorId}`

**Purpose**: Get doctor-specific performance statistics and workload metrics.

**Path Parameters**:
- `doctorId` (Long): The doctor's ID

**Response Schema**:
```json
{
  "doctorId": 456,
  "totalAppointments": 150,
  "completedAppointments": 145,
  "pendingAppointments": 3,
  "cancelledAppointments": 2,
  "uniquePatients": 80,
  "totalMedicalRecords": 145,
  "totalPrescriptions": 220,
  "avgAppointmentsPerWeek": 12.5,
  "completionRate": 96.67,
  "avgAppointmentDuration": 30,
  "lastAppointmentDate": "2025-01-08",
  "appointmentsThisMonth": 45,
  "generatedAt": "2025-01-08T10:30:00",
  "cacheDurationMinutes": 5
}
```

**Key Metrics**:
- Total and status-based appointment counts
- Unique patient count
- Performance metrics (completion rate, duration)
- Medical records created and prescriptions issued
- Workload statistics (weekly, monthly)

**Implementation**:
- **Cache**: `@Cacheable("doctorStatistics", key = "#doctorId")`
- **Data Source**: Local appointment data only
- **Performance**: Single database query on appointments table

---

### 4. Clear All Statistics Caches

#### Endpoint: `POST /api/statistics/aggregate/cache/clear`

**Purpose**: Manually clear all cached statistics across all services.

**Response**: 204 No Content

**Implementation**:
```java
@CacheEvict(value = {"dashboardStatistics", "patientStatistics", "doctorStatistics"}, allEntries = true)
```

---

## Caching Strategy

All statistics endpoints implement **Spring Cache** with **5-minute TTL**:

```properties
spring.cache.type=redis
spring.redis.host=redis
spring.redis.port=6379
spring.cache.redis.time-to-live=300000
```

**Cache Keys**:
- `userStatistics`: User service statistics
- `appointmentStatistics`: Appointment statistics
- `medicalStatistics`: Medical statistics
- `dashboardStatistics`: Aggregated dashboard
- `patientStatistics:{patientId}`: Patient-specific data
- `doctorStatistics:{doctorId}`: Doctor-specific data

---

## Performance Optimizations

### Database Query Optimization

1. **Count Queries Only**: Statistics use pure `COUNT()` queries, never loading full entities
2. **Indexed Columns**: All queries use indexed columns (status, date, user IDs)
3. **Date Function Optimization**: Native SQL date functions (YEAR, MONTH, WEEK)

### Example Optimized Queries

```sql
-- User count by role
SELECT COUNT(u) FROM users WHERE role = 'DOCTOR'

-- Appointments by date and status
SELECT COUNT(a) FROM appointments
WHERE appointment_date = CURRENT_DATE
AND status IN ('PENDING', 'CONFIRMED')

-- Monthly medical records
SELECT COUNT(m) FROM medical_records
WHERE YEAR(created_at) = YEAR(CURRENT_DATE)
AND MONTH(created_at) = MONTH(CURRENT_DATE)
```

### Memory Efficiency

- No entity instantiation (pure COUNT)
- Pagination not used for counting
- Aggregation done at repository level
- Redis cache for frequently accessed data

---

## Error Handling

All endpoints handle the following error scenarios:

**400 Bad Request**: Invalid parameters
**401 Unauthorized**: Missing or invalid Bearer token
**404 Not Found**: Resource not found (patient/doctor ID)
**500 Internal Server Error**: Database or service errors

**Error Response**:
```json
{
  "timestamp": "2025-01-08T10:30:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Failed to fetch user statistics",
  "path": "/api/statistics/users/summary"
}
```

---

## Usage Examples

### cURL Examples

#### Get User Statistics
```bash
curl -X GET "http://localhost:8081/api/statistics/users/summary" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Appointment Statistics
```bash
curl -X GET "http://localhost:8082/api/statistics/appointments/summary" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Admin Dashboard
```bash
curl -X GET "http://localhost:8082/api/statistics/aggregate/dashboard" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Patient Statistics
```bash
curl -X GET "http://localhost:8082/api/statistics/aggregate/patient/123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Doctor Statistics
```bash
curl -X GET "http://localhost:8082/api/statistics/aggregate/doctor/456" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Clear All Caches
```bash
curl -X POST "http://localhost:8082/api/statistics/aggregate/cache/clear" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Files Created

### User Service
- `/user-service/src/main/java/com/clinicbooking/userservice/dto/statistics/UserStatisticsDto.java`
- `/user-service/src/main/java/com/clinicbooking/userservice/service/StatisticsService.java`
- `/user-service/src/main/java/com/clinicbooking/userservice/service/StatisticsServiceImpl.java`
- `/user-service/src/main/java/com/clinicbooking/userservice/controller/StatisticsController.java`
- Modified: `UserRepository.java` (added statistics query methods)

### Appointment Service
- `/appointment-service/src/main/java/com/clinicbooking/appointmentservice/dto/AppointmentStatisticsDto.java`
- `/appointment-service/src/main/java/com/clinicbooking/appointmentservice/dto/UserStatisticsDto.java`
- `/appointment-service/src/main/java/com/clinicbooking/appointmentservice/dto/MedicalStatisticsDto.java`
- `/appointment-service/src/main/java/com/clinicbooking/appointmentservice/dto/AggregatedDashboardStatisticsDto.java`
- `/appointment-service/src/main/java/com/clinicbooking/appointmentservice/dto/PatientStatisticsDto.java`
- `/appointment-service/src/main/java/com/clinicbooking/appointmentservice/dto/DoctorStatisticsDto.java`
- `/appointment-service/src/main/java/com/clinicbooking/appointmentservice/service/AppointmentStatisticsService.java`
- `/appointment-service/src/main/java/com/clinicbooking/appointmentservice/service/AppointmentStatisticsServiceImpl.java`
- `/appointment-service/src/main/java/com/clinicbooking/appointmentservice/service/AggregateStatisticsService.java`
- `/appointment-service/src/main/java/com/clinicbooking/appointmentservice/service/AggregateStatisticsServiceImpl.java`
- `/appointment-service/src/main/java/com/clinicbooking/appointmentservice/controller/AppointmentStatisticsController.java`
- `/appointment-service/src/main/java/com/clinicbooking/appointmentservice/controller/AggregateStatisticsController.java`
- `/appointment-service/src/main/java/com/clinicbooking/appointmentservice/client/MedicalServiceClient.java`
- Modified: `AppointmentRepository.java` (added statistics query methods)
- Modified: `UserServiceClient.java` (added statistics method)

### Medical Service
- `/medical-service/src/main/java/com/clinicbooking/medicalservice/dto/MedicalStatisticsDto.java`
- `/medical-service/src/main/java/com/clinicbooking/medicalservice/service/MedicalStatisticsService.java`
- `/medical-service/src/main/java/com/clinicbooking/medicalservice/service/MedicalStatisticsServiceImpl.java`
- `/medical-service/src/main/java/com/clinicbooking/medicalservice/controller/MedicalStatisticsController.java`
- Modified: `MedicalRecordRepository.java` (added statistics query methods)
- Modified: `PrescriptionRepository.java` (added statistics query methods)

---

## Production Checklist

- [x] Proper error handling with meaningful messages
- [x] Swagger/OpenAPI documentation on all endpoints
- [x] Caching strategy with TTL
- [x] Security with Bearer token authentication
- [x] Optimized database queries (COUNT only)
- [x] Comprehensive DTOs with proper annotations
- [x] Logging at appropriate levels
- [x] Transaction management (read-only)
- [x] Circuit breaker ready (Feign fallbacks)
- [x] Follows Spring Boot best practices
- [x] Production-ready code quality

---

## Future Enhancements

1. **Export Statistics**: Add CSV/PDF export functionality
2. **Real-time Updates**: WebSocket support for live dashboards
3. **Advanced Filtering**: Time range filters for statistics
4. **Trend Analysis**: Historical data and trend indicators
5. **Custom Reports**: User-defined report generation
6. **Alert Thresholds**: Configurable alert levels for key metrics
7. **Multi-language Support**: Localized statistics labels
8. **Performance Metrics**: System resource utilization tracking

---

## Support

For issues or questions about the Statistics API, please refer to:
- Swagger UI: `http://localhost:port/swagger-ui.html`
- API Documentation: `/v3/api-docs`
- Health Check: `http://localhost:port/actuator/health`

