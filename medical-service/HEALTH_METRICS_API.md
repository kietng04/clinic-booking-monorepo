# Health Metrics API Documentation

## Overview

The Health Metrics API is a comprehensive microservice component within the Medical Service that manages patient health metrics (vital signs and measurements). It provides endpoints for recording, retrieving, updating, and deleting health metrics with full validation, authorization, and audit support.

## Supported Health Metrics

The API supports the following metric types:

- **BLOOD_PRESSURE** - Blood pressure in format: `systolic/diastolic` (e.g., 120/80)
- **HEART_RATE** - Heart rate in bpm (20-300 range)
- **WEIGHT** - Weight in kg (1-500 range)
- **HEIGHT** - Height in cm (30-300 range)
- **TEMPERATURE** - Temperature in °C (30-45 range)
- **BLOOD_SUGAR** - Blood glucose in mg/dL (20-800 range)
- **BMI** - Body Mass Index
- **OXYGEN_SATURATION** - SpO2 percentage (50-100%)

## Architecture

### Entity Structure

**HealthMetric** (`/src/main/java/com/clinicbooking/medicalservice/entity/HealthMetric.java`)

```java
- id: Long (Primary Key)
- patientId: Long (Required, Foreign Key to User Service)
- patientName: String (Denormalized)
- metricType: String (Required, e.g., "blood_pressure")
- value: String (Required, the measurement value)
- unit: String (e.g., "mmHg", "bpm", "kg", "cm", "°C")
- measuredAt: LocalDateTime (Required, timestamp of measurement)
- notes: String (Optional notes)
- createdAt: LocalDateTime (Auto-populated, immutable)
- updatedAt: LocalDateTime (Auto-populated, updated on modification)
```

**Database Indexes:**
- `idx_patient_metric` - Composite index on (patient_id, metric_type, measured_at)
- `idx_health_metric_patient_id` - Index on patient_id
- `idx_health_metric_type` - Index on metric_type
- `idx_health_metric_measured_at` - Index on measured_at
- `idx_health_metric_created_at` - Index on created_at

### Data Transfer Objects

#### HealthMetricCreateDto
Used when creating a new health metric:
- `patientId`: Long (required)
- `patientName`: String (optional, auto-fetched if missing)
- `metricType`: String (required)
- `value`: String (required)
- `unit`: String (optional)
- `measuredAt`: LocalDateTime (required, ISO 8601 format)
- `notes`: String (optional)

#### HealthMetricResponseDto
Returned in API responses:
- `id`: Long
- `patientId`: Long
- `patientName`: String
- `metricType`: String
- `value`: String
- `unit`: String
- `measuredAt`: LocalDateTime
- `notes`: String
- `createdAt`: LocalDateTime
- `updatedAt`: LocalDateTime
- `isAbnormal`: Boolean (calculated based on metric type and value)

#### HealthMetricUpdateDto
Used when updating an existing metric:
- `metricType`: String (optional)
- `value`: String (optional)
- `unit`: String (optional)
- `measuredAt`: LocalDateTime (optional)
- `notes`: String (optional)

#### HealthMetricFilterDto
Advanced filtering options:
- `patientId`: Long (required)
- `metricType`: String (optional)
- `startDate`: LocalDateTime (optional)
- `endDate`: LocalDateTime (optional)
- `minValue`: Double (optional)
- `maxValue`: Double (optional)
- `isAbnormal`: Boolean (optional)
- `sortBy`: String (default: "measured_at")
- `sortDirection`: String (default: "DESC")
- `page`: Integer (default: 0)
- `pageSize`: Integer (default: 20)

### Repository

**HealthMetricRepository** extends `JpaRepository<HealthMetric, Long>`

**Query Methods:**
```java
// Pagination queries
Page<HealthMetric> findByPatientId(Long patientId, Pageable pageable);

// Filter queries
List<HealthMetric> findByPatientIdAndMetricType(Long patientId, String metricType);
List<HealthMetric> findByPatientIdAndMeasuredAtBetween(
    Long patientId, LocalDateTime start, LocalDateTime end);
List<HealthMetric> findByPatientIdAndMetricTypeAndMeasuredAtBetween(
    Long patientId, String metricType, LocalDateTime start, LocalDateTime end);

// Utility queries
Optional<HealthMetric> findLatestByPatientIdAndMetricType(
    Long patientId, String metricType);
List<HealthMetric> findByPatientIdOrderByMeasuredAtDesc(Long patientId);
long countByPatientIdAndMetricType(Long patientId, String metricType);
long countMetricsThisMonth();
```

