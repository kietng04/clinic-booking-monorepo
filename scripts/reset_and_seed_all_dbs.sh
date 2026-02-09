#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: scripts/reset_and_seed_all_dbs.sh [--small|--medium|--large] [--help]

Reset all clinic PostgreSQL databases and seed realistic large demo data.

Options:
  --small     Seed smaller dataset for quick local runs
  --medium    Seed medium dataset (default)
  --large     Seed large dataset
  --help      Show this help

Env overrides:
  TOTAL_PATIENTS
  TOTAL_DOCTORS
  TOTAL_ADMINS
  TOTAL_RECEPTIONISTS
  TOTAL_FAMILY_MEMBERS
  TOTAL_CLINICS
  ROOMS_PER_CLINIC
  SERVICES_PER_CLINIC
  TOTAL_APPOINTMENTS
  TOTAL_MEDICAL_RECORDS
  TOTAL_CONSULTATIONS
  TOTAL_PAYMENT_ORDERS
USAGE
}

PROFILE="medium"
for arg in "$@"; do
  case "$arg" in
    --small) PROFILE="small" ;;
    --medium) PROFILE="medium" ;;
    --large) PROFILE="large" ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      usage
      exit 1
      ;;
  esac
done

case "$PROFILE" in
  small)
    : "${TOTAL_PATIENTS:=180}"
    : "${TOTAL_DOCTORS:=30}"
    : "${TOTAL_ADMINS:=4}"
    : "${TOTAL_RECEPTIONISTS:=8}"
    : "${TOTAL_FAMILY_MEMBERS:=220}"
    : "${TOTAL_CLINICS:=6}"
    : "${ROOMS_PER_CLINIC:=5}"
    : "${SERVICES_PER_CLINIC:=9}"
    : "${TOTAL_APPOINTMENTS:=1800}"
    : "${TOTAL_MEDICAL_RECORDS:=900}"
    : "${TOTAL_CONSULTATIONS:=800}"
    : "${TOTAL_PAYMENT_ORDERS:=1700}"
    ;;
  medium)
    : "${TOTAL_PATIENTS:=800}"
    : "${TOTAL_DOCTORS:=120}"
    : "${TOTAL_ADMINS:=10}"
    : "${TOTAL_RECEPTIONISTS:=22}"
    : "${TOTAL_FAMILY_MEMBERS:=1100}"
    : "${TOTAL_CLINICS:=14}"
    : "${ROOMS_PER_CLINIC:=9}"
    : "${SERVICES_PER_CLINIC:=16}"
    : "${TOTAL_APPOINTMENTS:=12000}"
    : "${TOTAL_MEDICAL_RECORDS:=6400}"
    : "${TOTAL_CONSULTATIONS:=5200}"
    : "${TOTAL_PAYMENT_ORDERS:=11500}"
    ;;
  large)
    : "${TOTAL_PATIENTS:=1800}"
    : "${TOTAL_DOCTORS:=260}"
    : "${TOTAL_ADMINS:=16}"
    : "${TOTAL_RECEPTIONISTS:=48}"
    : "${TOTAL_FAMILY_MEMBERS:=3200}"
    : "${TOTAL_CLINICS:=26}"
    : "${ROOMS_PER_CLINIC:=12}"
    : "${SERVICES_PER_CLINIC:=20}"
    : "${TOTAL_APPOINTMENTS:=36000}"
    : "${TOTAL_MEDICAL_RECORDS:=20000}"
    : "${TOTAL_CONSULTATIONS:=14000}"
    : "${TOTAL_PAYMENT_ORDERS:=35000}"
    ;;
esac

PATIENT_START=1
PATIENT_END=$TOTAL_PATIENTS
DOCTOR_START=$((PATIENT_END + 1))
DOCTOR_END=$((DOCTOR_START + TOTAL_DOCTORS - 1))
ADMIN_START=$((DOCTOR_END + 1))
ADMIN_END=$((ADMIN_START + TOTAL_ADMINS - 1))
RECEPTIONIST_START=$((ADMIN_END + 1))
RECEPTIONIST_END=$((RECEPTIONIST_START + TOTAL_RECEPTIONISTS - 1))

PASSWORD_HASH='$2b$12$mkFwwmp16oiGSdmQ2aTVau995iIZPlvFl/kRKyKh5RHn9CL7rOOfe'

assert_container() {
  local container="$1"
  if ! docker ps --format '{{.Names}}' | rg -q "^${container}$"; then
    echo "Container not running: ${container}" >&2
    exit 1
  fi
}

psql_exec() {
  local container="$1"
  local db="$2"
  docker exec -i "$container" psql -U postgres -d "$db" -v ON_ERROR_STOP=1
}

reset_db() {
  local container="$1"
  local db="$2"
  local excludes="$3"

  psql_exec "$container" "$db" <<SQL
DO \
\$\$
DECLARE
    stmt TEXT;
BEGIN
    SELECT STRING_AGG(FORMAT('%I.%I', schemaname, tablename), ', ')
      INTO stmt
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> 'flyway_schema_history'
      AND tablename <> ALL (ARRAY[$excludes]);

    IF stmt IS NOT NULL THEN
        EXECUTE 'TRUNCATE TABLE ' || stmt || ' RESTART IDENTITY CASCADE';
    END IF;
END
\$\$;
SQL
}

echo "==> Checking required containers"
for c in clinic_postgres_user clinic_postgres_appointment clinic_postgres_medical clinic_postgres_consultation clinic_postgres_payment; do
  assert_container "$c"
done

echo "==> Resetting existing data"
reset_db clinic_postgres_user user_service_db "'permissions'"
reset_db clinic_postgres_appointment appointment_service_db "''"
reset_db clinic_postgres_medical medical_service_db "'medications'"
reset_db clinic_postgres_consultation consultation_service_db "''"
reset_db clinic_postgres_payment payment_db "''"

