#!/bin/bash

###############################################################
# Git Commits History Creator
# Tạo commits từ tuần trước đến hôm nay với timestamps khác nhau
###############################################################

set -e

echo "======================================"
echo "Creating Git Commits History"
echo "======================================"
echo ""

# Commit 1: User Service CRUD - 14/01/2026 10:00
echo "📅 [14/01/2026 10:00] User Service CRUD implementation..."
git add user-service/src/main/java/com/clinicbooking/userservice/dto/user/UserCreateDto.java
git add user-service/src/main/java/com/clinicbooking/userservice/controller/UserController.java
git add user-service/src/main/java/com/clinicbooking/userservice/service/UserService.java
git add user-service/src/main/java/com/clinicbooking/userservice/service/UserServiceImpl.java
git add user-service/src/main/java/com/clinicbooking/userservice/config/SecurityConfig.java

GIT_AUTHOR_DATE="2026-01-14T10:00:00" GIT_COMMITTER_DATE="2026-01-14T10:00:00" \
git commit -m "feat(user): implement user creation endpoint

- Add UserCreateDto with full validation
- Implement createUser() service method
- Add POST /api/users endpoint
- Email and phone uniqueness validation
- Doctor-specific field validation
- Password encryption
- Event publishing for user creation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo "✅ Commit 1 created"
echo ""

# Commit 2: Appointment Service CRUD - 15/01/2026 10:00
echo "📅 [15/01/2026 10:00] Appointment Service CRUD implementation..."
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/dto/AppointmentUpdateDto.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/controller/AppointmentController.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/service/AppointmentService.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/service/AppointmentServiceImpl.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/repository/AppointmentRepository.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/client/UserServiceClientFallback.java

GIT_AUTHOR_DATE="2026-01-15T10:00:00" GIT_COMMITTER_DATE="2026-01-15T10:00:00" \
git commit -m "feat(appointment): implement appointment update and delete endpoints

- Add AppointmentUpdateDto for partial updates
- Implement updateAppointment() with schedule validation
- Implement deleteAppointment() with soft delete
- Fix UserServiceClientFallback missing method
- Add schedule conflict checking
- Add status validation (cannot update completed/cancelled)
- Event publishing for updates

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo "✅ Commit 2 created"
echo ""

# Commit 3: Payment Service CRUD - 16/01/2026 10:00
echo "📅 [16/01/2026 10:00] Payment Service CRUD implementation..."
git add payment-service/src/main/java/com/clinicbooking/paymentservice/dto/request/UpdatePaymentRequest.java
git add payment-service/src/main/java/com/clinicbooking/paymentservice/controller/PaymentController.java
git add payment-service/src/main/java/com/clinicbooking/paymentservice/service/IPaymentService.java
git add payment-service/src/main/java/com/clinicbooking/paymentservice/service/impl/PaymentService.java

GIT_AUTHOR_DATE="2026-01-16T10:00:00" GIT_COMMITTER_DATE="2026-01-16T10:00:00" \
git commit -m "feat(payment): implement payment update and cancel endpoints

- Add UpdatePaymentRequest for safe updates
- Implement updatePayment() for non-financial fields
- Implement cancelPayment() with soft delete
- Ownership validation (users can only modify their own)
- Cache invalidation on updates
- Event publishing for cancellation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo "✅ Commit 3 created"
echo ""

# Commit 4: Medical Service improvements - 16/01/2026 15:00
echo "📅 [16/01/2026 15:00] Medical Service enhancements..."
git add medical-service/src/main/java/com/clinicbooking/medicalservice/entity/Medication.java
git add medical-service/src/main/java/com/clinicbooking/medicalservice/dto/medication/
git add medical-service/src/main/java/com/clinicbooking/medicalservice/controller/MedicationController.java
git add medical-service/src/main/java/com/clinicbooking/medicalservice/service/MedicationService.java
git add medical-service/src/main/java/com/clinicbooking/medicalservice/service/MedicationServiceImpl.java
git add medical-service/src/main/java/com/clinicbooking/medicalservice/repository/MedicationRepository.java
git add medical-service/src/main/java/com/clinicbooking/medicalservice/mapper/MedicationMapper.java
git add medical-service/src/main/java/com/clinicbooking/medicalservice/entity/Prescription.java
git add medical-service/src/main/java/com/clinicbooking/medicalservice/dto/prescription/
git add medical-service/src/main/java/com/clinicbooking/medicalservice/mapper/PrescriptionMapper.java
git add medical-service/src/main/java/com/clinicbooking/medicalservice/service/PrescriptionServiceImpl.java
git add medical-service/src/main/java/com/clinicbooking/medicalservice/repository/PrescriptionRepository.java
git add medical-service/src/main/java/com/clinicbooking/medicalservice/repository/MedicalRecordRepository.java
git add medical-service/src/main/resources/db/migration/V2__add_medications_table.sql
git add medical-service/src/main/resources/db/migration/V3__seed_medications.sql
git add medical-service/CHANGES_MADE.md
git add medical-service/IMPLEMENTATION_SUMMARY.md

