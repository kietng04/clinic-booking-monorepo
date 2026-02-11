#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: scripts/seed_e2e_accounts.sh [--help]

Create/refresh deterministic E2E accounts after DB reset.

This script is idempotent and safe to run multiple times.
It seeds the following users in user_service_db:
  - patient1@clinic.com
  - dr.sarah@clinic.com
  - admin@clinic.com

Env overrides:
  USER_DB_CONTAINER   (default: clinic_postgres_user)
  USER_DB_NAME        (default: user_service_db)
  USER_DB_USER        (default: postgres)
USAGE
}

for arg in "$@"; do
  case "$arg" in
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

USER_DB_CONTAINER="${USER_DB_CONTAINER:-clinic_postgres_user}"
USER_DB_NAME="${USER_DB_NAME:-user_service_db}"
USER_DB_USER="${USER_DB_USER:-postgres}"

# bcrypt("password")
PASSWORD_HASH='$2b$12$mkFwwmp16oiGSdmQ2aTVau995iIZPlvFl/kRKyKh5RHn9CL7rOOfe'

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

if ! docker ps --format '{{.Names}}' | rg -q "^${USER_DB_CONTAINER}$"; then
  echo "Container not running: ${USER_DB_CONTAINER}" >&2
  exit 1
fi

docker exec -i "$USER_DB_CONTAINER" psql -U "$USER_DB_USER" -d "$USER_DB_NAME" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO users (
  email, phone, password, full_name, date_of_birth, gender, role,
  avatar_url, avatar_public_id, specialization, license_number, workplace,
  experience_years, rating, consultation_fee,
  is_active, email_verified, phone_verified, created_at, updated_at
)
VALUES
(
  'patient1@clinic.com',
  '0909999001',
  '$PASSWORD_HASH',
  'Nguyen Van A',
  DATE '1990-05-15',
  'MALE',
  'PATIENT',
  'https://i.pravatar.cc/300?img=11',
  'healthflow/avatars/e2e_patient',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  TRUE,
  TRUE,
  TRUE,
  NOW(),
  NOW()
),
(
  'dr.sarah@clinic.com',
  '0909999002',
  '$PASSWORD_HASH',
  'Dr. Sarah Johnson',
  DATE '1985-03-20',
  'FEMALE',
  'DOCTOR',
  'https://i.pravatar.cc/300?img=32',
  'healthflow/avatars/e2e_doctor',
  'Noi tong quat',
  'LIC-E2E-0001',
  'HealthFlow Clinic 1',
  10,
  4.7,
  250000,
  TRUE,
  TRUE,
  TRUE,
  NOW(),
  NOW()
),
(
  'admin@clinic.com',
  '0909999003',
  '$PASSWORD_HASH',
  'Admin System',
  DATE '1980-01-01',
  'OTHER',
  'ADMIN',
  'https://i.pravatar.cc/300?img=48',
  'healthflow/avatars/e2e_admin',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  TRUE,
  TRUE,
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (email)
DO UPDATE SET
  phone = EXCLUDED.phone,
  password = EXCLUDED.password,
  full_name = EXCLUDED.full_name,
  date_of_birth = EXCLUDED.date_of_birth,
  gender = EXCLUDED.gender,
  role = EXCLUDED.role,
  avatar_url = EXCLUDED.avatar_url,
  avatar_public_id = EXCLUDED.avatar_public_id,
  specialization = EXCLUDED.specialization,
  license_number = EXCLUDED.license_number,
  workplace = EXCLUDED.workplace,
  experience_years = EXCLUDED.experience_years,
  rating = EXCLUDED.rating,
  consultation_fee = EXCLUDED.consultation_fee,
  is_active = TRUE,
  email_verified = TRUE,
  phone_verified = TRUE,
  updated_at = NOW();
SQL

echo "Seeded deterministic E2E accounts in ${USER_DB_NAME}"
