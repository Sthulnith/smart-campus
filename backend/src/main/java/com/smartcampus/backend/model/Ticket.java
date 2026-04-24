package com.smartcampus.backend.model;
<<<<<<< HEAD
import jakarta.persistence.*;
import java.util.List;
@Entity

=======

import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;

@Entity
>>>>>>> fix/32-fix-main-branch
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
<<<<<<< HEAD
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

    

=======

    private String title;
    private Long resourceId;
    private String location;
    private String contact;

    @Column(length = 2000)
    private String description;

    private String category;    // Hardware, Software, Network, Facility, Other
    private String priority;    // LOW, MEDIUM, HIGH, URGENT

    private String status;      // OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED

    private Long assignedTo;    // technician user ID
    private Long createdBy;     // user ID who created the ticket

    @Column(length = 1000)
    private String rejectionReason;

    @Column(length = 2000)
    private String resolutionNotes;

    @ElementCollection
    private List<String> imageUrls;

    private Instant createdAt;
    private Instant updatedAt;
    private Instant firstResponseAt;
    private Instant resolvedAt;

    @PrePersist
    public void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getAssignedTo() { return assignedTo; }
    public void setAssignedTo(Long assignedTo) { this.assignedTo = assignedTo; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public Instant getFirstResponseAt() { return firstResponseAt; }
    public void setFirstResponseAt(Instant firstResponseAt) { this.firstResponseAt = firstResponseAt; }

    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
>>>>>>> fix/32-fix-main-branch
}