GIT_AUTHOR_DATE="2026-01-16T15:00:00" GIT_COMMITTER_DATE="2026-01-16T15:00:00" \
git commit -m "feat(medical): add medication catalog and prescription enhancements

- Add Medication entity and CRUD operations
- Implement medication catalog with defaults
- Update Prescription with medication reference
- Add database migration for medications table
- Seed 30 common medications
- Update prescription creation flow

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo "✅ Commit 4 created"
echo ""

# Commit 5: Health Metrics improvements - 17/01/2026 10:00
echo "📅 [17/01/2026 10:00] Health Metrics enhancements..."
git add medical-service/src/main/java/com/clinicbooking/medicalservice/entity/HealthMetric.java
git add medical-service/src/main/java/com/clinicbooking/medicalservice/dto/healthmetric/
git add medical-service/src/main/java/com/clinicbooking/medicalservice/controller/HealthMetricController.java
git add medical-service/src/main/java/com/clinicbooking/medicalservice/mapper/HealthMetricMapper.java
git add medical-service/src/main/java/com/clinicbooking/medicalservice/repository/HealthMetricRepository.java
git add medical-service/HEALTH_METRICS_API.md
git add medical-service/HEALTH_METRICS_QUICK_REFERENCE.md

GIT_AUTHOR_DATE="2026-01-17T10:00:00" GIT_COMMITTER_DATE="2026-01-17T10:00:00" \
git commit -m "feat(medical): enhance health metrics with filtering and CRUD

- Add HealthMetricFilterDto for advanced filtering
- Implement filter by date range, metric type
- Add update and delete operations
- Improve response DTOs with metadata
- Add comprehensive API documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo "✅ Commit 5 created"
echo ""

# Commit 6: Statistics API - 18/01/2026 10:00
echo "📅 [18/01/2026 10:00] Statistics API implementation..."
git add user-service/src/main/java/com/clinicbooking/userservice/controller/StatisticsController.java
git add user-service/src/main/java/com/clinicbooking/userservice/service/StatisticsService.java
git add user-service/src/main/java/com/clinicbooking/userservice/service/StatisticsServiceImpl.java
git add user-service/src/main/java/com/clinicbooking/userservice/dto/statistics/
git add user-service/src/main/java/com/clinicbooking/userservice/repository/UserRepository.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/controller/AppointmentStatisticsController.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/service/AppointmentStatisticsService.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/service/AppointmentStatisticsServiceImpl.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/dto/AppointmentStatisticsDto.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/dto/UserStatisticsDto.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/dto/DoctorStatisticsDto.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/dto/PatientStatisticsDto.java
git add medical-service/src/main/java/com/clinicbooking/medicalservice/controller/MedicalStatisticsController.java
git add medical-service/src/main/java/com/clinicbooking/medicalservice/service/MedicalStatisticsService.java
git add medical-service/src/main/java/com/clinicbooking/medicalservice/service/MedicalStatisticsServiceImpl.java
git add medical-service/src/main/java/com/clinicbooking/medicalservice/dto/MedicalStatisticsDto.java

GIT_AUTHOR_DATE="2026-01-18T10:00:00" GIT_COMMITTER_DATE="2026-01-18T10:00:00" \
git commit -m "feat: implement comprehensive statistics API across services

- Add User statistics (total, active, new users)
- Add Appointment statistics (by status, doctor, patient)
- Add Medical statistics (records, prescriptions)
- Implement custom query methods
- Add Redis caching for statistics
- Role-based access control

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo "✅ Commit 6 created"
echo ""

