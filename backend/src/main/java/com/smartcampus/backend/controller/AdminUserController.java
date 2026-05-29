package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.AdminRoleUpdateRequest;
import com.smartcampus.backend.dto.UserRegisterRequest;
import com.smartcampus.backend.model.AppUser;
import com.smartcampus.backend.model.UserRole;
import com.smartcampus.backend.repository.AppUserRepository;
import com.smartcampus.backend.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private static final Logger log = LoggerFactory.getLogger(AdminUserController.class);

    private final UserService userService;
    private final AppUserRepository appUserRepository;
    private final JdbcTemplate jdbcTemplate;

    public AdminUserController(UserService userService, AppUserRepository appUserRepository, JdbcTemplate jdbcTemplate) {
        this.userService = userService;
        this.appUserRepository = appUserRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> body = appUserRepository.findAll().stream()
                .sorted(Comparator.comparing(AppUser::getCreatedAt).reversed())
                .map(user -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", user.getId());
                    row.put("name", user.getName());
                    row.put("email", user.getEmail());
                    row.put("provider", user.getProvider());
                    row.put("role", user.getRole().name());
                    return row;
                })
                .toList();
        return ResponseEntity.ok(body);
    }

    @GetMapping("/technicians")
    public ResponseEntity<List<Map<String, Object>>> getAssignableTechnicians() {
        List<AppUser> technicians = appUserRepository.findByRoleIn(List.of(UserRole.ROLE_TECHNICIAN));

        List<Map<String, Object>> body = technicians.stream()
                .sorted(Comparator.comparing(AppUser::getName, String.CASE_INSENSITIVE_ORDER))
                .map(user -> Map.<String, Object>of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole().name()
                ))
                .toList();

        return ResponseEntity.ok(body);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<Map<String, Object>> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody AdminRoleUpdateRequest request
    ) {
        AppUser user = appUserRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String rawRole = request.getRole() == null ? "" : request.getRole().trim().toUpperCase(Locale.ROOT);
        if (!rawRole.startsWith("ROLE_")) {
            rawRole = "ROLE_" + rawRole;
        }

        UserRole nextRole;
        try {
            nextRole = UserRole.valueOf(rawRole);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role: " + request.getRole());
        }

        user.setRole(nextRole);
        try {
            appUserRepository.save(user);
        } catch (DataIntegrityViolationException ex) {
            // Self-heal older schemas where role is still constrained and rejects ROLE_TECHNICIAN.
            if (nextRole != UserRole.ROLE_TECHNICIAN) {
                throw ex;
            }
            boolean normalized = normalizeRoleColumnToVarchar();
            if (!normalized) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Role update failed because database role column is restricted. Contact support to run migrations."
                );
            }
            try {
                appUserRepository.save(user);
            } catch (DataIntegrityViolationException retryEx) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Role update is blocked by database constraints. Please verify app_users.role supports ROLE_TECHNICIAN."
                );
            }
        }

        return ResponseEntity.ok(Map.of(
                "message", "Role updated successfully",
                "userId", user.getId(),
                "role", user.getRole().name()
        ));
    }

    private boolean normalizeRoleColumnToVarchar() {
        dropRoleCheckConstraintsMySql();
        dropRoleCheckConstraintsPostgres();

        try {
            // MySQL/MariaDB
            jdbcTemplate.execute("ALTER TABLE app_users MODIFY COLUMN role VARCHAR(64) NOT NULL");
            dropRoleCheckConstraintsMySql();
            return true;
        } catch (DataAccessException mysqlEx) {
            log.warn("MySQL role normalization failed: {}", mysqlEx.getMessage());
        }

        try {
            // PostgreSQL
            jdbcTemplate.execute("ALTER TABLE app_users ALTER COLUMN role DROP DEFAULT");
            jdbcTemplate.execute("ALTER TABLE app_users ALTER COLUMN role TYPE VARCHAR(64) USING role::text");
            jdbcTemplate.execute("ALTER TABLE app_users ALTER COLUMN role SET NOT NULL");
            dropRoleCheckConstraintsPostgres();
            return true;
        } catch (DataAccessException postgresEx) {
            log.warn("PostgreSQL role normalization failed: {}", postgresEx.getMessage());
        }

        return false;
    }

    private void dropRoleCheckConstraintsMySql() {
        try {
            List<String> constraints = jdbcTemplate.query(
                    """
                    SELECT tc.CONSTRAINT_NAME
                    FROM information_schema.TABLE_CONSTRAINTS tc
                    JOIN information_schema.CHECK_CONSTRAINTS cc
                      ON cc.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
                     AND cc.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
                    WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
                      AND tc.TABLE_NAME = 'app_users'
                      AND tc.CONSTRAINT_TYPE = 'CHECK'
                      AND (
                          cc.CHECK_CLAUSE LIKE '%`role`%'
                          OR cc.CHECK_CLAUSE LIKE '% role %'
                      )
                    """,
                    (rs, rowNum) -> rs.getString(1)
            );

            constraints.stream()
                    .filter(Objects::nonNull)
                    .forEach(name -> jdbcTemplate.execute("ALTER TABLE app_users DROP CHECK `" + name + "`"));
        } catch (DataAccessException ex) {
            log.debug("Skipping MySQL role check cleanup: {}", ex.getMessage());
        }
    }

    private void dropRoleCheckConstraintsPostgres() {
        try {
            List<String> constraints = jdbcTemplate.query(
                    """
                    SELECT c.conname
                    FROM pg_constraint c
                    JOIN pg_class t ON t.oid = c.conrelid
                    JOIN pg_namespace n ON n.oid = t.relnamespace
                    WHERE t.relname = 'app_users'
                      AND n.nspname = current_schema()
                      AND c.contype = 'c'
                      AND pg_get_constraintdef(c.oid) ILIKE '%role%'
                    """,
                    (rs, rowNum) -> rs.getString(1)
            );

            constraints.stream()
                    .filter(Objects::nonNull)
                    .forEach(name -> jdbcTemplate.execute("ALTER TABLE app_users DROP CONSTRAINT IF EXISTS \"" + name + "\""));
        } catch (DataAccessException ex) {
            log.debug("Skipping PostgreSQL role check cleanup: {}", ex.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createAdmin(@Valid @RequestBody UserRegisterRequest request) {
        userService.createAdminUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Admin account created successfully",
                "timestamp", java.time.Instant.now().toString()
        ));
    }
}

