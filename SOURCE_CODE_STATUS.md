# Source code status — 2026-04-26 19:05 ICT

## Kết luận

Source code hiện đã ở trạng thái **ổn cho demo/nộp ở mức kiểm thử cục bộ**: backend full tests, frontend lint, frontend unit tests, frontend contract tests và frontend production build đều PASS sau lượt fix.

## Evidence đã chạy

| Hạng mục | Lệnh | Kết quả |
|---|---|---|
| Backend full tests | `./mvnw -q test` | PASS |
| Frontend lint | `npm run lint` | PASS |
| Frontend unit tests | `npm test -- --run` | PASS: 21 files, 66 tests |
| Frontend contract tests | `npm run test:contracts` | PASS: 2 files, 6 tests |
| Frontend production build | `npm run build` | PASS |

## Những gì đã fix chính

- Backend stale tests ở `user-service`, `appointment-service`, `payment-service`, `consultation-service`.
- Appointment API contract thiếu endpoint:
  - `POST /api/appointments/{id}/reschedule`
  - `POST /api/appointments/{id}/check-in`
  - `GET /api/appointments/{id}/calendar.ics`
- Frontend API mismatch:
  - Rooms: dùng `/api/rooms/clinic/{clinicId}`.
  - Health metrics history: dùng `/api/health-metrics/patient/{patientId}/range`.
  - Report export: dùng `/api/reports/export/pdf`.
- Frontend lint blocker: thêm `.eslintrc.cjs` và sửa lỗi lint thật (`arguments` trong arrow function, return trong `finally`, escape dư ở Playwright spec).
- Testcontainers Postgres case: cấu hình skip nếu Docker không bật.

## Caveat còn lại

- Chưa chạy full Playwright E2E vì cần môi trường app/services/seed data đầy đủ.
- Vitest vẫn có warning React `act(...)` ở `MedicationPicker`; không fail nhưng nên làm sạch trước khi nộp nếu muốn log đẹp.
- Repo hiện có nhiều file modified/untracked, gồm cả một số file frontend đã có từ trước lượt fix; cần review/stage có chọn lọc trước khi commit.
