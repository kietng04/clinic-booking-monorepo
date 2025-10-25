# FIX_503_ADMIN_ANALYTICS

Muc tieu: sua loi toast do `"An unexpected error occurred..."` tren Admin Dashboard (thuong do 503 transient tu analytics endpoint), de UI on dinh hon.

## Root cause (tom tat)
- Admin dashboard goi 2 endpoint:
  - `GET /api/statistics/aggregate/dashboard`
  - `GET /api/statistics/aggregate/analytics/admin/dashboard`
- Khi mot service phu (vd `user-service`/`medical-service`) restart hoac gateway dang khoi dong, request analytics co the tra ve `503` trong thoi gian ngan.
- Truoc day frontend coi day la loi chung va show toast do.

## Fix
- Frontend: neu gap `503` thi KHONG show toast do; hien banner xanh "Dang tai lai du lieu..." va tu dong retry (exponential backoff + auto retry vong lap).
- Backend (appointment-service): bat circuit breaker cho Feign + fallback cho `medical-service` (giam do vo, on dinh hon khi service phu bi down).

## 1) Rebuild backend (chi can 1 lan)
```bash
cd clinic-booking-system

# Neu co Maven wrapper:
./mvnw clean package -DskipTests -pl appointment-service -am

# Rebuild + restart rieng appointment-service
docker compose up -d --build appointment-service
```

## 2) Test frontend
```bash
cd clinic-booking-systemc-frontend
npm run dev

# Login as admin -> Dashboard -> verify KHONG con toast do 503
```

## 3) Simulate transient error (optional)
```bash
cd clinic-booking-system

# Stop user-service briefly
docker compose stop user-service
sleep 2
docker compose start user-service

# Trong luc restart: mo Admin Dashboard
# Mong doi: thay banner xanh retry, KHONG thay toast do
```

## 4) Load test nhanh (optional)
Can admin token hop le.

```bash
# API gateway
export BASE_URL=http://localhost:8080
export ADMIN_TOKEN="<paste_admin_jwt_here>"

# Hit endpoint 20 lan song song, thong ke status codes
seq 1 20 | xargs -n1 -P20 -I{} bash -lc 'curl -s -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer '$ADMIN_TOKEN'" \
  "$BASE_URL/api/statistics/aggregate/analytics/admin/dashboard"' \
  | sort | uniq -c
```

Ket qua mong doi:
- Chu yeu la `200`.
- Neu co 1 vai `503` trong luc service restart: frontend se tu retry va UI van on dinh (banner xanh).
