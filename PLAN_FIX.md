# PLAN_FIX.md — Kế hoạch sửa repo KLTN và hoàn thiện trước khi nộp

> Repo: `clinic-booking-monorepo`  
> Ngày scan: 2026-04-26  
> Mục tiêu: đưa codebase, test evidence và báo cáo về trạng thái đủ sạch để demo/nộp, giảm rủi ro bị hỏi vào lỗi kỹ thuật hoặc thiếu minh chứng.

---

## 0. Trạng thái triển khai — 2026-04-26 19:04 ICT

### 0.1. Đã hoàn thành trong lượt implement

- Backend test suite đã được đưa về trạng thái xanh toàn bộ.
- Frontend lint blocker đã được xử lý bằng ESLint config phù hợp repo hiện tại.
- Frontend/backend API contract quick wins đã được vá:
  - Thêm backend `POST /api/appointments/{id}/reschedule`.
  - Thêm backend `POST /api/appointments/{id}/check-in`.
  - Thêm backend `GET /api/appointments/{id}/calendar.ics`.
  - Sửa frontend room lookup sang `GET /api/rooms/clinic/{clinicId}`.
  - Sửa frontend health metric history sang `GET /api/health-metrics/patient/{patientId}/range`.
  - Sửa frontend report export sang route backend hiện có `GET /api/reports/export/pdf`.
- Các test stale đã được cập nhật mock/expectation để khớp implementation hiện tại.
- Testcontainers Postgres test đã được cấu hình `disabledWithoutDocker = true` để không fail máy không mở Docker.

### 0.2. Validation sau implement

| Hạng mục | Lệnh | Kết quả |
|---|---|---|
| Backend full tests | `./mvnw -q test` | PASS |
| Frontend lint | `npm run lint` | PASS |
| Frontend unit tests | `npm test -- --run` | PASS: 21 files, 66 tests |
| Frontend contract tests | `npm run test:contracts` | PASS: 2 files, 6 tests |
| Frontend production build | `npm run build` | PASS |

### 0.3. Báo cáo KLTN cập nhật sau implement

- Bản báo cáo mới nhất theo timestamp trước khi kiểm tra là `/Users/kietnguyen/Downloads/Bao Cao KLTN (2).review-fixed.docx` lúc 2026-04-26 18:09:23.
- Bản đó chưa có evidence từ lượt implement mới (`ESLint`, `Vitest`, `calendar.ics`, `check-in`, `reschedule`, `2026-04-26`).
- Đã tạo bản cập nhật không overwrite file gốc: `/Users/kietnguyen/Downloads/Bao Cao KLTN (2).review-fixed.latest-code-evidence-20260426.docx`.
- Đã tạo audit note: `/Users/kietnguyen/Downloads/KLTN_REPORT_LATEST_STATUS_2026-04-26.md`.
- Ghi chú: chưa tự bổ sung tên GVHD vì chưa có dữ liệu xác nhận.

### 0.4. Ghi chú còn lại

- Frontend tests vẫn in nhiều warning React `act(...)` từ `MedicationPicker`; hiện không fail nhưng nên xử lý ở pass P1 để log sạch hơn.
- `PLAN_FIX.md` phần dưới giữ lại snapshot ban đầu để đối chiếu trước/sau.

## 1. Snapshot kết quả scan

### 0.1. Quy mô repo

- Tổng code/docs hữu ích, bỏ `node_modules`, `target`, `dist`, `.git`: khoảng **838 file**, **~93.9k dòng**.
- Backend: **Spring Boot microservices / Java 21**, khoảng **574 file**, **~58k dòng**.
- Frontend: **React 18 + Vite**, khoảng **262 file**, **~35.9k dòng**.

### 0.2. Backend modules

- `eureka-server`
- `api-gateway`
- `user-service`
- `appointment-service`
- `medical-service`
- `payment-service`
- `consultation-service`
- `chatbot-service`

### 0.3. Validation đã chạy

| Hạng mục | Lệnh | Kết quả |
|---|---|---|
| Frontend unit tests | `npm test -- --run` | PASS: 21 files, 66 tests |
| Frontend production build | `npm run build` | PASS |
| Frontend lint | `npm run lint` | FAIL: thiếu ESLint config |
| Backend compile | `./mvnw -q -DskipTests compile` | PASS |
| Backend tests | `./mvnw test` và module tách | Có module fail/error, chi tiết bên dưới |

