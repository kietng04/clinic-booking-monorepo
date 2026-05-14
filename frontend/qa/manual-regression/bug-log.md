# Bug Log

Create one section per bug. Keep newest bugs at the top.

Last reviewed at 2026-03-18T13:55:34Z: closed `SC-X-027`, `SC-X-028`, `SC-X-029`, `SC-X-030`, `SC-X-031`, and `SC-X-032` without creating a new bug entry. There are now no `Not started` rows remaining in the catalog.

### BUG-034 - Admin reports weekly grouping and PDF export are broken
- Status: Open
- Severity: High
- Area: Admin / Reports
- Test Case IDs: SC-ADM-031, SC-ADM-033
- Found At (UTC): 2026-03-17T15:53:07Z
- Environment: local frontend + local backend
- Preconditions: logged in as `admin@clinic.com`; opened `http://127.0.0.1:3000/admin/reports`
- Steps To Reproduce:
  1. Sign in as `admin@clinic.com / password`.
  2. Open `http://127.0.0.1:3000/admin/reports`.
  3. Change the grouping control from `Tháng` to `Tuần`.
  4. Click `Xuất PDF`.
- Expected:
  - Weekly charts should refresh correctly, and the PDF export should generate a download or fail with clear controlled feedback.
- Actual:
  - Switching to weekly grouping triggers `500 Internal Server Error` responses on all three report datasets and surfaces an unexpected-error banner.
  - Clicking `Xuất PDF` does not trigger any download event; the export endpoint returns `503 Service Unavailable`.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-031-grouping-blocked.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-033-export-failed.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-reports-medium-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-reports-medium-console.log`
- Network / Console Notes:
  - Saved network traffic shows `GET /api/reports/appointments?dateRange=6months&groupBy=week => 500`, `GET /api/reports/revenue?dateRange=6months&groupBy=week => 500`, and `GET /api/reports/patients?dateRange=6months&groupBy=week => 500`.
  - The export action then calls `GET /api/reports/export/pdf?dateRange=6months&groupBy=week => 503`.
  - Playwright did not observe any download event after clicking `Xuất PDF`.
- Related Coverage Rows:
  - SC-ADM-031 -> Failed
  - SC-ADM-033 -> Failed

### BUG-033 - Invalid admin profile phone input returns `500` instead of validation feedback
- Status: Open
- Severity: Medium
- Area: Admin / Profile
- Test Case IDs: SC-ADM-036
- Found At (UTC): 2026-03-17T15:53:07Z
- Environment: local frontend + local backend
- Preconditions: logged in as `admin@clinic.com`; opened `http://127.0.0.1:3000/profile`
- Steps To Reproduce:
  1. Sign in as `admin@clinic.com / password`.
  2. Open `http://127.0.0.1:3000/profile`.
  3. Replace the phone number with an invalid value such as `12`.
  4. Click `Lưu thay đổi`.
- Expected:
  - The form should block the submit with validation feedback or return a controlled field-level/profile-level error without a backend `500`.
- Actual:
  - `PUT /api/profile` returns `500 Internal Server Error`, and the UI shows the generic message `An unexpected error occurred. Please contact support.`
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-profile-invalid-phone-500.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-profile-invalid-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-profile-invalid-console.log`
- Network / Console Notes:
  - Saved network traffic shows `PUT /api/profile => 500 Internal Server Error` after the invalid phone submission.
  - Saved console output captures the matching failed resource error for `http://localhost:8080/api/profile`.
- Related Coverage Rows:
  - SC-ADM-036 -> Failed

### BUG-032 - Admin room edit accepts invalid capacity and saves successfully
- Status: Open
- Severity: High
- Area: Admin / Rooms
- Test Case IDs: SC-ADM-027
- Found At (UTC): 2026-03-17T15:53:07Z
- Environment: local frontend + local backend
- Preconditions: logged in as `admin@clinic.com`; opened `http://127.0.0.1:3000/admin/rooms`; opened a room edit modal
- Steps To Reproduce:
  1. Sign in as `admin@clinic.com / password`.
  2. Open `http://127.0.0.1:3000/admin/rooms`.
  3. Open any room edit modal.
  4. Set `Sức chứa (người)` to `0`.
  5. Click `Cập nhật`.
- Expected:
  - The form should reject the invalid capacity with validation feedback or a controlled error, and it should not persist the change.
- Actual:
  - The submit succeeds with `PUT /api/rooms/2 => 200 OK` and the success toast `Đã cập nhật phòng`, indicating the invalid value was accepted instead of blocked.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-026-room-edit-modal.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-room-invalid-save-succeeded.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-room-invalid-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-room-invalid-console.log`
- Network / Console Notes:
  - Saved network traffic shows successful writes during the room edit pass, including the invalid submit `PUT /api/rooms/2 => 200 OK`.
  - No protective client-side validation or controlled error was emitted to the console.
- Related Coverage Rows:
  - SC-ADM-027 -> Failed

### BUG-031 - Admin reports date-range changes trigger `503` failures for all report datasets
- Status: Open
- Severity: High
- Area: Admin / Reports
- Test Case IDs: SC-ADM-030
- Found At (UTC): 2026-03-17T15:41:14Z
- Environment: local frontend + local backend
- Preconditions: logged in as `admin@clinic.com`; opened `http://127.0.0.1:3000/admin/reports`
- Steps To Reproduce:
  1. Sign in as `admin@clinic.com / password`.
  2. Open `http://127.0.0.1:3000/admin/reports`.
  3. Leave the default `6 tháng qua` range loaded, then change the date range to `30 ngày qua`.
- Expected:
  - The report queries should succeed for the selected range and the charts/cards should refresh with backend-backed data or a controlled no-data response.
