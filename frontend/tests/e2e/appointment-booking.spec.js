import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const API_ORIGIN = 'http://localhost:8080';

// Test credentials
const PATIENT_EMAIL = 'john.anderson@email.com';
const PATIENT_PASSWORD = 'password';
const DOCTOR_EMAIL = 'sarah.mitchell@healthflow.com';
const DOCTOR_PASSWORD = 'password';

test.describe('E2E: Appointment Booking Flow - Bệnh Nhân & Bác Sĩ', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    await installApiMocks(page);
  });

  test.describe('Bước 1: Bệnh Nhân Đăng Nhập', () => {
    test('đăng nhập thành công với tài khoản bệnh nhân', async ({ page }) => {
      await loginAsPatient(page);

      // Kiểm tra dashboard hiển thị (sidebar có mục "Đặt lịch khám")
      await expect(page.getByRole('link', { name: /Đặt lịch khám/i }).first()).toBeVisible();
    });
  });

  test.describe('Bước 2: Duyệt Danh Sách Bác Sĩ', () => {
    test('hiển thị danh sách bác sĩ và lọc theo chuyên khoa', async ({ page }) => {
      // Đăng nhập trước
      await loginAsPatient(page);

      // Click vào "Đặt Lịch Khám" hoặc "Tìm Bác Sĩ"
      await navigateToBooking(page);

      // Chờ trang tải
      await page.waitForURL(/.*appointments\/book|find-doctors/);

      // Kiểm tra danh sách bác sĩ hiển thị
      const selectButtons = page.getByRole('button', { name: /^Chọn$/ });
      await expect(selectButtons.first()).toBeVisible();

      // Log: số bác sĩ
      const count = await selectButtons.count();
      console.log(`✅ Tìm thấy ${count} bác sĩ (nút "Chọn")`);
    });

    test('tìm kiếm bác sĩ theo tên', async ({ page }) => {
      await loginAsPatient(page);
      await navigateToBooking(page);

      // Tìm input search
      const searchInput = page.locator('input[placeholder*="Tìm theo tên"], input[placeholder*="chuyên khoa"]').first();
      await expect(searchInput).toBeVisible();

      await searchInput.fill('Sarah');
      await page.waitForTimeout(300);

      // Kiểm tra kết quả lọc
      await expect(page.getByText(/Sarah/i).first()).toBeVisible();
      console.log('✅ Tìm kiếm bác sĩ thành công');
    });
  });

  test.describe('Bước 3: Chọn Bác Sĩ & Ngày Giờ', () => {
    test('chọn bác sĩ và tiến tới bước chọn ngày giờ', async ({ page }) => {
      await loginAsPatient(page);
      await navigateToBooking(page);

      // Click vào bác sĩ đầu tiên
      const firstDoctor = page.getByRole('button', { name: /^Chọn$/ }).first();
      await expect(firstDoctor).toBeVisible();
      await firstDoctor.click();

      // Step 2: date/time selection
      await expect(page.getByText(/Chọn Ngày/i).first()).toBeVisible();
      console.log('✅ Chọn bác sĩ thành công');
    });

    test('chọn ngày khám hợp lệ', async ({ page }) => {
      await loginAsPatient(page);
      await navigateToBooking(page);

      // Chọn bác sĩ trước
      await page.getByRole('button', { name: /^Chọn$/ }).first().click();

      // Chọn ngày (UI là grid button, không phải input[type=date])
      const dayButtons = page.locator('h4:has-text("Chọn Ngày")').locator('..').locator('button');
      await expect(dayButtons.first()).toBeVisible();
      await dayButtons.first().click();

      // Kiểm tra time slots hiển thị
      const timeSlots = page.getByRole('button', { name: /\b\d{2}:\d{2}\b/ });
      await expect(timeSlots.first()).toBeVisible();
      const count = await timeSlots.count();
      console.log(`✅ Tìm thấy ${count} khung giờ khám`);
    });

    test('chọn khung giờ khám', async ({ page }) => {
      await loginAsPatient(page);
      await navigateToBooking(page);

      // Chọn bác sĩ + ngày trước
      await page.getByRole('button', { name: /^Chọn$/ }).first().click();
      const dayButtons = page.locator('h4:has-text("Chọn Ngày")').locator('..').locator('button');
      await expect(dayButtons.first()).toBeVisible();
      await dayButtons.first().click();

      // Chọn khung giờ
      const timeSlot = page.getByRole('button', { name: /\b\d{2}:\d{2}\b/ }).first();
      await expect(timeSlot).toBeVisible();
      await timeSlot.click();
      await expect(page.getByText(/Thông tin Chi tiết/i).first()).toBeVisible();
      console.log('✅ Chọn khung giờ thành công');
    });
  });

  test.describe('Bước 4: Nhập Thông Tin Chi Tiết', () => {
    test('điền lý do khám', async ({ page }) => {
      await loginAsPatient(page);
      await navigateToBookingEnd(page);

      const reasonInput = page.locator('label:has-text("Lý do khám bệnh")').locator('..').locator('input');
      await expect(reasonInput).toBeVisible();
      await reasonInput.fill('Đau đầu và mệt mỏi');
      console.log('✅ Nhập lý do khám thành công');
    });

    test('chọn loại khám (Trực tiếp/Video)', async ({ page }) => {
      await loginAsPatient(page);
      await navigateToBookingEnd(page);

      // Tìm radio buttons hoặc buttons cho loại khám
      const inPersonBtn = page.getByRole('button', { name: /Trực tiếp/i }).first();
      const videoBtn = page.getByRole('button', { name: /Gọi video/i }).first();

      await expect(inPersonBtn).toBeVisible();
      await inPersonBtn.click();
      console.log('✅ Chọn khám trực tiếp thành công');

      await expect(videoBtn).toBeVisible();
      await videoBtn.click();
      console.log('✅ Chọn khám video thành công');
    });

    test('nhập ghi chú bổ sung', async ({ page }) => {
      await loginAsPatient(page);
      await navigateToBookingEnd(page);

      const notesInput = page.locator('textarea[placeholder*="additional information"]').first();
      await expect(notesInput).toBeVisible();
      await notesInput.fill('Tôi có tiền sử dị ứng với Penicillin');
      console.log('✅ Nhập ghi chú thành công');
    });
  });

  test.describe('Bước 5: Xác Nhận Đặt Lịch', () => {
    test('xem lại thông tin trước khi xác nhận', async ({ page }) => {
      await loginAsPatient(page);
      await navigateToBookingEnd(page);
      await fillBookingDetails(page);

      // Qua step 4 (xác nhận)
      await page.getByRole('button', { name: /Tiếp tục/i }).click();
      await expect(page.getByText(/Xem lại chi tiết đặt lịch/i).first()).toBeVisible();
      console.log('✅ Hiển thị thông tin xác nhận');
    });

    test('xác nhận đặt lịch thành công', async ({ page }) => {
      await loginAsPatient(page);
      await navigateToBookingEnd(page);
      await fillBookingDetails(page);

      await page.getByRole('button', { name: /Tiếp tục/i }).click();
      await expect(page.getByText(/Xem lại chi tiết đặt lịch/i).first()).toBeVisible();

      // Click nút xác nhận cuối cùng
      await page.getByRole('button', { name: /Xác nhận/i }).last().click();

      // Redirect tới /appointments
      await page.waitForURL(/\/appointments/);
      await expect(page.getByRole('heading', { name: /Lịch hẹn của tôi/i })).toBeVisible();
      console.log('✅ Đặt lịch khám thành công!');
    });
  });

  test.describe('Bước 6: Bác Sĩ Quản Lý Lịch Hẹn', () => {
    test('bác sĩ đăng nhập và xem lịch hẹn', async ({ page }) => {
      await loginAsDoctor(page);
      await expect(page.getByRole('link', { name: /Lịch hẹn/i }).first()).toBeVisible();
      console.log('✅ Bác sĩ đăng nhập thành công');
    });

    test('bác sĩ xem danh sách lịch hẹn hôm nay', async ({ page }) => {
      await loginAsDoctor(page);

      // Navigate to appointments
      await page.getByRole('link', { name: /Lịch hẹn/i }).first().click();
      await page.waitForURL(/\/doctor\/appointments/);

      // Kiểm tra tab "Hôm nay"
      const todayTab = page.getByRole('button', { name: /Hôm nay/i }).first();
      await expect(todayTab).toBeVisible();
      await todayTab.click();
      console.log('✅ Xem lịch hẹn hôm nay');
    });

    test('bác sĩ xem chi tiết lịch hẹn bệnh nhân', async ({ page }) => {
      await loginAsDoctor(page);

      // Navigate to appointments
      await page.getByRole('link', { name: /Lịch hẹn/i }).first().click();
      await page.waitForURL(/\/doctor\/appointments/);

      // Nếu có card, click và kiểm tra có text cơ bản
      const appointmentCard = page.locator('h3').filter({ hasText: /Bệnh nhân/i }).first();
      if (await appointmentCard.isVisible().catch(() => false)) {
        await appointmentCard.click();
        await page.waitForTimeout(300);
        const details = page.locator('text=Bệnh nhân, text=Lý do, text=Ngày');
        if (await details.first().isVisible().catch(() => false)) {
          console.log('✅ Xem chi tiết lịch hẹn thành công');
        }
      }
    });

    test('bác sĩ xác nhận lịch hẹn', async ({ page }) => {
      await loginAsDoctor(page);

      // Navigate to appointments
      await page.getByRole('link', { name: /Lịch hẹn/i }).first().click();
      await page.waitForURL(/\/doctor\/appointments/);

      // Tìm nút xác nhận
      const confirmBtn = page.locator('button:has-text("Xác nhận"), button:has-text("Confirm")').first();
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
        await page.waitForTimeout(500);

        // Kiểm tra success
        const successMsg = page.locator('text=thành công, text=confirmed, text=Đã xác nhận');
        if (await successMsg.first().isVisible().catch(() => false)) {
          console.log('✅ Bác sĩ xác nhận lịch hẹn thành công');
        }
      }
    });

    test('bác sĩ xem danh sách bệnh nhân', async ({ page }) => {
      await loginAsDoctor(page);

      // Navigate to patients
      const patientsLink = page.locator('a:has-text("Bệnh nhân"), a:has-text("Patients")').first();
      if (await patientsLink.isVisible()) {
        await patientsLink.click();
        await page.waitForTimeout(500);

        // Kiểm tra danh sách
        const patientList = page.locator('[data-testid="patient-card"], .patient-card, .p-4:has-text("Bệnh nhân")');
        if (await patientList.first().isVisible()) {
          console.log('✅ Xem danh sách bệnh nhân thành công');
        }
      }
    });
  });

  test.describe('Bước 7: Bệnh Nhân Kiểm Tra Lịch Hẹn', () => {
    test('bệnh nhân xem lịch hẹn đã đặt', async ({ page }) => {
      await loginAsPatient(page);

      // Navigate to appointments
      const appointmentsLink = page.locator('a:has-text("Lịch hẹn"), a:has-text("Appointments")').first();
      if (await appointmentsLink.isVisible()) {
        await appointmentsLink.click();
        await page.waitForTimeout(500);

        // Kiểm tra danh sách
        const appointments = page.locator('[data-testid="appointment-card"], .appointment-card');
        if (await appointments.first().isVisible()) {
          console.log('✅ Bệnh nhân xem danh sách lịch hẹn');
        }
      }
    });

    test('bệnh nhân xem chi tiết lịch hẹn', async ({ page }) => {
      await loginAsPatient(page);

      const appointmentsLink = page.locator('a:has-text("Lịch hẹn")').first();
      if (await appointmentsLink.isVisible()) {
        await appointmentsLink.click();
        await page.waitForTimeout(500);
      }

      // Click vào appointment
      const appointmentCard = page.locator('[data-testid="appointment-card"], .appointment-card').first();
      if (await appointmentCard.isVisible()) {
        await appointmentCard.click();
        await page.waitForTimeout(500);

        // Kiểm tra detail page
        const details = page.locator('text=Bác sĩ, text=Ngày, text=Giờ');
        if (await details.first().isVisible()) {
          console.log('✅ Xem chi tiết lịch hẹn thành công');
        }
      }
    });

    test('bệnh nhân hủy hoặc sửa lịch hẹn (nếu khả dụng)', async ({ page }) => {
      await loginAsPatient(page);

      const appointmentsLink = page.locator('a:has-text("Lịch hẹn")').first();
      if (await appointmentsLink.isVisible()) {
        await appointmentsLink.click();
        await page.waitForTimeout(500);
      }

      // Tìm nút hủy/sửa
      const actionBtn = page.locator('button:has-text("Hủy"), button:has-text("Sửa"), button:has-text("Reschedule")').first();
      if (await actionBtn.isVisible()) {
        const btnText = await actionBtn.textContent();
        console.log(`✅ Tìm thấy nút: ${btnText}`);
      }
    });
  });
});

