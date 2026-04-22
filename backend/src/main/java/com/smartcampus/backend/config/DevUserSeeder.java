package com.smartcampus.backend.config;

import com.smartcampus.backend.model.AppUser;
import com.smartcampus.backend.model.UserRole;
import com.smartcampus.backend.repository.AppUserRepository;
import com.smartcampus.backend.security.AuthProviders;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Configuration
public class DevUserSeeder {

    private static final Logger log = LoggerFactory.getLogger(DevUserSeeder.class);

    @Bean
    @ConditionalOnProperty(name = "app.seed-demo-users", havingValue = "true")
    CommandLineRunner seedUsers(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            seedIfMissing(
                    appUserRepository,
                    passwordEncoder,
                    "Admin User",
                    "admin@test.com",
                    "Admin@123",
                    UserRole.ROLE_ADMIN
            );

            seedIfMissing(
                    appUserRepository,
                    passwordEncoder,
                    "Normal User",
                    "user@test.com",
                    "User@123",
                    UserRole.ROLE_USER
            );

                seedIfMissing(
                    appUserRepository,
                    passwordEncoder,
                    "Technician User",
                    "technician@test.com",
                    "Tech@123",
                    UserRole.ROLE_TECHNICIAN
                );
        };
    }

    private static void seedIfMissing(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder,
            String name,
            String email,
            String rawPassword,
            UserRole role
    ) {
        String normalizedEmail = email.trim().toLowerCase();
        Optional<AppUser> existing = appUserRepository.findByEmail(normalizedEmail);
        if (existing.isPresent()) {
            log.info("skipped existing {}", normalizedEmail);
            return;
        }

        AppUser user = new AppUser();
        user.setName(name);
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setProvider(AuthProviders.LOCAL);
        user.setProviderId(null);
        user.setActive(true);

        appUserRepository.save(user);
        log.info("created {}", normalizedEmail);
    }
}

