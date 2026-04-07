package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.ResetPasswordRequest;
import com.smartcampus.backend.model.AppUser;
import com.smartcampus.backend.model.PasswordResetToken;
import com.smartcampus.backend.repository.AppUserRepository;
import com.smartcampus.backend.repository.PasswordResetTokenRepository;
import com.smartcampus.backend.security.AuthProviders;
import com.smartcampus.backend.security.TokenHasher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    private final AppUserRepository appUserRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetMailService passwordResetMailService;

    private final String frontendBaseUrl;
    private final boolean demoResetLinkEnabled;

    public PasswordResetService(
            AppUserRepository appUserRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            PasswordResetMailService passwordResetMailService,
            @Value("${app.frontend-url:http://localhost:3000}") String frontendBaseUrl,
            @Value("${app.auth.reset-demo-link-enabled:false}") boolean demoResetLinkEnabled
    ) {
        this.appUserRepository = appUserRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetMailService = passwordResetMailService;
        this.frontendBaseUrl = frontendBaseUrl.replaceAll("/$", "");
        this.demoResetLinkEnabled = demoResetLinkEnabled;
    }

    /**
     * Always returns the same response to avoid user enumeration.
     */
    @Transactional
    public Map<String, Object> requestForgotPassword(String email) {
        String normalized = email.trim().toLowerCase();
        Optional<AppUser> userOpt = appUserRepository.findByEmail(normalized);

        if (userOpt.isPresent()) {
            AppUser user = userOpt.get();
            if (isLocalPasswordAccount(user)) {
                tokenRepository.invalidateUnusedForUser(user.getId());

                String raw = TokenHasher.newRawToken();
                String hash = TokenHasher.sha256Hex(raw);

                PasswordResetToken entity = new PasswordResetToken();
                entity.setUser(user);
                entity.setTokenHash(hash);
                entity.setExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));
                entity.setUsed(false);
                tokenRepository.save(entity);

                String resetLink = buildResetLink(raw);
                if (demoResetLinkEnabled) {
                    log.warn("[DEMO] Password reset link (do not enable in production): {}", resetLink);
                } else {
                    try {
                        passwordResetMailService.sendPasswordResetEmail(user.getEmail(), resetLink);
                    } catch (MailException ex) {
                        // Keep a generic API response to avoid account enumeration leaks.
                        log.warn("Password reset email was not delivered for a local account.");
                    }
                }
                log.info("Password reset requested for local account (email redacted).");
            }
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "If an account exists with that email, reset instructions were sent.");
        body.put("code", "RESET_EMAIL_DISPATCHED");
        body.put("timestamp", Instant.now().toString());
        if (demoResetLinkEnabled) {
            body.put("demo", true);
        }
        return body;
    }

    @Transactional
    public Map<String, Object> resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match.");
        }

        String raw = request.getToken().trim();
        String hash = TokenHasher.sha256Hex(raw);
        PasswordResetToken prt = tokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "This reset link is invalid or has expired."
                ));

        if (prt.isUsed() || prt.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This reset link is invalid or has expired."
            );
        }

        AppUser user = prt.getUser();
        if (!isLocalPasswordAccount(user)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This reset link is invalid or has expired."
            );
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        appUserRepository.save(user);

        prt.setUsed(true);
        tokenRepository.save(prt);
        tokenRepository.invalidateUnusedForUser(user.getId());

        return Map.of(
                "message", "Your password was updated. You can sign in now.",
                "code", "PASSWORD_RESET_SUCCESS",
                "timestamp", Instant.now().toString()
        );
    }

    private boolean isLocalPasswordAccount(AppUser user) {
        return AuthProviders.LOCAL.equalsIgnoreCase(user.getProvider())
                && user.getPasswordHash() != null
                && !user.getPasswordHash().isBlank();
    }

    private String buildResetLink(String rawToken) {
        String encoded = URLEncoder.encode(rawToken, StandardCharsets.UTF_8);
        return frontendBaseUrl + "/reset-password?token=" + encoded;
    }
}
