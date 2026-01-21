# Medical Record and Prescription Flow

## Create Medical Record Flow

```mermaid
sequenceDiagram
    actor Doctor
    participant UI as Frontend
    participant GW as API Gateway
    participant MedCtrl as MedicalRecordController
    participant MedSvc as MedicalRecordService
    participant UserClient as UserServiceClient
    participant AppClient as AppointmentServiceClient
    participant MedRepo as MedicalRecordRepository
    participant PresRepo as PrescriptionRepository
    participant MedicRepo as MedicationRepository
    participant EventPub as EventPublisher
    participant Kafka
    participant DB as PostgreSQL

    Doctor->>UI: Complete appointment<br/>Create medical record
    UI->>GW: POST /api/medical-records<br/>Bearer {JWT}
    Note over UI,GW: {patientId, doctorId, appointmentId,<br/>diagnosis, symptoms, treatmentPlan,<br/>prescriptions[]}

    GW->>GW: Extract userId from JWT
    GW->>MedCtrl: Forward request

    MedCtrl->>MedCtrl: Authorize: only DOCTOR or ADMIN
    alt Not DOCTOR/ADMIN
        MedCtrl-->>GW: 403 Forbidden
        GW-->>UI: Error: Access denied
    end

    alt Role is DOCTOR
        MedCtrl->>MedCtrl: Verify doctorId == currentUserId
        alt Doctor creating for other doctor
            MedCtrl-->>GW: 403 Forbidden
            GW-->>UI: Error: Can only create own records
        end
    end

    MedCtrl->>MedSvc: createMedicalRecord(dto)

    %% Validate patient exists
    MedSvc->>UserClient: getUserById(patientId)
    UserClient->>GW: GET /api/users/{patientId}<br/>(Feign)
    GW-->>UserClient: UserDto

    alt Patient not found or Feign error
        UserClient->>UserClient: Fallback
        UserClient-->>MedSvc: Fallback response
        MedSvc-->>MedCtrl: 503 Service Unavailable
        MedCtrl-->>GW: Error
        GW-->>UI: Error: User service unavailable
    end

    MedSvc->>MedSvc: Extract patientName from UserDto

    %% Validate doctor exists and role
    MedSvc->>UserClient: getUserById(doctorId)
    UserClient->>GW: GET /api/users/{doctorId}<br/>(Feign)
    GW-->>UserClient: UserDto

    MedSvc->>MedSvc: Validate doctor.role == DOCTOR
    alt Not a doctor
        MedSvc-->>MedCtrl: ValidationException
        MedCtrl-->>GW: 400 Bad Request
        GW-->>UI: Error: User is not a doctor
    end

    MedSvc->>MedSvc: Extract doctorName from UserDto

    %% Validate appointment if provided
    alt appointmentId provided
        MedSvc->>AppClient: getAppointmentById(appointmentId)
        AppClient->>GW: GET /api/appointments/{appointmentId}<br/>(Feign)
        GW-->>AppClient: AppointmentDto

        alt Appointment not found
            AppClient->>AppClient: Fallback
            AppClient-->>MedSvc: Fallback response
            MedSvc-->>MedCtrl: 400 Bad Request
            MedCtrl-->>GW: Error
            GW-->>UI: Error: Appointment not found
        end

        MedSvc->>MedSvc: Validate appointment.patientId == dto.patientId
        alt Patient mismatch
            MedSvc-->>MedCtrl: ValidationException
            MedCtrl-->>GW: 400 Bad Request
            GW-->>UI: Error: Appointment patient mismatch
        end

        MedSvc->>MedSvc: Validate appointment.doctorId == dto.doctorId
        alt Doctor mismatch
            MedSvc-->>MedCtrl: ValidationException
            MedCtrl-->>GW: 400 Bad Request
            GW-->>UI: Error: Appointment doctor mismatch
        end

        MedSvc->>MedSvc: Validate appointment.status == COMPLETED
        alt Not completed
            MedSvc-->>MedCtrl: ValidationException
            MedCtrl-->>GW: 400 Bad Request
            GW-->>UI: Error: Appointment not completed
        end
    end

    %% Create medical record
    MedSvc->>MedSvc: Build MedicalRecord entity:<br/>- patientId, doctorId, appointmentId<br/>- patientName (denormalized)<br/>- doctorName (denormalized)<br/>- diagnosis, symptoms<br/>- treatmentPlan, notes<br/>- followUpDate

    %% Process prescriptions
    loop For each prescription in dto.prescriptions
        alt medicationId provided
            MedSvc->>MedicRepo: findById(medicationId)
            MedicRepo->>DB: SELECT * FROM medications<br/>WHERE id=?
            DB-->>MedicRepo: Medication
            MedicRepo-->>MedSvc: Medication

            MedSvc->>MedSvc: Build Prescription:<br/>- medicationId<br/>- medicationName from Medication<br/>- dosage (default or override)<br/>- frequency (default or override)<br/>- duration (default or override)<br/>- instructions (default or override)

        else medicationName provided manually
            MedSvc->>MedSvc: Build Prescription:<br/>- medicationName (manual)<br/>- dosage, frequency, duration<br/>- instructions (all required)
        end

        MedSvc->>MedSvc: Link prescription to medical record
    end

    %% Save with cascade
    MedSvc->>MedRepo: save(medicalRecord with prescriptions)
    MedRepo->>DB: BEGIN TRANSACTION
    MedRepo->>DB: INSERT INTO medical_records
    MedRepo->>DB: INSERT INTO prescriptions (cascade)
    MedRepo->>DB: COMMIT
    DB-->>MedRepo: Saved
    MedRepo-->>MedSvc: MedicalRecord with prescriptions

    %% Publish event
    MedSvc->>EventPub: publishMedicalRecordCreated(medicalRecord)
    EventPub->>Kafka: Publish "medical_record.created"
    Note over EventPub,Kafka: Event: {medicalRecordId, patientId,<br/>doctorId, appointmentId, diagnosis}

    MedSvc-->>MedCtrl: MedicalRecordResponseDto<br/>with prescriptions
    MedCtrl-->>GW: 201 Created
    GW-->>UI: Medical record created
    UI-->>Doctor: Success + Record ID
```