// ========== Helper Functions ==========

async function loginAsPatient(page) {
  await page.goto(`${BASE_URL}/login`);
  await expect(page.getByRole('heading', { name: /Chào mừng trở lại/i })).toBeVisible();

  // Ưu tiên quick login để tránh phụ thuộc backend.
  const quickLoginContainer = page.getByText('Đăng nhập nhanh để Demo:').locator('..');
  const quickBtn = quickLoginContainer.getByRole('button', { name: 'Bệnh nhân' });
  if (await quickBtn.isVisible().catch(() => false)) {
    await quickBtn.click();
  } else {
    // Fallback: login form (Input type="text" cho Email hoặc Số điện thoại)
    const emailInput = page.locator('label:has-text("Email hoặc Số điện thoại")').locator('..').locator('input');
    const passwordInput = page.locator('label:has-text("Mật khẩu")').locator('..').locator('input');
    await emailInput.fill(PATIENT_EMAIL);
    await passwordInput.fill(PATIENT_PASSWORD);
    await page.getByRole('button', { name: /Đăng nhập/i }).click();
  }

  await page.waitForURL(/\/dashboard/);
}

async function loginAsDoctor(page) {
  await page.goto(`${BASE_URL}/login`);
  await expect(page.getByRole('heading', { name: /Chào mừng trở lại/i })).toBeVisible();

  const quickLoginContainer = page.getByText('Đăng nhập nhanh để Demo:').locator('..');
  const quickBtn = quickLoginContainer.getByRole('button', { name: 'Bác sĩ' });
  if (await quickBtn.isVisible().catch(() => false)) {
    await quickBtn.click();
  } else {
    const emailInput = page.locator('label:has-text("Email hoặc Số điện thoại")').locator('..').locator('input');
    const passwordInput = page.locator('label:has-text("Mật khẩu")').locator('..').locator('input');
    await emailInput.fill(DOCTOR_EMAIL);
    await passwordInput.fill(DOCTOR_PASSWORD);
    await page.getByRole('button', { name: /Đăng nhập/i }).click();
  }

  await page.waitForURL(/\/dashboard|\/doctor/);
}

