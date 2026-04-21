package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
}