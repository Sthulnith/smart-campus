package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.ForgotPasswordRequest;
import com.smartcampus.backend.dto.ResetPasswordRequest;
import com.smartcampus.backend.security.RequestThrottleService;
import com.smartcampus.backend.service.PasswordResetService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/auth")
public class AuthPasswordResetController {

    private final PasswordResetService passwordResetService;
    private final RequestThrottleService requestThrottleService;

    public AuthPasswordResetController(
            PasswordResetService passwordResetService,
            RequestThrottleService requestThrottleService
    ) {
        this.passwordResetService = passwordResetService;
        this.requestThrottleService = requestThrottleService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest httpRequest
    ) {
        String email = request.getEmail().trim().toLowerCase();
        if (!requestThrottleService.allowForgotPassword(clientIp(httpRequest), email)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(errorBody(
                    "Too Many Requests",
                    "Too many reset attempts. Please wait a few minutes and try again.",
                    "THROTTLED_FORGOT_PASSWORD"
            ));
        }
        return ResponseEntity.ok(passwordResetService.requestForgotPassword(request.getEmail()));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(passwordResetService.resetPassword(request));
    }

    private Map<String, Object> errorBody(String error, String message, String code) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", error);
        body.put("message", message);
        body.put("code", code);
        body.put("timestamp", Instant.now().toString());
        return body;
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return Objects.toString(request.getRemoteAddr(), "unknown");
    }
}
