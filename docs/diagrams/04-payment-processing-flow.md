# Payment Processing Flow (MoMo Integration)

## Create Payment Flow

```mermaid
sequenceDiagram
    actor Patient
    participant UI as Frontend
    participant GW as API Gateway
    participant PayCtrl as PaymentController
    participant PaySvc as PaymentService
    participant OrderGen as OrderIdGenerator
    participant MomoSvc as MomoPaymentService
    participant PayRepo as PaymentRepository
    participant TxnRepo as TransactionRepository
    participant EventPub as EventPublisher
    participant Kafka
    participant Momo as MoMo API
    participant DB as PostgreSQL

    Patient->>UI: Click "Pay Now"
    UI->>GW: POST /api/payments<br/>Bearer {JWT}
    Note over UI,GW: {appointmentId, amount, description,<br/>patientName, patientEmail, patientPhone}

    GW->>GW: Extract patientId from JWT
    GW->>PayCtrl: Forward request

    PayCtrl->>PaySvc: createPayment(request, patientId)

    %% Check duplicate
    PaySvc->>PayRepo: existsByAppointmentId(appointmentId)
    PayRepo->>DB: SELECT COUNT(*)<br/>FROM payment_orders<br/>WHERE appointment_id=?
    DB-->>PayRepo: count
    PayRepo-->>PaySvc: boolean

    alt Payment exists
        PaySvc-->>PayCtrl: DuplicatePaymentException
        PayCtrl-->>GW: 409 Conflict
        GW-->>UI: Error: Payment already exists
    end

    %% Validate amount
    PaySvc->>PaySvc: Validate: 1,000 <= amount <= 999,999.99
    alt Invalid amount
        PaySvc-->>PayCtrl: PaymentException
        PayCtrl-->>GW: 400 Bad Request
        GW-->>UI: Error: Invalid amount
    end

    %% Generate order ID
    PaySvc->>OrderGen: generateOrderId()
    OrderGen-->>PaySvc: orderId (e.g., "ORD202601210001")

    %% Create MoMo payment request
    PaySvc->>MomoSvc: createPaymentRequest(request, orderId)

    MomoSvc->>MomoSvc: Generate UUID requestId
    MomoSvc->>MomoSvc: Build signature data:<br/>accessKey+amount+extraData+<br/>ipnUrl+orderId+orderInfo+<br/>partnerCode+redirectUrl+<br/>requestId+requestType

    MomoSvc->>MomoSvc: Generate HMAC-SHA256 signature<br/>using secretKey

    MomoSvc->>Momo: POST /v2/gateway/api/create
    Note over MomoSvc,Momo: {partnerCode, requestId, amount,<br/>orderId, orderInfo, redirectUrl,<br/>ipnUrl, signature, ...}

    Momo-->>MomoSvc: HTTP Response
    Note over Momo,MomoSvc: {resultCode, payUrl, deeplink,<br/>qrCodeUrl, message}

    alt MoMo API error (resultCode != 0)
        MomoSvc-->>PaySvc: MomoException
        PaySvc-->>PayCtrl: 503 Service Unavailable
        PayCtrl-->>GW: Error: MoMo service error
        GW-->>UI: Error: Payment gateway unavailable
    end

    MomoSvc-->>PaySvc: MomoResponse<br/>{payUrl, deeplink, qrCodeUrl}

    %% Create PaymentOrder entity
    PaySvc->>PaySvc: Build PaymentOrder:<br/>- orderId<br/>- appointmentId, patientId, doctorId<br/>- amount, currency="VND"<br/>- status=PENDING<br/>- description<br/>- patientName, patientEmail, patientPhone (denormalized)<br/>- doctorName (denormalized)<br/>- paymentMethod=MOMO_WALLET

    PaySvc->>PayRepo: save(paymentOrder)
    PayRepo->>DB: INSERT INTO payment_orders
    DB-->>PayRepo: PaymentOrder with ID
    PayRepo-->>PaySvc: PaymentOrder

    %% Create PaymentTransaction entity
    PaySvc->>PaySvc: Build PaymentTransaction:<br/>- payUrl, deeplink, qrCodeUrl<br/>- redirectUrl, ipnUrl<br/>- partnerCode, requestId<br/>- amount, orderInfo<br/>- expiresAt (now + 15 minutes)

    PaySvc->>TxnRepo: save(transaction)
    TxnRepo->>DB: INSERT INTO payment_transactions
    DB-->>TxnRepo: Transaction
    TxnRepo-->>PaySvc: Transaction

    %% Publish event
    PaySvc->>EventPub: publishPaymentCreated(PaymentEvent)
    EventPub->>Kafka: Publish "payment.created"

    PaySvc-->>PayCtrl: PaymentResponse<br/>{orderId, payUrl, deeplink,<br/>qrCodeUrl, expiresAt, status=PENDING}
    PayCtrl-->>GW: 201 Created
    GW-->>UI: Payment created
    UI-->>Patient: Show QR code / payment URL

    Patient->>Patient: Scan QR or click URL
    Patient->>Momo: Complete payment in MoMo app
```

