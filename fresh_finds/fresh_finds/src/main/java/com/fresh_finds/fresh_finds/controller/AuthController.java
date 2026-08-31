package com.fresh_finds.fresh_finds.controller;

import com.fresh_finds.fresh_finds.controller.request.LoginRequest;
import com.fresh_finds.fresh_finds.controller.request.RegisterRequest;
import com.fresh_finds.fresh_finds.controller.request.ResendOtpRequest;
import com.fresh_finds.fresh_finds.controller.request.VerifyOtpRequest;
import com.fresh_finds.fresh_finds.controller.response.AuthResponse;
import com.fresh_finds.fresh_finds.controller.response.MessageResponse;
import com.fresh_finds.fresh_finds.controller.response.UserProfileResponse;
import com.fresh_finds.fresh_finds.service.AuthService;
import com.fresh_finds.fresh_finds.utils.ApiResponse;
import com.fresh_finds.fresh_finds.utils.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/fresh-finds/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final SecurityUtil securityUtil;

    public AuthController(AuthService authService, SecurityUtil securityUtil) {
        this.authService = authService;
        this.securityUtil = securityUtil;
    }

    @PostMapping("/register")
    public ApiResponse register(@Valid @RequestBody RegisterRequest request) {
        MessageResponse response = authService.register(request);
        return ApiResponse.buildSuccessResponse(response);
    }

    @PostMapping("/verify-otp")
    public ApiResponse verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.verifyRegistrationOtp(request);
        return ApiResponse.buildSuccessResponse(response, HttpStatus.CREATED);
    }

    @PostMapping("/resend-otp")
    public ApiResponse resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        MessageResponse response = authService.resendRegistrationOtp(request);
        return ApiResponse.buildSuccessResponse(response);
    }

    @PostMapping("/login")
    public ApiResponse login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ApiResponse.buildSuccessResponse(response);
    }

    @GetMapping("/me")
    public ApiResponse getCurrentUser() {
        Long userId = securityUtil.getCurrentUserId();
        UserProfileResponse response = authService.getCurrentUser(userId);
        return ApiResponse.buildSuccessResponse(response);
    }
}

