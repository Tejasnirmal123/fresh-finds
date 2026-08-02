package com.fresh_finds.fresh_finds.controller;

import com.fresh_finds.fresh_finds.utils.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;

@RestController
@RequestMapping("/fresh-finds/api/v1/images")
public class ImageController {

    private final FileStorageService fileStorageService;

    public ImageController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/**")
    public ResponseEntity<Resource> getImage(HttpServletRequest request) {
        try {
            // Extract path from request URI
            String requestURI = request.getRequestURI();
            String basePath = "/fresh-finds/api/v1/images/";
            String imagePath;
            
            if (requestURI.startsWith(basePath)) {
                imagePath = requestURI.substring(basePath.length());
            } else {
                // Fallback: try to extract from full path
                int imagesIndex = requestURI.indexOf("/images/");
                if (imagesIndex >= 0) {
                    imagePath = requestURI.substring(imagesIndex + "/images/".length());
                } else {
                    System.out.println("ImageController: Could not extract path from URI: " + requestURI);
                    return ResponseEntity.badRequest().build();
                }
            }
            
            if (imagePath == null || imagePath.isEmpty()) {
                System.out.println("ImageController: Image path is empty");
                return ResponseEntity.badRequest().build();
            }
            
            System.out.println("ImageController: Requested image path: " + imagePath);
            Path filePath = fileStorageService.getFilePath(imagePath);
            System.out.println("ImageController: Resolved file path: " + filePath.toAbsolutePath());
            
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                System.out.println("ImageController: File found and readable");
                String contentType = determineContentType(imagePath);
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000")
                        .body(resource);
            } else {
                System.out.println("ImageController: File not found at: " + filePath.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.out.println("ImageController: Error loading image: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    // OPTIONS requests are handled by global CORS configuration

    private String determineContentType(String path) {
        String lowerPath = path.toLowerCase();
        if (lowerPath.endsWith(".jpg") || lowerPath.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lowerPath.endsWith(".png")) {
            return "image/png";
        } else if (lowerPath.endsWith(".gif")) {
            return "image/gif";
        } else if (lowerPath.endsWith(".webp")) {
            return "image/webp";
        }
        return "application/octet-stream";
    }
}

