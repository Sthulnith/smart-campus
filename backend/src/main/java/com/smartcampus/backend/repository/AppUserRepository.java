package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.AppUser;
import com.smartcampus.backend.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);
    List<AppUser> findByRoleIn(Collection<UserRole> roles);
}

