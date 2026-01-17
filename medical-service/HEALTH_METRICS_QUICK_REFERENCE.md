# Health Metrics API - Quick Reference Guide

## File Structure

```
medical-service/
├── src/main/java/com/clinicbooking/medicalservice/
│   ├── entity/
│   │   └── HealthMetric.java
│   ├── repository/
│   │   └── HealthMetricRepository.java
│   ├── dto/healthmetric/
│   │   ├── HealthMetricCreateDto.java
│   │   ├── HealthMetricResponseDto.java
│   │   ├── HealthMetricUpdateDto.java
│   │   └── HealthMetricFilterDto.java
│   ├── service/
│   │   ├── HealthMetricService.java (interface)
│   │   └── HealthMetricServiceImpl.java (implementation)
│   ├── mapper/
│   │   └── HealthMetricMapper.java
│   └── controller/
│       └── HealthMetricController.java
├── src/main/resources/db/migration/
│   └── V1__init_schema.sql
└── HEALTH_METRICS_API.md
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/health-metrics` | Create new metric |
| GET | `/api/health-metrics/{id}` | Get metric by ID |
| GET | `/api/health-metrics/patient/{patientId}` | List patient metrics (paginated) |
| GET | `/api/health-metrics/patient/{patientId}/type/{metricType}` | List metrics by type |
| GET | `/api/health-metrics/patient/{patientId}/range` | List metrics in date range |
| PUT | `/api/health-metrics/{id}` | Update metric |
| DELETE | `/api/health-metrics/{id}` | Delete metric |

## Supported Metric Types

- `blood_pressure` - Format: `120/80`
- `heart_rate` - Format: `72` (numeric)
- `weight` - Format: `70.5` (kg)
- `height` - Format: `175` (cm)
- `temperature` - Format: `37.5` (°C)
- `blood_sugar` - Format: `120` (mg/dL)
- `bmi` - Format: `23.5`
- `oxygen_saturation` - Format: `98` (%)

## Request/Response Examples

### Create Health Metric
**Request:**
```json
POST /api/health-metrics
Content-Type: application/json
Authorization: Bearer {token}

{
  "patientId": 123,
  "metricType": "blood_pressure",
  "value": "120/80",
  "unit": "mmHg",
  "measuredAt": "2024-01-08T10:30:00",
  "notes": "Morning measurement"
}
```

**Response (201):**
```json
{
  "id": 456,
  "patientId": 123,
  "patientName": "Nguyen Van A",
  "metricType": "blood_pressure",
  "value": "120/80",
  "unit": "mmHg",
  "measuredAt": "2024-01-08T10:30:00",
  "notes": "Morning measurement",
  "createdAt": "2024-01-08T10:35:00",
  "updatedAt": "2024-01-08T10:35:00",
  "isAbnormal": false
}
```

### Get Patient Metrics (Paginated)
**Request:**
```
GET /api/health-metrics/patient/123?page=0&size=10
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "content": [
    {
      "id": 456,
      "patientId": 123,
      "patientName": "Nguyen Van A",
      "metricType": "blood_pressure",
      "value": "120/80",
      "unit": "mmHg",
      "measuredAt": "2024-01-08T10:30:00",
      "notes": "Morning measurement",
      "createdAt": "2024-01-08T10:35:00",
      "updatedAt": "2024-01-08T10:35:00",
      "isAbnormal": false
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "sorted": true,
      "direction": "DESC"
    }
  },
  "totalElements": 1,
  "totalPages": 1
}
```

### Update Metric
**Request:**
```json
PUT /api/health-metrics/456
Content-Type: application/json
Authorization: Bearer {token}

{
  "value": "125/82",
  "notes": "Retaken after rest"
}
```

**Response (200):**
```json
{
  "id": 456,
  "patientId": 123,
  "patientName": "Nguyen Van A",
  "metricType": "blood_pressure",
  "value": "125/82",
  "unit": "mmHg",
  "measuredAt": "2024-01-08T10:30:00",
  "notes": "Retaken after rest",
  "createdAt": "2024-01-08T10:35:00",
  "updatedAt": "2024-01-08T11:00:00",
  "isAbnormal": false
}
```

## Error Responses

### Validation Error (400)
```json
{
  "timestamp": "2024-01-08T10:35:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Định dạng huyết áp không hợp lệ. Vui lòng nhập theo định dạng: 120/80",
  "path": "/api/health-metrics"
}
```

### Authorization Error (403)
```json
{
  "timestamp": "2024-01-08T10:35:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Bạn chỉ có thể tạo chỉ số sức khỏe cho mình",
  "path": "/api/health-metrics"
}
```

