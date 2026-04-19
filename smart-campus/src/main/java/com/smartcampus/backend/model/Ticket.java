package com.smartcampus.backend.model;
import jakarta.persistence.*;
import java.util.List;
@Entity

public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
     private Long resourceId;

    private String description;
    private String category;
    private String priority; // LOW, MEDIUM, HIGH

    private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED

    private Long assignedTo; // technician ID

    // Store image paths (max 3)
    @ElementCollection
    private List<String> imageUrls;


    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public Long getAssignedTo() {
        return assignedTo;
    }
    public void setAssignedTo(Long assignedTo) {
        this.assignedTo = assignedTo;
    }
    public List<String> getImageUrls() {
        return imageUrls;
    }
    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    

}