- Actual:
  - The UI refreshes, but every report dataset request fails with `503 Service Unavailable`, and the page falls back to the banner `The service is temporarily unavailable. Please try again later.` plus empty report cards.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-028-reports.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-029-report-tabs.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/bug-adm-reports-date-range-503.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/bug-adm-reports-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/bug-adm-reports-console.log`
- Network / Console Notes:
  - Saved network traffic shows `GET /api/reports/appointments?dateRange=6months&groupBy=month => 503`, `GET /api/reports/revenue?dateRange=6months&groupBy=month => 503`, and `GET /api/reports/patients?dateRange=6months&groupBy=month => 503`.
  - After switching to `30 ngày qua`, the same three endpoints still fail: `GET /api/reports/appointments?dateRange=30days&groupBy=month => 503`, `GET /api/reports/revenue?dateRange=30days&groupBy=month => 503`, and `GET /api/reports/patients?dateRange=30days&groupBy=month => 503`.
  - Saved console output captures matching failed resource errors for all three report endpoints.
- Related Coverage Rows:
  - SC-ADM-030 -> Failed

### BUG-030 - Admin doctor search crashes the management page with `undefined.toLowerCase()`
- Status: Open
- Severity: High
- Area: Admin / Doctor Management
- Test Case IDs: SC-ADM-011
- Found At (UTC): 2026-03-17T15:31:42Z
- Environment: local frontend + local backend
- Preconditions: logged in as `admin@clinic.com`; opened `http://127.0.0.1:3000/doctors`
- Steps To Reproduce:
  1. Sign in as `admin@clinic.com / password`.
  2. Open `http://127.0.0.1:3000/doctors`.
  3. Type `Sarah` into the doctor search box.
- Expected:
  - The doctor list should filter by name without crashing the page.
- Actual:
  - The page crashes to a blank white screen and the console records `TypeError: Cannot read properties of undefined (reading 'toLowerCase')` from `DoctorManagement.jsx`.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/sc-adm-010-doctors.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/bug-adm-doctor-search-crash.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/bug-adm-doctor-search-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/sc-adm-doctors-network.log`
- Network / Console Notes:
  - Saved network traffic only shows successful doctor list loads (`GET /api/users/role/DOCTOR?page=0&size=20 => 200 OK`), indicating this regression is client-side rather than a backend query failure.
  - Saved console output points to `src/pages/admin/DoctorManagement.jsx:67` inside `filterDoctors`.
- Related Coverage Rows:
  - SC-ADM-011 -> Failed

### BUG-029 - Admin valid user edit returns `503` and an error toast instead of saving cleanly
- Status: Open
- Severity: High
- Area: Admin / Users
- Test Case IDs: SC-ADM-006
- Found At (UTC): 2026-03-17T15:31:42Z
- Environment: local frontend + local backend
- Preconditions: logged in as `admin@clinic.com`; opened `http://127.0.0.1:3000/users`; filtered the list with `admin@clinic.com`; opened the edit modal for the admin record
- Steps To Reproduce:
  1. Sign in as `admin@clinic.com / password`.
  2. Open `http://127.0.0.1:3000/users`.
  3. Search for `admin@clinic.com`.
  4. Click `Sửa`, change the full name to a valid value such as `Admin System QA`, and click `Lưu`.
- Expected:
  - The valid edit should save successfully, close the modal, and show success feedback.
- Actual:
  - `PUT /api/users/225` returns `503 Service Unavailable`, and the UI shows the toast `Không thể lưu người dùng` instead of a successful save path.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/sc-adm-005-user-edit-modal.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/bug-adm-user-save-503.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/bug-adm-user-save-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/bug-adm-user-save-console.log`
- Network / Console Notes:
  - Saved network log shows the failing write call `PUT /api/users/225 => 503 Service Unavailable`.
  - Saved console log captures the matching failed resource error for `http://localhost:8080/api/users/225`.
- Related Coverage Rows:
  - SC-ADM-006 -> Failed

### BUG-028 - Doctor invalid consultation routes fall back to the queue after duplicate 403/404 errors and WebSocket subscriptions instead of a clear denied/not-found state
- Status: Open
- Severity: Medium
- Area: Doctor / Consultations
- Test Case IDs: SC-DOC-029, SC-DOC-030
- Found At (UTC): 2026-03-17T15:19:42Z
- Environment: local frontend + local backend
- Preconditions: logged in as `dr.sarah@clinic.com`
- Steps To Reproduce:
  1. Sign in as `dr.sarah@clinic.com / password`.
  2. Open `http://127.0.0.1:3000/doctor/consultations/800` or `http://127.0.0.1:3000/doctor/consultations/999999`.
  3. Wait for the route to settle.
- Expected:
  - The app should show a clear access-denied or not-found state without duplicate retries or invalid realtime subscriptions.
- Actual:
  - The route falls back to `/consultations` only after duplicate `403`/`404` traffic, repeated `Failed to load consultation` errors, and WebSocket/STOMP subscription activity for the invalid consultation ID.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-invalid-route.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-unauthorized-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-unauthorized-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-invalid-route-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-invalid-route-console.log`
- Network / Console Notes:
  - Unauthorized access to consultation `800` produced duplicate `GET /api/consultations/800 => 403 Forbidden` and `GET /api/messages/consultation/800 => 403 Forbidden` requests before the route fell back.
  - Nonexistent consultation `999999` produced duplicate `GET /api/consultations/999999 => 404 Not Found` and `GET /api/messages/consultation/999999 => 404 Not Found` requests before the route fell back.
  - Saved console logs show repeated `Failed to load consultation` messages while STOMP/WebSocket activity still attempted to subscribe to the invalid consultation IDs.
- Related Coverage Rows:
  - SC-DOC-029 -> Failed
  - SC-DOC-030 -> Failed

### BUG-027 - Floating chatbot widget blocks mouse clicks on the doctor consultation send button
- Status: Open
- Severity: Medium
- Area: Doctor / Consultations / Messaging
- Test Case IDs: SC-DOC-027
- Found At (UTC): 2026-03-17T15:08:57Z
- Environment: local frontend + local backend
- Preconditions: logged in as `dr.sarah@clinic.com`; opened active consultation `http://127.0.0.1:3000/doctor/consultations/801`
- Steps To Reproduce:
  1. Sign in as `dr.sarah@clinic.com / password`.
  2. Open `http://127.0.0.1:3000/doctor/consultations/801`.
  3. Type a message into the doctor chat input.
  4. Try to click the send button with the mouse.
- Expected:
  - The doctor should be able to click the send button and post the message normally.