### Not Found (404)
```json
{
  "timestamp": "2024-01-08T10:35:00",
  "status": 404,
  "error": "Not Found",
  "message": "Không tìm thấy chỉ số sức khỏe",
  "path": "/api/health-metrics/999"
}
```

## Authorization Rules

| Role | Create | Read Own | Read All | Update Own | Delete Own |
|------|--------|----------|----------|-----------|-----------|
| PATIENT | ✓ | ✓ | ✗ | ✓ | ✓ |
| DOCTOR | ✓ | ✓ | ✓ | ✗ | ✗ |
| ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ |

## Validation Rules

### Blood Pressure
- Format: `\d{2,3}/\d{2,3}`
- Valid ranges: Systolic 50-300, Diastolic 30-200
- Rule: Systolic > Diastolic

### Numeric Metrics
- Format: `\d+(\.\d+)?` (integer or decimal)
- Specific ranges enforced per metric type

### Abnormality Detection
- Blood Pressure: > 140/90 or < 90/60
- Heart Rate: > 100 or < 60
- Blood Sugar: > 200 or < 70
- Temperature: > 38.0 or < 36.0
- Others: No automatic abnormality detection

## Common Query Examples

### Get Latest Blood Pressure
```bash
curl -X GET http://localhost:8080/api/health-metrics/patient/123/type/blood_pressure \
  -H "Authorization: Bearer {token}"
```

### Get Metrics for Last 7 Days
```bash
curl -X GET "http://localhost:8080/api/health-metrics/patient/123/range" \
  -H "Authorization: Bearer {token}" \
  -d "start=2024-01-01T00:00:00&end=2024-01-08T23:59:59"
```

### Get Abnormal Metrics (Manual)
Query database directly:
```sql
SELECT * FROM health_metrics
WHERE patient_id = 123
  AND metric_type = 'blood_pressure'
  AND (CAST(SUBSTRING_INDEX(value, '/', 1) AS DECIMAL) > 140
       OR CAST(SUBSTRING_INDEX(value, '/', -1) AS DECIMAL) > 90)
ORDER BY measured_at DESC;
```

## Database Queries

### Find All Metrics for Patient
```sql
SELECT * FROM health_metrics WHERE patient_id = 123 ORDER BY measured_at DESC;
```

### Find Latest Metric by Type
```sql
SELECT * FROM health_metrics
WHERE patient_id = 123 AND metric_type = 'blood_pressure'
ORDER BY measured_at DESC LIMIT 1;
```

### Count Metrics This Month
```sql
SELECT COUNT(*) FROM health_metrics
WHERE YEAR(created_at) = YEAR(CURDATE())
  AND MONTH(created_at) = MONTH(CURDATE());
```

## Testing Commands

### Test Create
```bash
curl -X POST http://localhost:8080/api/health-metrics \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "metricType": "blood_pressure",
    "value": "120/80",
    "unit": "mmHg",
    "measuredAt": "2024-01-08T10:30:00"
  }'
```

### Test Get by ID
```bash
curl -X GET http://localhost:8080/api/health-metrics/1 \
  -H "Authorization: Bearer {token}"
```

### Test List Paginated
```bash
curl -X GET "http://localhost:8080/api/health-metrics/patient/1?page=0&size=5" \
  -H "Authorization: Bearer {token}"
```

### Test Delete
```bash
curl -X DELETE http://localhost:8080/api/health-metrics/1 \
  -H "Authorization: Bearer {token}"
```

## Performance Tips

1. **Use pagination** for large result sets
2. **Filter by date range** for historical data queries
3. **Index-aware queries**: Leverage composite index on (patient_id, metric_type, measured_at)
4. **Bulk operations**: Consider batch APIs for wearable device data
5. **Archive old records**: Implement retention policies (>2 years)

## Troubleshooting

### Invalid Metric Format Error
- Check metric value format matches type requirements
- Blood pressure must be in `systolic/diastolic` format
- Other metrics must be numeric

### Authorization Denied
- Ensure you have correct role
- Patients can only access their own metrics
- Include valid Bearer token in Authorization header

### Not Found Error
- Verify metric ID exists in database
- Verify patient ID is correct

### Connection Issues
- Check service is running on correct port
- Verify database connectivity
- Check network/firewall settings

## Dependencies

- Spring Boot 3.x
- Spring Data JPA
- MapStruct (for DTO mapping)
- Hibernate (ORM)
- PostgreSQL (database)
- SpringDoc OpenAPI (Swagger)
- Lombok (reduce boilerplate)