echo "==> Seeding user_service_db"
psql_exec clinic_postgres_user user_service_db <<SQL
INSERT INTO users (
  email, phone, password, full_name, date_of_birth, gender, role,
  avatar_url, avatar_public_id, is_active, email_verified, phone_verified,
  created_at, updated_at
)
SELECT
  FORMAT('patient.%s@healthflow.vn', gs),
  FORMAT('09%08s', gs::text),
  '$PASSWORD_HASH',
  CONCAT(
    (ARRAY['Nguyen','Tran','Le','Pham','Hoang','Phan','Vu','Dang','Bui','Do'])[(gs % 10) + 1], ' ',
    (ARRAY['Minh','Anh','Khanh','Linh','Phuong','Huy','Tien','Trang','Nam','Ha','Tu'])[(gs % 11) + 1], ' ',
    (ARRAY['An','Binh','Chi','Dung','Giang','Hung','Lan','My','Phuc','Quynh','Son'])[(gs % 11) + 1]
  ),
  CURRENT_DATE - ((18 + (RANDOM() * 55)::INT) * INTERVAL '1 year') - ((RANDOM() * 300)::INT * INTERVAL '1 day'),
  (ARRAY['MALE','FEMALE','OTHER'])[(gs % 3) + 1],
  'PATIENT',
  FORMAT('https://i.pravatar.cc/300?img=%s', (gs % 70) + 1),
  FORMAT('healthflow/avatars/patient_%s', gs),
  TRUE,
  (RANDOM() < 0.92),
  (RANDOM() < 0.95),
  NOW() - ((RANDOM() * 720)::INT * INTERVAL '1 day'),
  NOW() - ((RANDOM() * 30)::INT * INTERVAL '1 day')
FROM generate_series(1, $TOTAL_PATIENTS) gs;

INSERT INTO users (
  email, phone, password, full_name, date_of_birth, gender, role,
  specialization, license_number, workplace, experience_years, rating, consultation_fee,
  avatar_url, avatar_public_id, is_active, email_verified, phone_verified,
  created_at, updated_at
)
SELECT
  FORMAT('doctor.%s@healthflow.vn', gs),
  FORMAT('08%08s', gs::text),
  '$PASSWORD_HASH',
  CONCAT('BS. ',
    (ARRAY['Nguyen','Tran','Le','Pham','Hoang','Phan','Vu','Dang'])[(gs % 8) + 1], ' ',
    (ARRAY['Thanh','Thu','Mai','Quoc','Hoai','Bao','Ngoc','Duc','Yen'])[(gs % 9) + 1], ' ',
    (ARRAY['An','Binh','Chi','Dung','Giang','Hung','Lan','Phuc','Quynh'])[(gs % 9) + 1]
  ),
  CURRENT_DATE - ((30 + (RANDOM() * 30)::INT) * INTERVAL '1 year') - ((RANDOM() * 250)::INT * INTERVAL '1 day'),
  (ARRAY['MALE','FEMALE'])[(gs % 2) + 1],
  'DOCTOR',
  (ARRAY['Nội tổng quát','Tim mạch','Da liễu','Nhi khoa','Tai Mũi Họng','Thần kinh','Xương khớp','Nội tiết','Sản phụ khoa'])[(gs % 9) + 1],
  FORMAT('LIC-%s-%s', TO_CHAR(CURRENT_DATE, 'YY'), LPAD(gs::text, 5, '0')),
  (ARRAY['Bệnh viện Bạch Mai','Bệnh viện Chợ Rẫy','Bệnh viện Đại học Y','Phòng khám HealthFlow'])[(gs % 4) + 1],
  3 + (RANDOM() * 22)::INT,
  ROUND((3.6 + RANDOM() * 1.4)::numeric, 2),
  ROUND((180000 + RANDOM() * 620000)::numeric, 2),
  FORMAT('https://i.pravatar.cc/300?img=%s', (gs % 70) + 1),
  FORMAT('healthflow/avatars/doctor_%s', gs),
  TRUE,
  TRUE,
  TRUE,
  NOW() - ((RANDOM() * 1000)::INT * INTERVAL '1 day'),
  NOW() - ((RANDOM() * 40)::INT * INTERVAL '1 day')
FROM generate_series(1, $TOTAL_DOCTORS) gs;

INSERT INTO users (
  email, phone, password, full_name, date_of_birth, gender, role,
  is_active, email_verified, phone_verified, created_at, updated_at
)
SELECT
  FORMAT('admin.%s@healthflow.vn', gs),
  FORMAT('07%08s', gs::text),
  '$PASSWORD_HASH',
  FORMAT('Admin %s', gs),
  CURRENT_DATE - ((28 + (RANDOM() * 22)::INT) * INTERVAL '1 year'),
  (ARRAY['MALE','FEMALE'])[(gs % 2) + 1],
  'ADMIN',
  TRUE,
  TRUE,
  TRUE,
  NOW() - ((RANDOM() * 400)::INT * INTERVAL '1 day'),
  NOW()
FROM generate_series(1, $TOTAL_ADMINS) gs;

INSERT INTO users (
  email, phone, password, full_name, date_of_birth, gender, role,
  is_active, email_verified, phone_verified, created_at, updated_at
)
SELECT
  FORMAT('reception.%s@healthflow.vn', gs),
  FORMAT('03%08s', gs::text),
  '$PASSWORD_HASH',
  CONCAT('Lễ tân ', (ARRAY['Minh','Linh','Trang','Thao','Vy','Nhi','Khanh'])[(gs % 7)+1], ' ', gs),
  CURRENT_DATE - ((22 + (RANDOM() * 18)::INT) * INTERVAL '1 year'),
  (ARRAY['MALE','FEMALE'])[(gs % 2) + 1],
  'RECEPTIONIST',
  TRUE,
  TRUE,
  TRUE,
  NOW() - ((RANDOM() * 500)::INT * INTERVAL '1 day'),
  NOW()
FROM generate_series(1, $TOTAL_RECEPTIONISTS) gs;

