package com.smartcampus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class NotificationUpsertRequest {

    @NotBlank(message = "Title is required.")
    @Size(max = 160, message = "Title must be 160 characters or fewer.")
    private String title;

    @NotBlank(message = "Message is required.")
    @Size(max = 2000, message = "Message must be 2000 characters or fewer.")
    private String message;

    @NotBlank(message = "Type is required.")
    @Size(max = 40, message = "Type must be 40 characters or fewer.")
    private String type;

    @NotBlank(message = "Target role is required.")
    private String targetRole;

    @NotBlank(message = "Category is required.")
    private String category;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