- Actual:
  - The floating chatbot widget overlaps the send button and intercepts pointer events, so mouse-click submission times out. Pressing Enter still posts the message successfully.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-026-consultation-detail.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-turn22-network.log`
- Network / Console Notes:
  - The saved network log shows the keyboard fallback path succeeding with `POST /api/messages => 201 Created`.
  - The Playwright click attempt failed because the floating chatbot `Open chatbot` button intercepted pointer events over the send button.
- Related Coverage Rows:
  - SC-DOC-027 -> Failed

### BUG-026 - Doctor medical-record entry route redirects back to appointments without opening the form or explaining the missing context
- Status: Open
- Severity: Medium
- Area: Doctor / Create Medical Record
- Test Case IDs: SC-DOC-015, SC-DOC-017
- Found At (UTC): 2026-03-17T15:08:57Z
- Environment: local frontend + local backend
- Preconditions: logged in as `dr.sarah@clinic.com`; doctor appointments list is empty
- Steps To Reproduce:
  1. Sign in as `dr.sarah@clinic.com / password`.
  2. Navigate directly to `http://127.0.0.1:3000/doctor/create-medical-record`.
  3. Wait for the route to settle.
- Expected:
  - The app should either open the record-creation form or present a clear explanation that a valid appointment context is required before creating a medical record.
- Actual:
  - The route bounces back to `/doctor/appointments` and only shows the generic empty appointments state, leaving no stable route-level explanation or actionable next step for the missing context.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-015-create-record-redirected.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-turn22-network-final.log`
- Network / Console Notes:
  - The saved network log for the redirected state only shows doctor appointment search traffic (`GET /api/appointments/search?...doctorId=224 => 200 OK`); no medical-record form retrieval or context-specific explanation is surfaced.
- Related Coverage Rows:
  - SC-DOC-015 -> Failed
  - SC-DOC-017 -> Failed

### BUG-025 - Floating chatbot widget blocks mouse clicks on the patient consultation send button
- Status: Open
- Severity: Medium
- Area: Patient / Consultations / Messaging
- Test Case IDs: SC-PAT-069
- Found At (UTC): 2026-03-17T14:42:14Z
- Environment: local frontend + local backend
- Preconditions: consultation `801` was accepted from the doctor side; logged in again as `patient1@clinic.com`; opened `http://127.0.0.1:3000/patient/consultations/801`
- Steps To Reproduce:
  1. Sign in as `dr.sarah@clinic.com / password` and accept consultation `801`.
  2. Sign back in as `patient1@clinic.com / password`.
  3. Open `http://127.0.0.1:3000/patient/consultations/801`.
  4. Type a message into the patient chat input.
  5. Try to click the send button with the mouse.
- Expected:
  - The send button should remain clickable and submit the message normally.
- Actual:
  - The floating chatbot widget overlaps the send button and intercepts pointer events, so mouse-click submission fails. The message can only be sent with the Enter key workaround.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/bug-pat-chatbot-overlaps-send-button.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-069-doctor-accepted-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-069-messaging-network.log`
- Network / Console Notes:
  - The doctor-side unblock worked with `PUT /api/consultations/801/accept => 200 OK`.
  - The patient-side fallback sent the message with `POST /api/messages => 201 Created`, confirming the workflow only succeeds via keyboard while the button remains obstructed.
- Related Coverage Rows:
  - SC-PAT-069 -> Failed

### BUG-024 - Nonexistent consultation routes trigger duplicate 404 traffic and WebSocket subscriptions instead of a graceful not-found state
- Status: Open
- Severity: Medium
- Area: Patient / Consultations
- Test Case IDs: SC-PAT-073
- Found At (UTC): 2026-03-17T14:23:24Z
- Environment: local frontend + local backend
- Preconditions: logged in as `patient1@clinic.com`; opened `http://127.0.0.1:3000/patient/consultations/999999`
- Steps To Reproduce:
  1. Sign in as `patient1@clinic.com / password`.
  2. Navigate directly to `http://127.0.0.1:3000/patient/consultations/999999`.
  3. Wait for the route to settle.
- Expected:
  - The app should show a clear not-found state or route-level fallback without repeated background errors.
- Actual:
  - The app falls back to the generic toast `Không thể tải dữ liệu tư vấn`, but only after issuing duplicate `404 Not Found` requests for both the consultation and its messages and opening WebSocket handshake/subscription attempts for the nonexistent consultation ID.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-consultation-invalid-route.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-consultation-invalid-route-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-consultation-invalid-route-console.log`
- Network / Console Notes:
  - Saved network log shows duplicate `GET /api/consultations/999999 => 404 Not Found` and `GET /api/messages/consultation/999999 => 404 Not Found` requests plus `GET /ws/info => 200 OK`.
  - Saved console log records repeated `Failed to load consultation` errors and `Subscribed to consultation 999999` despite the missing entity.
- Related Coverage Rows:
  - SC-PAT-073 -> Failed

### BUG-023 - Invalid patient profile phone submission returns 500 instead of validation or a controlled rejection
- Status: Open
- Severity: Medium
- Area: Patient / Profile
- Test Case IDs: SC-PAT-077
- Found At (UTC): 2026-03-17T14:23:24Z
- Environment: local frontend + local backend
- Preconditions: logged in as `patient1@clinic.com`; opened `http://127.0.0.1:3000/profile`
- Steps To Reproduce:
  1. Sign in as `patient1@clinic.com / password`.
  2. Navigate to `http://127.0.0.1:3000/profile`.
  3. Replace the phone number with invalid text such as `abc`.
  4. Click `Lưu thay đổi`.
- Expected:
  - The form should block submission with inline validation or return a controlled validation-style response that explains how to fix the field.
- Actual:
  - `PUT /api/profile` returns `500 Internal Server Error`, and the UI only surfaces the generic message `An unexpected error occurred. Please contact support.`
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-profile-invalid-phone.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-profile-invalid-phone-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-profile-invalid-phone-console.log`
- Network / Console Notes:
  - Saved network log shows the good-control path `PUT /api/profile => 200 OK` for a valid save, followed by the invalid-phone attempt `PUT /api/profile => 500 Internal Server Error`.
  - Saved console log captures the matching failed resource entry for `http://localhost:8080/api/profile`.
- Related Coverage Rows:
  - SC-PAT-077 -> Failed

### BUG-022 - Patient appointment reschedule fails with 500 after selecting a valid new slot
- Status: Open
- Severity: High
- Area: Patient / Appointments
- Test Case IDs: SC-PAT-030
- Found At (UTC): 2026-03-17T14:11:23Z
- Environment: local frontend + local backend
- Preconditions: logged in as `patient1@clinic.com`; opened `http://127.0.0.1:3000/appointments/1801`; appointment status was `Chờ xác nhận`
- Steps To Reproduce:
  1. Sign in as `patient1@clinic.com / password`.
  2. Open `http://127.0.0.1:3000/appointments/1801`.
  3. Click `Đổi lịch`.
  4. Choose a valid-looking replacement slot such as `Th 5 19/3` at `10:00`.
  5. Enter an optional reason and click `Xác nhận đổi lịch`.