WITH p AS (
  SELECT id, full_name FROM users WHERE role = 'PATIENT' ORDER BY id
), g AS (
  SELECT gs FROM generate_series(1, $TOTAL_FAMILY_MEMBERS) gs
)
INSERT INTO family_members (
  user_id, full_name, date_of_birth, gender, relationship,
  blood_type, height, weight, allergies, chronic_diseases,
  avatar_url, is_deleted, created_at, updated_at
)
SELECT
  pick.id,
  CONCAT(
    (ARRAY['Nguyen','Tran','Le','Pham','Ho'])[(g.gs % 5)+1], ' ',
    (ARRAY['Gia','Bao','Khue','Thu','An','Viet'])[(g.gs % 6)+1], ' ',
    (ARRAY['An','Binh','Chi','Dung','Hoa','Khanh'])[(g.gs % 6)+1]
  ),
  CURRENT_DATE - ((2 + (RANDOM() * 78)::INT) * INTERVAL '1 year'),
  (ARRAY['MALE','FEMALE'])[(g.gs % 2) + 1],
  (ARRAY['Con','Vợ/Chồng','Bố/Mẹ','Anh/Chị/Em'])[(g.gs % 4)+1],
  (ARRAY['A+','A-','B+','B-','AB+','AB-','O+','O-'])[(g.gs % 8)+1],
  ROUND((95 + RANDOM() * 85)::numeric, 1),
  ROUND((16 + RANDOM() * 95)::numeric, 1),
  CASE WHEN RANDOM() < 0.2 THEN (ARRAY['Dị ứng hải sản','Dị ứng kháng sinh beta-lactam','Viêm mũi dị ứng'])[(g.gs % 3)+1] END,
  CASE WHEN RANDOM() < 0.18 THEN (ARRAY['Hen phế quản','Tăng huyết áp','Đái tháo đường tuýp 2'])[(g.gs % 3)+1] END,
  FORMAT('https://i.pravatar.cc/300?img=%s', (g.gs % 70)+1),
  FALSE,
  NOW() - ((RANDOM() * 600)::INT * INTERVAL '1 day'),
  NOW()
FROM g
CROSS JOIN LATERAL (SELECT id FROM p ORDER BY RANDOM() LIMIT 1) pick;

INSERT INTO verification_codes (user_id, type, code, expiry_date, attempt_count, is_verified, created_at)
SELECT
  u.id,
  CASE WHEN RANDOM() < 0.7 THEN 'EMAIL' ELSE 'PHONE' END,
  LPAD(((RANDOM() * 999999)::INT)::TEXT, 6, '0'),
  NOW() + ((10 + (RANDOM() * 50)::INT) * INTERVAL '1 minute'),
  (RANDOM() * 3)::INT,
  (RANDOM() < 0.6),
  NOW() - ((RANDOM() * 90)::INT * INTERVAL '1 day')
FROM users u
WHERE RANDOM() < 0.22;

INSERT INTO password_reset_tokens (user_id, token, expiry_date, is_used, created_at)
SELECT
  u.id,
  md5(random()::text || clock_timestamp()::text || u.id::text),
  NOW() + ((30 + (RANDOM() * 300)::INT) * INTERVAL '1 minute'),
  (RANDOM() < 0.35),
  NOW() - ((RANDOM() * 20)::INT * INTERVAL '1 day')
FROM users u
WHERE RANDOM() < 0.08;
SQL

echo "==> Seeding appointment_service_db"
psql_exec clinic_postgres_appointment appointment_service_db <<SQL
DROP TABLE IF EXISTS vouchers;

INSERT INTO clinics (name, address, phone, email, description, opening_hours, is_active, created_at, updated_at)
SELECT
  CONCAT('HealthFlow Clinic ', gs),
  CONCAT((10 + gs), ' Nguyễn Trãi, Quận ', ((gs % 12) + 1), ', TP.HCM'),
  FORMAT('0283%06s', (100000 + gs)::text),
  FORMAT('clinic.%s@healthflow.vn', gs),
  (ARRAY['Phòng khám đa khoa tiêu chuẩn quốc tế','Trung tâm chuyên khoa với đội ngũ bác sĩ giàu kinh nghiệm','Cơ sở khám chữa bệnh nhanh và cá nhân hóa'])[(gs % 3)+1],
  '07:00-20:00 (T2-T7), 08:00-17:00 (CN)',
  TRUE,
  NOW() - ((RANDOM() * 500)::INT * INTERVAL '1 day'),
  NOW()
FROM generate_series(1, $TOTAL_CLINICS) gs;

INSERT INTO rooms (clinic_id, name, room_number, type, capacity, is_active, created_at)
SELECT
  c.id,
  CONCAT('Phòng khám ', gs_room),
  CONCAT('R', LPAD(gs_room::text, 2, '0')),
  (ARRAY['CONSULTATION','EXAMINATION','PROCEDURE'])[(gs_room % 3) + 1],
  1 + (RANDOM() * 5)::INT,
  TRUE,
  NOW() - ((RANDOM() * 300)::INT * INTERVAL '1 day')
FROM clinics c
CROSS JOIN generate_series(1, $ROOMS_PER_CLINIC) gs_room;

INSERT INTO medical_services (clinic_id, name, description, category, duration_minutes, is_active, created_at, updated_at)
SELECT
  c.id,
  CONCAT(
    (ARRAY['Khám tổng quát','Khám tim mạch','Khám da liễu','Khám nội tiết','Khám hô hấp','Khám nhi khoa','Khám tai mũi họng'])[(gs_service % 7)+1],
    ' - Gói ', ((gs_service % 3) + 1)
  ),
  (ARRAY['Đánh giá tổng thể sức khỏe','Khám chuyên sâu theo triệu chứng','Theo dõi bệnh mạn tính và tư vấn điều trị'])[(gs_service % 3)+1],
  (ARRAY['GENERAL','CARDIO','DERMATOLOGY','ENDOCRINE','PEDIATRICS'])[(gs_service % 5)+1],
  (ARRAY[20,30,45,60])[(gs_service % 4)+1],
  TRUE,
  NOW() - ((RANDOM() * 500)::INT * INTERVAL '1 day'),
  NOW()
