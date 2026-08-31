package com.fresh_finds.fresh_finds.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Sends transactional email via Brevo's HTTPS API.
 * SMTP is blocked on Railway's Hobby plan, so this uses Brevo's REST API instead.
 */
@Service
public class EmailService {

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final RestClient restClient = RestClient.create();

    @Value("${brevo.api-key}")
    private String apiKey;

    @Value("${mail.from}")
    private String fromAddress;

    public void sendOtpEmail(String toEmail, String otpCode) {
        Map<String, Object> body = Map.of(
                "sender", Map.of("email", fromAddress),
                "to", List.of(Map.of("email", toEmail)),
                "subject", "Your Nirmal Farm verification code",
                "textContent", "Your verification code is: " + otpCode
                        + "\n\nThis code expires in 10 minutes. If you didn't request this, you can ignore this email."
        );

        restClient.post()
                .uri(BREVO_API_URL)
                .header("api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toBodilessEntity();
    }
}
