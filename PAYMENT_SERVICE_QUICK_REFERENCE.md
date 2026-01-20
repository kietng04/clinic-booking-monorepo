# PaymentService Quick Reference

## Compilation Status
```
mvn clean compile
[INFO] BUILD SUCCESS
```

All service code compiles successfully without errors.

---

## Implemented Files

### Service Interface
**File**: `src/main/java/com/clinicbooking/paymentservice/service/IPaymentService.java`
- Payment service contract
- 7 core methods
- RefundResponse inner class

### Service Implementation
**File**: `src/main/java/com/clinicbooking/paymentservice/service/impl/PaymentService.java`
- Full business logic implementation
- 700+ lines of code
- Comprehensive error handling
- Transaction management
- Event publishing
- Caching support

### Updated Dependencies
**File**: `src/main/java/com/clinicbooking/paymentservice/service/IMomoPaymentService.java`
- Added MomoQueryResponse inner class
- Added MomoRefundResponse inner class
- Response DTOs for Momo API operations

---

## Core Methods Overview

### 1. createPayment()
**Input**: `CreatePaymentRequest`, `patientId`
**Output**: `PaymentResponse`
**Process**:
- Validate amount and prevent duplicates
- Generate orderId
- Create payment entities
- Call Momo API
- Publish event
- Return payment URL

**Exceptions**: DuplicatePaymentException, PaymentException, MomoException

### 2. handleMomoCallback()
**Input**: `MomoCallbackResponse`
**Output**: void (updates database)
**Process**:
- Verify signature
- Check idempotency
- Update entities
- Update status
- Publish event

**Exceptions**: InvalidSignatureException, PaymentNotFoundException, PaymentException

### 3. getPaymentByOrderId()
**Input**: `orderId`
**Output**: `PaymentResponse`
**Features**: Cached, read-only transaction
**Exceptions**: PaymentNotFoundException

### 4. getPaymentByAppointmentId()
**Input**: `appointmentId`
**Output**: `PaymentResponse`
**Exceptions**: PaymentNotFoundException

### 5. getPatientPayments()
**Input**: `patientId`, `Pageable`
**Output**: `Page<PaymentResponse>`
**Features**: Pagination support

### 6. refundPayment()
**Input**: `RefundPaymentRequest`
**Output**: `RefundResponse`
**Process**:
- Validate payment status
- Check refund amount
- Call Momo refund API
- Create refund entity
- Update payment status
- Publish event

**Exceptions**: PaymentNotFoundException, PaymentException, MomoException

### 7. queryPaymentStatus()
**Input**: `orderId`
**Output**: `PaymentResponse`
**Process**:
- Query Momo API
- Sync with database
- Update status if changed

**Exceptions**: PaymentNotFoundException, PaymentException, MomoException

---

## Annotations Used

```java
@Service              // Spring service component
@Transactional        // Transaction management (write ops)
@Transactional(readOnly = true)  // Read-only transactions (read ops)
@Slf4j                // Lombok logging
@RequiredArgsConstructor  // Constructor injection
@Cacheable            // Cache read operations
@CacheEvict           // Clear cache on write
```

---

## Cache Configuration

**Cache Name**: `paymentOrders`

**Caching Strategy**:
- ✓ `getPaymentByOrderId()` - Cacheable
- ✓ Write operations - CacheEvict (all entries)

---

## Transaction Boundaries

**Transactional Methods**:
- createPayment() - Creates entities, publishes event
- handleMomoCallback() - Updates entities, publishes event
- refundPayment() - Creates refund, updates payment, publishes event
- queryPaymentStatus() - Updates if status changed

**Read-only Methods**:
- getPaymentByOrderId()
- getPaymentByAppointmentId()
- getPatientPayments()

---

## Dependency Injection

```java
private final PaymentOrderRepository paymentOrderRepository;
private final PaymentTransactionRepository paymentTransactionRepository;
private final RefundTransactionRepository refundTransactionRepository;
private final IMomoPaymentService momoPaymentService;
private final IPaymentEventPublisher eventPublisher;
```

All injected via constructor by Spring.

---

## Error Handling Strategy

### Exception Types

| Exception | When Thrown | HTTP Status |
|-----------|------------|-------------|
| PaymentNotFoundException | Order not found | 404 |
| DuplicatePaymentException | Appointment already has payment | 409 |
| InvalidSignatureException | Callback signature invalid | 400 |
| PaymentException | General payment errors | 500 |

### Logging

| Level | Used For |
|-------|----------|
| INFO | Operations completed (create, update) |
| DEBUG | Method entry, detailed data, generated IDs |
| WARN | Unusual cases (duplicates, missing data) |
| ERROR | Exceptions with full stack traces |

---

## Business Rules Enforced

1. **Payment Amount Validation**
   - Minimum: 1,000 VND
   - Maximum: 999,999.99 VND

2. **Duplicate Prevention**
   - One payment per appointment
   - DuplicatePaymentException thrown if exists

3. **Idempotency**
   - Callback checked against payment status
   - Already-processed callbacks logged but ignored

4. **Refund Validation**
   - Only COMPLETED payments can be refunded
   - Refund amount ≤ original amount
   - Updates status to REFUNDED or PARTIALLY_REFUNDED