FROM clinics c
CROSS JOIN generate_series(1, $SERVICES_PER_CLINIC) gs_service;

INSERT INTO service_prices (service_id, doctor_id, price, currency, effective_from, effective_to, created_at)
SELECT
  s.id,
  ($DOCTOR_START + (RANDOM() * ($TOTAL_DOCTORS - 1))::INT),
  ROUND((120000 + RANDOM() * 900000)::numeric, 2),
  'VND',
  CURRENT_DATE - ((RANDOM() * 180)::INT),
  NULL,
  NOW() - ((RANDOM() * 120)::INT * INTERVAL '1 day')
FROM medical_services s;

INSERT INTO doctor_schedules (doctor_id, doctor_name, day_of_week, start_time, end_time, is_available, created_at)
SELECT
  d_id,
  CONCAT('BS. ', d_id),
  dow,
  (ARRAY['07:00','08:00','08:30'])[(dow % 3)+1]::TIME,
  (ARRAY['16:30','17:00','18:00'])[(dow % 3)+1]::TIME,
  TRUE,
  NOW() - ((RANDOM() * 120)::INT * INTERVAL '1 day')
FROM generate_series($DOCTOR_START, $DOCTOR_END) d_id
CROSS JOIN generate_series(1, 6) dow;

INSERT INTO appointments (
  patient_id, doctor_id, patient_name, doctor_name, patient_phone,
  family_member_id, family_member_name,
  appointment_date, appointment_time, duration_minutes, type, status,
  symptoms, notes, cancel_reason, priority,
  clinic_id, room_id, service_id, service_fee,
  patient_rating, patient_review, reviewed_at,
  created_at, updated_at
)
SELECT
  ($PATIENT_START + (RANDOM() * ($TOTAL_PATIENTS - 1))::INT) AS patient_id,
  ($DOCTOR_START + (RANDOM() * ($TOTAL_DOCTORS - 1))::INT) AS doctor_id,
  CONCAT((ARRAY['Nguyen','Tran','Le','Pham','Ho'])[(gs % 5)+1], ' ', (ARRAY['Minh','Linh','An','Khanh','Thao'])[(gs % 5)+1], ' ', (ARRAY['Anh','Binh','Chi','Dung','Ha'])[(gs % 5)+1]),
  CONCAT('BS. ', (ARRAY['Nguyen','Tran','Le','Pham'])[(gs % 4)+1], ' ', (ARRAY['Thanh','Thu','Mai','Quoc'])[(gs % 4)+1]),
  FORMAT('09%08s', ((gs % $TOTAL_PATIENTS) + 1)::text),
  CASE WHEN RANDOM() < 0.35 THEN (1 + (RANDOM() * GREATEST($TOTAL_FAMILY_MEMBERS - 1, 1))::INT) ELSE NULL END,
  CASE WHEN RANDOM() < 0.35 THEN CONCAT('Người nhà ', gs) END,
  CURRENT_DATE + ((RANDOM() * 150)::INT - 60),
  (ARRAY['07:30','08:00','08:30','09:00','09:30','10:00','13:30','14:00','15:00','16:00'])[(gs % 10)+1]::TIME,
  (ARRAY[20,30,45,60])[(gs % 4)+1],
  (ARRAY['IN_PERSON','ONLINE'])[(gs % 2)+1],
  CASE
    WHEN (CURRENT_DATE + ((RANDOM() * 150)::INT - 60)) < CURRENT_DATE THEN
      (ARRAY['COMPLETED','COMPLETED','COMPLETED','CANCELLED'])[(gs % 4)+1]
    ELSE
      (ARRAY['PENDING','CONFIRMED','PENDING','CONFIRMED'])[(gs % 4)+1]
  END,
  (ARRAY['Đau họng kéo dài','Ho khan về đêm','Đau đầu, chóng mặt','Khám định kỳ','Mẩn ngứa da'])[(gs % 5)+1],
  (ARRAY['Theo dõi thêm 7 ngày','Mang kết quả xét nghiệm cũ','Ưu tiên khám sáng','Tái khám sau điều trị'])[(gs % 4)+1],
  CASE WHEN RANDOM() < 0.12 THEN (ARRAY['Bận công tác','Thay đổi lịch cá nhân','Đã khám nơi khác'])[(gs % 3)+1] END,
  CASE WHEN RANDOM() < 0.18 THEN 'URGENT' ELSE 'NORMAL' END,
  (1 + (RANDOM() * ($TOTAL_CLINICS - 1))::INT),
  (1 + (RANDOM() * (($TOTAL_CLINICS * $ROOMS_PER_CLINIC) - 1))::INT),
  (1 + (RANDOM() * (($TOTAL_CLINICS * $SERVICES_PER_CLINIC) - 1))::INT),
  ROUND((150000 + RANDOM() * 900000)::numeric, 2),
  CASE WHEN RANDOM() < 0.32 THEN ROUND((3.5 + RANDOM() * 1.5)::numeric, 1) END,
  CASE WHEN RANDOM() < 0.27 THEN (ARRAY['Bác sĩ tư vấn kỹ, dễ hiểu','Quy trình nhanh gọn','Phòng khám sạch sẽ','Cần cải thiện thời gian chờ'])[(gs % 4)+1] END,
  CASE WHEN RANDOM() < 0.3 THEN NOW() - ((RANDOM() * 40)::INT * INTERVAL '1 day') END,
  NOW() - ((RANDOM() * 180)::INT * INTERVAL '1 day'),
  NOW() - ((RANDOM() * 14)::INT * INTERVAL '1 day')
FROM generate_series(1, $TOTAL_APPOINTMENTS) gs;

