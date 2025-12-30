#!/bin/bash

# Fix variable names that were wrongly translated
sed -i '' \
  -e 's/setChọnedSpecialization/setSelectedSpecialization/g' \
  -e 's/setChọnedDate/setSelectedDate/g' \
  -e 's/isChọned/isSelected/g' \
  -e 's/Chọnion/Selection/g' \
  src/pages/patient/BookAppointment.jsx

echo "Fixed BookAppointment variables"