- Expected:
  - The appointment should reschedule successfully or return a handled validation-style error if the chosen slot is not allowed.
- Actual:
  - The frontend posts to `POST /api/appointments/1801/reschedule`, receives `500 Internal Server Error`, and shows the toast `Request failed with status code 500`.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/bug-pat-reschedule-500.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/bug-pat-reschedule-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/bug-pat-reschedule-console.log`
- Network / Console Notes:
  - Saved network log shows `POST /api/appointments/1801/reschedule => 500 Internal Server Error`.
  - Saved console log captures the matching failed resource entry for `http://localhost:8080/api/appointments/1801/reschedule`.
- Related Coverage Rows:
  - SC-PAT-030 -> Failed

### BUG-021 - Booking confirmation creates the appointment but payment handoff fails with 503
- Status: Open
- Severity: High
- Area: Patient / Booking / Payments
- Test Case IDs: SC-PAT-020
- Found At (UTC): 2026-03-17T13:59:39Z
- Environment: local frontend + local backend
- Preconditions: logged in as `patient1@clinic.com`; opened `http://127.0.0.1:3000/appointments/book`; selected `BS. Tran Thu Binh`, a valid date/time, clinic, service, room, and booking reason
- Steps To Reproduce:
  1. Sign in as `patient1@clinic.com / password`.
  2. Navigate to `http://127.0.0.1:3000/appointments/book`.
  3. Complete a valid booking flow and reach the final confirmation step.
  4. Click `Xác nhận & Thanh toán`.
- Expected:
  - The app should hand off into the payment flow or redirect to the external gateway after creating the appointment.
- Actual:
  - The appointment is created successfully, but `POST /api/payments` returns `503 Service Unavailable` and the UI remains on the confirmation step without a payment redirect.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/bug-pat-payment-handoff-503.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/bug-pat-payment-handoff-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/bug-pat-payment-handoff-console.log`
- Network / Console Notes:
  - Saved network log shows `POST /api/appointments => 201 Created` immediately followed by `POST /api/payments => 503 Service Unavailable`.
  - Saved console log captures the matching `Failed to load resource` error for `http://localhost:8080/api/payments`.
- Related Coverage Rows:
  - SC-PAT-020 -> Failed

### BUG-020 - Patient doctor-search submit leaves results unfiltered for both name and specialty queries
- Status: Open
- Severity: High
- Area: Patient / Doctor Search
- Test Case IDs: SC-PAT-009, SC-PAT-010
- Found At (UTC): 2026-03-17T13:59:39Z
- Environment: local frontend + local backend
- Preconditions: logged in as `patient1@clinic.com`; opened `http://127.0.0.1:3000/find-doctors`
- Steps To Reproduce:
  1. Sign in as `patient1@clinic.com / password`.
  2. Navigate to `http://127.0.0.1:3000/find-doctors`.
  3. Enter `Sarah` in the search box and click `Tìm kiếm`.
  4. Repeat with specialty text such as `Tim mạch`.
- Expected:
  - The page should narrow to matching doctor cards and update the result count.
- Actual:
  - The page remains at `Tìm thấy 31 bác sĩ`; unrelated cards stay visible for both the name and specialty queries.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-009-search-sarah-not-filtered.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-010-search-specialty-not-filtered.png`
- Network / Console Notes:
  - The regression reproduced without a route crash; the visible UI state simply failed to narrow the result set after submit.
- Related Coverage Rows:
  - SC-PAT-009 -> Failed
  - SC-PAT-010 -> Failed

### BUG-019 - Patient sidebar no longer exposes a doctor-search entry
- Status: Open
- Severity: Medium
- Area: Patient / Navigation
- Test Case IDs: SC-PAT-005
- Found At (UTC): 2026-03-17T13:59:39Z
- Environment: local frontend + local backend
- Preconditions: logged in as `patient1@clinic.com`
- Steps To Reproduce:
  1. Sign in as `patient1@clinic.com / password`.
  2. Open any authenticated patient route that renders the sidebar, for example `http://127.0.0.1:3000/dashboard` or `http://127.0.0.1:3000/find-doctors`.
  3. Inspect the patient sidebar links.
- Expected:
  - The patient navigation should expose a doctor-search entry for `/find-doctors`.
- Actual:
  - The sidebar includes `Đặt lịch khám`, `Lịch hẹn`, `Hồ sơ bệnh án`, `Lịch sử thanh toán`, `Chỉ số sức khỏe`, `Thông báo`, `Tin nhắn`, `Gia đình`, and `Tài khoản`, but no `/find-doctors` link is rendered.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-005-sidebar-missing-find-doctors.md`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-009-search-sarah-not-filtered.png`
- Network / Console Notes:
  - The saved accessibility snapshot for `/find-doctors` shows the patient sidebar items and confirms there is no `/find-doctors` entry even while the route itself is reachable directly.
- Related Coverage Rows:
  - SC-PAT-005 -> Failed

### BUG-018 - Admin user edit accepts invalid phone submission until backend returns 500
- Status: Open
- Severity: Medium
- Area: Admin / User Management
- Test Case IDs: SC-ADM-009
- Found At (UTC): 2026-03-16T16:01:30Z
- Environment: local frontend + local backend
- Preconditions: logged in as `admin@clinic.com`; opened `http://127.0.0.1:3000/users`; opened edit modal for `Dr. Sarah Johnson`
- Steps To Reproduce:
  1. Sign in as `admin@clinic.com / password`.
  2. Navigate to `http://127.0.0.1:3000/users`.
  3. Click `Sửa` on `Dr. Sarah Johnson`.
  4. Clear the phone field and click `Lưu`.
- Expected:
  - The modal should block the invalid submission with validation or return a handled 4xx-style validation response.
