# Event-Driven Architecture (Kafka)

## Event Flow Overview

```mermaid
graph TB
    subgraph "Event Publishers"
        US[User Service]
        AS[Appointment Service]
        MS[Medical Service]
        PS[Payment Service]
    end

    subgraph "Apache Kafka"
        T1[user.created]
        T2[user.updated]
        T3[user.deleted]
        T4[appointment.created]
        T5[appointment.updated]
        T6[appointment.cancelled]
        T7[medical_record.created]
        T8[medical_record.updated]
        T9[payment.created]
        T10[payment.completed]
        T11[payment.failed]
        T12[payment.refunded]
    end

    subgraph "Event Consumers"
        ASC[Appointment Service<br/>Consumer]
        MSC[Medical Service<br/>Consumer]
        Future[Future Services<br/>Notification, Analytics]
    end

    US -->|Publish| T1
    US -->|Publish| T2
    US -->|Publish| T3

    AS -->|Publish| T4
    AS -->|Publish| T5
    AS -->|Publish| T6

    MS -->|Publish| T7
    MS -->|Publish| T8

    PS -->|Publish| T9
    PS -->|Publish| T10
    PS -->|Publish| T11
    PS -->|Publish| T12

    T2 -->|Subscribe| ASC
    T3 -->|Subscribe| ASC
    T6 -->|Subscribe| MSC

    T1 -.->|Future| Future
    T4 -.->|Future| Future
    T7 -.->|Future| Future
    T10 -.->|Future| Future

    style US fill:#f3e5f5
    style AS fill:#e8f5e9
    style MS fill:#fff9c4
    style PS fill:#ffe0b2
    style T1 fill:#ffccbc
    style T2 fill:#ffccbc
    style T3 fill:#ffccbc
    style T4 fill:#c5e1a5
    style T5 fill:#c5e1a5
    style T6 fill:#c5e1a5
    style T7 fill:#fff59d
    style T8 fill:#fff59d
    style T9 fill:#ffcc80
    style T10 fill:#ffcc80
    style T11 fill:#ffcc80
    style T12 fill:#ffcc80
```

## User Events

### User Created Event

```mermaid
sequenceDiagram
    participant US as User Service
    participant EventPub as EventPublisher
    participant Kafka
    participant ASC as Appointment Service<br/>Consumer
    participant MSC as Medical Service<br/>Consumer

    US->>EventPub: publishUserCreated(user)
    EventPub->>Kafka: Publish to "user.created"
    Note over Kafka: Event: {userId, email, fullName,<br/>phone, role, timestamp, eventType}

    Kafka-->>ASC: Consume event
    ASC->>ASC: Log: New user created<br/>(Future: Pre-cache user data)

    Kafka-->>MSC: Consume event
    MSC->>MSC: Log: New user created<br/>(Future: Setup health metrics)
```

**Event Payload:**
```json
{
  "userId": 123,
  "email": "newuser@example.com",
  "fullName": "Nguyen Van A",
  "phone": "0901234567",
  "role": "PATIENT",
  "specialization": null,
  "licenseNumber": null,
  "timestamp": "2026-01-21T10:00:00",
  "eventType": "CREATED"
}
```

### User Updated Event

```mermaid
sequenceDiagram
    participant US as User Service
    participant EventPub as EventPublisher
    participant Kafka
    participant ASC as Appointment Service<br/>Consumer
    participant AppRepo as AppointmentRepository
    participant SchedRepo as DoctorScheduleRepository
    participant DB as PostgreSQL

    US->>EventPub: publishUserUpdated(user)
    EventPub->>Kafka: Publish to "user.updated"
    Note over Kafka: Event: {userId, email, fullName,<br/>phone, role, specialization}

    Kafka-->>ASC: Consume event
    ASC->>ASC: Log: User updated

    alt Role is PATIENT or DOCTOR
        ASC->>AppRepo: findByPatientIdOrDoctorId(userId)
        AppRepo->>DB: SELECT * FROM appointments<br/>WHERE patient_id=? OR doctor_id=?
        DB-->>AppRepo: List<Appointment>
        AppRepo-->>ASC: Appointments

        ASC->>ASC: Update denormalized fields:<br/>- patientName<br/>- doctorName<br/>- patientPhone

        ASC->>AppRepo: saveAll(appointments)
        AppRepo->>DB: UPDATE appointments<br/>SET patient_name=?, doctor_name=?<br/>WHERE id IN (...)
        DB-->>AppRepo: Success
        AppRepo-->>ASC: Updated
    end

    alt Role is DOCTOR
        ASC->>SchedRepo: findByDoctorId(userId)
        SchedRepo->>DB: SELECT * FROM doctor_schedules<br/>WHERE doctor_id=?
        DB-->>SchedRepo: List<DoctorSchedule>
        SchedRepo-->>ASC: Schedules

        ASC->>ASC: Update denormalized:<br/>- doctorName

        ASC->>SchedRepo: saveAll(schedules)
        SchedRepo->>DB: UPDATE doctor_schedules
        DB-->>SchedRepo: Success
        SchedRepo-->>ASC: Updated
    end
```

