# Appointment Booking Flow

## Create Appointment Flow

```mermaid
sequenceDiagram
    actor Patient
    participant UI as Frontend
    participant GW as API Gateway
    participant AppCtrl as AppointmentController
    participant AppSvc as AppointmentService
    participant UserClient as UserServiceClient
    participant SchedRepo as DoctorScheduleRepository
    participant AppRepo as AppointmentRepository
    participant EventPub as EventPublisher
    participant Kafka
    participant DB as PostgreSQL

    Patient->>UI: Select doctor & time slot
    UI->>GW: POST /api/appointments<br/>Bearer {JWT}
    Note over UI,GW: {patientId, doctorId, date, time, symptoms}

    GW->>GW: Validate JWT token
    GW->>AppCtrl: Forward request

    AppCtrl->>AppSvc: createAppointment(dto)

    %% Validate duration
    AppSvc->>AppSvc: Validate duration (15-180 min)
    alt Invalid duration
        AppSvc-->>AppCtrl: ValidationException
        AppCtrl-->>GW: 400 Bad Request
        GW-->>UI: Error: Duration must be 15-180 minutes
    end

    %% Validate not in past
    AppSvc->>AppSvc: Check date/time not in past
    alt Appointment in past
        AppSvc-->>AppCtrl: ValidationException
        AppCtrl-->>GW: 400 Bad Request
        GW-->>UI: Error: Cannot book past appointments
    end

    %% Validate not beyond 3 months
    AppSvc->>AppSvc: Check date <= now + 3 months
    alt Beyond 3 months
        AppSvc-->>AppCtrl: ValidationException
        AppCtrl-->>GW: 400 Bad Request
        GW-->>UI: Error: Cannot book beyond 3 months
    end

    %% Validate patient exists
    AppSvc->>UserClient: getUserById(patientId)
    UserClient->>GW: GET /api/users/{patientId}
    Note over UserClient,GW: Feign Client Call
    GW-->>UserClient: UserDto

    alt Patient not found or Feign error
        UserClient->>UserClient: Fallback
        UserClient-->>AppSvc: UserDto (fallback)
        AppSvc-->>AppCtrl: 503 Service Unavailable
        AppCtrl-->>GW: 503
        GW-->>UI: Error: User service unavailable
    end

    %% Validate doctor exists and role
    AppSvc->>UserClient: getUserById(doctorId)
    UserClient->>GW: GET /api/users/{doctorId}
    GW-->>UserClient: UserDto

    AppSvc->>AppSvc: Validate doctor.role == DOCTOR
    alt Not a doctor
        AppSvc-->>AppCtrl: ValidationException
        AppCtrl-->>GW: 400 Bad Request
        GW-->>UI: Error: User is not a doctor
    end

    %% Check doctor schedule
    AppSvc->>AppSvc: Calculate dayOfWeek from date
    AppSvc->>SchedRepo: findByDoctorIdAndDayOfWeek(doctorId, dayOfWeek)
    SchedRepo->>DB: SELECT * FROM doctor_schedules<br/>WHERE doctor_id=? AND day_of_week=?
    DB-->>SchedRepo: DoctorSchedule or null
    SchedRepo-->>AppSvc: Optional<DoctorSchedule>

    alt No schedule for day
        AppSvc-->>AppCtrl: ValidationException
        AppCtrl-->>GW: 400 Bad Request
        GW-->>UI: Error: Doctor không làm việc vào ngày này
    end

    AppSvc->>AppSvc: Calculate endTime = time + duration
    AppSvc->>AppSvc: Validate time >= schedule.startTime<br/>AND endTime <= schedule.endTime
    alt Outside working hours
        AppSvc-->>AppCtrl: ValidationException
        AppCtrl-->>GW: 400 Bad Request
        GW-->>UI: Error: Appointment outside working hours
    end

    AppSvc->>AppSvc: Check schedule.isAvailable == true
    alt Doctor not available
        AppSvc-->>AppCtrl: ValidationException
        AppCtrl-->>GW: 400 Bad Request
        GW-->>UI: Error: Doctor không có sẵn
    end

    %% Check overlapping appointments
    AppSvc->>AppRepo: hasOverlappingAppointmentNative(doctorId, date, time, endTime)
    AppRepo->>DB: Native query:<br/>SELECT COUNT(*) FROM appointments<br/>WHERE doctor_id=?<br/>AND date=?<br/>AND status NOT IN ('CANCELLED', 'COMPLETED')<br/>AND time_range overlaps
    DB-->>AppRepo: count > 0
    AppRepo-->>AppSvc: boolean

    alt Has overlapping
        AppSvc-->>AppCtrl: ValidationException
        AppCtrl-->>GW: 400 Bad Request
        GW-->>UI: Error: Khung giờ này đã bị trùng
    end

    %% Create appointment
    AppSvc->>AppSvc: Build Appointment entity<br/>- patientName (denormalized)<br/>- doctorName (denormalized)<br/>- patientPhone (denormalized)<br/>- status = PENDING<br/>- type = IN_PERSON/ONLINE<br/>- priority = NORMAL/URGENT

    AppSvc->>AppRepo: save(appointment)
    AppRepo->>DB: INSERT INTO appointments
    DB-->>AppRepo: Appointment with ID
    AppRepo-->>AppSvc: Appointment

    %% Publish event
    AppSvc->>EventPub: publishAppointmentCreated(appointment)
    EventPub->>Kafka: Publish "appointment.created"
    Note over EventPub,Kafka: Event: {appointmentId, patientId,<br/>doctorId, date, time, status}

    AppSvc-->>AppCtrl: AppointmentResponseDto
    AppCtrl-->>GW: 201 Created
    GW-->>UI: Appointment created
    UI-->>Patient: Booking successful<br/>Show appointment details
```

