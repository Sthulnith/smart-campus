package com.smartcampus.backend.config;

import com.smartcampus.backend.model.AppUser;
import com.smartcampus.backend.model.UserRole;
import com.smartcampus.backend.repository.AppUserRepository;
import com.smartcampus.backend.repository.PasswordResetTokenRepository;
import com.smartcampus.backend.security.AuthProviders;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DevUserSeeder {

    private static final Logger log = LoggerFactory.getLogger(DevUserSeeder.class);

    @Bean
    @ConditionalOnProperty(name = "app.seed-users", havingValue = "true")
    CommandLineRunner seedUsers(
            AppUserRepository appUserRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            passwordResetTokenRepository.deleteAll();
            appUserRepository.deleteAll();

            AppUser admin = new AppUser();
            admin.setName("Admin User");
            admin.setEmail("admin@test.com");
            admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
            admin.setRole(UserRole.ROLE_ADMIN);
            admin.setProvider(AuthProviders.LOCAL);
            admin.setProviderId(null);
            admin.setActive(true);

            AppUser user = new AppUser();
            user.setName("Normal User");
            user.setEmail("user@test.com");
            user.setPasswordHash(passwordEncoder.encode("User@123"));
            user.setRole(UserRole.ROLE_USER);
            user.setProvider(AuthProviders.LOCAL);
            user.setProviderId(null);
            user.setActive(true);

            appUserRepository.save(admin);
            appUserRepository.save(user);

            log.info("Seeded 1 admin and 1 user for dev environment");
        };
    }
}