INSERT INTO notifications (user_id, user_name, title, message, type, is_read, related_id, related_type, created_at)
SELECT
  a.patient_id,
  a.patient_name,
  CASE
    WHEN a.status = 'CONFIRMED' THEN 'Lịch hẹn đã được xác nhận'
    WHEN a.status = 'COMPLETED' THEN 'Kết quả khám đã cập nhật'
    WHEN a.status = 'CANCELLED' THEN 'Lịch hẹn đã hủy'
    ELSE 'Lịch hẹn mới đã tạo'
  END,
  CONCAT('Mã lịch hẹn #', a.id, ' vào ', a.appointment_date::text, ' lúc ', a.appointment_time::text),
  CASE
    WHEN a.status = 'CONFIRMED' THEN 'APPOINTMENT_CONFIRMED'
    WHEN a.status = 'COMPLETED' THEN 'APPOINTMENT_COMPLETED'
    WHEN a.status = 'CANCELLED' THEN 'APPOINTMENT_CANCELLED'
    ELSE 'APPOINTMENT_CREATED'
  END,
  (RANDOM() < 0.55),
  a.id,
  'APPOINTMENT',
  a.created_at + ((RANDOM() * 6)::INT * INTERVAL '1 hour')
FROM appointments a
WHERE RANDOM() < 0.75;
SQL

echo "==> Seeding medical_service_db"
psql_exec clinic_postgres_medical medical_service_db <<SQL
INSERT INTO medical_records (
  appointment_id, patient_id, doctor_id, patient_name, doctor_name,
  diagnosis, symptoms, treatment_plan, notes, follow_up_date, attachments,
  created_at, updated_at
)
SELECT
  (1 + (RANDOM() * ($TOTAL_APPOINTMENTS - 1))::INT),
  ($PATIENT_START + (RANDOM() * ($TOTAL_PATIENTS - 1))::INT),
  ($DOCTOR_START + (RANDOM() * ($TOTAL_DOCTORS - 1))::INT),
  CONCAT((ARRAY['Nguyen','Tran','Le','Pham'])[(gs % 4)+1], ' ', (ARRAY['Minh','Linh','An','Trang'])[(gs % 4)+1], ' ', (ARRAY['Anh','Binh','Chi','Dung'])[(gs % 4)+1]),
  CONCAT('BS. ', (ARRAY['Nguyen','Tran','Le','Pham'])[(gs % 4)+1], ' ', (ARRAY['Thanh','Thu','Mai','Quoc'])[(gs % 4)+1]),
  (ARRAY['Viêm họng cấp','Tăng huyết áp độ 1','Viêm da dị ứng','Rối loạn tiêu hóa','Đau thắt lưng cơ học'])[(gs % 5)+1],
  (ARRAY['Sốt nhẹ, ho khan','Đau đầu, mệt mỏi','Ngứa da vùng cổ','Đầy bụng, khó tiêu','Đau âm ỉ vùng lưng'])[(gs % 5)+1],
  (ARRAY['Điều trị nội khoa 5-7 ngày','Theo dõi huyết áp tại nhà','Dùng thuốc kháng viêm và tái khám','Điều chỉnh chế độ ăn và vận động'])[(gs % 4)+1],
  (ARRAY['Bệnh nhân hợp tác tốt','Cần tái khám đúng hẹn','Khuyến nghị xét nghiệm thêm'])[(gs % 3)+1],
  CASE WHEN RANDOM() < 0.45 THEN CURRENT_DATE + ((3 + RANDOM() * 21)::INT) END,
  CASE WHEN RANDOM() < 0.2 THEN CONCAT('https://files.healthflow.vn/records/', gs, '.pdf') END,
  NOW() - ((RANDOM() * 200)::INT * INTERVAL '1 day'),
  NOW() - ((RANDOM() * 30)::INT * INTERVAL '1 day')
FROM generate_series(1, $TOTAL_MEDICAL_RECORDS) gs;

WITH meds AS (
  SELECT id, name, default_dosage, default_frequency, default_duration, instructions
  FROM medications
  WHERE is_active = true
), rec AS (
  SELECT id, doctor_id, doctor_name FROM medical_records
)
INSERT INTO prescriptions (
  medical_record_id, doctor_id, doctor_name, medication_name,
  dosage, frequency, duration, instructions, notes, medication_id, created_at
)
SELECT
  r.id,
  r.doctor_id,
  r.doctor_name,
  m.name,
  COALESCE(m.default_dosage, (ARRAY['1 viên','2 viên','5 ml'])[(g.n % 3)+1]),
  COALESCE(m.default_frequency, (ARRAY['Ngày 2 lần','Ngày 3 lần','Khi cần'])[(g.n % 3)+1]),
  COALESCE(m.default_duration, (ARRAY['5 ngày','7 ngày','10 ngày'])[(g.n % 3)+1]),
  COALESCE(m.instructions, 'Uống sau ăn'),
  (ARRAY['Theo dõi phản ứng thuốc','Ngưng thuốc nếu dị ứng','Tái khám nếu không cải thiện'])[(g.n % 3)+1],
  m.id,
  NOW() - ((RANDOM() * 90)::INT * INTERVAL '1 day')
FROM rec r
CROSS JOIN LATERAL generate_series(1, (1 + RANDOM() * 2)::INT) g(n)
CROSS JOIN LATERAL (SELECT * FROM meds ORDER BY RANDOM() LIMIT 1) m;

INSERT INTO health_metrics (
  patient_id, patient_name, metric_type, value, unit, measured_at, notes, created_at, updated_at
)
SELECT
  ($PATIENT_START + (RANDOM() * ($TOTAL_PATIENTS - 1))::INT),
  CONCAT((ARRAY['Nguyen','Tran','Le','Pham'])[(gs % 4)+1], ' ', (ARRAY['Minh','Linh','An','Trang'])[(gs % 4)+1]),
  metric,
  CASE
    WHEN metric = 'BLOOD_PRESSURE' THEN CONCAT((100 + RANDOM()*40)::INT, '/', (60 + RANDOM()*25)::INT)
    WHEN metric = 'HEART_RATE' THEN ((58 + RANDOM()*45)::INT)::TEXT
    WHEN metric = 'BLOOD_GLUCOSE' THEN ROUND((4.0 + RANDOM()*5.2)::numeric, 1)::TEXT
    WHEN metric = 'WEIGHT' THEN ROUND((42 + RANDOM()*45)::numeric, 1)::TEXT
    ELSE ROUND((36.0 + RANDOM()*2.1)::numeric, 1)::TEXT
  END,
  CASE
    WHEN metric = 'BLOOD_PRESSURE' THEN 'mmHg'
    WHEN metric = 'HEART_RATE' THEN 'bpm'
    WHEN metric = 'BLOOD_GLUCOSE' THEN 'mmol/L'
    WHEN metric = 'WEIGHT' THEN 'kg'
    ELSE 'C'
  END,
  NOW() - ((RANDOM() * 200)::INT * INTERVAL '1 day') - ((RANDOM() * 23)::INT * INTERVAL '1 hour'),
  (ARRAY['Đo tại nhà','Đo tại phòng khám','Sau vận động nhẹ','Lúc đói'])[(gs % 4)+1],
  NOW() - ((RANDOM() * 200)::INT * INTERVAL '1 day'),
  NOW() - ((RANDOM() * 5)::INT * INTERVAL '1 day')