async function navigateToBooking(page) {
  const bookingLink = page.getByRole('link', { name: /Đặt lịch khám/i }).first();
  await expect(bookingLink).toBeVisible();
  await bookingLink.click();
  await page.waitForURL(/appointments\/book|find-doctors/);
}

async function navigateToBookingEnd(page) {
  await navigateToBooking(page);
  // Chọn bác sĩ đầu tiên
  await page.getByRole('button', { name: /^Chọn$/ }).first().click();

  // Chọn ngày + time slot để vào step 3
  const dayButtons = page.locator('h4:has-text("Chọn Ngày")').locator('..').locator('button');
  await expect(dayButtons.first()).toBeVisible();
  await dayButtons.first().click();

  const timeSlot = page.getByRole('button', { name: /\b\d{2}:\d{2}\b/ }).first();
  await expect(timeSlot).toBeVisible();
  await timeSlot.click();

  await expect(page.getByText(/Thông tin Chi tiết/i).first()).toBeVisible();
}

async function fillBookingDetails(page) {
  // Lưu ý: có 2 label bắt đầu bằng "Phòng khám" (clinic + room). Dùng text cụ thể để tránh strict-mode.
  const clinicSelect = page.locator('label:has-text("Phòng khám *")').locator('..').locator('select');
  const serviceSelect = page.locator('label:has-text("Dịch vụ *")').locator('..').locator('select');
  const roomSelect = page.locator('label:has-text("Phòng khám cụ thể *")').locator('..').locator('select');
  const reasonInput = page.locator('label:has-text("Lý do khám bệnh")').locator('..').locator('input');
  const notesInput = page.locator('textarea[placeholder*="additional information"]').first();

  await expect(clinicSelect).toBeVisible();
  await clinicSelect.selectOption({ label: 'HealthFlow Clinic 1' });

  await expect(serviceSelect).toBeVisible();
  await serviceSelect.selectOption({ label: 'Khám tim mạch - Gói 2' });

  await expect(roomSelect).toBeVisible();
  await roomSelect.selectOption({ label: 'Phòng khám 1 - #R01' });

  await expect(reasonInput).toBeVisible();
  await reasonInput.fill('Đau đầu và mệt mỏi kéo dài');

  await expect(notesInput).toBeVisible();
  await notesInput.fill('Tôi không có tiền sử dị ứng. Hãy kiểm tra huyết áp và mức glucose.');
}

