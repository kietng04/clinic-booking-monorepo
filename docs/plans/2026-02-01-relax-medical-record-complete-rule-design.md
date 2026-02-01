# Thiết kế: Bỏ ràng buộc "đúng giờ" khi tạo hồ sơ bệnh án

## Mục tiêu
- Cho phép bác sĩ lưu hồ sơ bệnh án ngay khi lịch hẹn đã CONFIRMED.
- Tự động hoàn thành lịch hẹn sau khi lưu hồ sơ, không bị chặn bởi "chưa đến giờ".
- UI chỉ cho phép lưu khi lịch hẹn CONFIRMED trở lên.

## Quyết định chính
- Backend medical-service: nới điều kiện từ COMPLETED-only → CONFIRMED hoặc COMPLETED.
- Backend appointment-service: bỏ rule "không thể hoàn thành lịch hẹn chưa đến giờ".
- Frontend: chỉ enable "Lưu hồ sơ" khi status CONFIRMED/COMPLETED.
- Auto-complete lỗi vì lý do khác vẫn báo lỗi.

## Phạm vi thay đổi
### 1) medical-service
File: `medical-service/src/main/java/com/clinicbooking/medicalservice/service/MedicalRecordServiceImpl.java`
- Thay kiểm tra:
  - Cũ: chỉ chấp nhận `COMPLETED`.
  - Mới: chấp nhận `CONFIRMED` hoặc `COMPLETED`.
- Giữ nguyên các kiểm tra khác: doctor role, doctorId match, appointment belongs to patient/doctor.

### 2) appointment-service
File: `appointment-service/src/main/java/com/clinicbooking/appointmentservice/service/AppointmentServiceImpl.java`
- Gỡ rule "không thể hoàn thành lịch hẹn chưa đến giờ".
- Giữ nguyên các rule hợp lệ khác (trạng thái không được CANCELLED, v.v.).

### 3) frontend
File: `clinic-booking-frontend/src/pages/doctor/CreateMedicalRecord.jsx`
- Chỉ cho phép submit khi `appointment.status` là `CONFIRMED` hoặc `COMPLETED`.
- Giữ flow: tạo hồ sơ → tạo đơn thuốc → gọi auto-complete.
- Nếu auto-complete lỗi (khác lý do thời gian) thì báo lỗi như hiện tại.

## Data flow mới
`CONFIRMED` → lưu hồ sơ bệnh án → auto-complete → `COMPLETED`

## Error handling
- Nếu appointment không đúng doctor/patient hoặc role không hợp lệ → vẫn lỗi.
- Nếu status không phải CONFIRMED/COMPLETED → chặn lưu ở UI và backend.
- Auto-complete fail vì lý do khác → báo lỗi.

## Testing đề xuất
- medical-service: tạo hồ sơ với status `CONFIRMED` → OK; `PENDING` → fail.
- appointment-service: complete appointment không còn check thời gian.
- frontend: disable nút lưu khi status < CONFIRMED; submit flow auto-complete OK.

