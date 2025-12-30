# 🚀 HƯỚNG DẪN NHANH - HealthFlow Frontend

## Bước 1: Cài đặt

```bash
cd clinic-booking-frontend
npm install
```

## Bước 2: Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: **http://localhost:3000**

## Bước 3: Đăng nhập và test

### 🏥 Tài khoản Patient (Bệnh nhân)
```
Email: john.anderson@email.com
Password: password
```

**Các tính năng có thể test:**
- ✅ Dashboard với tổng quan appointments, medical records
- ✅ Đặt lịch hẹn (Book Appointment) - Multi-step flow đầy đủ
- ✅ Xem danh sách doctors với filter
- ✅ Chọn ngày giờ khám
- ✅ Dark mode toggle
- ✅ Responsive design (thử resize browser)

### 👨‍⚕️ Tài khoản Doctor (Bác sĩ)
```
Email: sarah.mitchell@healthflow.com
Password: password
```

**Ghi chú:** Dashboard và features của doctor chưa được implement hoàn toàn (sẽ hiện "Coming Soon")

### 👑 Tài khoản Admin
```
Email: admin@healthflow.com
Password: password
```

**Ghi chú:** Admin features chưa được implement (sẽ hiện "Coming Soon")

## 🎨 Các tính năng để khám phá

### 1. Landing Page
- Mở http://localhost:3000 (không cần login)
- Hero section với animations
- Features showcase
- Testimonials
- Call-to-action

### 2. Book Appointment Flow
1. Login với tài khoản patient
2. Click "Book Appointment" button trên dashboard
3. **Bước 1:** Chọn doctor (có thể search và filter)
4. **Bước 2:** Chọn ngày trong 7 ngày tới, sau đó chọn giờ
5. **Bước 3:** Điền lý do khám, chọn loại hình (In-Person/Video)
6. **Bước 4:** Review và confirm

### 3. Dark Mode
- Click icon Moon/Sun ở góc phải navbar
- Toàn bộ app chuyển theme

### 4. Responsive Design
- Thử resize browser window
- Sidebar sẽ collapse trên mobile
- Layout tự động adjust

## 📁 Files quan trọng cần biết

### Mock API
- `src/api/mockData.js` - Tất cả dữ liệu mẫu
- `src/api/mockApi.js` - API functions (có delay để giống thật)

### Components
- `src/components/ui/` - Thư viện UI components
- `src/components/layout/` - Navbar, Sidebar, Layout wrappers

### Pages
- `src/pages/LandingPage.jsx` - Trang chủ
- `src/pages/auth/LoginPage.jsx` - Đăng nhập
- `src/pages/patient/PatientDashboard.jsx` - Dashboard bệnh nhân
- `src/pages/patient/BookAppointment.jsx` - Đặt lịch

### State Management
- `src/store/authStore.js` - Authentication state
- `src/store/uiStore.js` - UI state (theme, toasts, modals)

## 🎯 Checklist để test toàn bộ app

- [ ] Mở landing page, scroll qua các sections
- [ ] Click "Get Started" → Đăng ký tài khoản mới
- [ ] Đăng nhập với patient account
- [ ] Xem dashboard với stats và upcoming appointments
- [ ] Click "Book Appointment"
- [ ] Chọn 1 doctor (thử search "Cardiology")
- [ ] Chọn ngày và giờ
- [ ] Điền thông tin và confirm booking
- [ ] Thử toggle dark mode
- [ ] Logout và login lại (data vẫn giữ nhờ localStorage)
- [ ] Thử trên mobile/tablet (resize browser)

## 🔧 Tùy chỉnh

### Thay đổi màu sắc
Edit `tailwind.config.js` - section `theme.extend.colors`

### Thay đổi fonts
Edit `index.html` - Google Fonts import
Edit `tailwind.config.js` - fontFamily

### Thêm mock data
Edit `src/api/mockData.js` - thêm doctors, appointments, etc.

### Kết nối backend thực
Edit `src/api/mockApi.js` - thay mock functions bằng fetch/axios calls

## 📊 Build production

```bash
npm run build
```

Files sẽ được tạo trong folder `dist/`

## ❓ Troubleshooting

### Lỗi khi install
```bash
# Thử xóa node_modules và install lại
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 đã được sử dụng
Edit `vite.config.js` - đổi port sang 3001 hoặc số khác

### Lỗi "Module not found"
```bash
# Kiểm tra đã install đủ dependencies
npm install
```

## 💡 Tips

1. **Mở DevTools** (F12) để xem console logs và network requests
2. **Dữ liệu persist** trong localStorage - có thể xóa trong DevTools → Application → Local Storage
3. **Hot reload** - code changes tự động reload browser
4. **Mock API delays** - có thể chỉnh trong `mockApi.js` function `delay()`

## 📞 Support

Nếu có vấn đề, check:
1. Console logs trong browser DevTools
2. Terminal nơi chạy `npm run dev`
3. README.md và PROJECT_SUMMARY.md

---

**Chúc bạn khám phá vui vẻ! 🎉**
