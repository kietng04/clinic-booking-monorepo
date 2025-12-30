#!/bin/bash

# Replace common English phrases with Vietnamese in all JSX files
find src -name "*.jsx" -type f -exec sed -i '' \
  -e 's/"Loading\.\.\."/"Đang tải..."/g' \
  -e 's/>Loading</>Đang tải</g' \
  -e 's/"View All"/"Xem tất cả"/g' \
  -e 's/"Book Now"/"Đặt lịch ngay"/g' \
  -e 's/"Coming Soon"/"Sắp ra mắt"/g' \
  -e 's/"Full Name"/"Họ và tên"/g' \
  -e 's/"Email Address"/"Địa chỉ Email"/g' \
  -e 's/"Phone Number"/"Số điện thoại"/g' \
  -e 's/"Confirm Password"/"Xác nhận mật khẩu"/g' \
  -e 's/"Create Account"/"Tạo tài khoản"/g' \
  -e 's/"Already have an account?"/"Đã có tài khoản?"/g' \
  -e 's/"Sign in"/"Đăng nhập"/g' \
  {} \;

echo "Translation completed!"