async function installApiMocks(page) {
  const makeJson = async (route, data, status = 200) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  };

  const doctors = [
    { id: 801, fullName: 'BS. Tran Thu Binh', email: 'doctor1@clinic.com', role: 'DOCTOR', specialization: 'Tim mạch', rating: 4.8, consultationFee: 50, yearsOfExperience: 8 },
    { id: 802, fullName: 'Dr. Sarah Johnson', email: 'dr.sarah@clinic.com', role: 'DOCTOR', specialization: 'Nội tổng quát', rating: 4.7, consultationFee: 60, yearsOfExperience: 10 },
  ];

  const clinics = [
    { id: 1, name: 'HealthFlow Clinic 1', active: true },
  ];

  const services = [
    { id: 2, clinicId: 1, name: 'Khám tim mạch - Gói 2', active: true, basePrice: 200 },
  ];

  const rooms = [
    { id: 1, clinicId: 1, name: 'Phòng khám 1', roomNumber: 'R01', active: true, type: 'CONSULTATION' },
  ];

  const schedules = [
    { id: 1, doctorId: 801, dayOfWeek: 1, startTime: '08:00', endTime: '17:00', isAvailable: true },
  ];

  let createdAppointments = [];

  await page.route(`${API_ORIGIN}/api/**`, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const { pathname } = url;
    const method = req.method();

    // CORS preflight
    if (method === 'OPTIONS') {
      return makeJson(route, {}, 200);
    }

    // Auth
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = (() => {
        try { return req.postDataJSON(); } catch { return {}; }
      })();
      const email = (body?.email || '').toLowerCase();

      const isDoctor = email.includes('dr.') || email.includes('doctor') || email.includes('sarah');
      const isAdmin = email.includes('admin');

      const user =
        isAdmin ? { userId: 1, email: 'admin@clinic.com', fullName: 'Admin User', role: 'ADMIN', emailVerified: true, phoneVerified: true } :
          isDoctor ? { userId: 801, email: 'dr.sarah@clinic.com', fullName: 'Sarah Johnson', role: 'DOCTOR', emailVerified: true, phoneVerified: true } :
            { userId: 953, email: 'patient1@clinic.com', fullName: 'Nguyễn Văn A', role: 'PATIENT', emailVerified: true, phoneVerified: true };

      return makeJson(route, { ...user, token: 'e2e-token', refreshToken: 'e2e-refresh' }, 200);
    }

    // Users/Doctors
    if (pathname.startsWith('/api/users/role/DOCTOR') && method === 'GET') {
      return makeJson(route, doctors, 200);
    }
    if (pathname.startsWith('/api/users/doctors/specializations') && method === 'GET') {
      return makeJson(route, ['Tim mạch', 'Nội tổng quát'], 200);
    }

    // Booking config
    if (pathname === '/api/clinics' && method === 'GET') {
      return makeJson(route, clinics, 200);
    }
    if (pathname === '/api/services' && method === 'GET') {
      return makeJson(route, services, 200);
    }
    if (pathname === '/api/rooms' && method === 'GET') {
      return makeJson(route, rooms, 200);
    }

    // Schedule
    if (pathname.match(/^\/api\/schedules\/doctor\/\d+\/day\/\d+$/) && method === 'GET') {
      return makeJson(route, schedules, 200);
    }

    // Appointments
    if (pathname === '/api/appointments/search' && method === 'GET') {
      const doctorId = url.searchParams.get('doctorId');
      const patientId = url.searchParams.get('patientId');
      const filtered = createdAppointments.filter((apt) => {
        if (doctorId && String(apt.doctorId) !== String(doctorId)) return false;
        if (patientId && String(apt.patientId) !== String(patientId)) return false;
        return true;
      });
      return makeJson(route, filtered, 200);
    }
    if (pathname === '/api/appointments' && method === 'POST') {
      const body = (() => {
        try { return req.postDataJSON(); } catch { return {}; }
      })();
      const apt = {
        id: String(Date.now()),
        patientId: body.patientId ?? 953,
        patientName: 'Nguyễn Văn A',
        doctorId: body.doctorId ?? 801,
        doctorName: 'Dr. Sarah Johnson',
        doctorSpecialization: 'Nội tổng quát',
        appointmentDate: body.appointmentDate,
        appointmentTime: body.appointmentTime,
        date: body.appointmentDate,
        time: body.appointmentTime,
        reason: body.symptoms || '',
        notes: body.notes || '',
        type: body.type || 'IN_PERSON',
        status: 'PENDING',
      };
      createdAppointments = [apt];
      return makeJson(route, apt, 200);
    }
    if (pathname.match(/^\/api\/appointments\/[^/]+\/confirm$/) && method === 'PUT') {
      createdAppointments = createdAppointments.map((a) => ({ ...a, status: 'CONFIRMED' }));
      return makeJson(route, createdAppointments[0] || {}, 200);
    }

    // Doctor patients fetch (userApi.getDoctorPatients uses /api/appointments/doctor/:doctorId)
    if (pathname.match(/^\/api\/appointments\/doctor\/\d+$/) && method === 'GET') {
      return makeJson(route, [{
        id: 'apt-1',
        patientId: 953,
        patientName: 'Nguyễn Văn A',
        patientEmail: 'patient1@clinic.com',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '10:00',
        status: 'CONFIRMED',
      }], 200);
    }
    if (pathname.match(/^\/api\/appointments\/patient\/\d+$/) && method === 'GET') {
      return makeJson(route, createdAppointments, 200);
    }

    // Stats
    if (pathname.match(/^\/api\/statistics\/aggregate\/patient\/\d+$/) && method === 'GET') {
      return makeJson(route, {
        upcomingAppointments: 1,
        completedAppointments: 0,
        activePrescriptions: 0,
        healthMetricsLogged: 0,
      }, 200);
    }
    if (pathname.match(/^\/api\/statistics\/aggregate\/doctor\/\d+$/) && method === 'GET') {
      return makeJson(route, {
        todayAppointments: 0,
        weeklyAppointments: 0,
        totalPatients: 1,
        avgRating: 4.8,
      }, 200);
    }

    // Dashboards supporting APIs
    if (pathname.match(/^\/api\/medical-records\/patient\/\d+$/) && method === 'GET') {
      return makeJson(route, [], 200);
    }
    if (pathname.match(/^\/api\/health-metrics\/patient\/\d+$/) && method === 'GET') {
      return makeJson(route, [], 200);
    }

    // Default: trả empty array cho GET để tránh crash do .map/.slice
    if (method === 'GET') {
      return makeJson(route, [], 200);
    }
    return makeJson(route, {}, 200);
  });
}
