#!/bin/bash

# Update BookAppointment page
sed -i '' \
  -e 's/Select Doctor/Chọn Bác sĩ/g' \
  -e 's/Choose your healthcare provider/Chọn chuyên gia y tế phù hợp/g' \
  -e 's/Pick Date & Time/Chọn Ngày & Giờ/g' \
  -e 's/Select appointment slot/Chọn khung giờ khám/g' \
  -e 's/Appointment Details/Thông tin Chi tiết/g' \
  -e 's/Provide additional information/Cung cấp thông tin bổ sung/g' \
  -e 's/Confirm/Xác nhận/g' \
  -e 's/Review and confirm booking/Xem lại và xác nhận đặt lịch/g' \
  -e 's/Choose Your Doctor/Chọn Bác sĩ của bạn/g' \
  -e 's/Find the right healthcare professional for your needs/Tìm chuyên gia y tế phù hợp với nhu cầu của bạn/g' \
  -e 's/Search by name or specialization.../Tìm theo tên hoặc chuyên khoa.../g' \
  -e 's/Filter by specialization/Lọc theo chuyên khoa/g' \
  -e 's/All Specializations/Tất cả chuyên khoa/g' \
  -e 's/years exp./năm kinh nghiệm/g' \
  -e 's/Select/Chọn/g' \
  -e 's/Select Date & Time/Chọn Ngày & Giờ/g' \
  -e 's/Select Date/Chọn Ngày/g' \
  -e 's/Available Time Slots/Khung giờ có sẵn/g' \
  -e 's/Back/Quay lại/g' \
  -e 's/Continue/Tiếp tục/g' \
  -e 's/Appointment Type/Loại hình khám/g' \
  -e 's/In-Person/Trực tiếp/g' \
  -e 's/Video Call/Gọi video/g' \
  -e 's/Reason for Visit/Lý do khám bệnh/g' \
  -e 's/Additional Notes (Optional)/Ghi chú thêm (Tùy chọn)/g' \
  -e 's/Confirm Your Appointment/Xác nhận Lịch hẹn/g' \
  -e 's/Review your booking details before confirming/Xem lại chi tiết đặt lịch trước khi xác nhận/g' \
  -e 's/"Date"/"Ngày"/g' \
  -e 's/"Time"/"Giờ"/g' \
  -e 's/"Type"/"Loại hình"/g' \
  -e 's/"Fee"/"Phí khám"/g' \
  -e 's/"Reason"/"Lý do"/g' \
  -e 's/"Notes"/"Ghi chú"/g' \
  -e 's/Confirm Booking/Xác nhận Đặt lịch/g' \
  src/pages/patient/BookAppointment.jsx

echo "BookAppointment page updated!"