## MoMo Callback Webhook Flow

```mermaid
sequenceDiagram
    participant Momo as MoMo Server
    participant CallbackCtrl as MomoCallbackController
    participant MomoSvc as MomoPaymentService
    participant PayRepo as PaymentRepository
    participant TxnRepo as TransactionRepository
    participant EventPub as EventPublisher
    participant Kafka
    participant DB as PostgreSQL

    Momo->>CallbackCtrl: POST /api/payments/momo/callback
    Note over Momo,CallbackCtrl: {partnerCode, orderId, requestId,<br/>amount, orderInfo, orderType,<br/>transId, resultCode, message,<br/>payType, responseTime,<br/>extraData, signature}

    CallbackCtrl->>CallbackCtrl: Validate required fields
    alt Missing orderId or resultCode
        CallbackCtrl-->>Momo: 400 Bad Request
    end

    CallbackCtrl->>MomoSvc: verifyCallback(callback)

    %% Verify signature
    MomoSvc->>MomoSvc: Build callback signature data:<br/>accessKey+amount+extraData+<br/>message+orderId+orderInfo+<br/>orderType+partnerCode+<br/>payType+requestId+<br/>responseTime+resultCode+transId

    MomoSvc->>MomoSvc: Generate HMAC-SHA256<br/>using secretKey

    MomoSvc->>MomoSvc: Compare with callback.signature

    alt Invalid signature
        MomoSvc->>MomoSvc: Log security alert<br/>(IP address, callback data)
        MomoSvc-->>CallbackCtrl: InvalidSignatureException
        CallbackCtrl-->>Momo: 401 Unauthorized
    end

    MomoSvc-->>CallbackCtrl: Signature valid

    %% Find payment with lock (prevent duplicate processing)
    CallbackCtrl->>PayRepo: findByOrderIdWithLock(orderId)
    Note over PayRepo: SELECT ... FOR UPDATE<br/>(Pessimistic lock)
    PayRepo->>DB: SELECT * FROM payment_orders<br/>WHERE order_id=? FOR UPDATE
    DB-->>PayRepo: PaymentOrder
    PayRepo-->>CallbackCtrl: PaymentOrder

    alt Payment not found
        CallbackCtrl-->>Momo: 404 Not Found
    end

    %% Check idempotency
    CallbackCtrl->>CallbackCtrl: Check current status
    alt Status already COMPLETED/FAILED/REFUNDED
        CallbackCtrl-->>Momo: 200 OK<br/>"Already processed"
        Note over CallbackCtrl,Momo: Idempotent response<br/>(MoMo may retry)
    end

    %% Update transaction with callback data
    CallbackCtrl->>TxnRepo: findByPaymentOrderId(paymentOrder.id)
    TxnRepo->>DB: SELECT * FROM payment_transactions
    DB-->>TxnRepo: Transaction
    TxnRepo-->>CallbackCtrl: Transaction

    CallbackCtrl->>CallbackCtrl: Update transaction:<br/>- transId<br/>- resultCode<br/>- message<br/>- payType<br/>- responseTime

    CallbackCtrl->>TxnRepo: save(transaction)
    TxnRepo->>DB: UPDATE payment_transactions
    DB-->>TxnRepo: OK
    TxnRepo-->>CallbackCtrl: OK

    %% Process payment result
    alt resultCode == 0 (Success)
        CallbackCtrl->>CallbackCtrl: Update PaymentOrder:<br/>- status = COMPLETED<br/>- completedAt = now

        CallbackCtrl->>PayRepo: save(paymentOrder)
        PayRepo->>DB: UPDATE payment_orders<br/>SET status='COMPLETED'
        DB-->>PayRepo: OK
        PayRepo-->>CallbackCtrl: OK

        CallbackCtrl->>EventPub: publishPaymentCompleted(PaymentEvent)
        EventPub->>Kafka: Publish "payment.completed"
        Note over EventPub,Kafka: Event: {orderId, appointmentId,<br/>amount, status=COMPLETED}

    else resultCode != 0 (Failed)
        CallbackCtrl->>CallbackCtrl: Update PaymentOrder:<br/>- status = FAILED

        CallbackCtrl->>PayRepo: save(paymentOrder)
        PayRepo->>DB: UPDATE payment_orders<br/>SET status='FAILED'
        DB-->>PayRepo: OK
        PayRepo-->>CallbackCtrl: OK

        CallbackCtrl->>EventPub: publishPaymentFailed(PaymentEvent)
        EventPub->>Kafka: Publish "payment.failed"
        Note over EventPub,Kafka: Event: {orderId, errorMessage}
    end

    CallbackCtrl-->>Momo: 200 OK<br/>"OK"
    Note over Momo: MoMo marks callback as delivered
```