### 0.4. Backend test summary

| Module | Tests | Failures | Errors | Skipped | Nhận xét |
|---|---:|---:|---:|---:|---|
| `api-gateway` | 12 | 0 | 0 | 0 | Pass |
| `user-service` | 171 | 5 | 0 | 0 | Fail quanh `searchDoctors` contract |
| `appointment-service` | 236 | 8 | 10 | 0 | Fail mock/test expectations + 1 Docker/Testcontainers case |
| `medical-service` | 132 | 0 | 0 | 20 | Pass; có warning H2 quanh cột `value`, chưa fail |
| `payment-service` | 79 | 0 | 9 | 0 | Tests thiếu mock `AppointmentPaymentSyncClient` |
| `consultation-service` | 74 | 0 | 14 | 0 | Tests thiếu mock `ConsultationNotificationService` |
| `chatbot-service` | 41 | 0 | 0 | 0 | Pass |

---

## 1. Ưu tiên sửa

### P0 — Bắt buộc trước khi nộp/demo

1. Backend test suite không còn fail vì unit test stale.
2. Frontend/backend API contract không còn endpoint 404 rõ ràng.
3. Báo cáo không còn placeholder hình/sơ đồ.
4. Chương 5/đánh giá có minh chứng test thực tế và số liệu rõ.
5. Không để secret thật xuất hiện trong repo nộp/public.

### P1 — Nên làm để repo trông chuyên nghiệp

1. Thêm ESLint config hoặc bỏ script lint sai.
2. Giảm warning React `act(...)` trong frontend tests.
3. Ghi lại lệnh test chuẩn trong README.
4. Chuẩn hóa message lỗi tiếng Việt giữa service và test.
5. Chuẩn hóa docs kiến trúc + diagram export.

### P2 — Nếu còn thời gian

1. E2E smoke chạy ổn định với seed data.
2. Tạo coverage report frontend/backend.
3. Docker Compose startup guide sạch.
4. Observability cơ bản: actuator, logs, correlation ID, gateway traces.

---

## 2. Plan sửa backend tests

### 2.1. `user-service`: chốt contract `searchDoctors`

**Files:**

- `backend/user-service/src/main/java/com/clinicbooking/userservice/service/UserServiceImpl.java`
- `backend/user-service/src/test/java/com/clinicbooking/userservice/service/UserServiceImplTest.java`

**Hiện trạng:**

- Code trim + lowercase `keyword` và `specialization`.
- Blank/null filter đang truyền `""` xuống repository.
- Test kỳ vọng blank/null thành `null`, và `specialization` giữ case gốc như `Cardiology`.

**Quyết định đề xuất:**

- Nên truyền `null` cho blank filter để query dễ phân nhánh.
- Nên thống nhất case-insensitive ở repository query, không phụ thuộc frontend gửi case gì.
- Có 2 hướng hợp lệ:
  - Hướng A: code giữ lowercase, test sửa kỳ vọng lowercase.
  - Hướng B: code chỉ trim, không lowercase, test giữ hiện trạng.

**Khuyến nghị:** Hướng A nếu repository dùng `LOWER(...)`, nhưng phải sửa blank thành `null`.

**Acceptance criteria:**

- `UserServiceImplTest` pass 8/8.
- Search doctor vẫn case-insensitive khi gọi từ API.
- Blank keyword/specialization không làm query lọc bằng chuỗi rỗng.

**Lệnh verify:**

```bash
cd backend
./mvnw -q -pl user-service test
```

---

### 2.2. `appointment-service`: cập nhật test stale và Docker-bound test

**Files trọng tâm:**

- `backend/appointment-service/src/test/java/.../DoctorScheduleServiceTest.java`
- `backend/appointment-service/src/test/java/.../MedicalServiceServiceTest.java`
- `backend/appointment-service/src/test/java/.../RoomServiceTest.java`
- `backend/appointment-service/src/test/java/.../AppointmentRepositorySearchAppointmentsPostgresTest.java`

**Nhóm lỗi:**

