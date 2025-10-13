package com.clinicbooking.medicalservice.service;

import com.clinicbooking.medicalservice.client.AppointmentServiceClient;
import com.clinicbooking.medicalservice.client.UserServiceClient;
import com.clinicbooking.medicalservice.dto.AppointmentDto;
import com.clinicbooking.medicalservice.dto.UserDto;
import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordCreateDto;
import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordResponseDto;
import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordUpdateDto;
import com.clinicbooking.medicalservice.dto.prescription.PrescriptionCreateDto;
import com.clinicbooking.medicalservice.entity.MedicalRecord;
import com.clinicbooking.medicalservice.entity.Prescription;
import com.clinicbooking.medicalservice.event.MedicalRecordEventPublisher;
import com.clinicbooking.medicalservice.exception.AccessDeniedException;
import com.clinicbooking.medicalservice.exception.ResourceNotFoundException;
import com.clinicbooking.medicalservice.exception.ValidationException;
import com.clinicbooking.medicalservice.mapper.MedicalRecordMapper;
import com.clinicbooking.medicalservice.mapper.PrescriptionMapper;
import com.clinicbooking.medicalservice.repository.MedicalRecordRepository;
import com.clinicbooking.medicalservice.security.SecurityContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicalRecordServiceImpl implements MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicalRecordMapper medicalRecordMapper;
    private final PrescriptionMapper prescriptionMapper;
    private final UserServiceClient userServiceClient;
    private final AppointmentServiceClient appointmentServiceClient;
    private final MedicalRecordEventPublisher eventPublisher;
    private final SecurityContext securityContext;

    @Override
    @Transactional
    public MedicalRecordResponseDto createMedicalRecord(MedicalRecordCreateDto dto) {
        log.info("Creating medical record for patient: {}, doctor: {}", dto.getPatientId(), dto.getDoctorId());

        // Authorization: Only doctors can create medical records
        Long currentUserId = securityContext.getCurrentUserId();
        if (!securityContext.isDoctor() && !securityContext.isAdmin()) {
            throw new AccessDeniedException("Chỉ bác sĩ mới có thể tạo hồ sơ y tế");
        }

        // Doctor can only create records for themselves (unless admin)
        if (securityContext.isDoctor() && !dto.getDoctorId().equals(currentUserId)) {
            throw new AccessDeniedException("Bác sĩ chỉ có thể tạo hồ sơ y tế của mình");
        }

        // Fetch patient and doctor information from User Service
        UserDto patient = userServiceClient.getUserById(dto.getPatientId());
        UserDto doctor = userServiceClient.getUserById(dto.getDoctorId());

        // Validate doctor role
        if (!"DOCTOR".equals(doctor.getRole())) {
            throw new ValidationException("Người dùng không phải là bác sĩ");
        }

        // If appointment is provided, fetch appointment details and validate
        if (dto.getAppointmentId() != null) {
            AppointmentDto appointment = appointmentServiceClient.getAppointmentById(dto.getAppointmentId());

            // Validate appointment belongs to the patient and doctor
            if (!appointment.getPatientId().equals(dto.getPatientId()) ||
                !appointment.getDoctorId().equals(dto.getDoctorId())) {
                throw new ValidationException("Cuộc hẹn không hợp lệ cho bệnh nhân và bác sĩ này");
            }

            // Validate appointment is completed or confirmed
            if (!"COMPLETED".equals(appointment.getStatus()) && !"CONFIRMED".equals(appointment.getStatus())) {
                throw new ValidationException("Chỉ có thể tạo hồ sơ y tế cho cuộc hẹn đã xác nhận hoặc đã hoàn thành");
            }
        }

        // Create medical record entity
        MedicalRecord medicalRecord = medicalRecordMapper.toEntity(dto);
        medicalRecord.setPatientName(patient.getFullName());
        medicalRecord.setDoctorName(doctor.getFullName());

        // Process prescriptions
        if (dto.getPrescriptions() != null && !dto.getPrescriptions().isEmpty()) {
            List<Prescription> prescriptions = new ArrayList<>();
            for (PrescriptionCreateDto prescriptionDto : dto.getPrescriptions()) {
                // Validate prescribing doctor is the same as medical record doctor
                if (!prescriptionDto.getDoctorId().equals(dto.getDoctorId())) {
                    throw new ValidationException("Bác sĩ kê đơn phải là bác sĩ tạo hồ sơ y tế");
                }

                Prescription prescription = prescriptionMapper.toEntity(prescriptionDto);
                prescription.setDoctorName(doctor.getFullName());
                prescription.setMedicalRecord(medicalRecord);
                prescriptions.add(prescription);
            }
            medicalRecord.setPrescriptions(prescriptions);
        }

        // Save medical record
        medicalRecord = medicalRecordRepository.save(medicalRecord);
        log.info("Medical record created with ID: {}", medicalRecord.getId());

        // Publish Kafka event
        eventPublisher.publishMedicalRecordCreated(medicalRecord);

        return medicalRecordMapper.toDto(medicalRecord);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicalRecordResponseDto getMedicalRecordById(Long id) {
        log.info("Fetching medical record with ID: {}", id);
        MedicalRecord medicalRecord = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ y tế"));

        // Authorization check
        checkReadAccess(medicalRecord);

        return medicalRecordMapper.toDto(medicalRecord);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MedicalRecordResponseDto> getMedicalRecordsByPatientId(Long patientId, Pageable pageable) {
        log.info("Fetching medical records for patient ID: {}", patientId);

        // Authorization: Patient can only see their own records, doctors/admins can see all
        Long currentUserId = securityContext.getCurrentUserId();
        if (securityContext.isPatient() && !patientId.equals(currentUserId)) {
            throw new AccessDeniedException("Bạn chỉ có thể xem hồ sơ y tế của mình");
        }

        Page<MedicalRecord> medicalRecords = medicalRecordRepository.findByPatientId(patientId, pageable);
        return medicalRecords.map(medicalRecordMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MedicalRecordResponseDto> getMedicalRecordsByDoctorId(Long doctorId, Pageable pageable) {
        log.info("Fetching medical records for doctor ID: {}", doctorId);

        // Authorization: Doctors can see their own records, admins can see all
        Long currentUserId = securityContext.getCurrentUserId();
        if (securityContext.isDoctor() && !doctorId.equals(currentUserId)) {
            throw new AccessDeniedException("Bạn chỉ có thể xem hồ sơ y tế của mình");
        }
        if (securityContext.isPatient()) {
            throw new AccessDeniedException("Bệnh nhân không có quyền truy cập endpoint này");
        }

        Page<MedicalRecord> medicalRecords = medicalRecordRepository.findByDoctorId(doctorId, pageable);
        return medicalRecords.map(medicalRecordMapper::toDto);
    }

    @Override
    @Transactional
    public MedicalRecordResponseDto updateMedicalRecord(Long id, MedicalRecordUpdateDto dto) {
        log.info("Updating medical record with ID: {}", id);

        MedicalRecord medicalRecord = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ y tế"));

        // Authorization: Only the creating doctor or admin can update
        Long currentUserId = securityContext.getCurrentUserId();
        if (!securityContext.isAdmin() && !medicalRecord.getDoctorId().equals(currentUserId)) {
            throw new AccessDeniedException("Chỉ bác sĩ tạo hồ sơ hoặc admin mới có thể cập nhật");
        }

        medicalRecordMapper.updateEntityFromDto(dto, medicalRecord);
        medicalRecord.setUpdatedAt(LocalDateTime.now());

        medicalRecord = medicalRecordRepository.save(medicalRecord);
        log.info("Medical record updated with ID: {}", medicalRecord.getId());

        // Publish Kafka event
        eventPublisher.publishMedicalRecordUpdated(medicalRecord);

        return medicalRecordMapper.toDto(medicalRecord);
    }

    @Override
    @Transactional
    public void deleteMedicalRecord(Long id) {
        log.info("Deleting medical record with ID: {}", id);

        // Only admin can delete medical records (soft delete recommended for compliance)
        if (!securityContext.isAdmin()) {
            throw new AccessDeniedException("Chỉ admin mới có thể xóa hồ sơ y tế");
        }

        if (!medicalRecordRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy hồ sơ y tế");
        }

        medicalRecordRepository.deleteById(id);
        log.info("Medical record deleted with ID: {}", id);
    }

    private void checkReadAccess(MedicalRecord medicalRecord) {
        Long currentUserId = securityContext.getCurrentUserId();

        // Admin can access all
        if (securityContext.isAdmin()) {
            return;
        }

        // Doctor can access their own records
        if (securityContext.isDoctor() && medicalRecord.getDoctorId().equals(currentUserId)) {
            return;
        }

        // Patient can access their own records
        if (securityContext.isPatient() && medicalRecord.getPatientId().equals(currentUserId)) {
            return;
        }

        throw new AccessDeniedException("Bạn không có quyền truy cập hồ sơ y tế này");
    }
}