## Add Prescription to Existing Medical Record

```mermaid
sequenceDiagram
    actor Doctor
    participant UI as Frontend
    participant GW as API Gateway
    participant PresCtrl as PrescriptionController
    participant PresSvc as PrescriptionService
    participant MedRepo as MedicalRecordRepository
    participant UserClient as UserServiceClient
    participant MedicRepo as MedicationRepository
    participant PresRepo as PrescriptionRepository
    participant DB as PostgreSQL

    Doctor->>UI: Add prescription<br/>to medical record
    UI->>GW: POST /api/prescriptions<br/>Bearer {JWT}
    Note over UI,GW: {medicalRecordId, doctorId,<br/>medicationId OR medicationName,<br/>dosage, frequency, duration}

    GW->>PresCtrl: Forward request
    PresCtrl->>PresSvc: addPrescription(medicalRecordId, dto)

    %% Verify medical record exists
    PresSvc->>MedRepo: findById(medicalRecordId)
    MedRepo->>DB: SELECT * FROM medical_records<br/>WHERE id=?
    DB-->>MedRepo: MedicalRecord
    MedRepo-->>PresSvc: MedicalRecord

    alt Medical record not found
        PresSvc-->>PresCtrl: ResourceNotFoundException
        PresCtrl-->>GW: 404 Not Found
        GW-->>UI: Error: Medical record not found
    end

    %% Verify doctor
    PresSvc->>UserClient: getUserById(doctorId)
    UserClient->>GW: GET /api/users/{doctorId}
    GW-->>UserClient: UserDto

    PresSvc->>PresSvc: Validate doctor.role == DOCTOR
    alt Not a doctor
        PresSvc-->>PresCtrl: ValidationException
        PresCtrl-->>GW: 400 Bad Request
        GW-->>UI: Error: User is not a doctor
    end

    %% Get medication details
    alt medicationId provided
        PresSvc->>MedicRepo: findById(medicationId)
        MedicRepo->>DB: SELECT * FROM medications
        DB-->>MedicRepo: Medication
        MedicRepo-->>PresSvc: Medication

        PresSvc->>PresSvc: Build Prescription:<br/>- Use medication defaults<br/>- Override with DTO if provided
        PresSvc->>PresSvc: Set: medicationName, dosage,<br/>frequency, duration, instructions

    else medicationName provided manually
        PresSvc->>PresSvc: Require all fields in DTO
        alt Missing required fields
            PresSvc-->>PresCtrl: ValidationException
            PresCtrl-->>GW: 400 Bad Request
            GW-->>UI: Error: Missing required fields
        end

        PresSvc->>PresSvc: Build Prescription from DTO
    end

    %% Save prescription
    PresSvc->>PresRepo: save(prescription)
    PresRepo->>DB: INSERT INTO prescriptions
    DB-->>PresRepo: Prescription
    PresRepo-->>PresSvc: Prescription

    PresSvc-->>PresCtrl: PrescriptionResponseDto
    PresCtrl-->>GW: 201 Created
    GW-->>UI: Prescription added
    UI-->>Doctor: Success
```