## Update Appointment Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant GW as API Gateway
    participant AppCtrl as AppointmentController
    participant AppSvc as AppointmentService
    participant AppRepo as AppointmentRepository
    participant EventPub as EventPublisher
    participant Kafka
    participant DB as PostgreSQL

    User->>UI: Update appointment details
    UI->>GW: PUT /api/appointments/{id}<br/>Bearer {JWT}
    Note over UI,GW: {appointmentDate, appointmentTime,<br/>symptoms, notes, priority}

    GW->>AppCtrl: Forward request
    AppCtrl->>AppSvc: updateAppointment(id, dto)

    AppSvc->>AppRepo: findById(id)
    AppRepo->>DB: SELECT * FROM appointments WHERE id=?
    DB-->>AppRepo: Appointment or null
    AppRepo-->>AppSvc: Optional<Appointment>

    alt Appointment not found
        AppSvc-->>AppCtrl: ResourceNotFoundException
        AppCtrl-->>GW: 404 Not Found
        GW-->>UI: Error: Lịch hẹn không tồn tại
    end

    AppSvc->>AppSvc: Check status
    alt Status is COMPLETED or CANCELLED
        AppSvc-->>AppCtrl: ValidationException
        AppCtrl-->>GW: 400 Bad Request
        GW-->>UI: Error: Không thể cập nhật lịch hẹn<br/>đã hoàn thành hoặc đã hủy
    end

    alt If date/time changed
        AppSvc->>AppSvc: Validate new date/time not in past
        AppSvc->>AppSvc: Check doctor schedule
        AppSvc->>AppRepo: hasOverlappingAppointmentNative<br/>(exclude current appointmentId)
        AppRepo->>DB: Check overlaps
        DB-->>AppRepo: boolean
        AppRepo-->>AppSvc: hasOverlap

        alt Has overlapping
            AppSvc-->>AppCtrl: ValidationException
            AppCtrl-->>GW: 400 Bad Request
            GW-->>UI: Error: Khung giờ này đã bị trùng
        end
    end

    AppSvc->>AppSvc: Update fields from DTO<br/>- appointmentDate<br/>- appointmentTime<br/>- durationMinutes<br/>- symptoms<br/>- notes<br/>- priority

    AppSvc->>AppRepo: save(appointment)
    AppRepo->>DB: UPDATE appointments
    DB-->>AppRepo: Updated appointment
    AppRepo-->>AppSvc: Appointment

    AppSvc->>EventPub: publishAppointmentUpdated(appointment)
    EventPub->>Kafka: Publish "appointment.updated"

    AppSvc-->>AppCtrl: AppointmentResponseDto
    AppCtrl-->>GW: 200 OK
    GW-->>UI: Updated appointment
    UI-->>User: Update successful
```

## Cancel/Delete Appointment Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant GW as API Gateway
    participant AppCtrl as AppointmentController
    participant AppSvc as AppointmentService
    participant AppRepo as AppointmentRepository
    participant EventPub as EventPublisher
    participant Kafka
    participant DB as PostgreSQL

    User->>UI: Cancel appointment
    UI->>GW: DELETE /api/appointments/{id}<br/>Bearer {JWT}

    GW->>AppCtrl: Forward request
    AppCtrl->>AppSvc: deleteAppointment(id)

    AppSvc->>AppRepo: findById(id)
    AppRepo->>DB: SELECT * FROM appointments WHERE id=?
    DB-->>AppRepo: Appointment
    AppRepo-->>AppSvc: Appointment

    alt Appointment not found
        AppSvc-->>AppCtrl: ResourceNotFoundException
        AppCtrl-->>GW: 404 Not Found
        GW-->>UI: Error: Lịch hẹn không tồn tại
    end

    alt Already cancelled
        AppSvc-->>AppCtrl: ValidationException
        AppCtrl-->>GW: 400 Bad Request
        GW-->>UI: Error: Lịch hẹn đã bị hủy
    end

    AppSvc->>AppSvc: Soft delete:<br/>- status = CANCELLED<br/>- cancelReason = "Đã xóa bởi hệ thống"

    AppSvc->>AppRepo: save(appointment)
    AppRepo->>DB: UPDATE appointments<br/>SET status='CANCELLED'
    DB-->>AppRepo: Updated
    AppRepo-->>AppSvc: OK

    AppSvc->>EventPub: publishAppointmentCancelled(appointment)
    EventPub->>Kafka: Publish "appointment.cancelled"

    AppSvc-->>AppCtrl: void
    AppCtrl-->>GW: 204 No Content
    GW-->>UI: Success
    UI-->>User: Appointment cancelled
```

