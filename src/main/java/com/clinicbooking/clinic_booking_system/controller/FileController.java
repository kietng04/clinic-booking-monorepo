package com.clinicbooking.clinic_booking_system.controller;

import com.clinicbooking.clinic_booking_system.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "File Upload", description = "File upload and download APIs")
public class FileController {

    private final FileStorageService fileStorageService;

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    private static final Set<String> ALLOWED_DOCUMENT_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    @PostMapping("/avatar")
    @Operation(summary = "Upload user avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId) {

        validateImageFile(file);

        String filename = fileStorageService.storeFile(file, "avatars");
        String url = fileStorageService.getFileUrl("avatars", filename);

        log.info("Uploaded avatar for user {}: {}", userId, filename);

        Map<String, String> response = new HashMap<>();
        response.put("filename", filename);
        response.put("url", url);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/medical-record")
    @Operation(summary = "Upload medical record attachment")
    public ResponseEntity<Map<String, String>> uploadMedicalRecord(
            @RequestParam("file") MultipartFile file,
            @RequestParam("recordId") Long recordId) {

        validateFile(file);

        String filename = fileStorageService.storeFile(file, "medical-records");
        String url = fileStorageService.getFileUrl("medical-records", filename);

        log.info("Uploaded medical record attachment for record {}: {}", recordId, filename);

        Map<String, String> response = new HashMap<>();
        response.put("filename", filename);
        response.put("url", url);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/consultation")
    @Operation(summary = "Upload consultation attachment (chat files)")
    public ResponseEntity<Map<String, String>> uploadConsultationFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("consultationId") Long consultationId) {

        validateFile(file);

        String filename = fileStorageService.storeFile(file, "consultations");
        String url = fileStorageService.getFileUrl("consultations", filename);

        log.info("Uploaded consultation attachment for consultation {}: {}", consultationId, filename);

        Map<String, String> response = new HashMap<>();
        response.put("filename", filename);
        response.put("url", url);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{directory}/{filename}")
    @Operation(summary = "Download a file")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String directory,
            @PathVariable String filename) {

        Resource resource = fileStorageService.loadFileAsResource(directory, filename);

        String contentType = determineContentType(filename);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

    @DeleteMapping("/{directory}/{filename}")
    @Operation(summary = "Delete a file")
    public ResponseEntity<Map<String, Boolean>> deleteFile(
            @PathVariable String directory,
            @PathVariable String filename) {

        boolean deleted = fileStorageService.deleteFile(directory, filename);

        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", deleted);

        return ResponseEntity.ok(response);
    }

    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 10MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Invalid file type. Allowed: JPEG, PNG, GIF, WebP");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 10MB");
        }

        String contentType = file.getContentType();
        if (contentType == null ||
                (!ALLOWED_IMAGE_TYPES.contains(contentType) &&
                        !ALLOWED_DOCUMENT_TYPES.contains(contentType))) {
            throw new IllegalArgumentException("Invalid file type. Allowed: images and PDF/Word documents");
        }
    }

    private String determineContentType(String filename) {
        String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        return switch (extension) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            case "pdf" -> "application/pdf";
            case "doc" -> "application/msword";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            default -> "application/octet-stream";
        };
    }
}