## Get Patient Medical Records

```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant GW as API Gateway
    participant MedCtrl as MedicalRecordController
    participant MedSvc as MedicalRecordService
    participant MedRepo as MedicalRecordRepository
    participant DB as PostgreSQL

    User->>UI: View medical records
    UI->>GW: GET /api/medical-records/patient/{patientId}<br/>Bearer {JWT}

    GW->>GW: Extract currentUserId & role from JWT
    GW->>MedCtrl: Forward request

    MedCtrl->>MedCtrl: Authorization check
    alt Role is PATIENT
        MedCtrl->>MedCtrl: Verify patientId == currentUserId
        alt Not own records
            MedCtrl-->>GW: 403 Forbidden
            GW-->>UI: Error: Can only view own records
        end
    end
    Note over MedCtrl: DOCTOR can view own created records<br/>ADMIN can view all

    MedCtrl->>MedSvc: getPatientMedicalRecords(patientId, page, size)

    MedSvc->>MedRepo: findByPatientId(patientId, pageable)
    MedRepo->>DB: SELECT * FROM medical_records<br/>WHERE patient_id=?<br/>ORDER BY created_at DESC<br/>LIMIT ? OFFSET ?
    DB-->>MedRepo: List<MedicalRecord>
    MedRepo-->>MedSvc: Page<MedicalRecord>

    MedSvc->>MedSvc: For each record, fetch prescriptions
    MedSvc->>MedRepo: Get prescriptions (eager/lazy)
    MedRepo->>DB: SELECT * FROM prescriptions<br/>WHERE medical_record_id IN (...)
    DB-->>MedRepo: List<Prescription>
    MedRepo-->>MedSvc: Prescriptions

    MedSvc-->>MedCtrl: Page<MedicalRecordResponseDto>
    MedCtrl-->>GW: 200 OK
    GW-->>UI: Medical records
    UI-->>User: Display records
```

## Update Medical Record

```mermaid
sequenceDiagram
    actor Doctor
    participant UI as Frontend
    participant GW as API Gateway
    participant MedCtrl as MedicalRecordController
    participant MedSvc as MedicalRecordService
    participant MedRepo as MedicalRecordRepository
    participant DB as PostgreSQL

    Doctor->>UI: Update medical record
    UI->>GW: PUT /api/medical-records/{id}<br/>Bearer {JWT}
    Note over UI,GW: {diagnosis, symptoms, treatmentPlan,<br/>notes, followUpDate}

    GW->>GW: Extract currentUserId & role from JWT
    GW->>MedCtrl: Forward request

    MedCtrl->>MedSvc: updateMedicalRecord(id, dto)

    MedSvc->>MedRepo: findById(id)
    MedRepo->>DB: SELECT * FROM medical_records
    DB-->>MedRepo: MedicalRecord
    MedRepo-->>MedSvc: MedicalRecord

    alt Medical record not found
        MedSvc-->>MedCtrl: ResourceNotFoundException
        MedCtrl-->>GW: 404 Not Found
        GW-->>UI: Error: Medical record not found
    end

    alt Role is DOCTOR
        MedSvc->>MedSvc: Verify record.doctorId == currentUserId
        alt Not own record
            MedSvc-->>MedCtrl: AccessDeniedException
            MedCtrl-->>GW: 403 Forbidden
            GW-->>UI: Error: Can only update own records
        end
    end

    MedSvc->>MedSvc: Update fields from DTO:<br/>- diagnosis<br/>- symptoms<br/>- treatmentPlan<br/>- notes<br/>- followUpDate

    MedSvc->>MedRepo: save(medicalRecord)
    MedRepo->>DB: UPDATE medical_records
    DB-->>MedRepo: Updated
    MedRepo-->>MedSvc: MedicalRecord

    MedSvc-->>MedCtrl: MedicalRecordResponseDto
    MedCtrl-->>GW: 200 OK
    GW-->>UI: Updated record
    UI-->>Doctor: Update successful
```

## Medication Catalog Usage

