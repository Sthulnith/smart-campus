package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void createNotification(String message, String actionType, String entityType, Long entityId, String createdBy) {
        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setActionType(actionType);
        notification.setEntityType(entityType);
        notification.setEntityId(entityId);
        notification.setCreatedBy(createdBy);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);
    }
}