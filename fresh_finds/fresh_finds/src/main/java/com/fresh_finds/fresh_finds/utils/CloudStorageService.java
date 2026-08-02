package com.fresh_finds.fresh_finds.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.util.UUID;

/**
 * Service for storing files in Cloudflare R2 (S3-compatible object storage)
 * Used for production deployments
 */
@Service
public class CloudStorageService {

    @Value("${r2.bucket-name:}")
    private String bucketName;

    @Value("${r2.enabled:false}")
    private boolean enabled;

    @Value("${r2.account-id:}")
    private String accountId;

    @Value("${r2.access-key-id:}")
    private String accessKeyId;

    @Value("${r2.secret-access-key:}")
    private String secretAccessKey;

    @Value("${r2.public-url:}")
    private String publicUrl;

    private S3Client s3Client;

    /**
     * Initialize R2 (S3-compatible) client
     */
    private S3Client getClient() {
        if (s3Client == null && enabled) {
            s3Client = S3Client.builder()
                    .endpointOverride(URI.create("https://" + accountId + ".r2.cloudflarestorage.com"))
                    .region(Region.of("auto"))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
                    .build();
        }
        return s3Client;
    }

    /**
     * Check if R2 is enabled and configured
     */
    public boolean isEnabled() {
        return enabled && bucketName != null && !bucketName.isEmpty();
    }

    /**
     * Upload a file to R2
     * @param file The multipart file
     * @param type Image type: "product", "category", or "avatar"
     * @param entityId Optional entity ID for organizing files
     * @return Public URL of the uploaded file
     * @throws IOException If upload fails
     */
    public String uploadFile(MultipartFile file, String type, Long entityId) throws IOException {
        if (!isEnabled()) {
            throw new IllegalStateException("R2 is not enabled or bucket name is not configured");
        }

        S3Client client = getClient();
        if (client == null) {
            throw new IllegalStateException("Failed to initialize R2 storage client");
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new IllegalArgumentException("File name cannot be empty");
        }

        String extension = getFileExtension(originalFilename);
        String filename = UUID.randomUUID().toString() + "." + extension;

        // Determine storage path based on type
        String objectName;
        if (type == null || type.isEmpty()) {
            type = "products";
        }

        if (entityId != null && ("product".equals(type) || "products".equals(type))) {
            objectName = "images/products/" + entityId + "/" + filename;
        } else if ("category".equals(type) || "categories".equals(type)) {
            objectName = "images/categories/" + filename;
        } else if ("avatar".equals(type) || "avatars".equals(type)) {
            objectName = "images/avatars/" + (entityId != null ? "user-" + entityId + "-" + filename : filename);
        } else {
            objectName = "images/" + type + "/" + filename;
        }

        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(objectName)
                .contentType(file.getContentType())
                .build();

        client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        // Return public URL: {publicUrl}/{objectName}
        return trimTrailingSlash(publicUrl) + "/" + objectName;
    }

    /**
     * Delete a file from R2
     * @param fileUrl The full public URL of the file
     * @return true if deleted, false if file doesn't exist
     */
    public boolean deleteFile(String fileUrl) {
        if (!isEnabled() || fileUrl == null || fileUrl.isEmpty()) {
            return false;
        }

        try {
            S3Client client = getClient();
            if (client == null) {
                return false;
            }

            String objectName = extractObjectNameFromUrl(fileUrl);
            if (objectName == null) {
                return false;
            }

            client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectName)
                    .build());
            return true;
        } catch (Exception e) {
            System.err.println("Error deleting file from R2: " + e.getMessage());
            return false;
        }
    }

    /**
     * Extract object name from a stored file URL
     */
    private String extractObjectNameFromUrl(String fileUrl) {
        String prefix = trimTrailingSlash(publicUrl) + "/";
        if (fileUrl.startsWith(prefix)) {
            return fileUrl.substring(prefix.length());
        }

        // If URL doesn't match the configured prefix, assume it's already an object name
        // (for backward compatibility with relative paths)
        return fileUrl;
    }

    private String trimTrailingSlash(String value) {
        if (value != null && value.endsWith("/")) {
            return value.substring(0, value.length() - 1);
        }
        return value;
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
     * Check if a path/URL points to cloud storage (R2, or a legacy GCS URL from before migration)
     */
    public boolean isCloudUrl(String path) {
        if (path == null || path.isEmpty()) {
            return false;
        }
        return (publicUrl != null && !publicUrl.isEmpty() && path.startsWith(trimTrailingSlash(publicUrl))) ||
               path.startsWith("https://storage.googleapis.com/") ||
               path.startsWith("https://storage.cloud.google.com/") ||
               path.startsWith("gs://");
    }
}