- Actual:
  - The frontend sends `PUT /api/users/224`, the backend returns `500 Internal Server Error`, and the UI only shows the generic toast `Không thể lưu người dùng`.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/bug-018-admin-user-edit-invalid-phone-500.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/bug-018-admin-user-edit-invalid-phone-500-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/playwright-console.log`
- Network / Console Notes:
  - Saved network log shows the invalid edit path as `PUT /api/users/224 => 500 Internal Server Error`.
  - The same session could recover on retry with the original phone value, so the defect is specifically invalid-input handling on the admin edit endpoint.
- Related Coverage Rows:
  - SC-ADM-009 -> Passed

### BUG-017 - Doctor profile save CTA is inert on invalid phone edits
- Status: Open
- Severity: Medium
- Area: Doctor / Profile
- Test Case IDs: SC-DOC-021
- Found At (UTC): 2026-03-16T15:46:08Z
- Environment: local frontend + local backend
- Preconditions: logged in as fallback doctor `doctor.1@healthflow.vn`; opened `http://127.0.0.1:3000/profile`
- Steps To Reproduce:
  1. Sign in as `doctor.1@healthflow.vn / password`.
  2. Navigate to `http://127.0.0.1:3000/profile`.
  3. Replace the phone field value with `abc`.
  4. Click `Lưu thay đổi`.
- Expected:
  - The form should block submission with field validation or send an update request that returns a handled validation error.
- Actual:
  - The page stays unchanged with no visible validation, no success/error feedback, and no `PUT /api/profile` request; only the initial profile/notification GETs appear in the saved network log.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-021-profile-invalid-phone.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-021-profile-invalid-phone-snapshot.md`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-021-profile-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-021-profile-console.log`
- Network / Console Notes:
  - Saved network log shows `GET /api/profile => 200` plus notification GETs only; no profile update request was fired after clicking save.
- Related Coverage Rows:
  - SC-DOC-021 -> Failed

### BUG-016 - Doctor patient-list detail action is inert
- Status: Open
- Severity: Medium
- Area: Doctor / Patients
- Test Case IDs: SC-DOC-013
- Found At (UTC): 2026-03-16T15:43:58Z
- Environment: local frontend + local backend
- Preconditions: logged in as fallback doctor `doctor.1@healthflow.vn`; opened `http://127.0.0.1:3000/patients`
- Steps To Reproduce:
  1. Sign in as `doctor.1@healthflow.vn / password`.
  2. Navigate to `http://127.0.0.1:3000/patients`.
  3. Click any visible `Xem hồ sơ` action, for example on patient `Le Nam Phuc`.
- Expected:
  - The patient detail affordance should open a modal or detail view and load the current doctor's visit history consistently.
- Actual:
  - Clicking `Xem hồ sơ` does nothing: the route remains `/patients`, no modal opens, and no follow-up detail/history request is fired.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-013-patient-detail-inert.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-013-post-click-snapshot.md`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-013-patient-detail-network.log`
- Network / Console Notes:
  - The saved post-click network log contains no patient-detail or appointment-history fetch after the click.
- Related Coverage Rows:
  - SC-DOC-013 -> Failed

### BUG-015 - Doctor schedule save action is inert and skips validation
- Status: Open
- Severity: Medium
- Area: Doctor / Schedule
- Test Case IDs: SC-DOC-009, SC-DOC-010
- Found At (UTC): 2026-03-16T15:41:13Z
- Environment: local frontend + local backend
- Preconditions: logged in as fallback doctor `doctor.1@healthflow.vn`; opened `http://127.0.0.1:3000/schedule`
- Steps To Reproduce:
  1. Sign in as `doctor.1@healthflow.vn / password`.
  2. Navigate to `http://127.0.0.1:3000/schedule`.
  3. Edit a working-day row to an invalid combination, for example start `18:30` and end `17:00`.
  4. Click `Lưu lịch làm việc`.
- Expected:
  - The UI should show validation or submit a save request that returns a handled error; a valid save should then be reload-persistent.
- Actual:
  - No validation appears, no toast appears, and no save request is fired at all; the edited values remain in the form, which also blocks any meaningful persistence check.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-009-invalid-schedule-values-retained.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-schedule-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-schedule-console.log`
- Network / Console Notes:
  - Saved network log shows only initial GETs such as `GET /api/schedules/doctor/181 => 200`; no POST/PUT schedule save request was emitted after the click.
- Related Coverage Rows:
  - SC-DOC-009 -> Failed
  - SC-DOC-010 -> Blocked

### BUG-014 - Doctor appointments page shows no seeded appointments or status actions
- Status: Open
- Severity: High
- Area: Doctor / Appointments
- Test Case IDs: SC-DOC-004, SC-DOC-006
- Found At (UTC): 2026-03-16T15:39:20Z
- Environment: local frontend + local backend
- Preconditions: logged in as fallback doctor `doctor.1@healthflow.vn`; opened `http://127.0.0.1:3000/doctor/appointments`
- Steps To Reproduce:
  1. Sign in as `doctor.1@healthflow.vn / password`.
  2. Navigate to `http://127.0.0.1:3000/doctor/appointments`.
  3. Check the `Hôm nay` and `Sắp tới` tabs.
  4. Compare against `http://127.0.0.1:3000/patients` in the same session.
- Expected:
  - When seeded appointment-linked patients exist for the doctor, `/doctor/appointments` should render consistent appointment cards and expose status controls where applicable.
- Actual:
  - `/doctor/appointments` stays on `Không có lịch hẹn nào`, while `/patients` in the same session shows many patients with `Tổng lịch hẹn: 1` and one with `Tổng lịch hẹn: 2`, leaving no doctor status controls reachable from the appointments route.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-004-appointments-empty.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-004-patients-with-history.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-004-appointments-network.log`
- Network / Console Notes:
  - The doctor appointments screen rendered without any appointment cards or actionable rows during the session; the patient list proves linked history exists elsewhere in the doctor experience.
- Related Coverage Rows:
  - SC-DOC-004 -> Failed
  - SC-DOC-006 -> Blocked

### BUG-013 - Patient payment history is unavailable because `/api/payments/my-payments` returns 503
- Status: Open
- Severity: Medium
- Area: Patient / Payments
- Test Case IDs: SC-PAT-035, SC-PAT-037, SC-PAT-038, SC-PAT-041, SC-PAT-042
- Found At (UTC): 2026-03-16T15:25:42Z
- Environment: local frontend + local backend
- Preconditions: signed in as `patient1@clinic.com` or fallback patient `patient.1@healthflow.vn`; opened `http://127.0.0.1:3000/payments`
- Steps To Reproduce:
  1. Open `http://127.0.0.1:3000/login` and sign in as either seeded patient account.
  2. Navigate to `http://127.0.0.1:3000/payments`.
  3. Wait for the history list to load.
