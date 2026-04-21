package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    public ResourceService(ResourceRepository resourceRepository,
                           NotificationService notificationService) {
        this.resourceRepository = resourceRepository;
        this.notificationService = notificationService;
    }

    // Get all resources
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    // Get resource by ID
    public Optional<Resource> getResourceById(Long id) {
        return resourceRepository.findById(id);
    }

    // Create resource
    public Resource createResource(Resource resource) {
        Resource saved = resourceRepository.save(resource);

        notificationService.createNotification(
                "Added resource " + saved.getName(),
                "ADD",
                "RESOURCE",
                saved.getId(),
                "Admin"
        );

        return saved;
    }

    // Update resource
    public Resource updateResource(Long id, Resource updatedResource) {
        return resourceRepository.findById(id).map(resource -> {
            resource.setName(updatedResource.getName());
            resource.setType(updatedResource.getType());
            resource.setCapacity(updatedResource.getCapacity());
            resource.setLocation(updatedResource.getLocation());
            resource.setStatus(updatedResource.getStatus());

            Resource saved = resourceRepository.save(resource);

            notificationService.createNotification(
                    "Updated resource " + saved.getName(),
                    "UPDATE",
                    "RESOURCE",
                    saved.getId(),
                    "Admin"
            );

            return saved;
        }).orElseThrow(() -> new RuntimeException("Resource not found"));
    }

    // Delete resource
    public void deleteResource(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        String resourceName = resource.getName();

        resourceRepository.deleteById(id);

        notificationService.createNotification(
                "Deleted resource " + resourceName,
                "DELETE",
                "RESOURCE",
                id,
                "Admin"
        );
    }
}