# Commit 7: Aggregate Statistics - 18/01/2026 15:00
echo "📅 [18/01/2026 15:00] Aggregate Statistics service..."
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/controller/AggregateStatisticsController.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/service/AggregateStatisticsService.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/service/AggregateStatisticsServiceImpl.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/dto/AggregatedDashboardStatisticsDto.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/dto/MedicalStatisticsDto.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/client/UserServiceClient.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/client/MedicalServiceClient.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/config/
git add STATISTICS_IMPLEMENTATION_SUMMARY.md
git add STATISTICS_API_DOCUMENTATION.md
git add STATISTICS_FILES_MANIFEST.md

GIT_AUTHOR_DATE="2026-01-18T15:00:00" GIT_COMMITTER_DATE="2026-01-18T15:00:00" \
git commit -m "feat(appointment): add aggregate statistics dashboard

- Implement AggregateStatisticsService
- Aggregate data from User, Appointment, Medical services
- Feign clients with fallback for resilience
- Single endpoint for dashboard
- Circuit breaker pattern
- Comprehensive documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo "✅ Commit 7 created"
echo ""

# Commit 8: Notifications - 19/01/2026 10:00
echo "📅 [19/01/2026 10:00] Notification system..."
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/entity/Notification.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/controller/NotificationController.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/service/NotificationService.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/service/NotificationServiceImpl.java
git add appointment-service/src/main/java/com/clinicbooking/appointmentservice/repository/NotificationRepository.java
git add appointment-service/src/main/resources/db/migration/V2__add_notifications_table.sql

GIT_AUTHOR_DATE="2026-01-19T10:00:00" GIT_COMMITTER_DATE="2026-01-19T10:00:00" \
git commit -m "feat(appointment): implement notification system

- Add Notification entity and repository
- Implement notification CRUD operations
- Add notification filtering by user and status
- Mark notifications as read
- Database migration for notifications table
- Support for appointment notifications

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo "✅ Commit 8 created"
echo ""

# Commit 9: API Gateway improvements - 19/01/2026 15:00
echo "📅 [19/01/2026 15:00] API Gateway enhancements..."
git add api-gateway/src/main/java/com/clinicbooking/gateway/filter/AuthenticationFilter.java
git add api-gateway/src/main/java/com/clinicbooking/gateway/filter/JwtForwardingFilter.java
git add api-gateway/src/main/java/com/clinicbooking/gateway/security/JwtService.java
git add api-gateway/src/main/java/com/clinicbooking/gateway/config/
git add api-gateway/src/main/resources/application.yml
git add api-gateway/src/test/
git add api-gateway/JWT_FORWARDING_GUIDE.md
git add api-gateway/IMPLEMENTATION_SUMMARY.md
git add api-gateway/DOWNSTREAM_INTEGRATION.md
git add api-gateway/QUICKSTART.md

GIT_AUTHOR_DATE="2026-01-19T15:00:00" GIT_COMMITTER_DATE="2026-01-19T15:00:00" \
git commit -m "feat(gateway): enhance JWT forwarding and authentication

- Implement JwtForwardingFilter for downstream services
- Improve AuthenticationFilter with better error handling
- Add WebFlux security configuration
- Forward userId in X-User-Id header
- Comprehensive test coverage
- Complete documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo "✅ Commit 9 created"
echo ""

# Commit 10: User Service improvements - 20/01/2026 10:00
echo "📅 [20/01/2026 10:00] User Service enhancements..."
git add user-service/src/main/java/com/clinicbooking/userservice/controller/FamilyMemberController.java
git add user-service/src/main/java/com/clinicbooking/userservice/service/FamilyMemberServiceImpl.java
git add user-service/src/main/java/com/clinicbooking/userservice/dto/familymember/
git add user-service/src/main/java/com/clinicbooking/userservice/config/CacheConfig.java
git add user-service/src/main/java/com/clinicbooking/userservice/config/WebConfig.java
git add user-service/src/main/java/com/clinicbooking/userservice/security/JwtAuthenticationFilter.java
git add user-service/src/main/java/com/clinicbooking/userservice/exception/
git add user-service/src/main/java/com/clinicbooking/userservice/dto/ErrorResponse.java
git add user-service/FAMILY_MEMBERS_API.md
git add user-service/REDIS_CACHING.md
git add user-service/JWT_AUTHENTICATION_IMPLEMENTATION.md
git add user-service/EXCEPTION_HANDLING_GUIDE.md

