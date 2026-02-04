# Relax Medical Record Completion Rules Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow doctors to save medical records for CONFIRMED appointments, auto-complete without a time check, and keep UI guarded to CONFIRMED/COMPLETED only.
**Architecture:** Loosen the appointment status validation in medical-service, remove the time-based guard in appointment-service, and gate the frontend save action on CONFIRMED/COMPLETED while keeping auto-complete behavior.
**Tech Stack:** Spring Boot (Java 21), JUnit 5 + Mockito, React (Vite), Zustand, Axios.
---

### Task 1: Create medical-service unit tests for relaxed status

**Files:**
- Create: `clinic-booking-system/medical-service/src/test/java/com/clinicbooking/medicalservice/service/MedicalRecordServiceImplTest.java`
- Modify: `clinic-booking-system/medical-service/src/main/java/com/clinicbooking/medicalservice/service/MedicalRecordServiceImpl.java`

**Step 1: Write the failing test**

```java
@ExtendWith(MockitoExtension.class)
class MedicalRecordServiceImplTest {
    @Mock private MedicalRecordRepository medicalRecordRepository;
    @Mock private MedicalRecordMapper medicalRecordMapper;
    @Mock private PrescriptionMapper prescriptionMapper;
    @Mock private UserServiceClient userServiceClient;
    @Mock private AppointmentServiceClient appointmentServiceClient;
    @Mock private MedicalRecordEventPublisher eventPublisher;
    @Mock private SecurityContext securityContext;

    @InjectMocks private MedicalRecordServiceImpl medicalRecordService;

    @Test
    void createMedicalRecord_allowsConfirmedAppointment() {
        MedicalRecordCreateDto dto = MedicalRecordCreateDto.builder()
            .appointmentId(11L)
            .patientId(15L)
            .doctorId(12L)
            .diagnosis("Test")
            .build();

        AppointmentDto appointment = AppointmentDto.builder()
            .id(11L)
            .patientId(15L)
            .doctorId(12L)
            .status("CONFIRMED")
            .build();

        UserDto doctor = UserDto.builder().id(12L).role("DOCTOR").fullName("Demo Doctor").build();
        UserDto patient = UserDto.builder().id(15L).role("PATIENT").fullName("Test Patient").build();

        MedicalRecord record = new MedicalRecord();

        when(securityContext.isDoctor()).thenReturn(true);
        when(securityContext.isAdmin()).thenReturn(false);
        when(securityContext.getCurrentUserId()).thenReturn(12L);
        when(appointmentServiceClient.getAppointmentById(11L)).thenReturn(appointment);
        when(userServiceClient.getUserById(12L)).thenReturn(doctor);
        when(userServiceClient.getUserById(15L)).thenReturn(patient);
        when(medicalRecordMapper.toEntity(dto)).thenReturn(record);
        when(medicalRecordRepository.save(record)).thenReturn(record);
        when(medicalRecordMapper.toDto(record)).thenReturn(MedicalRecordResponseDto.builder().id(1L).build());

        assertDoesNotThrow(() -> medicalRecordService.createMedicalRecord(dto));
    }
}
```

**Step 2: Run test to verify it fails**

Run: `mvn -q -pl clinic-booking-system/medical-service -Dtest=MedicalRecordServiceImplTest test`  
Expected: FAIL with `ValidationException: Chỉ có thể tạo hồ sơ y tế cho cuộc hẹn đã hoàn thành`

**Step 3: Write minimal implementation**

In `MedicalRecordServiceImpl.createMedicalRecord`, replace status check:

```java
if (!"COMPLETED".equals(appointment.getStatus())) {
    throw new ValidationException("Chỉ có thể tạo hồ sơ y tế cho cuộc hẹn đã hoàn thành");
}
```

with:

```java
if (!"COMPLETED".equals(appointment.getStatus()) && !"CONFIRMED".equals(appointment.getStatus())) {
    throw new ValidationException("Chỉ có thể tạo hồ sơ y tế cho cuộc hẹn đã xác nhận hoặc đã hoàn thành");
}
```

**Step 4: Run test to verify it passes**

Run: `mvn -q -pl clinic-booking-system/medical-service -Dtest=MedicalRecordServiceImplTest test`  
Expected: PASS

**Step 5: Commit**

