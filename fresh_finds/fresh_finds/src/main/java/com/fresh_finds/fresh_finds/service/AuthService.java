package com.fresh_finds.fresh_finds.service;

import com.fresh_finds.fresh_finds.controller.request.LoginRequest;
import com.fresh_finds.fresh_finds.controller.request.RegisterRequest;
import com.fresh_finds.fresh_finds.controller.response.AuthResponse;
import com.fresh_finds.fresh_finds.controller.response.UserProfileResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserProfileResponse getCurrentUser(Long userId);
}

