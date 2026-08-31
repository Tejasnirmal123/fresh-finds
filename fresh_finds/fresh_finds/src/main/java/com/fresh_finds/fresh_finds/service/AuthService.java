package com.fresh_finds.fresh_finds.service;

import com.fresh_finds.fresh_finds.controller.request.LoginRequest;
import com.fresh_finds.fresh_finds.controller.request.RegisterRequest;
import com.fresh_finds.fresh_finds.controller.request.ResendOtpRequest;
import com.fresh_finds.fresh_finds.controller.request.VerifyOtpRequest;
import com.fresh_finds.fresh_finds.controller.response.AuthResponse;
import com.fresh_finds.fresh_finds.controller.response.MessageResponse;
import com.fresh_finds.fresh_finds.controller.response.UserProfileResponse;

public interface AuthService {
    MessageResponse register(RegisterRequest request);
    AuthResponse verifyRegistrationOtp(VerifyOtpRequest request);
    MessageResponse resendRegistrationOtp(ResendOtpRequest request);
    AuthResponse login(LoginRequest request);
    UserProfileResponse getCurrentUser(Long userId);
}

