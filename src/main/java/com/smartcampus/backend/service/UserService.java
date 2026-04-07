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
        createLocalUser(request, UserRole.ROLE_USER);
    }

    @Transactional
    public void createAdminUser(UserRegisterRequest request) {
        createLocalUser(request, UserRole.ROLE_ADMIN);
    }

    private void createLocalUser(UserRegisterRequest request, UserRole role) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new EmailInUseException("Email already in use");
        }

        AppUser user = new AppUser();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setProvider(AuthProviders.LOCAL);
        user.setProviderId(null);
        user.setRole(role);
        user.setActive(true);
        userRepository.save(user);
    }
}