## Query Payment Status Flow

```mermaid
sequenceDiagram
    actor Patient
    participant UI as Frontend
    participant GW as API Gateway
    participant PayCtrl as PaymentController
    participant PaySvc as PaymentService
    participant MomoSvc as MomoPaymentService
    participant PayRepo as PaymentRepository
    participant EventPub as EventPublisher
    participant Kafka
    participant Momo as MoMo API
    participant DB as PostgreSQL

    Patient->>UI: Check payment status
    UI->>GW: GET /api/payments/{orderId}/status<br/>Bearer {JWT}

    GW->>GW: Extract patientId from JWT
    GW->>PayCtrl: Forward request

    PayCtrl->>PaySvc: getPaymentByOrderId(orderId)
    PaySvc->>PayRepo: findByOrderId(orderId)
    PayRepo->>DB: SELECT * FROM payment_orders
    DB-->>PayRepo: PaymentOrder
    PayRepo-->>PaySvc: PaymentOrder

    PaySvc-->>PayCtrl: PaymentResponse

    %% Check ownership
    PayCtrl->>PayCtrl: Verify patientId matches
    alt Not owner
        PayCtrl-->>GW: 403 Forbidden
        GW-->>UI: Access denied
    end

    PayCtrl->>PaySvc: queryPaymentStatus(orderId)

    PaySvc->>PayRepo: Get transaction by orderId
    PayRepo->>DB: SELECT * FROM payment_transactions
    DB-->>PayRepo: Transaction
    PayRepo-->>PaySvc: Transaction (with requestId)

    PaySvc->>MomoSvc: queryTransactionStatus(orderId, requestId)

    MomoSvc->>MomoSvc: Generate new query requestId (UUID)
    MomoSvc->>MomoSvc: Build signature:<br/>accessKey+orderId+partnerCode+<br/>requestId+requestType="queryTransactionStatus"

    MomoSvc->>MomoSvc: HMAC-SHA256 signature

    MomoSvc->>Momo: POST /v2/gateway/api/query
    Note over MomoSvc,Momo: {partnerCode, orderId, requestId,<br/>signature, lang="vi"}

    Momo-->>MomoSvc: HTTP Response
    Note over Momo,MomoSvc: {resultCode, transId, amount,<br/>message, responseTime}

    alt MoMo API error
        MomoSvc-->>PaySvc: MomoException
        PaySvc-->>PayCtrl: Current cached status
    end

    MomoSvc-->>PaySvc: MomoQueryResponse

    %% Update if status changed
    alt resultCode == 0 AND local status != COMPLETED
        PaySvc->>PaySvc: Update PaymentOrder:<br/>- status = COMPLETED<br/>- completedAt = now

        PaySvc->>PayRepo: save(paymentOrder)
        PayRepo->>DB: UPDATE payment_orders
        DB-->>PayRepo: OK
        PayRepo-->>PaySvc: OK

        PaySvc->>EventPub: publishPaymentCompleted(PaymentEvent)
        EventPub->>Kafka: Publish "payment.completed"
    end

    PaySvc-->>PayCtrl: Updated PaymentResponse
    PayCtrl-->>GW: 200 OK
    GW-->>UI: Payment status
    UI-->>Patient: Show current status
```