1. `AppointmentRepositorySearchAppointmentsPostgresTest` cần Docker/Testcontainers.
2. `DoctorScheduleServiceTest` mock doctor/user chưa đủ, gây `doctor == null` hoặc DTO null.
3. `MedicalServiceServiceTest` và `RoomServiceTest` fail vì service hiện validate clinic tồn tại nhưng test chưa mock clinic lookup.
4. Message mismatch: code trả `Phòng không tìm thấy`, test kỳ vọng `Phòng không tồn tại`.

**Plan sửa:**

- Với Testcontainers:
  - Nếu CI/local không đảm bảo Docker: thêm JUnit condition skip khi Docker unavailable.
  - Nếu bắt buộc test Postgres: ghi rõ prerequisite Docker trong README/test guide.
- Với service tests:
  - Mock đầy đủ dependency mới hoặc validate behavior mới.
  - Tạo helper fixture cho `Clinic`, `Room`, `MedicalService`, `DoctorSchedule` để giảm duplicate.
- Với message lỗi:
  - Chọn một câu chuẩn và áp dụng đồng bộ code + test.

**Acceptance criteria:**

- `./mvnw -q -pl appointment-service test` pass trong môi trường không Docker, trừ test được skip có lý do rõ.
- Nếu Docker bật, repository postgres test pass.

---

### 2.3. `payment-service`: mock `AppointmentPaymentSyncClient`

**Files:**

- `backend/payment-service/src/test/java/com/clinicbooking/paymentservice/service/PaymentServiceTest.java`
- `backend/payment-service/src/main/java/com/clinicbooking/paymentservice/client/AppointmentPaymentSyncClient.java`

**Hiện trạng:**

- 9 tests error do `appointmentPaymentSyncClient` null.
- Các luồng lỗi: create payment, callback success/fail, refund, cancel, confirm counter payment, query status.

**Plan sửa:**

- Add `@Mock AppointmentPaymentSyncClient appointmentPaymentSyncClient` vào test.
- Inject vào `PaymentServiceImpl` đúng constructor hoặc `@InjectMocks`.
- Stub các method:
  - `linkPaymentOrder(...)`
  - `updatePaymentStatus(...)`
- Với test failure path, verify sync call có/không được gọi đúng tình huống.

**Acceptance criteria:**

- `./mvnw -q -pl payment-service test` pass 79/79.
- Test cover được contract sync appointment payment state.

---

### 2.4. `consultation-service`: mock `ConsultationNotificationService`

**Files:**

- `backend/consultation-service/src/test/java/.../ConsultationServiceImplTest.java`
- `backend/consultation-service/src/test/java/.../MessageServiceImplTest.java`
- `backend/consultation-service/src/main/java/.../ConsultationNotificationService.java`

**Hiện trạng:**

- 14 errors do `consultationNotificationService` null.
- Service behavior mới có notify user khi create/accept/reject/complete/cancel consultation và khi gửi message.

**Plan sửa:**

- Add mock `ConsultationNotificationService` vào 2 test class.
- Inject đúng vào service under test.
- Stub `notifyUser(...)` no-op.
- Verify các event quan trọng:
  - Create consultation: notify doctor.
  - Accept/reject/complete/cancel: notify patient hoặc actor phù hợp.
  - Send message: notify recipient.

**Acceptance criteria:**

- `./mvnw -q -pl consultation-service test` pass 74/74.
- Test không chỉ né NPE mà còn xác nhận notification side effect chính.

---

### 2.5. `medical-service`: xử lý warning H2 cột `value`

**Hiện trạng:**

- Test pass, nhưng Hibernate/H2 có warning khi tạo bảng `health_metrics` vì cột `value` dễ đụng keyword.

**Plan đề xuất:**

- Đổi column name trong entity sang `metric_value` bằng `@Column(name = "metric_value")`.
- Tạo migration tương ứng nếu DB thật đã có dữ liệu.
- Cập nhật `schema-test.sql` nếu cần.

**Acceptance criteria:**

- `./mvnw -q -pl medical-service test` pass và log không còn DDL warning nghiêm trọng.

---

## 3. Plan sửa frontend/API contract

### 3.1. Endpoint mismatch cần xử lý

Frontend registry có 7 endpoint chưa match trực tiếp backend controller:

