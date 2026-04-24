package com.smartcampus.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
<<<<<<< HEAD
=======

>>>>>>> fix/32-fix-main-branch
@Entity
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
<<<<<<< HEAD

    private Long id;
    private Long resourceId;
    private Long userId;

    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    private String status; // PENDING, APPROVED, REJECTED
=======
    private Long id;

    private Long resourceId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private AppUser user;

    private LocalDate date;
    private LocalDate endDate;
    private LocalTime startTime;
    private LocalTime endTime;

    private String status; // PENDING, APPROVED, REJECTED, CANCELLED
>>>>>>> fix/32-fix-main-branch

    private String purpose;
    private int attendees;

<<<<<<< HEAD
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
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    public LocalDate getDate() {
        return date;
    }
    public void setDate(LocalDate date) {
        this.date = date;
    }
    public LocalTime getStartTime() {
        return startTime;
    }
    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }
    public LocalTime getEndTime() {
        return endTime;
    }
    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public String getPurpose() {
        return purpose;
    }
    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }
    public int getAttendees() {
        return attendees;
    }
    public void setAttendees(int attendees) {
        this.attendees = attendees;
    }
    
=======
    // Premium UI additions
    private String campus;
    private String category;
    private String floor;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public int getAttendees() { return attendees; }
    public void setAttendees(int attendees) { this.attendees = attendees; }

    public String getCampus() { return campus; }
    public void setCampus(String campus) { this.campus = campus; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }
>>>>>>> fix/32-fix-main-branch
}