### Service Layer

**HealthMetricService** Interface

```java
HealthMetricResponseDto createHealthMetric(HealthMetricCreateDto dto);
HealthMetricResponseDto getHealthMetricById(Long id);
Page<HealthMetricResponseDto> getHealthMetricsByPatientId(Long patientId, Pageable pageable);
List<HealthMetricResponseDto> getHealthMetricsByPatientIdAndType(Long patientId, String metricType);
List<HealthMetricResponseDto> getHealthMetricsByPatientIdAndDateRange(
    Long patientId, LocalDateTime start, LocalDateTime end);
HealthMetricResponseDto updateHealthMetric(Long id, HealthMetricUpdateDto dto);
void deleteHealthMetric(Long id);
```

**HealthMetricServiceImpl**

Complete implementation with:
- **Validation**: Comprehensive value validation for each metric type
  - Blood pressure format and range validation
  - Numeric metrics range validation
  - Systolic > diastolic check for blood pressure
- **Authorization**: Role-based access control
  - Patients can only access/modify their own metrics
  - Doctors can access all patient metrics
  - Admins have full access
- **Exception Handling**: Custom exceptions for validation, authorization, and resource not found
- **Logging**: Comprehensive logging for audit trails

### Controller

**HealthMetricController** (`/api/health-metrics`)

All endpoints require authentication via Bearer token.

#### POST /api/health-metrics
Create a new health metric
- **Request Body**: HealthMetricCreateDto
- **Response**: 201 Created with HealthMetricResponseDto
- **Validation**: Metric value format and range
- **Authorization**: Patient for self, Doctor/Admin for all

#### GET /api/health-metrics/{id}
Retrieve a specific health metric
- **Path Parameter**: id (Long)
- **Response**: 200 OK with HealthMetricResponseDto
- **Authorization**: Patient (own only), Doctor/Admin (all)

#### GET /api/health-metrics/patient/{patientId}
List all health metrics for a patient (paginated)
- **Path Parameter**: patientId (Long)
- **Query Parameters**: page, size, sort
- **Response**: 200 OK with Page<HealthMetricResponseDto>
- **Authorization**: Patient (own only), Doctor/Admin (all)

#### GET /api/health-metrics/patient/{patientId}/type/{metricType}
List all metrics of a specific type for a patient
- **Path Parameters**: patientId, metricType
- **Response**: 200 OK with List<HealthMetricResponseDto>
- **Authorization**: Patient (own only), Doctor/Admin (all)

#### GET /api/health-metrics/patient/{patientId}/range
List metrics within a date range
- **Path Parameter**: patientId (Long)
- **Query Parameters**:
  - start (required, ISO 8601 format)
  - end (required, ISO 8601 format)
- **Response**: 200 OK with List<HealthMetricResponseDto>
- **Authorization**: Patient (own only), Doctor/Admin (all)

#### PUT /api/health-metrics/{id}
Update an existing health metric
- **Path Parameter**: id (Long)
- **Request Body**: HealthMetricUpdateDto
- **Response**: 200 OK with HealthMetricResponseDto
- **Validation**: Updated metric value validation
- **Authorization**: Patient (own only), Admin

#### DELETE /api/health-metrics/{id}
Delete a health metric
- **Path Parameter**: id (Long)
- **Response**: 204 No Content
- **Authorization**: Patient (own only), Admin

### Mapper

**HealthMetricMapper** (MapStruct Interface)

```java
HealthMetric toEntity(HealthMetricCreateDto dto);
HealthMetricResponseDto toDto(HealthMetric entity);
List<HealthMetricResponseDto> toDtoList(List<HealthMetric> entities);
void updateEntityFromDto(HealthMetricUpdateDto dto, @MappingTarget HealthMetric entity);
```

## API Examples

### Create Health Metric
```bash
curl -X POST http://localhost:8080/api/health-metrics \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 123,
    "metricType": "blood_pressure",
    "value": "120/80",
    "unit": "mmHg",
    "measuredAt": "2024-01-08T10:30:00",
    "notes": "Morning measurement"
  }'
```

### Get Patient Metrics
```bash
curl -X GET http://localhost:8080/api/health-metrics/patient/123?page=0&size=10 \
  -H "Authorization: Bearer {token}"
```

### Get Specific Metric Type
```bash
curl -X GET http://localhost:8080/api/health-metrics/patient/123/type/blood_pressure \
  -H "Authorization: Bearer {token}"
```