FROM generate_series(1, ($TOTAL_PATIENTS * 6)) gs
CROSS JOIN LATERAL (
  SELECT (ARRAY['BLOOD_PRESSURE','HEART_RATE','BLOOD_GLUCOSE','WEIGHT','TEMPERATURE'])[(gs % 5)+1] AS metric
) t;
SQL

echo "==> Seeding consultation_service_db"
psql_exec clinic_postgres_consultation consultation_service_db <<SQL
INSERT INTO consultations (
  patient_id, patient_name, doctor_id, doctor_name, specialization,
  topic, description, status, fee, is_paid, payment_id,
  created_at, updated_at, accepted_at, started_at, completed_at,
  rejection_reason, doctor_notes, diagnosis, prescription, rating, review
)
SELECT
  ($PATIENT_START + (RANDOM() * ($TOTAL_PATIENTS - 1))::INT),
  CONCAT((ARRAY['Nguyen','Tran','Le','Pham'])[(gs % 4)+1], ' ', (ARRAY['Minh','Linh','An','Trang'])[(gs % 4)+1], ' ', (ARRAY['Anh','Binh','Chi','Dung'])[(gs % 4)+1]),
  ($DOCTOR_START + (RANDOM() * ($TOTAL_DOCTORS - 1))::INT),
  CONCAT('BS. ', (ARRAY['Nguyen','Tran','Le','Pham'])[(gs % 4)+1], ' ', (ARRAY['Thanh','Thu','Mai','Quoc'])[(gs % 4)+1]),
  (ARRAY['Nội tổng quát','Tim mạch','Da liễu','Nhi khoa','Nội tiết'])[(gs % 5)+1],
  (ARRAY['Tư vấn đau đầu kéo dài','Tư vấn đọc kết quả xét nghiệm','Tư vấn dị ứng da theo mùa','Tư vấn chế độ dinh dưỡng cho người tiền tiểu đường','Tư vấn mất ngủ'])[(gs % 5)+1],
  (ARRAY['Triệu chứng xuất hiện 3 ngày gần đây, cần tư vấn hướng điều trị','Đã dùng thuốc cơ bản nhưng chưa cải thiện nhiều','Muốn được tư vấn thêm về chế độ sinh hoạt'])[(gs % 3)+1],
  CASE
    WHEN gs % 100 < 12 THEN 'PENDING'
    WHEN gs % 100 < 20 THEN 'ACCEPTED'
    WHEN gs % 100 < 28 THEN 'IN_PROGRESS'
    WHEN gs % 100 < 88 THEN 'COMPLETED'
    WHEN gs % 100 < 94 THEN 'REJECTED'
    ELSE 'CANCELLED'
  END,
  ROUND((90000 + RANDOM() * 260000)::numeric, 2),
  (RANDOM() < 0.78),
  CASE WHEN RANDOM() < 0.78 THEN FORMAT('PAY-CONS-%s', gs) END,
  NOW() - ((RANDOM() * 160)::INT * INTERVAL '1 day'),
  NOW() - ((RANDOM() * 7)::INT * INTERVAL '1 day'),
  NOW() - ((RANDOM() * 150)::INT * INTERVAL '1 day'),
  NOW() - ((RANDOM() * 145)::INT * INTERVAL '1 day'),
  CASE WHEN gs % 100 < 88 THEN NOW() - ((RANDOM() * 130)::INT * INTERVAL '1 day') END,
  CASE WHEN gs % 100 >= 88 AND gs % 100 < 94 THEN (ARRAY['Bác sĩ đang quá tải lịch trực','Triệu chứng không thuộc chuyên khoa hiện tại'])[(gs % 2)+1] END,
  CASE WHEN gs % 100 < 88 THEN (ARRAY['Đã tư vấn phác đồ theo triệu chứng','Khuyến nghị xét nghiệm cận lâm sàng','Theo dõi thêm 5-7 ngày'])[(gs % 3)+1] END,
  CASE WHEN gs % 100 < 88 THEN (ARRAY['Theo dõi đau nửa đầu','Viêm da tiếp xúc','Rối loạn giấc ngủ'])[(gs % 3)+1] END,
  CASE WHEN gs % 100 < 88 THEN (ARRAY['Paracetamol 500mg khi sốt','Cetirizine 10mg mỗi tối','Melatonin 3mg trước ngủ'])[(gs % 3)+1] END,
  CASE WHEN gs % 100 < 70 THEN ROUND((3.5 + RANDOM() * 1.5)::numeric, 1) END,
  CASE WHEN gs % 100 < 70 THEN (ARRAY['Bác sĩ phản hồi nhanh và chi tiết','Tư vấn rõ ràng, dễ hiểu','Cần cải thiện tốc độ phản hồi vào giờ cao điểm'])[(gs % 3)+1] END
FROM generate_series(1, $TOTAL_CONSULTATIONS) gs;

