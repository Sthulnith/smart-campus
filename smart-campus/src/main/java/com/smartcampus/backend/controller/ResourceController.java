package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/resources")


public class ResourceController {
    @Autowired
    private ResourceRepository resourceRepository;

    @GetMapping
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }
    @PostMapping
    public Resource createResource(@RequestBody Resource resource) {
        return resourceRepository.save(resource);
    }

    @PutMapping("/{id}")
    public Resource updateResource(@PathVariable Long id, @RequestBody Resource updatedResource) {

    Resource resource = resourceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Resource not found with id " + id));

    resource.setName(updatedResource.getName());
    resource.setType(updatedResource.getType());
    resource.setCapacity(updatedResource.getCapacity());
    resource.setLocation(updatedResource.getLocation());
    resource.setStatus(updatedResource.getStatus());

    return resourceRepository.save(resource);
}

    @DeleteMapping("/{id}")
    public String deleteResource(@PathVariable Long id) {

    if (!resourceRepository.existsById(id)) {
        throw new RuntimeException("Resource not found with id " + id);
    }

    resourceRepository.deleteById(id);
    return "Resource deleted successfully!";
}
   

}