- Expected:
  - Payment history should load real rows or an accurate empty state based on backend data so search, filtering, and linked appointment follow-ups can be exercised.
- Actual:
  - `GET /api/payments/my-payments?page=0&size=20` returns `503 Service Unavailable`, the page shows the generic support toast, and the history area falls back to `Không có giao dịch nào`, blocking the downstream search/filter/cross-link scenarios.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-payment-history-service-unavailable.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/playwright-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/playwright-console.log`
- Network / Console Notes:
  - Saved network log shows repeated `[GET] http://localhost:8080/api/payments/my-payments?page=0&size=20 => [503] Service Unavailable`.
  - Saved console log records the matching failed resource loads at lines 41 and 58.
- Related Coverage Rows:
  - SC-PAT-035 -> Failed
  - SC-PAT-037 -> Blocked
  - SC-PAT-038 -> Blocked
  - SC-PAT-041 -> Blocked
  - SC-PAT-042 -> Failed

### BUG-012 - Appointment detail quick actions are inert on a pending patient appointment
- Status: Open
- Severity: Medium
- Area: Patient / Appointment Detail
- Test Case IDs: SC-PAT-033
- Found At (UTC): 2026-03-16T15:31:07Z
- Environment: local frontend + local backend
- Preconditions: logged in as fallback patient `patient.1@healthflow.vn`; opened `http://127.0.0.1:3000/appointments/1100`
- Steps To Reproduce:
  1. Sign in as `patient.1@healthflow.vn / password`.
  2. Open pending appointment detail `http://127.0.0.1:3000/appointments/1100`.
  3. Click the visible quick actions such as `Đổi lịch`, `Hủy lịch`, or `Xem hóa đơn`.
- Expected:
  - The clicked action should open its modal or navigate to the target route.
- Actual:
  - The buttons remain inert: no modal opens, the route stays on `/appointments/1100`, and no follow-up network request is fired beyond the initial detail fetch.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-033-appointment-detail-quick-actions-inert.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-033-post-click-snapshot.md`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-033-network.log`
- Network / Console Notes:
  - The saved post-click network log contains only the initial `GET /api/appointments/1100` and notification calls; no cancel/reschedule/payment-follow-up request was triggered by the user clicks.
- Related Coverage Rows:
  - SC-PAT-033 -> Failed

### BUG-011 - Booking wizard loses selected slot when navigating back from details step
- Status: Open
- Severity: Medium
- Area: Patient / Booking
- Test Case IDs: SC-PAT-023
- Found At (UTC): 2026-03-16T15:16:29Z
- Environment: local frontend + local backend
- Preconditions: logged in as `patient1@clinic.com`; opened `http://127.0.0.1:3000/appointments/book`
- Steps To Reproduce:
  1. Select `BS. Tran Thu Binh`.
  2. Select `Tue 17` and time slot `08:30`.
  3. On step 3, fill required clinic/service/room selections and type any reason, for example `QA preserve booking state`.
  4. Click `Quay lại`.
- Expected:
  - Returning to the previous step preserves the chosen date and time so the patient can continue editing without reselecting the slot.
- Actual:
  - The wizard returns to step 2 with no selected slot highlighted, so the patient must reselect date/time before moving forward again.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/sc-pat-023-booking-back-loses-selected-slot.png`
- Network / Console Notes:
  - No new API failure was needed to trigger the regression; the state loss happened entirely in client-side step navigation.
- Related Coverage Rows:
  - SC-PAT-023 -> Failed

### BUG-010 - Doctor search clear action leaves the page stuck in empty state
- Status: Open
- Severity: Medium
- Area: Patient / Doctor Search
- Test Case IDs: SC-PAT-011
- Found At (UTC): 2026-03-16T15:14:00Z
- Environment: local frontend + local backend
- Preconditions: logged in as `patient1@clinic.com`; opened `http://127.0.0.1:3000/find-doctors`
- Steps To Reproduce:
  1. Search `/find-doctors` with a no-match keyword such as `zzzz-no-match`.
  2. Wait for the empty state `Không tìm thấy bác sĩ`.
  3. Click `Xóa bộ lọc`.
- Expected:
  - Clearing the filter immediately restores the unfiltered doctor list.
- Actual:
  - The search box clears, but the page stays on the empty-state card until the patient clicks `Tìm kiếm` manually.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/sc-pat-011-clear-filter-stuck-empty-state.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/sc-pat-014-doctor-search-no-match.png`
- Network / Console Notes:
  - The regression reproduced without any backend error; it is a broken recovery action on the patient search UI.
- Related Coverage Rows:
  - SC-PAT-011 -> Failed

### BUG-009 - Verify-phone resend action fails with 500 and no visible feedback
- Status: Open
- Severity: Medium
- Area: Auth / Verification
- Test Case IDs: SC-AUTH-025
- Found At (UTC): 2026-03-16T15:03:31Z
- Environment: local frontend + local backend
- Preconditions: logged out and opened `http://127.0.0.1:3000/verify-phone` directly
- Steps To Reproduce:
  1. Open `http://127.0.0.1:3000/verify-phone`.
  2. Click `Gửi lại mã`.
- Expected:
  - The resend action either sends a new OTP successfully or tells the user clearly that prerequisite phone context is missing.
- Actual:
  - The frontend sends `POST /api/auth/send-sms-verification`, the backend returns `500 Internal Server Error`, and the verification screen stays unchanged with no inline or toast feedback.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-025-resend-otp-failure.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-025-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-025-console.log`
- Network / Console Notes:
  - Saved network log reproduces `[POST] http://localhost:8080/api/auth/send-sms-verification => [500] Internal Server Error`.
  - The saved console log shows only the failed resource load and no compensating user-facing message path.
- Related Coverage Rows:
  - SC-AUTH-025 -> Failed

### BUG-008 - Register form failures do not surface visible feedback
- Status: Open
- Severity: Medium
- Area: Auth / Registration
- Test Case IDs: SC-AUTH-015, SC-AUTH-016
- Found At (UTC): 2026-03-16T15:01:16Z
- Environment: local frontend + local backend
- Preconditions: logged out on `http://127.0.0.1:3000/register`
- Steps To Reproduce:
  1. Fill the required register fields and submit with mismatched passwords, or submit with duplicate seeded email `patient1@clinic.com`.
  2. Click `Create Account`.
- Expected:
  - The form shows visible, actionable validation or duplicate-account feedback so the user knows how to fix the submission.