INSERT INTO messages (
  consultation_id, sender_id, sender_name, sender_role,
  type, content, file_url, file_name, file_size, file_mime_type,
  sent_at, is_read, read_at, is_deleted, deleted_at
)
SELECT
  c.id,
  CASE WHEN msg_idx % 2 = 1 THEN c.patient_id ELSE c.doctor_id END,
  CASE WHEN msg_idx % 2 = 1 THEN c.patient_name ELSE c.doctor_name END,
  CASE
    WHEN msg_idx = 1 THEN 'SYSTEM'
    WHEN msg_idx % 2 = 1 THEN 'PATIENT'
    ELSE 'DOCTOR'
  END,
  CASE WHEN msg_idx = 1 THEN 'SYSTEM' ELSE 'TEXT' END,
  CASE
    WHEN msg_idx = 1 THEN CONCAT('Tư vấn #', c.id, ' đã được tạo')
    WHEN msg_idx % 2 = 1 THEN (ARRAY['Em bị đau đầu từ chiều qua','Bác sĩ cho em hỏi có cần làm xét nghiệm không?','Em đã uống thuốc nhưng còn mệt'])[(msg_idx % 3)+1]
    ELSE (ARRAY['Bạn theo dõi thêm 24 giờ','Bạn uống thuốc sau ăn và nghỉ ngơi','Nếu triệu chứng nặng hơn, vào viện ngay'])[(msg_idx % 3)+1]
  END,
  NULL, NULL, NULL, NULL,
  c.created_at + ((msg_idx - 1) * INTERVAL '9 minute'),
  (RANDOM() < 0.83),
  CASE WHEN RANDOM() < 0.8 THEN c.created_at + ((msg_idx) * INTERVAL '10 minute') END,
  FALSE,
  NULL
FROM consultations c
CROSS JOIN LATERAL generate_series(1, (4 + RANDOM() * 8)::INT) msg_idx
WHERE c.status IN ('ACCEPTED','IN_PROGRESS','COMPLETED');
SQL

echo "==> Seeding payment_db"
psql_exec clinic_postgres_payment payment_db <<SQL
INSERT INTO payment_orders (
  order_id, appointment_id, patient_id, doctor_id,
  patient_name, patient_email, patient_phone, doctor_name,
  amount, currency, description, payment_method, status,
  created_at, updated_at, completed_at, expired_at,
  confirmed_by_user_id, confirmed_at, confirmation_note
)
SELECT
  FORMAT('ORD-%s-%s', TO_CHAR(NOW(), 'YYYYMMDD'), LPAD(gs::text, 8, '0')),
  (1 + (RANDOM() * ($TOTAL_APPOINTMENTS - 1))::INT),
  ($PATIENT_START + (RANDOM() * ($TOTAL_PATIENTS - 1))::INT),
  ($DOCTOR_START + (RANDOM() * ($TOTAL_DOCTORS - 1))::INT),
  CONCAT((ARRAY['Nguyen','Tran','Le','Pham'])[(gs % 4)+1], ' ', (ARRAY['Minh','Linh','An','Trang'])[(gs % 4)+1], ' ', (ARRAY['Anh','Binh','Chi','Dung'])[(gs % 4)+1]),
  FORMAT('patient.%s@healthflow.vn', ((gs % $TOTAL_PATIENTS) + 1)),
  FORMAT('09%08s', ((gs % $TOTAL_PATIENTS) + 1)::text),
  CONCAT('BS. ', (ARRAY['Nguyen','Tran','Le','Pham'])[(gs % 4)+1], ' ', (ARRAY['Thanh','Thu','Mai','Quoc'])[(gs % 4)+1]),
  ROUND((120000 + RANDOM() * 1200000)::numeric, 2),
  'VND',
  (ARRAY['Thanh toán khám trực tiếp','Thanh toán tư vấn online','Thanh toán tái khám'])[(gs % 3)+1],
  (ARRAY['MOMO_WALLET','MOMO_ATM','MOMO_CREDIT','MOMO_QR','CASH','BANK_TRANSFER','CARD_AT_COUNTER'])[(gs % 7)+1],
  CASE
    WHEN gs % 100 < 62 THEN 'COMPLETED'
    WHEN gs % 100 < 74 THEN 'PENDING'
    WHEN gs % 100 < 81 THEN 'PROCESSING'
    WHEN gs % 100 < 88 THEN 'FAILED'
    WHEN gs % 100 < 93 THEN 'EXPIRED'
    WHEN gs % 100 < 97 THEN 'REFUNDED'
    ELSE 'PARTIALLY_REFUNDED'
  END,
  NOW() - ((RANDOM() * 180)::INT * INTERVAL '1 day'),
  NOW() - ((RANDOM() * 4)::INT * INTERVAL '1 day'),
  CASE WHEN gs % 100 < 62 THEN NOW() - ((RANDOM() * 170)::INT * INTERVAL '1 day') END,
  CASE WHEN gs % 100 >= 88 AND gs % 100 < 93 THEN NOW() - ((RANDOM() * 30)::INT * INTERVAL '1 day') END,
  CASE
    WHEN (ARRAY['MOMO_WALLET','MOMO_ATM','MOMO_CREDIT','MOMO_QR','CASH','BANK_TRANSFER','CARD_AT_COUNTER'])[(gs % 7)+1] IN ('CASH','BANK_TRANSFER','CARD_AT_COUNTER')
         AND gs % 100 < 70
      THEN ($RECEPTIONIST_START + (RANDOM() * ($TOTAL_RECEPTIONISTS - 1))::INT)
  END,
  CASE
    WHEN (ARRAY['MOMO_WALLET','MOMO_ATM','MOMO_CREDIT','MOMO_QR','CASH','BANK_TRANSFER','CARD_AT_COUNTER'])[(gs % 7)+1] IN ('CASH','BANK_TRANSFER','CARD_AT_COUNTER')
         AND gs % 100 < 70
      THEN NOW() - ((RANDOM() * 140)::INT * INTERVAL '1 day')
  END,
  CASE
    WHEN (ARRAY['MOMO_WALLET','MOMO_ATM','MOMO_CREDIT','MOMO_QR','CASH','BANK_TRANSFER','CARD_AT_COUNTER'])[(gs % 7)+1] IN ('CASH','BANK_TRANSFER','CARD_AT_COUNTER')
         AND gs % 100 < 70
      THEN (ARRAY['Đã thu tại quầy','Khách chuyển khoản thành công','Xác nhận thanh toán thẻ'])[(gs % 3)+1]
  END
