# CRUD Endpoints Testing Guide

This guide provides API testing examples for all newly implemented CRUD operations.

## Prerequisites

Start all services using Docker Compose:
```bash
cd /Users/kietnguyen/Documents/kltn/clinic-booking-system
docker-compose up -d
```

Or start services individually:
```bash
# Terminal 1 - User Service
cd user-service && mvn spring-boot:run

# Terminal 2 - Appointment Service
cd appointment-service && mvn spring-boot:run

# Terminal 3 - Payment Service
cd payment-service && mvn spring-boot:run
```

## Authentication

Most endpoints require JWT authentication. First, login to get a token:

```bash
# Login as admin/patient/doctor
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'

# Save the token from response
export TOKEN="your-jwt-token-here"
```

---

## 1. User Service - CREATE User ✅

**Endpoint:** `POST /api/users`

**Description:** Create a new user (patient, doctor, or admin)

### Test Case 1: Create Patient

```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email": "newpatient@example.com",
    "password": "SecurePass123",
    "fullName": "Nguyen Van A",
    "phone": "0901234567",
    "dateOfBirth": "1990-01-15",
    "gender": "MALE",
    "role": "PATIENT"
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": 123,
  "email": "newpatient@example.com",
  "fullName": "Nguyen Van A",
  "phone": "0901234567",
  "dateOfBirth": "1990-01-15",
  "gender": "MALE",
  "role": "PATIENT",
  "isActive": true,
  "emailVerified": false,
  "phoneVerified": false,
  "createdAt": "2026-01-21T00:30:00",
  "updatedAt": "2026-01-21T00:30:00"
}
```

### Test Case 2: Create Doctor

```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email": "doctor.new@hospital.com",
    "password": "DoctorPass123",
    "fullName": "Dr. Tran Thi B",
    "phone": "0912345678",
    "dateOfBirth": "1985-05-20",
    "gender": "FEMALE",
    "role": "DOCTOR",
    "specialization": "Cardiology",
    "licenseNumber": "MD12345",
    "workplace": "City General Hospital",
    "experienceYears": 10,
    "consultationFee": 500000
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": 124,
  "email": "doctor.new@hospital.com",
  "fullName": "Dr. Tran Thi B",
  "role": "DOCTOR",
  "specialization": "Cardiology",
  "licenseNumber": "MD12345",
  "workplace": "City General Hospital",
  "experienceYears": 10,
  "consultationFee": 500000,
  "isActive": true,
  "createdAt": "2026-01-21T00:30:00"
}
```

### Test Case 3: Error - Duplicate Email

```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email": "newpatient@example.com",
    "password": "password",
    "fullName": "Test User",
    "role": "PATIENT"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Email đã tồn tại"
}
```

---

## 2. Appointment Service - UPDATE Appointment ✅

**Endpoint:** `PUT /api/appointments/{id}`

**Description:** Update appointment details (date, time, symptoms, notes, etc.)

### Test Case 1: Update Appointment Time

```bash
curl -X PUT http://localhost:8080/api/appointments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "appointmentDate": "2026-02-15",
    "appointmentTime": "14:00",
    "durationMinutes": 45,
    "symptoms": "Updated symptoms - chest pain and shortness of breath",
    "notes": "Patient requested afternoon slot"
  }'
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "patientId": 10,
  "doctorId": 5,
  "patientName": "Nguyen Van A",
  "doctorName": "Dr. Tran Thi B",
  "appointmentDate": "2026-02-15",
  "appointmentTime": "14:00:00",
  "durationMinutes": 45,
  "type": "IN_PERSON",
  "status": "PENDING",
  "symptoms": "Updated symptoms - chest pain and shortness of breath",
  "notes": "Patient requested afternoon slot",
  "priority": "NORMAL",
  "updatedAt": "2026-01-21T00:35:00"
}
```

### Test Case 2: Update Only Symptoms

```bash
curl -X PUT http://localhost:8080/api/appointments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "symptoms": "Mild headache, no fever",
    "priority": "NORMAL"
  }'
```

### Test Case 3: Error - Update Completed Appointment

```bash
curl -X PUT http://localhost:8080/api/appointments/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "appointmentDate": "2026-02-20",
    "appointmentTime": "10:00"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Không thể cập nhật lịch hẹn đã hoàn thành hoặc đã hủy"
}
```

### Test Case 4: Error - Time Slot Conflict

```bash
curl -X PUT http://localhost:8080/api/appointments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "appointmentDate": "2026-02-15",
    "appointmentTime": "10:00"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Khung giờ này đã bị trùng với lịch hẹn khác"
}
```

---

## 3. Appointment Service - DELETE Appointment ✅

**Endpoint:** `DELETE /api/appointments/{id}`

**Description:** Delete (soft delete via cancellation) an appointment

### Test Case 1: Delete Appointment

```bash
curl -X DELETE http://localhost:8080/api/appointments/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (204 No Content):**
```
(Empty response body)
```

### Test Case 2: Verify Deletion

```bash
curl -X GET http://localhost:8080/api/appointments/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "status": "CANCELLED",
  "cancelReason": "Đã xóa bởi hệ thống",
  ...
}
```

### Test Case 3: Error - Delete Non-existent Appointment

```bash
curl -X DELETE http://localhost:8080/api/appointments/99999 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (404 Not Found):**
```json
{
  "error": "Lịch hẹn không tồn tại"
}
```

---

## 4. Payment Service - UPDATE Payment ✅

**Endpoint:** `PUT /api/payments/{orderId}`

