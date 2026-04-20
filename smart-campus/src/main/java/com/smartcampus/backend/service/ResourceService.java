package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
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
        return resourceRepository.save(resource);
    }

    public Resource updateResource(Long id, Resource updatedResource) {
    return resourceRepository.findById(id).map(resource -> {
        resource.setName(updatedResource.getName());
        resource.setType(updatedResource.getType());
        resource.setCapacity(updatedResource.getCapacity());
        resource.setLocation(updatedResource.getLocation());
        resource.setStatus(updatedResource.getStatus());
        return resourceRepository.save(resource);
    }).orElseThrow(() -> new RuntimeException("Resource not found"));
}

    // Delete resource
    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }
}