5. **Status Transitions**
   ```
   PENDING → COMPLETED or FAILED
   COMPLETED → REFUNDED or PARTIALLY_REFUNDED
   ```

---

## Event Publishing

**Events Published**:

1. **payment.created**
   - When: Payment order created
   - Consumers: Appointment Service, Notification Service

2. **payment.completed**
   - When: Momo callback confirms success (resultCode=0)
   - Consumers: Appointment Service, Notification Service

3. **payment.failed**
   - When: Momo callback indicates failure
   - Consumers: Appointment Service, Notification Service

4. **payment.refunded**
   - When: Refund completed
   - Consumers: Appointment Service, Notification Service

Each event contains full payment context for consumer services.

---

## Integration Points

### Repositories
- **PaymentOrderRepository**: CRUD operations on payment orders
- **PaymentTransactionRepository**: CRUD operations on payment transactions
- **RefundTransactionRepository**: CRUD operations on refund transactions

### External Services
- **IMomoPaymentService**: Momo API integration
  - createPaymentRequest()
  - verifyCallback()
  - queryTransactionStatus()
  - refundPayment()

- **IPaymentEventPublisher**: Kafka event publishing
  - publishPaymentCreated()
  - publishPaymentCompleted()
  - publishPaymentFailed()
  - publishPaymentRefunded()

### Utilities
- **OrderIdGenerator**: Generates unique order IDs
- **SignatureUtil**: HMAC-SHA256 signature verification

---

## DTO Mapping

**Entity → DTO Conversion**:
```java
PaymentOrder → PaymentResponse
    ├─ orderId
    ├─ amount
    ├─ status
    ├─ currency
    └─ expiresAt (optional)

PaymentTransaction → (mapped to PaymentResponse)
    ├─ payUrl
    ├─ deeplink
    ├─ qrCodeUrl
    └─ transactionId

RefundTransaction → RefundResponse
    ├─ refundId
    ├─ status
    └─ amount
```

---

## Code Statistics

| Metric | Value |
|--------|-------|
| Lines of Code (PaymentService) | 700+ |
| Methods (Service) | 7 |
| Repositories Injected | 3 |
| External Services | 2 |
| Error Types Handled | 4 |
| Events Published | 4 |
| Caching Operations | 1 |

---

## Logging Example

```
// Creating payment
[INFO] Creating payment for appointment 123 by patient 456
[DEBUG] Generated order ID: ORDER1704686400000123456

// Callback received
[INFO] Processing Momo callback for order ORDER1704686400000123456
[DEBUG] Verifying Momo callback signature
[INFO] Payment completed for order ORDER1704686400000123456 with transaction ID 789

// Event published
[DEBUG] Published payment.completed event for order ORDER1704686400000123456

// Refund processed
[INFO] Processing refund for order ORDER1704686400000123456
[INFO] Refund REFUND1704686400123 created for order ORDER1704686400000123456
[DEBUG] Published payment.refunded event for order ORDER1704686400000123456
```

---

## Testing Checklist

- [ ] Test payment creation with valid amounts
- [ ] Test payment creation with invalid amounts (too low/high)
- [ ] Test duplicate payment prevention
- [ ] Test successful callback handling (resultCode=0)
- [ ] Test failed callback handling (resultCode≠0)
- [ ] Test callback idempotency
- [ ] Test payment retrieval by orderId
- [ ] Test payment retrieval by appointmentId
- [ ] Test paginated patient payments
- [ ] Test full refund (amount=original)
- [ ] Test partial refund (amount<original)
- [ ] Test invalid refund (payment not COMPLETED)
- [ ] Test status query and sync
- [ ] Test cache hit/miss scenarios
- [ ] Test signature verification failure
- [ ] Test missing order handling

---

## Version Information

| Component | Version |
|-----------|---------|
| Java | 21 |
| Spring Boot | (from parent pom) |
| Maven | 3.11.0 |
| Status | Compiled Successfully |
| Build Time | ~1.6 seconds |

---

## File Locations

### Service Files
- Interface: `/src/main/java/com/clinicbooking/paymentservice/service/IPaymentService.java`
- Implementation: `/src/main/java/com/clinicbooking/paymentservice/service/impl/PaymentService.java`

### Supporting Files
- Repositories: `/src/main/java/com/clinicbooking/paymentservice/repository/`
- Entities: `/src/main/java/com/clinicbooking/paymentservice/entity/`
- DTOs: `/src/main/java/com/clinicbooking/paymentservice/dto/`
- Exceptions: `/src/main/java/com/clinicbooking/paymentservice/exception/`
- Utilities: `/src/main/java/com/clinicbooking/paymentservice/util/`

---

## Next Steps

1. **Implement IMomoPaymentService** - Payment gateway integration
2. **Implement IPaymentEventPublisher** - Kafka event publishing
3. **Complete PaymentController** - REST API endpoints
4. **Complete MomoCallbackController** - Webhook handler
5. **Create Unit Tests** - Service layer tests
6. **Create Integration Tests** - End-to-end flows
7. **Performance Testing** - Load testing with high concurrency
8. **Security Audit** - Review signature verification and data handling

---

**Implementation Status**: Complete ✓
**Compilation Status**: Success ✓
**Ready for Integration**: Yes ✓
