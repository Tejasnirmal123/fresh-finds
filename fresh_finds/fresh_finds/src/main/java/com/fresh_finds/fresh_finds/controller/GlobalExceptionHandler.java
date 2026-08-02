package com.fresh_finds.fresh_finds.controller;

import com.fresh_finds.fresh_finds.utils.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MultipartException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ApiResponse handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ApiResponse.buildErrorResponse(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ApiResponse handleIllegalArgumentException(IllegalArgumentException ex) {
        return ApiResponse.buildErrorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MultipartException.class)
    public ApiResponse handleMultipartException(MultipartException ex) {
        System.err.println("=== MultipartException caught ===");
        ex.printStackTrace(); // Log the full stack trace
        String errorMessage = "Multipart request error: " + ex.getMessage();
        if (ex.getCause() != null) {
            errorMessage += " - Cause: " + ex.getCause().getMessage();
            System.err.println("Cause: " + ex.getCause().getMessage());
            if (ex.getCause().getCause() != null) {
                errorMessage += " - Root Cause: " + ex.getCause().getCause().getMessage();
                System.err.println("Root Cause: " + ex.getCause().getCause().getMessage());
            }
        }
        System.err.println("Full error message: " + errorMessage);
        return ApiResponse.buildErrorResponse(errorMessage, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ApiResponse handleGenericException(Exception ex) {
        ex.printStackTrace(); // Log the full stack trace for debugging
        return ApiResponse.buildErrorResponse("An error occurred: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

