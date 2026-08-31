package com.fresh_finds.fresh_finds.service.impl;

import com.fresh_finds.fresh_finds.controller.request.LoginRequest;
import com.fresh_finds.fresh_finds.controller.request.RegisterRequest;
import com.fresh_finds.fresh_finds.controller.request.ResendOtpRequest;
import com.fresh_finds.fresh_finds.controller.request.VerifyOtpRequest;
import com.fresh_finds.fresh_finds.controller.response.AuthResponse;
import com.fresh_finds.fresh_finds.controller.response.MessageResponse;
import com.fresh_finds.fresh_finds.controller.response.UserProfileResponse;
import com.fresh_finds.fresh_finds.repository.PendingRegistrationRepository;
import com.fresh_finds.fresh_finds.repository.UserRepository;
import com.fresh_finds.fresh_finds.repository.entity.PendingRegistration;
import com.fresh_finds.fresh_finds.repository.entity.User;
import com.fresh_finds.fresh_finds.service.AuthService;
import com.fresh_finds.fresh_finds.utils.EmailService;
import com.fresh_finds.fresh_finds.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${otp.expiry-minutes:10}")
    private long otpExpiryMinutes;

    @Value("${otp.max-attempts:5}")
    private int otpMaxAttempts;

    @Value("${otp.resend-cooldown-seconds:60}")
    private long otpResendCooldownSeconds;

    public AuthServiceImpl(UserRepository userRepository,
                            PendingRegistrationRepository pendingRegistrationRepository,
                            PasswordEncoder passwordEncoder,
                            JwtUtil jwtUtil,
                            EmailService emailService) {
        this.userRepository = userRepository;
        this.pendingRegistrationRepository = pendingRegistrationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public MessageResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        PendingRegistration pending = pendingRegistrationRepository.findByEmail(request.getEmail())
                .orElseGet(PendingRegistration::new);

        enforceResendCooldown(pending.getLastOtpSentAt());

        pending.setEmail(request.getEmail());
        pending.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        pending.setFirstName(request.getFirstName());
        pending.setLastName(request.getLastName());
        pending.setPhone(request.getPhone());
        pending.setAddressLine1(request.getAddressLine1());
        pending.setAddressLine2(request.getAddressLine2());
        pending.setCity(request.getCity());
        pending.setState(request.getState());
        pending.setZipCode(request.getZipCode());
        pending.setCountry(request.getCountry());

        issueNewOtp(pending);
        pendingRegistrationRepository.save(pending);

        emailService.sendOtpEmail(pending.getEmail(), pending.getOtpCode());

        return new MessageResponse("Verification code sent to your email. Please verify to complete registration.");
    }

    @Override
    @Transactional
    public AuthResponse verifyRegistrationOtp(VerifyOtpRequest request) {
        PendingRegistration pending = pendingRegistrationRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No pending registration found for this email"));

        if (pending.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code expired, please request a new one");
        }

        if (pending.getOtpAttempts() >= otpMaxAttempts) {
            throw new IllegalArgumentException("Too many incorrect attempts, please request a new code");
        }

        if (!pending.getOtpCode().equals(request.getOtp())) {
            pending.setOtpAttempts(pending.getOtpAttempts() + 1);
            pendingRegistrationRepository.save(pending);
            throw new IllegalArgumentException("Invalid verification code");
        }

        User user = new User();
        user.setEmail(pending.getEmail());
        user.setPassword(pending.getPasswordHash());
        user.setFirstName(pending.getFirstName());
        user.setLastName(pending.getLastName());
        user.setPhone(pending.getPhone());
        user.setAddressLine1(pending.getAddressLine1());
        user.setAddressLine2(pending.getAddressLine2());
        user.setCity(pending.getCity());
        user.setState(pending.getState());
        user.setZipCode(pending.getZipCode());
        user.setCountry(pending.getCountry());
        user.setRole("CUSTOMER");
        user.setIsActive(true);
        user.setIsEmailVerified(true);
        user.setLastLoginAt(LocalDateTime.now());

        user = userRepository.save(user);
        pendingRegistrationRepository.deleteByEmail(pending.getEmail());

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());

        AuthResponse response = new AuthResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRole(user.getRole());
        response.setToken(token);
        return response;
    }

    @Override
    @Transactional
    public MessageResponse resendRegistrationOtp(ResendOtpRequest request) {
        PendingRegistration pending = pendingRegistrationRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No pending registration found for this email"));

        enforceResendCooldown(pending.getLastOtpSentAt());

        issueNewOtp(pending);
        pendingRegistrationRepository.save(pending);

        emailService.sendOtpEmail(pending.getEmail(), pending.getOtpCode());

        return new MessageResponse("Verification code resent to your email.");
    }

    private void enforceResendCooldown(LocalDateTime lastOtpSentAt) {
        if (lastOtpSentAt == null) {
            return;
        }
        long secondsSinceLastSend = ChronoUnit.SECONDS.between(lastOtpSentAt, LocalDateTime.now());
        if (secondsSinceLastSend < otpResendCooldownSeconds) {
            long waitSeconds = otpResendCooldownSeconds - secondsSinceLastSend;
            throw new IllegalArgumentException("Please wait " + waitSeconds + " seconds before requesting another code");
        }
    }

    private void issueNewOtp(PendingRegistration pending) {
        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        pending.setOtpCode(otp);
        pending.setOtpExpiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
        pending.setOtpAttempts(0);
        pending.setLastOtpSentAt(LocalDateTime.now());
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // Check if user is active
        if (user.getIsActive() == null || !user.getIsActive()) {
            throw new IllegalArgumentException("Account is inactive");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());

        // Create response
        AuthResponse response = new AuthResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRole(user.getRole());
        response.setToken(token);

        return response;
    }

    @Override
    public UserProfileResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setPhone(user.getPhone());
        response.setAddressLine1(user.getAddressLine1());
        response.setAddressLine2(user.getAddressLine2());
        response.setCity(user.getCity());
        response.setState(user.getState());
        response.setZipCode(user.getZipCode());
        response.setCountry(user.getCountry());
        response.setRole(user.getRole());
        return response;
    }
}
