package com.smartcampus.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
@Entity
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;
    private Long resourceId;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private AppUser user;

    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    private String status; // PENDING, APPROVED, REJECTED

    private String purpose;
    private int attendees;

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
    public AppUser getUser() {
        return user;
    }
    public void setUser(AppUser user) {
        this.user = user;
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
}
