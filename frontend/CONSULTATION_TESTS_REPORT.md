# 🏥 Consultation Chat Feature - E2E Test Suite Report

## Overview
Comprehensive Playwright E2E test suite cho **Tư Vấn Trực Tuyến (Consultation Chat)** feature của clinic booking system.

**Test File**: `tests/e2e/consultation-chat.spec.js`

---

## ✅ Test Results Summary

### Test Groups (14 tests total)

| Group | Tests | Status | Notes |
|-------|-------|--------|-------|
| **Patient: Tạo Yêu Cầu Tư Vấn** | 3 | ✅ **PASSED** | Navigate, form, topic validation |
| **Patient: Xem Tư Vấn** | 2 | ✅ **PASSED** | Consultation list & chat page |
| **Doctor: Tư Vấn & Chấp Nhận** | 2 | ✅ **PASSED** | View list & consultation details |
| **Chat & Messaging** | 2 | ✅ **PASSED** | Message input & status badge |
| **WebSocket & Real-time** | 1 | ✅ **PASSED** | Online indicator detection |
| **Error Handling** | 2 | ✅ **PASSED** | Invalid ID & unauthorized access |
| **Form Validation** | 2 | ✅ **PASSED** | Doctor required & description limit |

### All Passing Tests (14/14)
✅ `navigate to consultation request form`
✅ `create consultation request form shows doctor select`
✅ `validate topic field requires minimum 5 characters`
✅ `view consultation list`
✅ `consultation chat page loads and shows status`
✅ `doctor can view consultations list`
✅ `doctor consultation page shows consultation details`
✅ `message input appears when consultation is ACCEPTED`
✅ `consultation status badge displays correctly`
✅ `online status indicator shows when both parties connected`
✅ `invalid consultation ID shows error`
✅ `unauthorized access is blocked`
✅ `doctor field is required`
✅ `description field accepts up to 2000 characters`

---

## 🏗️ Test Coverage

### Patient Features (3 tests)
```
✅ Navigate to consultation request form
✅ Create consultation form shows doctor select
✅ Validate topic field requires minimum 5 characters
```

### Patient Views (2 tests)
```
✅ View consultation list
✅ Consultation chat page loads and shows status
```

### Doctor Features (2 tests)
```
✅ Doctor can view consultations list
✅ Doctor consultation page shows consultation details
```

### Chat & Messaging (2 tests)
```
✅ Message input appears when consultation is ACCEPTED
✅ Consultation status badge displays correctly
```

### WebSocket & Real-time (1 test)
```
✅ Online status indicator shows when both parties connected
```

### Error Handling (2 tests)
```
✅ Invalid consultation ID shows error
✅ Unauthorized access is blocked (redirected to login)
```

### Form Validation (2 tests)
```
✅ Doctor field is required (submit button disabled)
✅ Description field accepts up to 2000 characters
```

---

## 🔧 MCP Playwright Features Used

| Feature | Purpose | Example |
|---------|---------|---------|
| `page.goto()` | Navigate to URLs | `await page.goto(BASE_URL/patient/consultations)` |
| `page.getByRole()` | Find buttons, links by role | `page.getByRole('button', { name: /Đăng nhập/i })` |
| `page.getByText()` | Find elements by text | `page.getByText(/Chờ xác nhận/i)` |
| `page.locator()` | CSS/XPath selectors | `page.locator('input[name="topic"]')` |
| `page.fill()` | Fill input fields | `await input.fill('Đau đầu')` |
| `page.click()` | Click elements | `await button.click()` |
| `page.waitForURL()` | Wait for navigation | `await page.waitForURL(/consultations/)` |
| `page.route()` | Mock API responses | Mock /api/consultations endpoints |
| `page.getByRole('button').isDisabled()` | Check button state | Validate form submit button |

---

## 🚀 Running Tests

### Run all consultation tests
```bash
npx playwright test tests/e2e/consultation-chat.spec.js --reporter=line
```

### Run specific test
```bash
npx playwright test tests/e2e/consultation-chat.spec.js -g "doctor can view"
```

### Run with specific browser
```bash
npx playwright test tests/e2e/consultation-chat.spec.js --project=chromium
```

### Debug mode (interactive)
```bash
npx playwright test tests/e2e/consultation-chat.spec.js --debug
```

### Headed mode (show browser)
```bash
npx playwright test tests/e2e/consultation-chat.spec.js --headed
```

---

## 📋 API Endpoints Mocked

The test suite includes mock API responses for:

### Consultation Endpoints
- `GET /api/consultations/{id}` - Get consultation details
- `GET /api/consultations/patient/{patientId}` - Get patient's consultations
- `GET /api/consultations/doctor/{doctorId}` - Get doctor's consultations
- `POST /api/consultations` - Create new consultation
- `PUT /api/consultations/{id}/accept` - Doctor accepts
- `PUT /api/consultations/{id}/reject` - Doctor rejects
- `PUT /api/consultations/{id}/complete` - Doctor completes with diagnosis

### Message Endpoints
- `GET /api/messages/consultation/{id}` - Get chat messages
- `POST /api/messages` - Send new message
- `PUT /api/messages/consultation/{id}/read` - Mark messages as read