```bash
git -C clinic-booking-system add medical-service/src/main/java/com/clinicbooking/medicalservice/service/MedicalRecordServiceImpl.java \
  medical-service/src/test/java/com/clinicbooking/medicalservice/service/MedicalRecordServiceImplTest.java
git -C clinic-booking-system commit -m "feat: allow medical record for confirmed appointments"
```

### Task 2: Remove time-based completion guard in appointment-service

**Files:**
- Create: `clinic-booking-system/appointment-service/src/test/java/com/clinicbooking/appointmentservice/service/AppointmentServiceImplTest.java`
- Modify: `clinic-booking-system/appointment-service/src/main/java/com/clinicbooking/appointmentservice/service/AppointmentServiceImpl.java`

**Step 1: Write the failing test**

```java
@ExtendWith(MockitoExtension.class)
class AppointmentServiceImplTest {
    @Mock private AppointmentRepository appointmentRepository;
    @Mock private AppointmentMapper appointmentMapper;
    @Mock private AppointmentEventPublisher eventPublisher;
    @Mock private DoctorScheduleRepository doctorScheduleRepository;
    @Mock private NotificationService notificationService;
    @Mock private UserServiceClient userServiceClient;

    @InjectMocks private AppointmentServiceImpl appointmentService;

    @Test
    void completeAppointment_allowsUpcomingConfirmed() {
        Appointment appointment = Appointment.builder()
            .id(11L)
            .status(Appointment.AppointmentStatus.CONFIRMED)
            .appointmentDate(LocalDate.now().plusDays(1))
            .appointmentTime(LocalTime.of(10, 0))
            .build();

        when(appointmentRepository.findById(11L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(appointment)).thenReturn(appointment);
        when(appointmentMapper.toDto(appointment)).thenReturn(AppointmentResponseDto.builder().id(11L).build());

        assertDoesNotThrow(() -> appointmentService.completeAppointment(11L));
        assertEquals(Appointment.AppointmentStatus.COMPLETED, appointment.getStatus());
    }
}
```

**Step 2: Run test to verify it fails**

Run: `mvn -q -pl clinic-booking-system/appointment-service -Dtest=AppointmentServiceImplTest test`  
Expected: FAIL with `ValidationException: Không thể hoàn thành lịch hẹn chưa đến giờ`

**Step 3: Write minimal implementation**

In `AppointmentServiceImpl.completeAppointment`, remove this block:

```java
if (appointment.isUpcoming()) {
    throw new ValidationException("Không thể hoàn thành lịch hẹn chưa đến giờ");
}
```

**Step 4: Run test to verify it passes**

Run: `mvn -q -pl clinic-booking-system/appointment-service -Dtest=AppointmentServiceImplTest test`  
Expected: PASS

**Step 5: Commit**

```bash
git -C clinic-booking-system add appointment-service/src/main/java/com/clinicbooking/appointmentservice/service/AppointmentServiceImpl.java \
  appointment-service/src/test/java/com/clinicbooking/appointmentservice/service/AppointmentServiceImplTest.java
git -C clinic-booking-system commit -m "feat: allow completing upcoming confirmed appointments"
```

### Task 3: Frontend guard for save action by status

**Files:**
- Modify: `clinic-booking-frontend/src/pages/doctor/CreateMedicalRecord.jsx`

**Step 1: Write the failing test**

```jsx
import { render, screen } from '@testing-library/react'
import CreateMedicalRecord from '@/pages/doctor/CreateMedicalRecord'

test('disable save for non-confirmed appointment', async () => {
  // Render with appointment.status = 'PENDING' and verify save disabled.
})
```

**Step 2: Run test to verify it fails**

Run: `npm --prefix clinic-booking-frontend test -- --runInBand`  
Expected: FAIL (button not disabled)

**Step 3: Write minimal implementation**

Add a guard:

```jsx
const canSave =
  appointment?.status === 'CONFIRMED' || appointment?.status === 'COMPLETED'
```

Use `canSave` to:
- disable the "Lưu hồ sơ" button when false
- show a small message near the button (e.g. "Chỉ có thể tạo hồ sơ cho lịch hẹn đã xác nhận")

**Step 4: Run test to verify it passes**

Run: `npm --prefix clinic-booking-frontend test -- --runInBand`  
Expected: PASS

**Step 5: Commit**

```bash
git -C clinic-booking-frontend add src/pages/doctor/CreateMedicalRecord.jsx
git -C clinic-booking-frontend commit -m "feat: guard medical record save by appointment status"
```

