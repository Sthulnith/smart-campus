package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.SigninRequest;
import com.smartcampus.backend.dto.SignupRequest;
import com.smartcampus.backend.dto.UpdateProfileRequest;
import com.smartcampus.backend.dto.UserRegisterRequest;
import com.smartcampus.backend.exception.EmailInUseException;
import com.smartcampus.backend.model.AppUser;
import com.smartcampus.backend.model.UserRole;
import com.smartcampus.backend.repository.AppUserRepository;
import com.smartcampus.backend.security.AppUserDetails;
import com.smartcampus.backend.security.RequestThrottleService;
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
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository appUserRepository;
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final RequestThrottleService requestThrottleService;
    private final SecurityContextHolderStrategy securityContextHolderStrategy;
    private final SecurityContextRepository securityContextRepository;
    private final String backendUrl;

    public AuthController(
            AppUserRepository appUserRepository,
            AuthenticationManager authenticationManager,
            UserService userService,
            RequestThrottleService requestThrottleService,
            @Value("${app.backend-url:http://localhost:8080}") String backendUrl
    ) {
        this.appUserRepository = appUserRepository;
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.requestThrottleService = requestThrottleService;
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
        try {
            userService.registerLocalUser(
                    request.getFullName(),
                    request.getEmail(),
                    request.getPassword(),
                    UserRole.ROLE_USER
            );
        } catch (EmailInUseException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(authBody(
                    "Conflict",
                    "This email is already registered. Sign in or use Google if you signed up that way.",
                    "EMAIL_IN_USE"
            ));
        }
        return successBody(HttpStatus.CREATED, "Account created. You can sign in now.", "ACCOUNT_CREATED");
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody UserRegisterRequest request) {
        userService.registerUser(request);
        return successBody(HttpStatus.CREATED, "Account created successfully", "ACCOUNT_CREATED");
    }

    @PostMapping("/signin")
    public ResponseEntity<Map<String, Object>> signin(
            @Valid @RequestBody SigninRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        String email = request.getEmail().trim().toLowerCase();
        String ip = clientIp(httpRequest);
        if (!requestThrottleService.allowSignin(ip, email)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(authBody(
                    "Too Many Requests",
                    "Too many sign-in attempts. Please wait a minute and try again.",
                    "THROTTLED_SIGNIN"
            ));
        }
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

        return successBody(HttpStatus.OK, "Signed in successfully.", "SIGNED_IN");
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

    @PutMapping("/me")
    public ResponseEntity<Map<String, Object>> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    authBody("Unauthorized", "Please sign in to continue.", "NOT_AUTHENTICATED")
            );
        }

        AppUser appUser = resolveAppUser(authentication);
        if (appUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    authBody("Unauthorized", "Please sign in to continue.", "NOT_AUTHENTICATED")
            );
        }

        if (appUser.getRole() == UserRole.ROLE_ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    authBody("Forbidden", "Admin profile editing is not allowed.", "ADMIN_PROFILE_EDIT_BLOCKED")
            );
        }

        if (appUser.getRole() != UserRole.ROLE_USER && appUser.getRole() != UserRole.ROLE_STUDENT) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    authBody("Forbidden", "You are not allowed to edit profile details.", "PROFILE_EDIT_NOT_ALLOWED")
            );
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String normalizedName = request.getName().trim();

        if (normalizedName.isBlank()) {
            return ResponseEntity.badRequest().body(
                    authBody("Bad Request", "Full name is required.", "VALIDATION_ERROR")
            );
        }

        appUserRepository.findByEmail(normalizedEmail)
                .filter(existing -> !existing.getId().equals(appUser.getId()))
                .ifPresent(existing -> {
                    throw new EmailInUseException("Email already in use");
                });

        appUser.setName(normalizedName);
        appUser.setEmail(normalizedEmail);
        AppUser saved = appUserRepository.save(appUser);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("id", saved.getId());
        body.put("email", saved.getEmail());
        body.put("name", saved.getName());
        body.put("role", saved.getRole().name());
        body.put("provider", saved.getProvider());
        body.put("message", "Profile updated successfully.");
        body.put("code", "PROFILE_UPDATED");
        body.put("timestamp", Instant.now().toString());
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

    private ResponseEntity<Map<String, Object>> successBody(HttpStatus status, String message, String code) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", message);
        body.put("code", code);
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.status(status).body(body);
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
