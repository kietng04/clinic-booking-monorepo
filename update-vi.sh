#!/bin/bash

# Update common phrases across all files
cd /Users/kietnguyen/Documents/kltn/clinic-booking-frontend/src

# Find and replace in all JSX files
find . -name "*.jsx" -type f -exec sed -i '' \
  -e 's/Loading\.\.\./Đang tải.../g' \
  -e 's/>Loading</>Đang tải</g' \
  -e 's/View All/Xem tất cả/g' \
  -e 's/Book Now/Đặt lịch ngay/g' \
  -e 's/Coming Soon/Sắp ra mắt/g' \
  {} \;

echo "Updated common phrases"