**Event Payload:**
```json
{
  "userId": 123,
  "email": "updated@example.com",
  "fullName": "Nguyen Van A (Updated)",
  "phone": "0912345678",
  "role": "PATIENT",
  "specialization": null,
  "timestamp": "2026-01-21T11:00:00",
  "eventType": "UPDATED"
}
```

### User Deleted Event

```mermaid
sequenceDiagram
    participant US as User Service
    participant EventPub as EventPublisher
    participant Kafka
    participant ASC as Appointment Service<br/>Consumer

    US->>EventPub: publishUserDeleted(userId)
    EventPub->>Kafka: Publish to "user.deleted"
    Note over Kafka: Event: {userId, timestamp, eventType}

    Kafka-->>ASC: Consume event
    ASC->>ASC: Log warning:<br/>"User deleted: {userId}"<br/>"Associated appointments may need review"
    Note over ASC: Soft delete pattern:<br/>User is marked inactive<br/>but data remains
```

**Event Payload:**
```json
{
  "userId": 123,
  "timestamp": "2026-01-21T12:00:00",
  "eventType": "DELETED"
}
```

## Appointment Events

### Appointment Created Event

```mermaid
sequenceDiagram
    participant AS as Appointment Service
    participant EventPub as EventPublisher
    participant Kafka
    participant MSC as Medical Service<br/>Consumer
    participant Future as Notification Service<br/>(Future)

    AS->>EventPub: publishAppointmentCreated(appointment)
    EventPub->>Kafka: Publish to "appointment.created"
    Note over Kafka: Event: {appointmentId, patientId,<br/>doctorId, date, time, status}

    Kafka-->>MSC: Consume event
    MSC->>MSC: Log: New appointment created<br/>(Future: Prepare medical record template)

    Kafka-.->Future: Consume event (Future)
    Future-.->Future: Send notification to patient<br/>Send notification to doctor<br/>Add to calendar
```

**Event Payload:**
```json
{
  "appointmentId": 456,
  "patientId": 10,
  "doctorId": 5,
  "patientName": "Nguyen Van A",
  "doctorName": "Dr. Tran Thi B",
  "appointmentDate": "2026-02-15",
  "appointmentTime": "14:00:00",
  "durationMinutes": 30,
  "status": "PENDING",
  "type": "IN_PERSON",
  "priority": "NORMAL",
  "timestamp": "2026-01-21T10:30:00",
  "eventType": "CREATED"
}
```

### Appointment Updated Event

```mermaid
sequenceDiagram
    participant AS as Appointment Service
    participant EventPub as EventPublisher
    participant Kafka
    participant Future as Notification Service<br/>(Future)

    AS->>EventPub: publishAppointmentUpdated(appointment)
    EventPub->>Kafka: Publish to "appointment.updated"
    Note over Kafka: Event: {appointmentId, changes}

    Kafka-.->Future: Consume event (Future)
    Future-.->Future: Send update notification<br/>to patient and doctor
```

**Event Payload:**
```json
{
  "appointmentId": 456,
  "patientId": 10,
  "doctorId": 5,
  "appointmentDate": "2026-02-15",
  "appointmentTime": "15:00:00",
  "status": "CONFIRMED",
  "changedFields": ["appointmentTime", "status"],
  "timestamp": "2026-01-21T11:00:00",
  "eventType": "UPDATED"
}
```

### Appointment Cancelled Event