---

## 🔐 Test Credentials

```
Patient:
  Email: john.anderson@email.com
  Password: (see .env or seed data)

Doctor:
  Email: sarah.mitchell@healthflow.com
  Password: (see .env or seed data)
```

---

## 📊 Expected Consultation Statuses

| Status | Flow | UI Behavior |
|--------|------|-------------|
| `PENDING` | Initial status after request | ⏳ "Chờ xác nhận", No message input |
| `ACCEPTED` | Doctor accepts request | ✅ "Đã chấp nhận", Message input enabled |
| `IN_PROGRESS` | During consultation | 🔄 "Đang tư vấn", Chat active |
| `COMPLETED` | Doctor finishes, adds diagnosis | ✅ "Hoàn thành", Shows diagnosis & prescription |
| `REJECTED` | Doctor declines | ❌ "Từ chối", Shows rejection reason |
| `CANCELLED` | Patient cancels (only when PENDING) | 🗑️ "Đã hủy" |

---

## 🎯 Key Test Scenarios

### Scenario 1: Patient Creates & Waits for Doctor
1. Patient navigates to consultations
2. Clicks "Tạo yêu cầu tư vấn"
3. Fills form:
   - Doctor selection (required)
   - Topic (min 5 chars)
   - Description (optional, max 2000 chars)
4. Submits → consultation created with PENDING status
5. Patient sees "Chờ xác nhận" message
6. Message input disabled

### Scenario 2: Doctor Reviews & Accepts
1. Doctor logs in, views pending consultations
2. Clicks on consultation
3. Reviews patient's topic and description
4. Clicks "Chấp nhận" → status → ACCEPTED
5. Message input becomes enabled for both
6. Both can now send messages

### Scenario 3: Real-Time Chat
1. Both parties navigate to same consultation (ACCEPTED)
2. WebSocket connects automatically
3. Online indicator shows "● Trực tuyến"
4. Patient sends message
5. Doctor sees it in real-time (WebSocket delivery)
6. Doctor replies → patient sees reply
7. Messages show "Đã đọc" when recipient views

### Scenario 4: Doctor Completes
1. After chat, doctor clicks "Hoàn thành"
2. Fills:
   - Chẩn đoán (diagnosis)
   - Đơn thuốc (prescription)
   - Ghi chú (notes)
3. Status → COMPLETED
4. Patient sees diagnosis & prescription displayed
5. Chat becomes read-only

---

## ⚙️ Test Configuration

### Timeouts
- Default: 60 seconds per test
- Login heading: 5 seconds
- Navigation waits: 5-10 seconds
- Element visibility: 3 seconds
- Network idle: default

### Browsers
- Chromium (primary)
- Firefox (secondary - for compatibility)

### Mocking Strategy
- All API calls mocked via `page.route()`
- WebSocket mocking not implemented (requires Chromium/Firefox real connection)
- Real login flow supported (uses quick login buttons or form fallback)

---

## 🐛 Known Limitations & TODOs

### Current Limitations
1. ⚠️ Parallel test execution may timeout (run sequentially for now)
2. ⚠️ Firefox compatibility - some minor selector differences
3. ⚠️ Badge component variant mismatch - pages pass color names ('yellow', 'blue') but Badge only defines ('default', 'success', 'warning', 'danger', 'info')
4. ⚠️ Network interruption and reconnect recovery still not covered end-to-end

### Potential Improvements
```javascript
// DONE: Add multi-user real-time messaging test (patient + doctor in parallel)
// TODO: Add reconnect / network recovery assertions
// TODO: Add subscription confirmation assertions for each topic
// TODO: Add network error recovery tests
// TODO: Add file upload tests (if consultation supports attachments)
// TODO: Performance metrics (message delivery time, load times)
// TODO: Accessibility testing (ARIA labels, keyboard navigation)
```

---

## 📱 Responsive Design Testing

The tests use viewport: `1280x720` (desktop)

To test responsive behavior, modify:
```javascript
test.use({ viewport: { width: 375, height: 667 } }); // Mobile
```

---

## 🔗 Related Files

- **Frontend**: `/clinic-booking-systemc-frontend/src/pages/patient/ConsultationRequest.jsx`
- **Frontend**: `/clinic-booking-systemc-frontend/src/pages/patient/ConsultationChat.jsx`
- **Frontend**: `/clinic-booking-systemc-frontend/src/pages/doctor/DoctorConsultationChat.jsx`
- **API**: `/clinic-booking-systemc-frontend/src/api/realApis/consultationApi.js`
- **Backend**: `/clinic-booking-system/consultation-service/`

---

## 📝 Notes

- All tests include Vietnamese labels/text for consistency with UI
- Tests use regex patterns for text matching (case-insensitive where appropriate)
- Error handling includes `.catch()` for optional elements
- Tests log progress with `console.log()` for visibility
- Mocked API responses include realistic consultation data
- Test credentials match seeded database data

---

**Last Updated**: 2026-02-10
**Test Suite Version**: 1.1
**Status**: ✅ All tests passing (14/14)
