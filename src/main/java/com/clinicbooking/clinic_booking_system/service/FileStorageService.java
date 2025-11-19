package com.clinicbooking.clinic_booking_system.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    /**
     * Store a file and return the generated filename
     */
    String storeFile(MultipartFile file, String directory);

    /**
     * Store a file with a specific filename
     */
    String storeFile(MultipartFile file, String directory, String filename);

    /**
     * Load a file as a Resource
     */
    Resource loadFileAsResource(String directory, String filename);

    /**
     * Delete a file
     */
    boolean deleteFile(String directory, String filename);

    /**
     * Check if file exists
     */
    boolean fileExists(String directory, String filename);

    /**
     * Get file URL for access
     */
    String getFileUrl(String directory, String filename);
}