## Refund Payment Flow

```mermaid
sequenceDiagram
    actor Admin/Patient
    participant UI as Frontend
    participant GW as API Gateway
    participant PayCtrl as PaymentController
    participant PaySvc as PaymentService
    participant MomoSvc as MomoPaymentService
    participant PayRepo as PaymentRepository
    participant RefundRepo as RefundRepository
    participant EventPub as EventPublisher
    participant Kafka
    participant Momo as MoMo API
    participant DB as PostgreSQL

    Admin/Patient->>UI: Request refund
    UI->>GW: POST /api/payments/refund<br/>Bearer {JWT}
    Note over UI,GW: {orderId, amount, reason}

    GW->>PayCtrl: Forward request
    PayCtrl->>PaySvc: refundPayment(request)

    %% Validate payment status
    PaySvc->>PayRepo: findByOrderId(orderId)
    PayRepo->>DB: SELECT * FROM payment_orders
    DB-->>PayRepo: PaymentOrder
    PayRepo-->>PaySvc: PaymentOrder

    alt Status not COMPLETED or PARTIALLY_REFUNDED
        PaySvc-->>PayCtrl: PaymentException
        PayCtrl-->>GW: 400 Bad Request
        GW-->>UI: Error: Cannot refund<br/>non-completed payment
    end

    %% Calculate refundable amount
    PaySvc->>RefundRepo: findByPaymentOrderIdAndStatus(id, COMPLETED)
    RefundRepo->>DB: SELECT SUM(amount)<br/>FROM refund_transactions<br/>WHERE payment_order_id=?<br/>AND status='COMPLETED'
    DB-->>RefundRepo: totalRefunded
    RefundRepo-->>PaySvc: totalRefunded

    PaySvc->>PaySvc: remainingAmount =<br/>originalAmount - totalRefunded

    alt refundAmount > remainingAmount
        PaySvc-->>PayCtrl: PaymentException
        PayCtrl-->>GW: 400 Bad Request
        GW-->>UI: Error: Refund amount exceeds remaining
    end

    %% Get transaction transId
    PaySvc->>PayRepo: Get PaymentTransaction
    PaySvc->>PaySvc: Verify transId exists

    alt No transId
        PaySvc-->>PayCtrl: PaymentException
        PayCtrl-->>GW: 400 Bad Request
        GW-->>UI: Error: Missing transaction ID
    end

    %% Call MoMo refund API
    PaySvc->>MomoSvc: refundPayment(orderId, transId, amount, reason)

    MomoSvc->>MomoSvc: Generate refund requestId (UUID)
    MomoSvc->>MomoSvc: Build signature:<br/>accessKey+amount+extraData+<br/>orderId+partnerCode+<br/>requestId+requestType+transId

    MomoSvc->>MomoSvc: HMAC-SHA256 signature

    MomoSvc->>Momo: POST /v2/gateway/api/refund
    Note over MomoSvc,Momo: {partnerCode, orderId, requestId,<br/>transId, amount, description,<br/>signature, lang="vi"}

    Momo-->>MomoSvc: HTTP Response
    Note over Momo,MomoSvc: {resultCode, refundTransId,<br/>message, responseTime}

    alt MoMo refund failed (resultCode != 0)
        MomoSvc-->>PaySvc: MomoException
        PaySvc->>PaySvc: Create RefundTransaction:<br/>- status = FAILED<br/>- errorMessage = MoMo message

        PaySvc->>RefundRepo: save(refundTransaction)
        RefundRepo->>DB: INSERT INTO refund_transactions
        DB-->>RefundRepo: OK
        RefundRepo-->>PaySvc: OK

        PaySvc-->>PayCtrl: MomoException
        PayCtrl-->>GW: 503 Service Unavailable
        GW-->>UI: Error: Refund failed
    end

    MomoSvc-->>PaySvc: MomoRefundResponse<br/>{refundTransId, message}

    %% Create refund transaction
    PaySvc->>PaySvc: Create RefundTransaction:<br/>- refundId (UUID)<br/>- transId (MoMo refundTransId)<br/>- amount<br/>- reason<br/>- status = COMPLETED<br/>- resultCode = 0

    PaySvc->>RefundRepo: save(refundTransaction)
    RefundRepo->>DB: INSERT INTO refund_transactions
    DB-->>RefundRepo: RefundTransaction
    RefundRepo-->>PaySvc: RefundTransaction

    %% Update payment status
    PaySvc->>PaySvc: Calculate new remaining:<br/>remaining = remainingAmount - refundAmount

    alt remaining == 0 (Full refund)
        PaySvc->>PaySvc: PaymentOrder.status = REFUNDED
    else remaining > 0 (Partial refund)
        PaySvc->>PaySvc: PaymentOrder.status = PARTIALLY_REFUNDED
    end

    PaySvc->>PayRepo: save(paymentOrder)
    PayRepo->>DB: UPDATE payment_orders
    DB-->>PayRepo: OK
    PayRepo-->>PaySvc: OK

    %% Publish event
    PaySvc->>EventPub: publishPaymentRefunded(PaymentEvent)
    EventPub->>Kafka: Publish "payment.refunded"<br/>or "payment.partially_refunded"

    PaySvc-->>PayCtrl: RefundResponse<br/>{refundId, status, amount}
    PayCtrl-->>GW: 200 OK
    GW-->>UI: Refund successful
    UI-->>Admin/Patient: Show refund confirmation
```