```mermaid
flowchart TD
    Start([Doctor adds prescription]) --> Check{Has<br/>medicationId?}

    Check -->|Yes| Query[Query Medication catalog<br/>by medicationId]
    Check -->|No| Manual[Enter manually:<br/>medicationName, dosage,<br/>frequency, duration]

    Query --> Found{Found?}
    Found -->|No| Error1[Error: Medication not found]
    Found -->|Yes| Defaults[Load defaults from catalog:<br/>- name<br/>- defaultDosage<br/>- defaultFrequency<br/>- defaultDuration<br/>- instructions]

    Defaults --> Override{DTO has<br/>overrides?}
    Override -->|Yes| UseOverride[Use DTO values:<br/>- dosage<br/>- frequency<br/>- duration]
    Override -->|No| UseDefaults[Use catalog defaults]

    UseOverride --> Create[Create Prescription]
    UseDefaults --> Create
    Manual --> Validate{All fields<br/>provided?}

    Validate -->|No| Error2[Error: Missing required fields]
    Validate -->|Yes| Create

    Create --> Save[Save to database]
    Save --> Done([Prescription Created])

    style Start fill:#e1f5ff
    style Done fill:#c8e6c9
    style Error1 fill:#ffcdd2
    style Error2 fill:#ffcdd2
```

## Authorization Matrix

| Role | Create Record | View Own Records | View All Records | Update Own Records | Update All Records | Delete Records |
|------|---------------|------------------|------------------|--------------------|--------------------|----------------|
| **PATIENT** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **DOCTOR** | ✅ (own only) | ✅ (own created) | ❌ | ✅ (own only) | ❌ | ❌ |
| **ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Event: Medical Record Created

```mermaid
graph LR
    A[Medical Service] -->|Publish| B[Kafka: medical_record.created]
    B -->|Subscribe| C[Notification Service<br/>future]
    B -->|Subscribe| D[Analytics Service<br/>future]

    style A fill:#9ff,stroke:#333,stroke-width:2px
    style B fill:#ff9,stroke:#333,stroke-width:2px
    style C fill:#ddd,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5
    style D fill:#ddd,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5
```

**Event Payload:**
```json
{
  "medicalRecordId": 456,
  "patientId": 10,
  "doctorId": 5,
  "appointmentId": 123,
  "diagnosis": "Hypertension",
  "prescriptionCount": 2,
  "timestamp": "2026-01-21T15:30:00",
  "eventType": "CREATED"
}
```

## Database Schema

```mermaid
erDiagram
    MEDICAL_RECORDS ||--o{ PRESCRIPTIONS : contains
    MEDICAL_RECORDS }o--|| APPOINTMENTS : "linked to"
    PRESCRIPTIONS }o--o| MEDICATIONS : "references"

    MEDICAL_RECORDS {
        bigint id PK
        bigint patient_id FK
        bigint doctor_id FK
        bigint appointment_id FK
        string patient_name
        string doctor_name
        text diagnosis
        text symptoms
        text treatment_plan
        text notes
        date follow_up_date
        timestamp created_at
        timestamp updated_at
    }

    PRESCRIPTIONS {
        bigint id PK
        bigint medical_record_id FK
        bigint medication_id FK
        string medication_name
        string dosage
        string frequency
        int duration_days
        text instructions
        timestamp created_at
    }

    MEDICATIONS {
        bigint id PK
        string name
        string category
        string default_dosage
        string default_frequency
        int default_duration_days
        text instructions
        text side_effects
        boolean is_active
    }

    APPOINTMENTS {
        bigint id PK
        bigint patient_id
        bigint doctor_id
        date appointment_date
        time appointment_time
        string status
    }
```

## Error Handling Summary

| Error | HTTP Status | Message |
|-------|-------------|---------|
| Not authorized | 403 Forbidden | Only DOCTOR/ADMIN can create records |
| Doctor creating for other | 403 Forbidden | Can only create own records |
| User service unavailable | 503 Service Unavailable | User service unavailable |
| Not a doctor | 400 Bad Request | User is not a doctor |
| Appointment not found | 400 Bad Request | Appointment not found |
| Patient mismatch | 400 Bad Request | Appointment patient mismatch |
| Doctor mismatch | 400 Bad Request | Appointment doctor mismatch |
| Appointment not completed | 400 Bad Request | Appointment must be completed |
| Medication not found | 404 Not Found | Medication not found in catalog |
| Missing required fields | 400 Bad Request | All prescription fields required |
| Medical record not found | 404 Not Found | Medical record not found |
| Not own record | 403 Forbidden | Can only update own records |
| Patient viewing others | 403 Forbidden | Can only view own medical records |