| Endpoint frontend | Backend hiện có | Hướng xử lý |
|---|---|---|
| `GET /api/appointments/${id}/calendar.ics` | Không thấy | Thêm backend export ICS hoặc bỏ UI/API nếu unused |
| `POST /api/appointments/${id}/check-in` | Không thấy | Thêm check-in endpoint hoặc bỏ wrapper |
| `POST /api/appointments/${id}/reschedule` | Không thấy | Backend hiện chỉ update appointment; thêm reschedule semantic hoặc map sang PUT |
| `GET /api/clinics/${clinicId}/rooms` | Backend có `/api/rooms/clinic/{clinicId}` | Sửa frontend gọi endpoint backend hiện có, hoặc thêm alias route |
| `GET /api/health-metrics/patient/${patientId}/history` | Backend có `/api/health-metrics/patient/{patientId}` và `/range` | Sửa wrapper dùng endpoint thật hoặc thêm alias `/history` |
| `GET /api/notifications/user/${userId}/status/false` | Backend có `/status/{isRead}` | Có thể chạy runtime; registry checker cần hiểu literal/path-var hoặc đổi registry pattern |
| `GET /api/reports/export/${format}` | Backend có `/api/reports/export/pdf` | Nếu chỉ PDF thì sửa frontend hardcode `pdf`; nếu nhiều format thì mở backend |

### 3.2. Acceptance criteria

- Contract script không còn báo missing endpoint thật.
- Các UI flow chính không 404 trong browser/network:
  - booking appointment
  - payment history/continue payment
  - health metrics
  - notification center
  - admin reports
  - clinic/room/service management

### 3.3. Lệnh verify

```bash
cd frontend
npm test -- --run
npm run build

cd ../backend
./mvnw -q -DskipTests compile
```

Nếu có script contract riêng, thêm vào `package.json`, ví dụ:

```bash
npm run test:contracts
```

---

## 4. Plan sửa frontend quality

### 4.1. ESLint

**Hiện trạng:** `npm run lint` fail vì không có config.

**Hướng sửa:**

- Thêm `eslint.config.js` hoặc `.eslintrc.cjs` tương thích ESLint 8.
- Include React + hooks rules.
- Exclude generated folders: `dist`, `node_modules`, `playwright-report`, `test-results`.

**Acceptance criteria:**

```bash
cd frontend
npm run lint
```

phải pass hoặc fail bằng lỗi code thật, không phải thiếu config.

### 4.2. React test warnings

**Hiện trạng:** nhiều warning `act(...)`, chủ yếu ở `MedicationPicker.test.jsx`, `LoginPage.test.jsx`.

**Plan:**

- Dùng `await userEvent.setup()` và `await user.click/type/keyboard`.
- Dùng `findBy...` hoặc `waitFor(...)` quanh UI state async.
- Không assert ngay sau event nếu component setState async.

**Acceptance criteria:**

- `npm test -- --run` pass và warning giảm rõ.

---

## 5. Plan bảo mật/config trước khi public/nộp source

### 5.1. `.env` thật

Repo có:

- `backend/.env`
- `frontend/.env`

**Plan:**

- Không nộp `.env` thật nếu có secret/ngrok/MoMo/JWT thật.
- Chỉ nộp `.env.example` với placeholder.
- Đảm bảo `.gitignore` ignore `.env`.

### 5.2. Default secrets trong YAML/docs

Một số config/docs có default secret/dev key. Với repo học tập private thì chấp nhận được; nếu public thì cần:

- Đổi default thành placeholder vô hại.
- Ghi rõ biến môi trường bắt buộc.
- Không hardcode MoMo secret thật.

### 5.3. Acceptance criteria

```bash
git grep -nE 'secret|password|api.key|access.key|MOMO|JWT_SECRET|NGROK' -- ':!**/target/**' ':!**/node_modules/**'
```

Review thủ công toàn bộ kết quả trước khi nộp/public.

---

## 6. Plan hoàn thiện báo cáo/luận văn

> Lưu ý: trong repo hiện tại chưa thấy file `.docx`, `.pdf`, `.tex` báo cáo. Các mục dưới đây dựa trên nội dung review trong `prompt.md`. Cần đặt file báo cáo vào repo hoặc cung cấp path để chỉnh trực tiếp.

### 6.1. Bổ sung hình/sơ đồ thật — ưu tiên cao nhất

Các placeholder kiểu `Hình minh họa: Use case chi tiết của User-service` phải thay bằng hình thật.