- Actual:
  - On the mismatched-password path, the form stays on `/register` with no visible inline or toast error.
  - On the duplicate-email path, `POST /api/auth/register` returns `409 Conflict`, but the form still shows no visible error state.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-015-register-mismatch.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-016-register-duplicate-email.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/playwright-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/playwright-console.log`
- Network / Console Notes:
  - The saved network log shows `[POST] http://localhost:8080/api/auth/register => [409] Conflict` for the duplicate-email submission.
  - The mismatched-password path stayed on the form with no visible error text and no compensating network request.
- Related Coverage Rows:
  - SC-AUTH-015 -> Failed
  - SC-AUTH-016 -> Failed

### BUG-007 - Doctor profile invalid phone submission returns 500 with only generic feedback
- Status: Open
- Severity: Medium
- Area: Doctor / Profile
- Test Case IDs: X-003, X-004, SC-X-002
- Found At (UTC): 2026-03-16T13:19:52Z
- Environment: local frontend + local backend
- Preconditions: logged in as `dr.sarah@clinic.com`; opened `http://127.0.0.1:3000/profile`
- Steps To Reproduce:
  1. Open `http://127.0.0.1:3000/login` and quick-login as doctor.
  2. Open `http://127.0.0.1:3000/profile`.
  3. Replace the phone field value with `abc`.
  4. Click `Lưu thay đổi`.
- Expected:
  - The profile form blocks the submission with field-level validation or returns a handled 4xx-style validation error that tells the doctor how to fix the phone input.
- Actual:
  - The frontend sends the update request, `PUT /api/profile` returns `500 Internal Server Error`, and the UI only shows the generic message `An unexpected error occurred. Please contact support.`
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/x-003-doctor-profile-invalid-phone.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-x-002-doctor-invalid-phone.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/playwright-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/playwright-network.log`
- Network / Console Notes:
  - The failure reproduced twice in the same turn: `PUT /api/profile => 500` at lines 32 and 37 of the saved network log.
  - Restoring the seeded phone value `0909999002` immediately afterward returned `PUT /api/profile => 200`, so the issue is tied to invalid input handling rather than a broken profile endpoint.
  - Reproduced again on 2026-03-18 while executing `SC-X-002`; the doctor profile still showed only the generic support error after an invalid phone submit.
- Related Coverage Rows:
  - X-003 -> Failed
  - X-004 -> Failed
  - SC-X-002 -> Failed

### BUG-006 - Authenticated sidebar logs duplicate-key React warnings across routes
- Status: Open
- Severity: Low
- Area: Cross-cutting / Navigation
- Test Case IDs: X-004, SC-X-025
- Found At (UTC): 2026-03-16T13:02:59Z
- Environment: local frontend + local backend
- Preconditions: logged in on an authenticated patient or doctor session
- Steps To Reproduce:
  1. Sign in as a patient or doctor.
  2. Open authenticated routes that render the dashboard sidebar, such as `/dashboard`, `/consultations`, `/patient/consultations`, or `/doctor/create-medical-record`.
  3. Observe the browser console during navigation.
- Expected:
  - Authenticated navigation renders without React key warnings.
- Actual:
  - The console repeatedly logs `Warning: Encountered two children with the same key` for sidebar route entries such as `/consultations` and `/patient/consultations`.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T125227Z/playwright-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130020Z/playwright-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-019-020-025-console.log`
- Network / Console Notes:
  - The warning is reproducible across both patient and doctor sessions, so it is broader than a single feature page.
  - Current doctor-side evidence logs the warning against `/consultations` while rendering analytics/profile/create-record flows.
  - This turn reproduced the same warning again on patient routes including `/dashboard`, `/patient/consultations/new`, and `/patient/consultations/427`.
- Related Coverage Rows:
  - X-004 -> Failed
  - SC-X-025 -> Failed

### BUG-005 - Admin doctor search crashes DoctorManagement page
- Status: Open
- Severity: High
- Area: Admin / Doctor Management
- Test Case IDs: ADM-003, X-004
- Found At (UTC): 2026-03-16T12:46:46Z
- Environment: local frontend + local backend
- Preconditions: logged in as `admin@clinic.com`; opened `http://127.0.0.1:3000/doctors`
- Steps To Reproduce:
  1. Open `http://127.0.0.1:3000/doctors`.
  2. Wait for the doctor cards to load.
  3. Type `Sarah` into `Tìm theo tên hoặc chuyên khoa...`.
- Expected:
  - The list filters to matching doctors without crashing the page.
- Actual:
  - The route crashes to a blank page and React logs `TypeError: Cannot read properties of undefined (reading 'toLowerCase')`.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-003-doctors-search-crash.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-003-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-003-network.log`
- Network / Console Notes:
  - `GET /api/users/role/DOCTOR?page=0&size=20 => 200`, so the page has data before the crash.
  - Console points to `src/pages/admin/DoctorManagement.jsx:67` inside `filterDoctors`.
- Related Coverage Rows:
  - ADM-003 -> Failed
  - X-004 -> Failed

### BUG-004 - Admin user edit save intermittently fails with 503
- Status: Open
- Severity: Medium
- Area: Admin / User Management
- Test Case IDs: ADM-002, X-004
- Found At (UTC): 2026-03-16T12:46:46Z
- Environment: local frontend + local backend
- Preconditions: logged in as `admin@clinic.com`; opened `http://127.0.0.1:3000/users`
- Steps To Reproduce:
  1. Open `http://127.0.0.1:3000/users`.
  2. Search for `Sarah` and open the `Sửa` modal for `Dr. Sarah Johnson`.
  3. Click `Lưu` without changing the seeded values.
- Expected:
  - The user update completes successfully or performs a harmless no-op save.
- Actual:
  - The first save attempt in this turn showed toast `Không thể lưu người dùng`, and Playwright reported `503 Service Unavailable` for the update request. An immediate retry later in the same session succeeded, so the regression appears intermittent.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-002-user-save-error.png`
- Network / Console Notes:
  - The failing attempt surfaced `Failed to load resource: the server responded with a status of 503 (Service Unavailable)` for `http://localhost:8080/api/users/224`.
  - A later retry against the same seeded record returned success toast `Đã cập nhật người dùng`.
- Related Coverage Rows:
  - ADM-002 -> Failed
  - X-004 -> Failed

