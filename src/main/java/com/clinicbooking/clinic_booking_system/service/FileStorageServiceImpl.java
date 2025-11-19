package com.clinicbooking.clinic_booking_system.service;

import com.clinicbooking.clinic_booking_system.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${file.base-url:http://localhost:8080/api/files}")
    private String baseUrl;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        this.rootLocation = Paths.get(uploadDir);
        try {
            Files.createDirectories(rootLocation);
            log.info("File storage initialized at: {}", rootLocation.toAbsolutePath());
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize file storage location", e);
        }
    }

    @Override
    public String storeFile(MultipartFile file, String directory) {
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String extension = getFileExtension(originalFilename);
        String newFilename = UUID.randomUUID().toString() + extension;
        return storeFile(file, directory, newFilename);
    }

    @Override
    public String storeFile(MultipartFile file, String directory, String filename) {
        try {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("Cannot store empty file");
            }

            String cleanFilename = StringUtils.cleanPath(filename);
            if (cleanFilename.contains("..")) {
                throw new IllegalArgumentException("Invalid filename: " + cleanFilename);
            }

            Path directoryPath = rootLocation.resolve(directory);
            Files.createDirectories(directoryPath);

            Path targetLocation = directoryPath.resolve(cleanFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            log.info("Stored file: {}/{}", directory, cleanFilename);
            return cleanFilename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Override
    public Resource loadFileAsResource(String directory, String filename) {
        try {
            Path filePath = rootLocation.resolve(directory).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("File not found: " + filename);
        }
    }

    @Override
    public boolean deleteFile(String directory, String filename) {
        try {
            Path filePath = rootLocation.resolve(directory).resolve(filename).normalize();
            boolean deleted = Files.deleteIfExists(filePath);
            if (deleted) {
                log.info("Deleted file: {}/{}", directory, filename);
            }
            return deleted;
        } catch (IOException e) {
            log.error("Failed to delete file: {}/{}", directory, filename, e);
            return false;
        }
    }

    @Override
    public boolean fileExists(String directory, String filename) {
        Path filePath = rootLocation.resolve(directory).resolve(filename).normalize();
        return Files.exists(filePath);
    }

    @Override
    public String getFileUrl(String directory, String filename) {
        return baseUrl + "/" + directory + "/" + filename;
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0) {
            return filename.substring(dotIndex);
        }
        return "";
    }
}