**Sơ đồ nên có:**

1. **Kiến trúc tổng thể hệ thống**
   - Frontend React
   - API Gateway
   - Eureka
   - User/Appointment/Medical/Payment/Consultation/Chatbot services
   - PostgreSQL per service
   - Redis
   - Kafka
   - MoMo/ngrok callback

2. **Use case tổng quát**
   - Patient: đăng ký/đăng nhập, tìm bác sĩ, đặt lịch, thanh toán, xem hồ sơ, tư vấn online
   - Doctor: xem lịch, quản lý bệnh nhân, tạo hồ sơ, tư vấn
   - Admin: quản lý user/doctor/clinic/service/room/report

3. **Use case chi tiết theo service**
   - User-service: auth, profile, family member, verification, permission
   - Appointment-service: appointment, schedule, clinic, room, service, notification
   - Medical-service: medical record, prescription, medication, health metrics
   - Payment-service: create payment, MoMo callback, refund, counter payment
   - Consultation-service: request, accept/reject, message, complete
   - Chatbot-service: classify, RAG/knowledge, doctor lookup, session history

4. **Sequence diagrams**
   - Đăng nhập JWT qua gateway
   - Đặt lịch + tạo payment MoMo
   - MoMo IPN callback cập nhật payment + appointment
   - Tư vấn online realtime message
   - Doctor tạo medical record + prescription

5. **ERD/database diagrams**
   - Có thể tách theo bounded context/microservice DB.

**Acceptance criteria:**

- Không còn dòng placeholder hình trong báo cáo.
- Mỗi hình có caption, số hình, nguồn nếu cần.
- Hình đọc được khi in PDF.

### 6.2. Mở rộng Abstract/Tóm tắt

Abstract nên có đủ 5 ý:

1. Bối cảnh/vấn đề: đặt lịch khám và quản lý hồ sơ y tế còn phân mảnh.
2. Mục tiêu: xây dựng hệ thống clinic booking full-stack theo kiến trúc microservices.
3. Công nghệ: Spring Boot, Spring Cloud Gateway, Eureka, React, PostgreSQL, Redis, Kafka, JWT, MoMo sandbox, Gemini/chatbot nếu dùng.
4. Phương pháp đánh giá: unit test, integration/contract test, e2e smoke, build verification.
5. Kết quả: liệt kê tính năng hoàn thành và số liệu test pass sau khi fix.

**Acceptance criteria:** Abstract dài khoảng 250–350 từ tiếng Việt hoặc 180–250 từ tiếng Anh, không chỉ 2 đoạn chung chung.

### 6.3. Lời cảm ơn

**Plan:**

- Bổ sung tên GVHD cụ thể.
- Cảm ơn khoa/trường, giảng viên phản biện nếu phù hợp, gia đình/bạn bè/nhóm.
- Văn phong trang trọng, không quá dài.

**Placeholder cần thay:**

- `[Tên GVHD]`
- `[Tên khoa/trường]`
- `[Tên thành viên nhóm nếu cần]`

### 6.4. Bảng đóng góp mục 1.6

Bảng có phần “Kế thừa” là minh bạch nhưng dễ bị hỏi.

**Plan:**

- Viết rõ: kế thừa framework/thư viện open-source, không kế thừa business logic.
- Nêu phần nhóm tự thiết kế/triển khai:
  - domain model
  - API contract
  - business workflows
  - database migrations
  - frontend pages/components
  - payment integration flow
  - test cases và seed data
- Chuẩn bị slide backup: “Ranh giới sử dụng framework vs phần nhóm xây dựng”.

### 6.5. Bảng 2.1 tổng quan nghiên cứu

Hiện chỉ có 4 công trình, nên thêm 2–4 nguồn.

**Nhóm nguồn nên bổ sung:**

1. Tài liệu hoặc paper về online medical appointment scheduling.
2. Paper/case study về microservices trong healthcare information systems.
3. Tài liệu về secure healthcare data management / JWT / RBAC.
4. Tài liệu về chatbot/RAG trong hỗ trợ y tế, nếu chatbot là điểm nhấn.

**Acceptance criteria:**

- Bảng 2.1 có ít nhất 6–8 dòng.
- Mỗi dòng có: tác giả/năm, mục tiêu, phương pháp, kết quả, hạn chế, liên hệ với đề tài.

