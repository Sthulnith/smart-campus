package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.AdminRoleUpdateRequest;
import com.smartcampus.backend.dto.UserRegisterRequest;
import com.smartcampus.backend.model.AppUser;
import com.smartcampus.backend.model.UserRole;
import com.smartcampus.backend.repository.AppUserRepository;
import com.smartcampus.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserService userService;
    private final AppUserRepository appUserRepository;

    public AdminUserController(UserService userService, AppUserRepository appUserRepository) {
        this.userService = userService;
        this.appUserRepository = appUserRepository;
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
        appUserRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Role updated successfully",
                "userId", user.getId(),
                "role", user.getRole().name()
        ));
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