FROM generate_series(1, $TOTAL_PAYMENT_ORDERS) gs;

INSERT INTO payment_transactions (
  payment_order_id, partner_code, request_id, trans_id,
  request_type, amount, order_info, redirect_url, ipn_url,
  pay_url, deeplink, qr_code_url,
  signature, request_signature, result_code, message,
  created_at, updated_at
)
SELECT
  p.id,
  'MOMO',
  FORMAT('REQ-%s-%s', TO_CHAR(NOW(), 'YYMMDD'), LPAD(p.id::text, 10, '0')),
  CASE WHEN p.status IN ('COMPLETED','REFUNDED','PARTIALLY_REFUNDED') THEN (100000000000 + p.id) END,
  CASE
    WHEN p.payment_method = 'MOMO_WALLET' THEN 'captureWallet'
    WHEN p.payment_method = 'MOMO_ATM' THEN 'payWithATM'
    WHEN p.payment_method = 'MOMO_CREDIT' THEN 'payWithCredit'
    WHEN p.payment_method = 'MOMO_QR' THEN 'payWithQRCode'
    ELSE 'counter'
  END,
  p.amount::BIGINT,
  p.description,
  'http://localhost:5173/payment/result',
  'http://localhost:8084/api/payments/callback',
  CASE WHEN p.payment_method LIKE 'MOMO_%' THEN CONCAT('https://momo.vn/pay/', p.order_id) END,
  CASE WHEN p.payment_method LIKE 'MOMO_%' THEN CONCAT('momo://payment/', p.order_id) END,
  CASE WHEN p.payment_method LIKE 'MOMO_%' THEN CONCAT('https://img.momo.vn/qr/', p.order_id, '.png') END,
  md5(p.order_id || 'sig'),
  md5(p.order_id || 'reqsig'),
  CASE
    WHEN p.status IN ('COMPLETED','REFUNDED','PARTIALLY_REFUNDED') THEN 0
    WHEN p.status = 'PENDING' THEN 1000
    WHEN p.status = 'PROCESSING' THEN 7000
    WHEN p.status = 'EXPIRED' THEN 1006
    ELSE 99
  END,
  CASE
    WHEN p.status IN ('COMPLETED','REFUNDED','PARTIALLY_REFUNDED') THEN 'Success'
    WHEN p.status = 'PENDING' THEN 'Pending payment'
    WHEN p.status = 'PROCESSING' THEN 'Processing'
    WHEN p.status = 'EXPIRED' THEN 'Expired'
    ELSE 'Payment failed'
  END,
  p.created_at + ((RANDOM() * 3)::INT * INTERVAL '1 hour'),
  p.updated_at
FROM payment_orders p
WHERE p.payment_method LIKE 'MOMO_%' OR p.status IN ('FAILED','EXPIRED');

INSERT INTO refund_transactions (
  payment_order_id, payment_transaction_id, refund_id, trans_id,
  amount, reason, result_code, message, status,
  created_at, updated_at, completed_at
)
SELECT
  p.id,
  t.id,
  FORMAT('RF-%s-%s', TO_CHAR(NOW(), 'YYMMDD'), LPAD(p.id::text, 10, '0')),
  COALESCE(t.trans_id, 100000000000 + p.id),
  CASE WHEN p.status = 'REFUNDED' THEN p.amount ELSE ROUND((p.amount * (0.2 + RANDOM() * 0.6))::numeric, 2) END,
  (ARRAY['Khách đổi lịch khám','Bác sĩ hủy lịch đột xuất','Thanh toán trùng đơn'])[(p.id % 3)+1],
  0,
  'Refund successful',
  'COMPLETED',
  p.updated_at,
  p.updated_at,
  p.updated_at + ((RANDOM() * 4)::INT * INTERVAL '1 hour')
FROM payment_orders p
JOIN payment_transactions t ON t.payment_order_id = p.id
WHERE p.status IN ('REFUNDED', 'PARTIALLY_REFUNDED');
SQL

echo "==> Summary counts"
psql_exec clinic_postgres_user user_service_db <<'SQL'
SELECT 'users' AS table_name, COUNT(*) FROM users
UNION ALL SELECT 'family_members', COUNT(*) FROM family_members
UNION ALL SELECT 'verification_codes', COUNT(*) FROM verification_codes
UNION ALL SELECT 'password_reset_tokens', COUNT(*) FROM password_reset_tokens
ORDER BY table_name;
SQL

psql_exec clinic_postgres_appointment appointment_service_db <<'SQL'
SELECT 'clinics' AS table_name, COUNT(*) FROM clinics
UNION ALL SELECT 'rooms', COUNT(*) FROM rooms
UNION ALL SELECT 'medical_services', COUNT(*) FROM medical_services
UNION ALL SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
ORDER BY table_name;
SQL

psql_exec clinic_postgres_medical medical_service_db <<'SQL'
SELECT 'medical_records' AS table_name, COUNT(*) FROM medical_records
UNION ALL SELECT 'prescriptions', COUNT(*) FROM prescriptions
UNION ALL SELECT 'health_metrics', COUNT(*) FROM health_metrics
ORDER BY table_name;
SQL

psql_exec clinic_postgres_consultation consultation_service_db <<'SQL'
SELECT 'consultations' AS table_name, COUNT(*) FROM consultations
UNION ALL SELECT 'messages', COUNT(*) FROM messages
ORDER BY table_name;
SQL

psql_exec clinic_postgres_payment payment_db <<'SQL'
SELECT 'payment_orders' AS table_name, COUNT(*) FROM payment_orders
UNION ALL SELECT 'payment_transactions', COUNT(*) FROM payment_transactions
UNION ALL SELECT 'refund_transactions', COUNT(*) FROM refund_transactions
ORDER BY table_name;
SQL

echo "==> Done. Profile: $PROFILE"
