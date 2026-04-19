package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.UserRegisterRequest;
import com.smartcampus.backend.exception.EmailInUseException;
import com.smartcampus.backend.model.AppUser;
import com.smartcampus.backend.model.UserRole;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.security.AuthProviders;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void registerUser(UserRegisterRequest request) {
        registerLocalUser(request.getName(), request.getEmail(), request.getPassword(), UserRole.ROLE_USER);
    }

    @Transactional
    public void createAdminUser(UserRegisterRequest request) {
        registerLocalUser(request.getName(), request.getEmail(), request.getPassword(), UserRole.ROLE_ADMIN);
    }

    @Transactional
    public AppUser registerLocalUser(String rawName, String rawEmail, String rawPassword, UserRole role) {
        String email = normalizeEmail(rawEmail);
        if (userRepository.findByEmail(email).isPresent()) {
            throw new EmailInUseException("Email already in use");
        }

        AppUser user = new AppUser();
        user.setName(normalizeName(rawName));
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setProvider(AuthProviders.LOCAL);
        user.setProviderId(null);
        user.setRole(role);
        user.setActive(true);
        return userRepository.save(user);
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String normalizeName(String name) {
        return name == null ? "" : name.trim();
    }
}