**Description:** Update non-financial payment information (description only)

### Test Case 1: Update Payment Description

```bash
curl -X PUT http://localhost:8080/api/payments/ORD202601210001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "Updated payment description - consultation for chest pain"
  }'
```

**Expected Response (200 OK):**
```json
{
  "orderId": "ORD202601210001",
  "appointmentId": 1,
  "patientId": 10,
  "amount": 500000,
  "status": "PENDING",
  "description": "Updated payment description - consultation for chest pain",
  "paymentMethod": "MOMO_WALLET",
  "updatedAt": "2026-01-21T00:40:00"
}
```

### Test Case 2: Error - Update Completed Payment

```bash
curl -X PUT http://localhost:8080/api/payments/ORD202601210002 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "Try to update completed payment"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Cannot update payment with status COMPLETED",
  "errorCode": "INVALID_PAYMENT_STATUS_FOR_UPDATE"
}
```

### Test Case 3: Error - Unauthorized Update

```bash
# Login as different user
curl -X PUT http://localhost:8080/api/payments/ORD202601210001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OTHER_USER_TOKEN" \
  -d '{
    "description": "Hacking attempt"
  }'
```

**Expected Response (403 Forbidden):**
```
(Empty response or Forbidden message)
```

---

## 5. Payment Service - DELETE Payment (Cancel) ✅

**Endpoint:** `DELETE /api/payments/{orderId}`

**Description:** Cancel a pending payment (soft delete)

### Test Case 1: Cancel Pending Payment

```bash
curl -X DELETE http://localhost:8080/api/payments/ORD202601210003 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (204 No Content):**
```
(Empty response body)
```

### Test Case 2: Verify Cancellation

```bash
curl -X GET http://localhost:8080/api/payments/ORD202601210003 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "orderId": "ORD202601210003",
  "status": "EXPIRED",
  "expiredAt": "2026-01-21T00:45:00",
  ...
}
```

### Test Case 3: Error - Cancel Completed Payment

```bash
curl -X DELETE http://localhost:8080/api/payments/ORD202601210002 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Can only cancel pending payments. Current status: COMPLETED",
  "errorCode": "INVALID_PAYMENT_STATUS_FOR_CANCEL"
}
```

---

## Frontend API Testing

The frontend JavaScript APIs can be tested from the browser console:

### Test Health Metrics Update

```javascript
// Update a health metric
const result = await healthMetricsApi.updateMetric('metric-id-123', {
  values: { systolic: 125, diastolic: 82 },
  notes: 'Updated reading after medication'
});
console.log(result);
```

### Test Health Metrics Delete

```javascript
// Delete a health metric
await healthMetricsApi.deleteMetric('metric-id-123');
console.log('Metric deleted');
```

### Test User Create

```javascript
// Create a new user from frontend
const newUser = await userApi.createUser({
  email: 'frontend-test@example.com',
  password: 'TestPass123',
  fullName: 'Frontend Test User',
  phone: '0909090909',
  role: 'PATIENT'
});
console.log(newUser);
```

### Test Appointment Delete

```javascript
// Delete an appointment from frontend
await appointmentApi.deleteAppointment(1);
console.log('Appointment deleted');
```

---

## Complete Test Script

Here's a complete bash script to test all endpoints:

```bash
#!/bin/bash

# Configuration
BASE_URL="http://localhost:8080"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"

# Login and get token
echo "=== Logging in ==="
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "Token: $TOKEN"

# Test 1: Create User
echo -e "\n=== Test 1: Create New Patient ==="
curl -X POST $BASE_URL/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email": "test-patient-'$(date +%s)'@example.com",
    "password": "TestPass123",
    "fullName": "Test Patient",
    "phone": "0901234567",
    "role": "PATIENT"
  }' | jq '.'

# Test 2: Update Appointment
echo -e "\n=== Test 2: Update Appointment ==="
curl -X PUT $BASE_URL/api/appointments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "symptoms": "Updated test symptoms",
    "notes": "API test update"
  }' | jq '.'

# Test 3: Delete Appointment
echo -e "\n=== Test 3: Delete Appointment ==="
curl -X DELETE $BASE_URL/api/appointments/999 \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus Code: %{http_code}\n"

# Test 4: Update Payment
echo -e "\n=== Test 4: Update Payment Description ==="
curl -X PUT $BASE_URL/api/payments/ORD202601210001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "API test payment update"
  }' | jq '.'

# Test 5: Cancel Payment
echo -e "\n=== Test 5: Cancel Payment ==="
curl -X DELETE $BASE_URL/api/payments/ORD202601210999 \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus Code: %{http_code}\n"

echo -e "\n=== All tests completed ==="
```

Save this as `test-crud-endpoints.sh` and run:
```bash
chmod +x test-crud-endpoints.sh
./test-crud-endpoints.sh
```

---

## Summary

All CRUD operations have been successfully implemented and are ready for testing:

✅ **User Service**
- POST `/api/users` - Create user with full validation

✅ **Appointment Service**
- PUT `/api/appointments/{id}` - Update with schedule validation
- DELETE `/api/appointments/{id}` - Soft delete via cancellation

✅ **Payment Service**
- PUT `/api/payments/{orderId}` - Update non-financial fields
- DELETE `/api/payments/{orderId}` - Cancel pending payments

✅ **Frontend APIs**
- Health Metrics: `updateMetric()`, `deleteMetric()`
- Users: `createUser()`
- Appointments: `deleteAppointment()`

All implementations include proper validation, error handling, event publishing, and security checks!