## Payment Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING: Create payment

    PENDING --> COMPLETED: MoMo callback (success)
    PENDING --> FAILED: MoMo callback (failed)
    PENDING --> EXPIRED: 15 min timeout / Cancel

    COMPLETED --> PARTIALLY_REFUNDED: Partial refund
    COMPLETED --> REFUNDED: Full refund

    PARTIALLY_REFUNDED --> REFUNDED: Remaining refund

    FAILED --> [*]
    EXPIRED --> [*]
    REFUNDED --> [*]

    note right of PENDING
        Initial state
        Waiting for customer payment
        Expires in 15 minutes
    end note

    note right of COMPLETED
        Payment successful
        Money received
    end note

    note right of PARTIALLY_REFUNDED
        Part of amount refunded
        Can refund remaining
    end note

    note right of REFUNDED
        Full amount refunded
        Final state
    end note
```

## Security: Signature Verification

```mermaid
flowchart TD
    Start([Receive MoMo Callback]) --> Extract[Extract callback data]
    Extract --> Build[Build signature string:<br/>accessKey + amount + extraData +<br/>message + orderId + orderInfo +<br/>orderType + partnerCode + payType +<br/>requestId + responseTime +<br/>resultCode + transId]

    Build --> Hash[Generate HMAC-SHA256<br/>using secretKey]
    Hash --> Compare{Signature<br/>matches?}

    Compare -->|No| LogAlert[Log security alert:<br/>- IP address<br/>- Callback data<br/>- Expected signature]
    LogAlert --> Reject([Return 401 Unauthorized])

    Compare -->|Yes| Lock[Acquire pessimistic lock:<br/>SELECT ... FOR UPDATE]
    Lock --> CheckIdem{Already<br/>processed?}

    CheckIdem -->|Yes| Return200([Return 200 OK<br/>Idempotent])
    CheckIdem -->|No| Process[Process payment<br/>Update status]
    Process --> Release[Release lock]
    Release --> Return200

    style Start fill:#e1f5ff
    style Return200 fill:#c8e6c9
    style Reject fill:#ffcdd2
    style LogAlert fill:#ffecb3
```

## Error Handling Summary

| Error | HTTP Status | Message |
|-------|-------------|---------|
| Duplicate payment | 409 Conflict | Payment already exists for appointment |
| Invalid amount | 400 Bad Request | Amount must be between 1,000 and 999,999.99 |
| MoMo API error | 503 Service Unavailable | Payment gateway unavailable |
| Invalid signature | 401 Unauthorized | Invalid callback signature |
| Payment not found | 404 Not Found | Order ID not found |
| Cannot refund | 400 Bad Request | Cannot refund non-completed payment |
| Refund exceeds | 400 Bad Request | Refund amount exceeds remaining balance |
| Missing transId | 400 Bad Request | Missing transaction ID for refund |

## Caching Strategy

- **Cache Key**: `paymentOrders::{orderId}`
- **TTL**: 10 minutes
- **Eviction**: On all state changes (callback, query, refund, cancel)
- **Lock**: Pessimistic lock on callback processing to prevent race conditions
