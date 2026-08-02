package com.fresh_finds.fresh_finds.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload.dir:uploads/images}")
    private String uploadDir;

    @Value("${file.upload.max-size:10485760}")
    private long maxFileSize;

    @Value("${file.upload.allowed-types:jpg,jpeg,png,gif,webp}")
    private String allowedTypes;

    @Autowired(required = false)
    private CloudStorageService cloudStorageService;

    private static final String[] ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"};

    /**
     * Store a single image file
     * Uses cloud storage (R2) if enabled, otherwise falls back to local filesystem
     * @param file The multipart file
     * @param type Image type: "product", "category", or "avatar"
     * @param entityId Optional entity ID for organizing files
     * @return File path or public URL (e.g., "images/products/123/main.jpg" or "https://pub-xxxx.r2.dev/images/products/123/main.jpg")
     * @throws IOException If file storage fails
     */
    public String storeImage(MultipartFile file, String type, Long entityId) throws IOException {
        validateFile(file);

        // Use cloud storage if enabled and configured
        if (cloudStorageService != null && cloudStorageService.isEnabled()) {
            return cloudStorageService.uploadFile(file, type, entityId);
        }

        // Fall back to local filesystem storage
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new IllegalArgumentException("File name cannot be empty");
        }

        String extension = getFileExtension(originalFilename);
        String filename = generateUniqueFilename(extension);

        // Determine storage path based on type
        String storagePath;
        if (type == null || type.isEmpty()) {
            type = "products";
        }

        if (entityId != null && ("product".equals(type) || "products".equals(type))) {
            storagePath = "images/products/" + entityId + "/" + filename;
        } else if ("category".equals(type) || "categories".equals(type)) {
            storagePath = "images/categories/" + filename;
        } else if ("avatar".equals(type) || "avatars".equals(type)) {
            storagePath = "images/avatars/" + (entityId != null ? "user-" + entityId + "-" + filename : filename);
        } else {
            storagePath = "images/" + type + "/" + filename;
        }

        Path targetPath = Paths.get(uploadDir, storagePath);
        Files.createDirectories(targetPath.getParent());
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return storagePath;
    }

    /**
     * Store multiple image files
     * @param files Array of multipart files
     * @param type Image type
     * @param entityId Optional entity ID
     * @return List of relative file paths
     * @throws IOException If file storage fails
     */
    public List<String> storeImages(MultipartFile[] files, String type, Long entityId) throws IOException {
        List<String> filePaths = new ArrayList<>();
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                String path = storeImage(file, type, entityId);
                filePaths.add(path);
            }
        }
        return filePaths;
    }

    /**
     * Delete an image file
     * Handles both GCS URLs and local file paths
     * @param filePath Relative file path or GCS URL
     * @return true if deleted, false if file doesn't exist
     * @throws IOException If deletion fails
     */
    public boolean deleteImage(String filePath) throws IOException {
        if (filePath == null || filePath.isEmpty()) {
            return false;
        }

        // Check if it's a cloud storage URL
        if (cloudStorageService != null && cloudStorageService.isEnabled() && cloudStorageService.isCloudUrl(filePath)) {
            return cloudStorageService.deleteFile(filePath);
        }

        // Delete from local filesystem
        Path targetPath = Paths.get(uploadDir, filePath);
        if (Files.exists(targetPath)) {
            Files.delete(targetPath);
            return true;
        }
        return false;
    }

    /**
     * Validate file before storage
     * @param file The multipart file
     * @throws IllegalArgumentException If validation fails
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of " + (maxFileSize / 1024 / 1024) + "MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new IllegalArgumentException("File name cannot be empty");
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        boolean isValidExtension = false;
        for (String allowedExt : ALLOWED_EXTENSIONS) {
            if (allowedExt.equals(extension)) {
                isValidExtension = true;
                break;
            }
        }

        if (!isValidExtension) {
            throw new IllegalArgumentException("File type not allowed. Allowed types: " + String.join(", ", ALLOWED_EXTENSIONS));
        }
    }

    /**
     * Get file extension from filename
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < filename.length() - 1) {
            return filename.substring(lastDotIndex + 1);
        }
        return "";
    }

    /**
     * Generate unique filename using UUID
     */
    private String generateUniqueFilename(String extension) {
        return UUID.randomUUID().toString() + "." + extension;
    }

    /**
     * Get full file path for reading
     * The relativePath from DB already includes "images/" prefix
     * uploadDir is "uploads/images", so we need to handle this correctly
     * 
     * Note: Files might be stored in two locations:
     * 1. uploads/images/categories/file.jpg (correct location)
     * 2. uploads/images/images/categories/file.jpg (legacy location with extra images/)
     */
    public Path getFilePath(String relativePath) {
        if (relativePath == null || relativePath.isEmpty()) {
            throw new IllegalArgumentException("Image path cannot be null or empty");
        }
        
        // If the path already starts with "images/", we need to combine it with uploadDir
        // uploadDir is "uploads/images", so we get "uploads/images/images/..." which is wrong
        // We need to remove the "images/" prefix if it exists, or adjust uploadDir
        
        // Check if path starts with "images/"
        if (relativePath.startsWith("images/")) {
            // Try path without "images/" prefix first (correct location)
            String pathWithoutImages = relativePath.substring("images/".length());
            Path path1 = Paths.get(uploadDir, pathWithoutImages);
            
            // Also try with the extra images/ directory (legacy location - files might be here)
            Path path2 = Paths.get(uploadDir, relativePath);
            
            // Return the path that exists, or the first one if neither exists
            if (java.nio.file.Files.exists(path1)) {
                System.out.println("FileStorageService: Found file at path1: " + path1.toAbsolutePath());
                return path1;
            } else if (java.nio.file.Files.exists(path2)) {
                System.out.println("FileStorageService: Found file at path2 (legacy): " + path2.toAbsolutePath());
                return path2;
            }
            
            // Return the expected path (path1) even if it doesn't exist yet
            System.out.println("FileStorageService: File not found at either location. Trying path1: " + path1.toAbsolutePath());
            return path1;
        }
        
        // If path doesn't start with "images/", combine directly
        return Paths.get(uploadDir, relativePath);
    }
}

