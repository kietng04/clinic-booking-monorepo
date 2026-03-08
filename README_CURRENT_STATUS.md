# Current Status

This monorepo is currently in a working integration state for the main user-facing flows below.

## Working now

- AI chatbot is available from the authenticated dashboard UI.
- AI chatbot supports:
  - RAG answers from the internal knowledge base
  - live doctor lookup
  - session/history persistence through backend session APIs
- Patient/doctor consultation chat is working end-to-end.
- Legacy `/messages` navigation now points to the real consultation flow instead of the old mock surface.
- MoMo sandbox payment flow is wired for local development with ngrok:
  - public IPN callback goes through API Gateway
  - payment creation returns real `test-payment.momo.vn` URLs
  - pending MoMo payments can be resumed from `Lich su thanh toan` using `Tiep tuc thanh toan`
- Appointment records now store payment linkage fields:
  - `paymentOrderId`
  - `paymentStatus`
  - `paymentMethod`
  - `paymentExpiresAt`
  - `paymentCompletedAt`
- Payment receipt download endpoint now exists on the backend.

## Local payment startup

Run:

`bash backend/scripts/start_payment_dev.sh`

This script:

- starts/reuses the frontend on `localhost:3000`
- starts/reuses ngrok for the API Gateway
- writes sandbox MoMo values into `backend/.env`
- rebuilds payment dependencies
- recreates API Gateway after payment-service is healthy

## Current practical path for MoMo testing

The most reliable UI test path right now is:

1. log in as patient
2. open `Lich su thanh toan`
3. click `Tiep tuc thanh toan` on a pending MoMo payment
4. verify redirect to `https://test-payment.momo.vn/...`

## Known follow-up areas

- Keep expanding automated payment coverage beyond the current redirect checks.
- Continue tightening domain consistency between appointment, payment, and reporting surfaces.
- Continue hardening infra/config if the repo moves beyond private learning usage.
