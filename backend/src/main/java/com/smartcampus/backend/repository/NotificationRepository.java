package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTargetRoleOrderByCreatedAtDesc(UserRole targetRole);
}