```mermaid
sequenceDiagram
    participant AS as Appointment Service
    participant EventPub as EventPublisher
    participant Kafka
    participant MSC as Medical Service<br/>Consumer
    participant Future as Notification Service<br/>(Future)

    AS->>EventPub: publishAppointmentCancelled(appointment)
    EventPub->>Kafka: Publish to "appointment.cancelled"
    Note over Kafka: Event: {appointmentId, cancelReason}

    Kafka-->>MSC: Consume event
    MSC->>MSC: Log: Appointment cancelled<br/>Check if medical record exists<br/>Mark as cancelled in related records

    Kafka-.->Future: Consume event (Future)
    Future-.->Future: Send cancellation notification<br/>Update calendar<br/>Trigger refund if payment made
```

**Event Payload:**
```json
{
  "appointmentId": 456,
  "patientId": 10,
  "doctorId": 5,
  "status": "CANCELLED",
  "cancelReason": "Patient requested cancellation",
  "cancelledAt": "2026-01-21T12:00:00",
  "timestamp": "2026-01-21T12:00:00",
  "eventType": "CANCELLED"
}
```

## Medical Record Events

### Medical Record Created Event

```mermaid
sequenceDiagram
    participant MS as Medical Service
    participant EventPub as EventPublisher
    participant Kafka
    participant Future1 as Notification Service<br/>(Future)
    participant Future2 as Analytics Service<br/>(Future)

    MS->>EventPub: publishMedicalRecordCreated(medicalRecord)
    EventPub->>Kafka: Publish to "medical_record.created"
    Note over Kafka: Event: {medicalRecordId, patientId,<br/>doctorId, appointmentId, diagnosis}

    Kafka-.->Future1: Consume event (Future)
    Future1-.->Future1: Send notification to patient:<br/>"Your medical record is ready"

    Kafka-.->Future2: Consume event (Future)
    Future2-.->Future2: Update analytics:<br/>- Disease statistics<br/>- Doctor performance<br/>- Treatment outcomes
```

**Event Payload:**
```json
{
  "medicalRecordId": 789,
  "patientId": 10,
  "doctorId": 5,
  "appointmentId": 456,
  "diagnosis": "Hypertension",
  "prescriptionCount": 2,
  "hasFollowUp": true,
  "followUpDate": "2026-03-15",
  "timestamp": "2026-01-21T15:30:00",
  "eventType": "CREATED"
}
```

### Medical Record Updated Event

```mermaid
sequenceDiagram
    participant MS as Medical Service
    participant EventPub as EventPublisher
    participant Kafka
    participant Future as Notification Service<br/>(Future)

    MS->>EventPub: publishMedicalRecordUpdated(medicalRecord)
    EventPub->>Kafka: Publish to "medical_record.updated"

    Kafka-.->Future: Consume event (Future)
    Future-.->Future: Send update notification<br/>to patient
```

**Event Payload:**
```json
{
  "medicalRecordId": 789,
  "patientId": 10,
  "doctorId": 5,
  "updatedFields": ["diagnosis", "treatmentPlan"],
  "timestamp": "2026-01-21T16:00:00",
  "eventType": "UPDATED"
}
```

## Payment Events

### Payment Created Event

```mermaid
sequenceDiagram
    participant PS as Payment Service
    participant EventPub as EventPublisher
    participant Kafka
    participant Future as Analytics Service<br/>(Future)

    PS->>EventPub: publishPaymentCreated(paymentEvent)
    EventPub->>Kafka: Publish to "payment.created"

    Kafka-.->Future: Consume event (Future)
    Future-.->Future: Track payment initiation<br/>Monitor pending payments
```

**Event Payload:**
```json
{
  "eventType": "payment.created",
  "timestamp": "2026-01-21T10:00:00",
  "data": {
    "orderId": "ORD202601210001",
    "appointmentId": 123,
    "patientId": 10,
    "doctorId": 5,
    "amount": 500000,
    "currency": "VND",
    "paymentMethod": "MOMO_WALLET",
    "status": "PENDING"
  }
}
```

### Payment Completed Event

```mermaid
sequenceDiagram
    participant PS as Payment Service
    participant EventPub as EventPublisher
    participant Kafka
    participant Future1 as Notification Service<br/>(Future)
    participant Future2 as Accounting Service<br/>(Future)

    PS->>EventPub: publishPaymentCompleted(paymentEvent)
    EventPub->>Kafka: Publish to "payment.completed"

    Kafka-.->Future1: Consume event (Future)
    Future1-.->Future1: Send payment confirmation<br/>to patient<br/>Generate receipt

    Kafka-.->Future2: Consume event (Future)
    Future2-.->Future2: Record revenue<br/>Update financial reports<br/>Trigger doctor payout
```

