package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository for registration use-cases using the existing AppUser entity.
 */
public interface UserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);
}

