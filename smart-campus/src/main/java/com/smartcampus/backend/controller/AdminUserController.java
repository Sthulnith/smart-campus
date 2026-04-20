package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.UserRegisterRequest;
import com.smartcampus.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
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

