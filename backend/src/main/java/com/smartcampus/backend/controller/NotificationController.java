package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.NotificationUpsertRequest;
import com.smartcampus.backend.model.AppUser;
import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.model.UserRole;
import com.smartcampus.backend.model.UserNotificationPreference;
import com.smartcampus.backend.repository.AppUserRepository;
import com.smartcampus.backend.repository.NotificationRepository;
import com.smartcampus.backend.repository.UserNotificationPreferenceRepository;
import com.smartcampus.backend.security.AppUserDetails;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    private static final List<String> CATEGORIES = List.of(
            "BOOKING",
            "MAINTENANCE",
            "ANNOUNCEMENT",
            "RESOURCE",
            "GENERAL"
    );

    private final NotificationRepository notificationRepository;
    private final AppUserRepository appUserRepository;
    private final UserNotificationPreferenceRepository preferenceRepository;
    private final JdbcTemplate jdbcTemplate;

    public NotificationController(
            NotificationRepository notificationRepository,
            AppUserRepository appUserRepository,
            UserNotificationPreferenceRepository preferenceRepository,
            JdbcTemplate jdbcTemplate
    ) {
        this.notificationRepository = notificationRepository;
        this.appUserRepository = appUserRepository;
        this.preferenceRepository = preferenceRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> myNotifications(Authentication authentication) {
        AppUser currentUser = resolveUser(authentication);
        UserRole role = currentUser.getRole();
        try {
            Set<String> enabledCategories = enabledCategoriesFor(currentUser.getId());
            List<Map<String, Object>> body = notificationRepository.findByTargetRoleOrderByCreatedAtDesc(role).stream()
                    .filter(n -> enabledCategories.contains(normalizeCategory(n.getCategory())))
                    .map(this::toResponse)
                    .toList();
            return ResponseEntity.ok(body);
        } catch (DataAccessException ex) {
            log.warn("Notifications query failed, returning empty list. reason={}", ex.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/preferences")
    public ResponseEntity<Map<String, Object>> getMyPreferences(Authentication authentication) {
        AppUser currentUser = resolveUser(authentication);
        Map<String, Boolean> categories;
        try {
            categories = preferencesMapFor(currentUser.getId());
        } catch (DataAccessException ex) {
            log.warn("Preferences query failed, using defaults. reason={}", ex.getMessage());
            categories = new LinkedHashMap<>();
            for (String category : CATEGORIES) {
                categories.put(category, true);
            }
        }
        return ResponseEntity.ok(Map.of(
                "categories", categories,
                "timestamp", Instant.now().toString()
        ));
    }

    @PutMapping("/preferences")
    public ResponseEntity<Map<String, Object>> updateMyPreferences(
            @RequestBody Map<String, Object> request,
            Authentication authentication
    ) {
        AppUser currentUser = resolveUser(authentication);
        Object categoriesRaw = request == null ? null : request.get("categories");
        if (!(categoriesRaw instanceof Map<?, ?> categoriesInput)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "categories object is required.");
        }

        Map<String, Boolean> normalized = new HashMap<>();
        for (String category : CATEGORIES) {
            Object value = categoriesInput.get(category);
            if (!(value instanceof Boolean)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each category must be true or false.");
            }
            normalized.put(category, (Boolean) value);
        }

        try {
            preferenceRepository.findByUserId(currentUser.getId()).forEach(preferenceRepository::delete);
            normalized.forEach((category, enabled) -> {
                UserNotificationPreference pref = new UserNotificationPreference();
                pref.setUserId(currentUser.getId());
                pref.setCategory(category);
                pref.setEnabled(enabled);
                preferenceRepository.save(pref);
            });
        } catch (DataAccessException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Notification preferences are temporarily unavailable. Please run the latest database migrations."
            );
        }

        return ResponseEntity.ok(Map.of(
                "categories", normalized,
                "message", "Notification preferences updated successfully.",
                "code", "NOTIFICATION_PREFERENCES_UPDATED",
                "timestamp", Instant.now().toString()
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createNotification(
            @Valid @RequestBody NotificationUpsertRequest request,
            Authentication authentication
    ) {
        AppUser currentUser = resolveUser(authentication);
        ensureAdmin(currentUser);

        Notification entity = new Notification();
        applyRequest(entity, request);
        Notification saved;
        try {
            saved = notificationRepository.save(entity);
        } catch (DataAccessException ex) {
            log.warn("Create notification failed. reason={}", ex.getMessage());
            ensureNotificationSchema();
            try {
                saved = notificationRepository.save(entity);
            } catch (DataAccessException retryEx) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Notification could not be created due to database schema mismatch. Please run latest migrations."
                );
            }
        }

        Map<String, Object> body = toResponse(saved);
        body.put("message", "Notification created successfully.");
        body.put("code", "NOTIFICATION_CREATED");
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateNotification(
            @PathVariable Long id,
            @Valid @RequestBody NotificationUpsertRequest request,
            Authentication authentication
    ) {
        AppUser currentUser = resolveUser(authentication);
        ensureAdmin(currentUser);

        Notification entity = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found."));

        applyRequest(entity, request);
        Notification saved;
        try {
            saved = notificationRepository.save(entity);
        } catch (DataAccessException ex) {
            log.warn("Update notification failed. reason={}", ex.getMessage());
            ensureNotificationSchema();
            try {
                saved = notificationRepository.save(entity);
            } catch (DataAccessException retryEx) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Notification could not be updated due to database schema mismatch. Please run latest migrations."
                );
            }
        }

        Map<String, Object> body = toResponse(saved);
        body.put("message", "Notification updated successfully.");
        body.put("code", "NOTIFICATION_UPDATED");
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(body);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteNotification(
            @PathVariable Long id,
            Authentication authentication
    ) {
        AppUser currentUser = resolveUser(authentication);
        ensureAdmin(currentUser);

        Notification entity = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found."));

        notificationRepository.delete(entity);
        return ResponseEntity.ok(Map.of(
                "message", "Notification deleted successfully.",
                "code", "NOTIFICATION_DELETED",
                "timestamp", Instant.now().toString()
        ));
    }

    private void applyRequest(Notification entity, NotificationUpsertRequest request) {
        entity.setTitle(request.getTitle().trim());
        entity.setMessage(request.getMessage().trim());
        entity.setType(request.getType().trim().toUpperCase(Locale.ROOT));
        entity.setCategory(parseCategory(request.getCategory()));
        entity.setTargetRole(parseRole(request.getTargetRole()));
    }

    private UserRole parseRole(String rawRole) {
        String value = rawRole == null ? "" : rawRole.trim().toUpperCase(Locale.ROOT);
        if (!value.startsWith("ROLE_")) {
            value = "ROLE_" + value;
        }
        try {
            return UserRole.valueOf(value);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid target role: " + rawRole);
        }
    }

    private Map<String, Object> toResponse(Notification n) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", n.getId());
        row.put("title", n.getTitle());
        row.put("message", n.getMessage());
        row.put("type", n.getType());
        row.put("category", normalizeCategory(n.getCategory()));
        row.put("targetRole", n.getTargetRole().name());
        row.put("createdAt", n.getCreatedAt() != null ? n.getCreatedAt().toEpochMilli() : Instant.now().toEpochMilli());
        row.put("updatedAt", n.getUpdatedAt() != null ? n.getUpdatedAt().toEpochMilli() : Instant.now().toEpochMilli());
        return row;
    }

    private String parseCategory(String rawCategory) {
        String category = normalizeCategory(rawCategory);
        if (!CATEGORIES.contains(category)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category: " + rawCategory);
        }
        return category;
    }

    private String normalizeCategory(String category) {
        String normalized = category == null ? "GENERAL" : category.trim().toUpperCase(Locale.ROOT);
        return normalized.isBlank() ? "GENERAL" : normalized;
    }

    private Set<String> enabledCategoriesFor(Long userId) {
        Map<String, Boolean> map = preferencesMapFor(userId);
        Set<String> enabled = new HashSet<>();
        map.forEach((category, isEnabled) -> {
            if (Boolean.TRUE.equals(isEnabled)) {
                enabled.add(category);
            }
        });
        return enabled;
    }

    private Map<String, Boolean> preferencesMapFor(Long userId) {
        Map<String, Boolean> result = new LinkedHashMap<>();
        CATEGORIES.forEach(category -> result.put(category, true));
        preferenceRepository.findByUserId(userId).forEach(pref -> {
            String category = normalizeCategory(pref.getCategory());
            if (result.containsKey(category)) {
                result.put(category, pref.isEnabled());
            }
        });
        return result;
    }

    private AppUser resolveUser(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in to continue.");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof AppUserDetails details) {
            return details.getAppUser();
        }
        if (principal instanceof OAuth2User oauth2User) {
            Object rawEmail = oauth2User.getAttribute("email");
            String email = rawEmail == null ? null : String.valueOf(rawEmail).trim().toLowerCase(Locale.ROOT);
            if (email != null && !email.isBlank()) {
                return appUserRepository.findByEmail(email)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in to continue."));
            }
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in to continue.");
    }

    private void ensureAdmin(AppUser user) {
        if (user.getRole() != UserRole.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can manage notifications.");
        }
    }

    private void ensureNotificationSchema() {
        try {
            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS notifications (
                        id BIGSERIAL PRIMARY KEY,
                        title VARCHAR(160) NOT NULL,
                        message VARCHAR(2000) NOT NULL,
                        type VARCHAR(40) NOT NULL,
                        category VARCHAR(40) NOT NULL DEFAULT 'GENERAL',
                        target_role VARCHAR(40) NOT NULL,
                        created_at TIMESTAMP(6) NOT NULL,
                        updated_at TIMESTAMP(6) NOT NULL
                    )
                    """);
            jdbcTemplate.execute("""
                    ALTER TABLE notifications
                    ADD COLUMN IF NOT EXISTS category VARCHAR(40) NOT NULL DEFAULT 'GENERAL'
                    """);
            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS user_notification_preferences (
                        id BIGSERIAL PRIMARY KEY,
                        user_id BIGINT NOT NULL,
                        category VARCHAR(40) NOT NULL,
                        enabled BOOLEAN NOT NULL DEFAULT TRUE,
                        created_at TIMESTAMP(6) NOT NULL,
                        updated_at TIMESTAMP(6) NOT NULL,
                        CONSTRAINT uk_user_notification_pref UNIQUE (user_id, category),
                        CONSTRAINT fk_user_notification_pref_user
                            FOREIGN KEY (user_id) REFERENCES app_users (id) ON DELETE CASCADE
                    )
                    """);
        } catch (DataAccessException ex) {
            log.warn("Schema self-heal failed for notifications. reason={}", ex.getMessage());
        }
    }
}