**Event Payload:**
```json
{
  "eventType": "payment.completed",
  "timestamp": "2026-01-21T10:15:00",
  "data": {
    "orderId": "ORD202601210001",
    "appointmentId": 123,
    "patientId": 10,
    "doctorId": 5,
    "amount": 500000,
    "currency": "VND",
    "paymentMethod": "MOMO_WALLET",
    "status": "COMPLETED",
    "transId": "12345678901",
    "completedAt": "2026-01-21T10:15:00"
  }
}
```

### Payment Failed Event

```mermaid
sequenceDiagram
    participant PS as Payment Service
    participant EventPub as EventPublisher
    participant Kafka
    participant Future as Notification Service<br/>(Future)

    PS->>EventPub: publishPaymentFailed(paymentEvent)
    EventPub->>Kafka: Publish to "payment.failed"

    Kafka-.->Future: Consume event (Future)
    Future-.->Future: Send failure notification<br/>Suggest retry or alternatives
```

**Event Payload:**
```json
{
  "eventType": "payment.failed",
  "timestamp": "2026-01-21T10:15:00",
  "data": {
    "orderId": "ORD202601210002",
    "appointmentId": 124,
    "patientId": 11,
    "amount": 500000,
    "status": "FAILED",
    "errorMessage": "Insufficient balance",
    "errorCode": "1001"
  }
}
```

### Payment Refunded Event

```mermaid
sequenceDiagram
    participant PS as Payment Service
    participant EventPub as EventPublisher
    participant Kafka
    participant Future1 as Notification Service<br/>(Future)
    participant Future2 as Accounting Service<br/>(Future)

    PS->>EventPub: publishPaymentRefunded(paymentEvent)
    EventPub->>Kafka: Publish to "payment.refunded"

    Kafka-.->Future1: Consume event (Future)
    Future1-.->Future1: Send refund confirmation<br/>to patient

    Kafka-.->Future2: Consume event (Future)
    Future2-.->Future2: Update financial reports<br/>Adjust revenue<br/>Process doctor commission reversal
```

**Event Payload:**
```json
{
  "eventType": "payment.refunded",
  "timestamp": "2026-01-21T11:00:00",
  "data": {
    "orderId": "ORD202601210001",
    "appointmentId": 123,
    "patientId": 10,
    "amount": 500000,
    "status": "REFUNDED",
    "refundAmount": 500000,
    "refundReason": "Appointment cancelled by patient",
    "refundTransId": "REF12345678"
  }
}
```

## Kafka Configuration

### Producer Configuration

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
      properties:
        max.in.flight.requests.per.connection: 1
        enable.idempotence: true
```

### Consumer Configuration

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: ${spring.application.name}-group
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: "*"
        max.poll.records: 10
        session.timeout.ms: 30000
```

## Event Processing Flow

```mermaid
flowchart TD
    Start([Event Occurs]) --> Publish[Publisher creates event object]
    Publish --> Serialize[Serialize to JSON]
    Serialize --> Send[Send to Kafka topic]
    Send --> Partition[Kafka partitions message<br/>by key]

    Partition --> Store[Store in log]
    Store --> Notify[Notify consumers in group]

    Notify --> Consumer1[Consumer reads message]
    Consumer1 --> Deserialize[Deserialize from JSON]
    Deserialize --> Validate{Valid<br/>event?}

    Validate -->|No| DLQ[Send to Dead Letter Queue]
    Validate -->|Yes| Process[Process event]

    Process --> Success{Success?}
    Success -->|Yes| Commit[Commit offset]
    Success -->|No| Retry{Retry<br/>count?}

    Retry -->|< 3| Wait[Wait with backoff]
    Wait --> Process
    Retry -->|>= 3| DLQ

    Commit --> Done([Complete])
    DLQ --> Alert[Log error + Alert]
    Alert --> ManualReview([Manual Review Required])

    style Start fill:#e1f5ff
    style Done fill:#c8e6c9
    style DLQ fill:#ffcdd2
    style Alert fill:#ff9800,color:#fff
    style ManualReview fill:#f44336,color:#fff
```

## Event Ordering and Partitioning

