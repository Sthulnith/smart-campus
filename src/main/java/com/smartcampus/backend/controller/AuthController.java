package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.AppUser;
import com.smartcampus.backend.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository appUserRepository;
    private final String backendUrl;

    public AuthController(
            AppUserRepository appUserRepository,
            @Value("${app.backend-url:http://localhost:8080}") String backendUrl
    ) {
        this.appUserRepository = appUserRepository;
        this.backendUrl = backendUrl;
    }

    @GetMapping("/login")
    public ResponseEntity<Map<String, String>> loginUrl() {
        return ResponseEntity.ok(Map.of("loginUrl", backendUrl + "/oauth2/authorization/google"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof OAuth2User oauth2User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized", "timestamp", Instant.now().toString()));
        }

        String email = oauth2User.getAttribute("email");
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized", "timestamp", Instant.now().toString()));
        }

        AppUser appUser = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user record not found"));

        Set<String> authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        return ResponseEntity.ok(Map.of(
                "id", appUser.getId(),
                "email", appUser.getEmail(),
                "name", appUser.getName(),
                "role", appUser.getRole().name(),
                "provider", appUser.getProvider(),
                "authorities", authorities
        ));
    }
}