### 6.6. Format heading mục 3.2.5

**Plan:**

- Chuẩn hóa style heading con `3.2.5.1`, `3.2.5.2`, ... giống các mục cùng cấp.
- Update tự động mục lục/danh mục hình/bảng sau khi chỉnh.

### 6.7. Kiểm tra Chương 5

**Plan:**

- Xác nhận Chương 5 có nội dung thật, không chỉ xuất hiện trong danh mục bảng.
- Chương 5 nên có:
  - môi trường kiểm thử
  - chiến lược test
  - bảng kết quả unit/integration/e2e
  - đánh giá chức năng hoàn thành
  - đánh giá phi chức năng: hiệu năng cơ bản, bảo mật, khả năng mở rộng
  - hạn chế còn tồn tại

**Số liệu nên cập nhật sau khi fix test:**

- Frontend unit tests: 66/66 pass hiện tại.
- Backend: chỉ ghi số pass cuối cùng sau khi sửa fail, không ghi số đang fail vào bản nộp nếu chưa giải thích.
- Build: frontend build pass, backend compile pass.

---

## 7. Checklist demo/nộp

### 7.1. Code

- [ ] `git status` sạch hoặc chỉ còn thay đổi chủ động.
- [ ] Backend compile pass.
- [ ] Frontend test/build pass.
- [ ] Backend tests pass hoặc có danh sách skipped hợp lý.
- [ ] Không còn endpoint frontend gọi mà backend không support.
- [ ] `.env` thật không nằm trong bản nộp/public.

### 7.2. Báo cáo

- [ ] Không còn placeholder hình.
- [ ] Abstract đủ thông tin công nghệ/phương pháp/kết quả.
- [ ] Lời cảm ơn có tên GVHD.
- [ ] Bảng đóng góp viết rõ ranh giới framework vs nhóm làm.
- [ ] Bảng tổng quan nghiên cứu có 6–8 nguồn.
- [ ] Mục heading nhất quán.
- [ ] Chương 5 đầy đủ bảng kết quả và nhận xét.
- [ ] Mục lục, danh mục hình, danh mục bảng đã update.

### 7.3. Slide bảo vệ

- [ ] Có sơ đồ kiến trúc tổng thể.
- [ ] Có sequence đặt lịch + thanh toán.
- [ ] Có sequence tư vấn online.
- [ ] Có slide test evidence.
- [ ] Có slide giới hạn và hướng phát triển.
- [ ] Chuẩn bị trả lời: “Microservices có cần thiết không?”, “Phần nào nhóm tự làm?”, “Dữ liệu y tế bảo mật thế nào?”, “MoMo callback xử lý ra sao?”.

---

## 8. Thứ tự triển khai đề xuất

1. Sửa unit tests stale do dependency mới: payment + consultation.
2. Sửa `user-service searchDoctors` contract.
3. Sửa appointment-service tests + Docker skip condition.
4. Chạy lại toàn bộ backend tests.
5. Sửa API endpoint mismatch frontend/backend.
6. Thêm ESLint config hoặc bỏ lint script.
7. Tạo/cập nhật diagrams cho báo cáo.
8. Cập nhật Abstract, Lời cảm ơn, Bảng 2.1, Chương 5.
9. Chạy lại frontend/backend validation cuối.
10. Export báo cáo PDF và kiểm tra mục lục/danh mục hình/bảng.

---

## 9. Lệnh verify cuối cùng

```bash
# Frontend
cd frontend
npm test -- --run
npm run build
npm run lint

# Backend
cd ../backend
./mvnw -q -DskipTests compile
./mvnw -q test

# Nếu có Docker và muốn chạy Testcontainers/Postgres-specific tests
./mvnw -q -pl appointment-service -Dtest=AppointmentRepositorySearchAppointmentsPostgresTest test
```

---

## 10. Definition of Done

Xem như hoàn tất khi:

- Frontend tests/build/lint pass.
- Backend compile và test pass, hoặc test cần Docker được skip có điều kiện rõ ràng.
- API registry không còn endpoint missing nghiêm trọng.
- Báo cáo có đủ hình thật, Abstract mở rộng, Lời cảm ơn có GVHD, Chương 5 có số liệu test.
- Repo không chứa secret thật trong bản nộp/public.