```mermaid
graph TB
    subgraph "User Events"
        U1[User 123 Updated]
        U2[User 123 Deleted]
    end

    subgraph "Kafka Topic: user.updated"
        P0[Partition 0]
        P1[Partition 1<br/>Key: userId=123]
        P2[Partition 2]
    end

    subgraph "Consumers"
        C1[Consumer Instance 1<br/>Reads P0, P1]
        C2[Consumer Instance 2<br/>Reads P2]
    end

    U1 -->|Key: 123| P1
    U2 -->|Key: 123| P1
    P1 --> C1

    style U1 fill:#b3e5fc
    style U2 fill:#ffccbc
    style P1 fill:#c5e1a5
    style C1 fill:#fff59d
```

**Key Points:**
- Events for same entity (e.g., userId=123) go to same partition
- Maintains order within partition
- Different partitions can be processed in parallel
- Consumer group ensures each partition is read by only one consumer instance

## Error Handling and Dead Letter Queue

```mermaid
sequenceDiagram
    participant Kafka
    participant Consumer
    participant DLQ as Dead Letter Queue
    participant Monitor as Monitoring System

    Kafka->>Consumer: Deliver message
    Consumer->>Consumer: Process event

    alt Processing succeeds
        Consumer->>Kafka: Commit offset
    else Processing fails (attempt 1)
        Consumer->>Consumer: Retry after 1s
        Consumer->>Consumer: Process event
    end

    alt Still fails (attempt 2)
        Consumer->>Consumer: Retry after 2s
        Consumer->>Consumer: Process event
    end

    alt Still fails (attempt 3)
        Consumer->>Consumer: Retry after 4s
        Consumer->>Consumer: Process event
    end

    alt Still fails (max retries)
        Consumer->>DLQ: Send to DLQ
        Consumer->>Monitor: Log error + Alert
        Consumer->>Kafka: Commit offset<br/>(to not block other messages)
        Monitor->>Monitor: Trigger alert:<br/>- Email to dev team<br/>- Slack notification<br/>- Dashboard metric
    end
```

## Event Schema Evolution

```mermaid
flowchart TD
    V1[Version 1 Event:<br/>{userId, email, fullName}] --> Publish1[Published by old service]
    Publish1 --> Kafka[Kafka Topic]

    V2[Version 2 Event:<br/>{userId, email, fullName,<br/>phone, role}] --> Publish2[Published by new service]
    Publish2 --> Kafka

    Kafka --> Consumer[Consumer]
    Consumer --> Check{Check<br/>version?}

    Check -->|V1| HandleV1[Handle V1:<br/>Use default values<br/>for missing fields]
    Check -->|V2| HandleV2[Handle V2:<br/>Use all fields]

    HandleV1 --> Process[Process Event]
    HandleV2 --> Process

    style V1 fill:#ffcdd2
    style V2 fill:#c8e6c9
    style Process fill:#e1f5ff
```

**Backward Compatibility Strategy:**
- Add new fields with default values
- Never remove or rename existing fields
- Use optional fields for new features
- Version field in event payload for major changes

## Monitoring and Metrics

```mermaid
graph TB
    subgraph "Metrics Collected"
        M1[Message Produce Rate]
        M2[Message Consume Rate]
        M3[Consumer Lag]
        M4[Processing Time]
        M5[Error Rate]
        M6[Dead Letter Queue Size]
    end

    subgraph "Monitoring Tools"
        Prometheus[Prometheus]
        Grafana[Grafana Dashboard]
        AlertManager[Alert Manager]
    end

    M1 --> Prometheus
    M2 --> Prometheus
    M3 --> Prometheus
    M4 --> Prometheus
    M5 --> Prometheus
    M6 --> Prometheus

    Prometheus --> Grafana
    Prometheus --> AlertManager

    AlertManager --> Email[Email Alerts]
    AlertManager --> Slack[Slack Notifications]

    style Prometheus fill:#ff9800,color:#fff
    style Grafana fill:#2196f3,color:#fff
    style AlertManager fill:#f44336,color:#fff
```

## Best Practices Summary

1. **Use meaningful event names** - `user.created`, `payment.completed`
2. **Include timestamp in all events** - For debugging and ordering
3. **Use consistent event structure** - `{eventType, timestamp, data}`
4. **Partition by entity ID** - Maintain order for same entity
5. **Implement idempotency** - Handle duplicate events gracefully
6. **Use Dead Letter Queue** - For failed messages
7. **Enable monitoring** - Track lag, error rates, throughput
8. **Version your events** - For backward compatibility
9. **Set appropriate retention** - Balance storage vs. replay ability
10. **Document event schemas** - Make it easy for consumers to integrate
