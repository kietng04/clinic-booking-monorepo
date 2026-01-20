#!/bin/bash

echo "==================================="
echo "CRUD Implementation Verification"
echo "==================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verification function
verify() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
    fi
}

# Check User Service CREATE
echo "1. User Service - CREATE endpoint"
grep -q "@PostMapping" /Users/kietnguyen/Documents/kltn/clinic-booking-system/user-service/src/main/java/com/clinicbooking/userservice/controller/UserController.java
verify "  POST /api/users endpoint exists"

grep -q "UserCreateDto" /Users/kietnguyen/Documents/kltn/clinic-booking-system/user-service/src/main/java/com/clinicbooking/userservice/dto/user/UserCreateDto.java
verify "  UserCreateDto exists"

grep -q "createUser" /Users/kietnguyen/Documents/kltn/clinic-booking-system/user-service/src/main/java/com/clinicbooking/userservice/service/UserServiceImpl.java
verify "  createUser() method implemented"
echo ""

# Check Appointment Service UPDATE
echo "2. Appointment Service - UPDATE endpoint"
grep -q '@PutMapping("/{id}")' /Users/kietnguyen/Documents/kltn/clinic-booking-system/appointment-service/src/main/java/com/clinicbooking/appointmentservice/controller/AppointmentController.java
verify "  PUT /api/appointments/{id} endpoint exists"

grep -q "AppointmentUpdateDto" /Users/kietnguyen/Documents/kltn/clinic-booking-system/appointment-service/src/main/java/com/clinicbooking/appointmentservice/dto/AppointmentUpdateDto.java
verify "  AppointmentUpdateDto exists"

grep -q "updateAppointment" /Users/kietnguyen/Documents/kltn/clinic-booking-system/appointment-service/src/main/java/com/clinicbooking/appointmentservice/service/AppointmentServiceImpl.java
verify "  updateAppointment() method implemented"
echo ""

# Check Appointment Service DELETE
echo "3. Appointment Service - DELETE endpoint"
grep -q '@DeleteMapping("/{id}")' /Users/kietnguyen/Documents/kltn/clinic-booking-system/appointment-service/src/main/java/com/clinicbooking/appointmentservice/controller/AppointmentController.java
verify "  DELETE /api/appointments/{id} endpoint exists"

grep -q "deleteAppointment" /Users/kietnguyen/Documents/kltn/clinic-booking-system/appointment-service/src/main/java/com/clinicbooking/appointmentservice/service/AppointmentServiceImpl.java
verify "  deleteAppointment() method implemented"
echo ""

# Check Payment Service UPDATE
echo "4. Payment Service - UPDATE endpoint"
grep -q '@PutMapping("/{orderId}")' /Users/kietnguyen/Documents/kltn/clinic-booking-system/payment-service/src/main/java/com/clinicbooking/paymentservice/controller/PaymentController.java
verify "  PUT /api/payments/{orderId} endpoint exists"

grep -q "UpdatePaymentRequest" /Users/kietnguyen/Documents/kltn/clinic-booking-system/payment-service/src/main/java/com/clinicbooking/paymentservice/dto/request/UpdatePaymentRequest.java
verify "  UpdatePaymentRequest exists"

grep -q "updatePayment" /Users/kietnguyen/Documents/kltn/clinic-booking-system/payment-service/src/main/java/com/clinicbooking/paymentservice/service/impl/PaymentService.java
verify "  updatePayment() method implemented"
echo ""

# Check Payment Service DELETE
echo "5. Payment Service - DELETE endpoint"
grep -q '@DeleteMapping("/{orderId}")' /Users/kietnguyen/Documents/kltn/clinic-booking-system/payment-service/src/main/java/com/clinicbooking/paymentservice/controller/PaymentController.java
verify "  DELETE /api/payments/{orderId} endpoint exists"

grep -q "cancelPayment" /Users/kietnguyen/Documents/kltn/clinic-booking-system/payment-service/src/main/java/com/clinicbooking/paymentservice/service/impl/PaymentService.java
verify "  cancelPayment() method implemented"
echo ""

# Check Frontend APIs
echo "6. Frontend Health Metrics API"
grep -q "updateMetric:" /Users/kietnguyen/Documents/kltn/clinic-booking-frontend/src/api/realApis/healthMetricsApi.js
verify "  updateMetric() method exists"

grep -q "deleteMetric:" /Users/kietnguyen/Documents/kltn/clinic-booking-frontend/src/api/realApis/healthMetricsApi.js
verify "  deleteMetric() method exists"
echo ""

echo "7. Frontend User API"
grep -q "createUser:" /Users/kietnguyen/Documents/kltn/clinic-booking-frontend/src/api/realApis/userApi.js
verify "  createUser() method exists"
echo ""

echo "8. Frontend Appointment API"
grep -q "deleteAppointment:" /Users/kietnguyen/Documents/kltn/clinic-booking-frontend/src/api/realApis/appointmentApi.js
verify "  deleteAppointment() method exists"
echo ""

# Build verification
echo "9. Build Verification"
echo "   Checking compilation status..."

cd /Users/kietnguyen/Documents/kltn/clinic-booking-system/user-service
mvn compile -q -DskipTests > /dev/null 2>&1
verify "  User Service compiles successfully"

cd /Users/kietnguyen/Documents/kltn/clinic-booking-system/appointment-service
mvn compile -q -DskipTests > /dev/null 2>&1
verify "  Appointment Service compiles successfully"

cd /Users/kietnguyen/Documents/kltn/clinic-booking-system/payment-service
mvn compile -q -DskipTests > /dev/null 2>&1
verify "  Payment Service compiles successfully"

echo ""
echo "==================================="
echo "Verification Complete!"
echo "==================================="
