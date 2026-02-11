# Huong Dan Migrate Docker Images Sang May Khac

Tai lieu nay huong dan export/import toan bo Docker images cua he thong `clinic-booking-system` tu may nguon sang may dich.

## 1. Muc tieu

- Lay tat ca images dang duoc su dung boi `docker-compose.yml` hien tai.
- Dong goi thanh 1 file `.tar`.
- Chuyen file sang may khac va `docker load` de chay khong can build lai.

## 2. Yeu cau

- May nguon va may dich da cai Docker.
- Co source code project `clinic-booking-system`.
- Co quyen chay lenh `docker`.

## 3. Tren may nguon (export images)

Chay trong thu muc project:

```bash
cd /home/ubuntu/clinic-projects/clinic-booking-system
```

Tao thu muc bundle va export:

```bash
TS=$(date +%Y%m%d-%H%M%S)
OUT_DIR=/home/ubuntu/clinic-projects/migration-bundles/$TS
mkdir -p "$OUT_DIR"

# Lay danh sach image tu cac container cua compose hien tai
docker compose -f docker-compose.yml ps -q \
  | xargs -r docker inspect --format '{{.Config.Image}}' \
  | sort -u > "$OUT_DIR/images.txt"

# Dong goi tat ca images vao 1 file tar
docker save -o "$OUT_DIR/clinic-images.tar" $(cat "$OUT_DIR/images.txt")

# Nen nhe de copy nhanh hon
gzip -1 "$OUT_DIR/clinic-images.tar"

ls -lh "$OUT_DIR"
```

Ket qua:
- `images.txt`: danh sach image da export
- `clinic-images.tar.gz`: file de chuyen sang may khac

## 4. Copy bundle sang may dich

Vi du dung `scp`:

```bash
scp /home/ubuntu/clinic-projects/migration-bundles/<timestamp>/clinic-images.tar.gz <user>@<target-host>:/tmp/
scp /home/ubuntu/clinic-projects/migration-bundles/<timestamp>/images.txt <user>@<target-host>:/tmp/
```

## 5. Tren may dich (import images)

```bash
gunzip -k /tmp/clinic-images.tar.gz
docker load -i /tmp/clinic-images.tar
```

Kiem tra images da co:

```bash
cat /tmp/images.txt
docker images
```

## 6. Chay he thong tren may dich

Trong thu muc project tren may dich:

```bash
cd <path-to>/clinic-booking-system
docker compose -f docker-compose.yml up -d --no-build
docker compose -f docker-compose.yml ps
```

`--no-build` dam bao dung image da import, khong build lai.

## 7. Kiem tra nhanh sau migrate

```bash
curl -f http://localhost:8080/actuator/health
curl -f http://localhost:8081/actuator/health
curl -f http://localhost:8082/actuator/health
curl -f http://localhost:8083/actuator/health
curl -f http://localhost:8084/actuator/health
curl -f http://localhost:8085/actuator/health
```

Neu can migrate du lieu PostgreSQL, dung them bo backup SQL/BAK da tao rieng (khong nam trong image tar).
