package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.UserNotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserNotificationPreferenceRepository extends JpaRepository<UserNotificationPreference, Long> {
    List<UserNotificationPreference> findByUserId(Long userId);
    Optional<UserNotificationPreference> findByUserIdAndCategory(Long userId, String category);
}