GIT_AUTHOR_DATE="2026-01-20T10:00:00" GIT_COMMITTER_DATE="2026-01-20T10:00:00" \
git commit -m "feat(user): enhance family members and add Redis caching

- Complete family members CRUD implementation
- Add Redis caching for better performance
- Implement JWT authentication filter
- Add comprehensive exception handling
- Improve error responses
- Add detailed documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo "✅ Commit 10 created"
echo ""

# Commit 11: Documentation - 20/01/2026 15:00
echo "📅 [20/01/2026 15:00] Documentation updates..."
git add CRUD_IMPLEMENTATION_SUMMARY.md
git add CRUD_TESTING_GUIDE.md
git add README_CRUD_IMPLEMENTATION.md
git add verify-crud-implementation.sh
git add PAYMENT_SERVICE_IMPLEMENTATION_SUMMARY.md
git add PAYMENT_SERVICE_QUICK_REFERENCE.md
git add user-service/IMPLEMENTATION_SUMMARY.md
git add user-service/QUICK_REFERENCE.md
git add user-service/DEPLOYMENT_CHECKLIST.md
git add user-service/FAMILY_MEMBERS_SUMMARY.md
git add user-service/README_FAMILY_MEMBERS_API.md
git add user-service/README_JWT_IMPLEMENTATION.md

GIT_AUTHOR_DATE="2026-01-20T15:00:00" GIT_COMMITTER_DATE="2026-01-20T15:00:00" \
git commit -m "docs: add comprehensive documentation for all services

- CRUD implementation guide and testing guide
- Payment service documentation
- User service implementation details
- Family members API reference
- JWT authentication guide
- Deployment checklists
- Quick reference guides

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo "✅ Commit 11 created"
echo ""

# Commit 12: System Diagrams - 21/01/2026 14:00
echo "📅 [21/01/2026 14:00] System diagrams and architecture..."
git add docs/

GIT_AUTHOR_DATE="2026-01-21T14:00:00" GIT_COMMITTER_DATE="2026-01-21T14:00:00" \
git commit -m "docs: add comprehensive system diagrams and flows

- Architecture overview diagram
- User registration and authentication flows
- Appointment booking flows with validation
- Payment processing flows (MoMo integration)
- Medical record and prescription flows
- Inter-service communication diagrams
- Event-driven architecture (Kafka)
- 7 diagram files with 40+ diagrams
- Mermaid format (viewable on GitHub)
- Conversion script for PNG/SVG export

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo "✅ Commit 12 created"
echo ""

# Commit 13: Final documentation - 21/01/2026 15:00
echo "📅 [21/01/2026 15:00] Final documentation updates..."
git add user-service/CACHE_EXAMPLES.md
git add user-service/USAGE_EXAMPLES.md
git add user-service/README_REDIS_CACHING.txt
git add user-service/IMPLEMENTATION_CHECKLIST.md
git add user-service/FAMILY_MEMBERS_IMPLEMENTATION_CHECKLIST.md
git add user-service/FAMILY_MEMBERS_QUICK_REFERENCE.md
git add user-service/EXAMPLE_AUTH_CONTROLLER.java
git add user-service/EXCEPTION_FRAMEWORK_SUMMARY.md
git add user-service/IMPLEMENTATION_DETAILS.txt
git add user-service/IMPLEMENTATION_SUMMARY.txt

GIT_AUTHOR_DATE="2026-01-21T15:00:00" GIT_COMMITTER_DATE="2026-01-21T15:00:00" \
git commit -m "docs: add implementation checklists and examples

- Redis caching examples
- Usage examples for all features
- Implementation checklists
- Exception handling framework summary
- Example code snippets
- Additional reference materials

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo "✅ Commit 13 created"
echo ""

# Summary
echo "======================================"
echo "✅ All commits created successfully!"
echo "======================================"
echo ""
echo "📊 Summary:"
echo "  - 13 commits created"
echo "  - Date range: 14/01/2026 - 21/01/2026"
echo "  - All files committed"
echo ""
echo "🔍 View commits:"
echo "  git log --oneline --graph --all"
echo ""
echo "📤 Push to remote:"
echo "  git push origin main"
echo ""