### Get Metrics in Date Range
```bash
curl -X GET "http://localhost:8080/api/health-metrics/patient/123/range?start=2024-01-01T00:00:00&end=2024-01-31T23:59:59" \
  -H "Authorization: Bearer {token}"
```

### Update Metric
```bash
curl -X PUT http://localhost:8080/api/health-metrics/456 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "125/82",
    "notes": "Retaken after rest"
  }'
```

## Validation Rules

### Blood Pressure
- Format: `\d{2,3}/\d{2,3}` (e.g., 120/80)
- Systolic range: 50-300 mmHg
- Diastolic range: 30-200 mmHg
- Systolic must be > Diastolic
- Abnormal: systolic > 140 or systolic < 90 or diastolic > 90 or diastolic < 60

### Heart Rate
- Format: numeric
- Range: 20-300 bpm
- Abnormal: > 100 or < 60 bpm

### Blood Sugar
- Format: numeric (decimal allowed)
- Range: 20-800 mg/dL
- Abnormal: > 200 or < 70 mg/dL

### Temperature
- Format: numeric (decimal allowed)
- Range: 30-45 °C
- Abnormal: > 38.0 or < 36.0 °C

### Weight
- Format: numeric (decimal allowed)
- Range: 1-500 kg
- No specific abnormal range

### Height
- Format: numeric (decimal allowed)
- Range: 30-300 cm
- No specific abnormal range

### Oxygen Saturation
- Format: numeric (decimal allowed)
- Range: 50-100%
- No specific abnormal range

## Database Migration

**V1__init_schema.sql** - Creates health_metrics table with all indexes

Schema:
```sql
CREATE TABLE health_metrics (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    patient_name VARCHAR(255),
    metric_type VARCHAR(50) NOT NULL,
    value VARCHAR(100) NOT NULL,
    unit VARCHAR(20),
    measured_at TIMESTAMP NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Integration with Other Services

### User Service Client
The API integrates with the User Service to:
- Fetch patient information (name, contact) for denormalization
- Validate patient existence
- Maintain data consistency

### Event Publishing
The API publishes events for health metrics creation/updates to notify other services:
- `HealthMetricCreatedEvent`
- `HealthMetricUpdatedEvent`
- `HealthMetricDeletedEvent`

## Error Handling

The API returns appropriate HTTP status codes:
- **201 Created**: Successful creation
- **200 OK**: Successful read/update operations
- **204 No Content**: Successful deletion
- **400 Bad Request**: Validation errors (invalid metric value, format issues)
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Unexpected server errors

Error responses include detailed messages in Vietnamese for user guidance.

## Performance Considerations

1. **Composite Index**: `(patient_id, metric_type, measured_at)` optimizes common queries
2. **Pagination**: List endpoints support pagination to limit response size
3. **Caching**: Consider implementing Redis caching for recent metrics
4. **Archival**: Implement archival strategy for old metrics (>2 years)
5. **Batch Operations**: Consider bulk insert APIs for IoT/wearable device data

## Security Features

1. **Authentication**: Required Bearer token for all endpoints
2. **Authorization**: Role-based access control (PATIENT, DOCTOR, ADMIN)
3. **Input Validation**: Comprehensive validation of all inputs
4. **SQL Injection Prevention**: Parameterized queries via Spring Data JPA
5. **CORS**: Configured per Spring Security settings
6. **Audit Trail**: All operations logged with timestamps and user information

## Future Enhancements

1. **Abnormality Detection**: Real-time alerts for abnormal metrics
2. **Trend Analysis**: Calculate trends and patterns
3. **Report Generation**: PDF/Excel health metric reports
4. **Integration with Wearables**: Support IoT health devices
5. **Machine Learning**: Predictive health analytics
6. **Bulk Upload**: CSV import capability
7. **Export Features**: Export metrics in multiple formats
8. **Notifications**: Push notifications for abnormal readings

## Testing

All components include comprehensive unit tests:
- Service layer tests with mock repositories
- Controller tests with MockMvc
- Validation tests for each metric type
- Authorization tests for different roles

## Deployment

The Health Metrics API:
- Runs as part of the Medical Service microservice
- Requires PostgreSQL database with migration scripts
- Requires Spring Boot 3.x and Java 21+
- Integrates with service discovery (Eureka)
- Supports Kubernetes deployment with health checks

## Support

For issues or questions, refer to:
- Service implementation: `/src/main/java/com/clinicbooking/medicalservice/service/HealthMetricServiceImpl.java`
- Controller: `/src/main/java/com/clinicbooking/medicalservice/controller/HealthMetricController.java`
- Database schema: `/src/main/resources/db/migration/V1__init_schema.sql`