### BUG-003 - Consultation detail throws STOMP connection exception during realtime setup
- Status: Open
- Severity: Medium
- Area: Consultation / Cross-cutting
- Test Case IDs: PAT-011, SC-PAT-070, SC-DOC-028, X-004, SC-X-019, SC-X-021
- Found At (UTC): 2026-03-16T12:30:22Z
- Environment: local frontend + local backend
- Preconditions: logged in as a consultation participant and opened a consultation detail page after creating or accepting a request
- Steps To Reproduce:
  1. As a patient, open `http://127.0.0.1:3000/patient/consultations`, create a consultation request, and open the resulting detail page.
  2. Or as a doctor, open `http://127.0.0.1:3000/consultations`, accept a pending request, and open the consultation detail page.
  3. Wait for the consultation detail view to initialize its realtime connection.
- Expected:
  - Consultation detail initializes its realtime subscription without JS exceptions or websocket lifecycle warnings.
- Actual:
  - The detail page renders and core chat actions can still work, but the console logs STOMP warnings about missing auto reconnect and an exception: `There is no underlying STOMP connection` before the subscription recovers.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T122210Z/pat-011-consultation-detail.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T122210Z/playwright-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T123327Z/doc-005-consultation-detail.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T123327Z/playwright-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T123327Z/playwright-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-021-patient-consultation-stomp-warning.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-021-022-patient-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-021-022-patient-network.log`
- Network / Console Notes:
  - Patient detail for consultation `801` and doctor detail for consultation `802` both reproduced the same STOMP lifecycle warnings.
  - For doctor consultation `802`, `PUT /api/consultations/802/accept => 200`, `GET /api/consultations/802 => 200`, `GET /api/messages/consultation/802 => 200`, `GET /ws/info => 200`, `POST /api/messages => 201`, and `PUT /api/messages/consultation/802/read => 204`, so the failure is in the frontend websocket/STOMP lifecycle rather than a missing backend endpoint.
  - Console recorded `Stomp.over did not receive a factory, auto reconnect will not work` and `Ignoring an exception thrown by a frame handler ... There is no underlying STOMP connection`.
  - This turn reproduced the same startup warnings and frame-handler exception again on patient consultation `427`, even though live message delivery still worked once the page settled.
- Related Coverage Rows:
  - PAT-011 -> Failed
  - SC-PAT-070 -> Failed
  - SC-DOC-028 -> Failed
  - X-004 -> Failed
  - SC-X-019 -> Failed
  - SC-X-021 -> Failed

### BUG-002 - Patient dashboard hits repeated 500 stats error on initial load
- Status: Open
- Severity: Medium
- Area: Patient / Cross-cutting
- Test Case IDs: PAT-001, SC-PAT-003, X-004, SC-X-020
- Found At (UTC): 2026-03-16T12:17:25Z
- Environment: local frontend + local backend
- Preconditions: deterministic seed prepared; logged in as `patient1@clinic.com`
- Steps To Reproduce:
  1. Open `http://127.0.0.1:3000/login`.
  2. Sign in with `patient1@clinic.com / password`.
  3. Wait for the patient dashboard at `/dashboard` to finish loading.
- Expected:
  - Patient dashboard loads without failing API requests or unexpected console errors.
- Actual:
  - The dashboard renders, but repeated stats requests fail and the browser console logs React warnings during page load.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T120816Z/auth-001-patient-dashboard.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-020-patient-dashboard-aggregate-500.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-019-020-025-network.log`
- Network / Console Notes:
  - `GET http://localhost:8080/api/statistics/aggregate/patient/223 => 500 Internal Server Error` twice during the same dashboard load.
  - The dashboard load still includes the stats `500`, while the broader duplicate-key warning is now tracked separately in `BUG-006`.
  - A second seeded patient session (`patient.52@healthflow.vn`) also reproduced the same aggregate stats failure pattern this turn via `GET /api/statistics/aggregate/patient/52 => 500`.
- Related Coverage Rows:
  - PAT-001 -> Failed
  - SC-PAT-003 -> Failed
  - X-004 -> Failed
  - SC-X-020 -> Failed

### BUG-001 - Login failures return no visible user-facing error
- Status: Open
- Severity: Medium
- Area: Auth
- Test Case IDs: AUTH-004, SC-AUTH-009, SC-AUTH-011
- Found At (UTC): 2026-03-16T12:17:25Z
- Environment: local frontend + local backend
- Preconditions: logged out on `/login`
- Steps To Reproduce:
  1. Open `http://127.0.0.1:3000/login`.
  2. Enter invalid credentials such as `invalid-user@clinic.com / wrong-password`, or enter a malformed identifier such as `not-an-email / password`.
  3. Submit the login form.
- Expected:
  - The page stays unauthenticated and shows a visible inline or toast error explaining that the credentials are invalid.
- Actual:
  - The page stays on `/login`, but no visible validation or server error message appears after the failed login attempt.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T120816Z/auth-004-invalid-login.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-009-invalid-login.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-invalid-login-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-011-login-malformed-email.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-011-network.log`
- Network / Console Notes:
  - `POST http://localhost:8080/api/auth/login => 401 Unauthorized` during the invalid login attempt.
  - `POST http://localhost:8080/api/auth/login => 401 Unauthorized` also reproduced for `patient1@clinic.com / wrongpass` on 2026-03-17 with the same missing user-facing feedback.
  - `POST http://localhost:8080/api/auth/login => 400 Bad Request` during malformed identifier submission `not-an-email`, with the same missing user-facing feedback.
- Related Coverage Rows:
  - AUTH-004 -> Failed
  - SC-AUTH-009 -> Failed
  - SC-AUTH-011 -> Failed

## Bug Template

### BUG-XXX - Short title
- Status: Open
- Severity: Critical | High | Medium | Low
- Area: Auth / Patient / Doctor / Admin / Cross-cutting
- Test Case IDs: AUTH-001
- Found At (UTC): 2026-03-16T00:00:00Z
- Environment: local frontend + local backend
- Preconditions: logged in as patient
- Steps To Reproduce:
  1. Step one
  2. Step two
  3. Step three
- Expected:
  - Expected result
- Actual:
  - Actual result
- Evidence:
  - `/absolute/path/to/screenshot-or-trace`
  - `/absolute/path/to/video-or-log`
- Network / Console Notes:
  - Optional API error or console stack
- Related Coverage Rows:
  - AUTH-001 -> Failed
