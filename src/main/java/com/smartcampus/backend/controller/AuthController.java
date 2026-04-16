package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.SigninRequest;
import com.smartcampus.backend.dto.SignupRequest;
import com.smartcampus.backend.dto.UserRegisterRequest;
import com.smartcampus.backend.model.AppUser;
import com.smartcampus.backend.model.UserRole;
import com.smartcampus.backend.repository.AppUserRepository;
import com.smartcampus.backend.security.AppUserDetails;
import com.smartcampus.backend.security.AuthProviders;
import com.smartcampus.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final SecurityContextHolderStrategy securityContextHolderStrategy;
    private final SecurityContextRepository securityContextRepository;
    private final String backendUrl;

    public AuthController(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            UserService userService,
            @Value("${app.backend-url:http://localhost:8080}") String backendUrl
    ) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.securityContextHolderStrategy = SecurityContextHolder.getContextHolderStrategy();
        this.securityContextRepository = new HttpSessionSecurityContextRepository();
        this.backendUrl = backendUrl;
    }

    @GetMapping("/login")
    public ResponseEntity<Map<String, String>> loginUrl() {
        return ResponseEntity.ok(Map.of("loginUrl", backendUrl + "/oauth2/authorization/google"));
    }

    @PostMapping("/signup")
    @Transactional
    public ResponseEntity<Map<String, Object>> signup(@Valid @RequestBody SignupRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (appUserRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(authBody(
                    "Conflict",
                    "This email is already registered. Sign in or use Google if you signed up that way.",
                    "EMAIL_IN_USE"
            ));
        }

        AppUser user = new AppUser();
        user.setEmail(email);
        user.setName(request.getFullName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setProvider(AuthProviders.LOCAL);
        user.setProviderId(null);
        user.setRole(UserRole.ROLE_USER);
        user.setActive(true);
        appUserRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Account created. You can sign in now.",
                "timestamp", Instant.now().toString()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody UserRegisterRequest request) {
        userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Account created successfully",
                "timestamp", Instant.now().toString()
        ));
    }

    @PostMapping("/signin")
    public ResponseEntity<Map<String, Object>> signin(
            @Valid @RequestBody SigninRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        String email = request.getEmail().trim().toLowerCase();
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
            SecurityContext context = securityContextHolderStrategy.createEmptyContext();
            context.setAuthentication(authentication);
            securityContextHolderStrategy.setContext(context);
            securityContextRepository.saveContext(context, httpRequest, httpResponse);
        } catch (DisabledException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(authBody(
                    "Forbidden",
                    "This account is disabled. Contact an administrator.",
                    "ACCOUNT_DISABLED"
            ));
        } catch (AuthenticationException e) {
            return unauthorizedBody("Invalid email or password.", "BAD_CREDENTIALS");
        }

        return ResponseEntity.ok(Map.of(
                "message", "Signed in successfully.",
                "timestamp", Instant.now().toString()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return unauthorizedEntity();
        }

        AppUser appUser = resolveAppUser(authentication);
        if (appUser == null) {
            return unauthorizedEntity();
        }

        Set<String> authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("id", appUser.getId());
        body.put("email", appUser.getEmail());
        body.put("name", appUser.getName());
        body.put("role", appUser.getRole().name());
        body.put("provider", appUser.getProvider());
        body.put("authorities", authorities);

        return ResponseEntity.ok(body);
    }

    private AppUser resolveAppUser(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof AppUserDetails details) {
            return details.getAppUser();
        }
        if (principal instanceof OAuth2User oauth2User) {
            Object raw = oauth2User.getAttribute("email");
            String email = raw == null ? null : String.valueOf(raw);
            if (email == null || email.isBlank()) {
                return null;
            }
            return appUserRepository.findByEmail(email.trim().toLowerCase()).orElse(null);
        }
        return null;
    }

    private ResponseEntity<Map<String, Object>> unauthorizedEntity() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                authBody("Unauthorized", "Please sign in to continue.", "NOT_AUTHENTICATED")
        );
    }

    private ResponseEntity<Map<String, Object>> unauthorizedBody(String message, String code) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(authBody("Unauthorized", message, code));
    }

    private Map<String, Object> authBody(String error, String message, String code) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", error);
        body.put("message", message);
        body.put("timestamp", Instant.now().toString());
        if (code != null && !code.isBlank()) {
            body.put("code", code);
        }
        return body;
    }
}