## Appointment Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING: Create appointment

    PENDING --> CONFIRMED: Doctor confirms
    PENDING --> CANCELLED: User cancels

    CONFIRMED --> COMPLETED: Doctor completes
    CONFIRMED --> CANCELLED: User cancels

    COMPLETED --> [*]
    CANCELLED --> [*]

    note right of PENDING
        Initial state after booking
    end note

    note right of CONFIRMED
        Doctor has confirmed the appointment
    end note

    note right of COMPLETED
        Appointment finished
        Medical record can be created
    end note

    note right of CANCELLED
        Soft delete state
        Audit trail preserved
    end note
```

## Doctor Schedule Validation

```mermaid
flowchart TD
    Start([New Appointment Request]) --> GetDay[Get day of week from date]
    GetDay --> QuerySched[Query DoctorSchedule<br/>by doctorId & dayOfWeek]
    QuerySched --> HasSched{Schedule<br/>exists?}

    HasSched -->|No| Err1[Error: Doctor không<br/>làm việc vào ngày này]
    HasSched -->|Yes| CheckAvail{isAvailable<br/>== true?}

    CheckAvail -->|No| Err2[Error: Doctor không có sẵn]
    CheckAvail -->|Yes| CalcEnd[Calculate endTime =<br/>appointmentTime + duration]

    CalcEnd --> CheckTime{time >= startTime<br/>AND<br/>endTime <= endTime?}
    CheckTime -->|No| Err3[Error: Appointment<br/>outside working hours]
    CheckTime -->|Yes| CheckOverlap[Check for overlapping<br/>appointments]

    CheckOverlap --> HasOverlap{Overlapping<br/>exists?}
    HasOverlap -->|Yes| Err4[Error: Khung giờ<br/>này đã bị trùng]
    HasOverlap -->|No| Success([Validation Passed])

    style Start fill:#e1f5ff
    style Success fill:#c8e6c9
    style Err1 fill:#ffcdd2
    style Err2 fill:#ffcdd2
    style Err3 fill:#ffcdd2
    style Err4 fill:#ffcdd2
```

## Event: Appointment Created

```mermaid
graph LR
    A[Appointment Service] -->|Publish| B[Kafka: appointment.created]
    B -->|Subscribe| C[Medical Service]
    B -->|Subscribe| D[Notification Service<br/>future]

    style A fill:#9f9,stroke:#333,stroke-width:2px
    style B fill:#ff9,stroke:#333,stroke-width:2px
    style C fill:#9ff,stroke:#333,stroke-width:2px
    style D fill:#ddd,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5
```

**Event Payload:**
```json
{
  "appointmentId": 123,
  "patientId": 10,
  "doctorId": 5,
  "patientName": "Nguyen Van A",
  "doctorName": "Dr. Tran Thi B",
  "appointmentDate": "2026-02-15",
  "appointmentTime": "14:00:00",
  "status": "PENDING",
  "type": "IN_PERSON",
  "timestamp": "2026-01-21T10:30:00",
  "eventType": "CREATED"
}
```

## Error Handling Summary

| Error | HTTP Status | Message |
|-------|-------------|---------|
| Invalid duration | 400 Bad Request | Duration must be 15-180 minutes |
| Past appointment | 400 Bad Request | Cannot book appointments in the past |
| Beyond 3 months | 400 Bad Request | Cannot book beyond 3 months |
| User not found | 503 Service Unavailable | User service unavailable |
| Not a doctor | 400 Bad Request | User is not a doctor |
| No schedule | 400 Bad Request | Doctor không làm việc vào ngày này |
| Outside working hours | 400 Bad Request | Appointment outside working hours |
| Doctor unavailable | 400 Bad Request | Doctor không có sẵn |
| Time conflict | 400 Bad Request | Khung giờ này đã bị trùng |
| Cannot update completed | 400 Bad Request | Không thể cập nhật lịch hẹn đã hoàn thành |
| Already cancelled | 400 Bad Request | Lịch hẹn đã bị hủy |
