package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.AppUser;
import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.model.UserRole;
import com.smartcampus.backend.repository.AppUserRepository;
import com.smartcampus.backend.repository.TicketRepository;
import com.smartcampus.backend.security.AppUserDetails;
import com.smartcampus.backend.service.FileStorageService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private AppUserRepository appUserRepository;

    // Valid status transitions
    private static final Map<String, List<String>> VALID_TRANSITIONS = Map.of(
        "OPEN", List.of("IN_PROGRESS", "REJECTED"),
        "IN_PROGRESS", List.of("RESOLVED", "REJECTED"),
        "RESOLVED", List.of("CLOSED"),
        "CLOSED", List.of(),
        "REJECTED", List.of()
    );

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
        "image/jpeg", "image/jpg", "image/png"
    );

    // ── GET ALL (Admin sees all) ──
    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    // ── GET MY TICKETS (User sees own) ──
    @GetMapping("/my")
    public List<Ticket> getMyTickets(Authentication authentication) {
        AppUser user = resolveUser(authentication);
        return ticketRepository.findByCreatedBy(user.getId());
    }

    // ── GET BY ASSIGNED TECHNICIAN ──
    @GetMapping("/assigned")
    public List<Ticket> getAssignedTickets(Authentication authentication) {
        AppUser user = resolveUser(authentication);
        return ticketRepository.findByAssignedTo(user.getId());
    }

    // ── CREATE ──
    @PostMapping
    public Ticket createTicket(@RequestBody Ticket ticket, Authentication authentication) {
        AppUser user = resolveUser(authentication);
        ticket.setStatus("OPEN");
        ticket.setCreatedBy(user.getId());
        return ticketRepository.save(ticket);
    }

    // ── DELETE ──
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTicket(@PathVariable Long id) {
        Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticketRepository.delete(ticket);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    // ── UPDATE (general fields) ──
    @PutMapping("/{id}")
    public Ticket updateTicket(@PathVariable Long id, @RequestBody Ticket updated) {
        Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (updated.getTitle() != null) ticket.setTitle(updated.getTitle());
        if (updated.getCategory() != null) ticket.setCategory(updated.getCategory());
        if (updated.getDescription() != null) ticket.setDescription(updated.getDescription());
        if (updated.getPriority() != null) ticket.setPriority(updated.getPriority());
        if (updated.getResourceId() != null) ticket.setResourceId(updated.getResourceId());
        if (updated.getLocation() != null) ticket.setLocation(updated.getLocation());
        if (updated.getContact() != null) ticket.setContact(updated.getContact());

        return ticketRepository.save(ticket);
    }

    // ── UPDATE STATUS (with transition validation) ──
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

        AppUser currentUser = resolveUser(authentication);
        String newStatus = body.get("status");
        String rejectionReason = body.get("rejectionReason");
        String resolutionNotes = body.get("resolutionNotes");

        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Status is required"));
        }

        String currentStatus = ticket.getStatus();

        // Validate transition
        List<String> allowed = VALID_TRANSITIONS.getOrDefault(currentStatus, List.of());
        if (!allowed.contains(newStatus)) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Invalid status transition from " + currentStatus + " to " + newStatus
            ));
        }

        // REJECTED requires a reason and must be ADMIN
        if ("REJECTED".equals(newStatus)) {
            if (currentUser.getRole() != UserRole.ROLE_ADMIN) {
                return ResponseEntity.status(403).body(Map.of("message", "Only admins can reject tickets"));
            }
            if (rejectionReason == null || rejectionReason.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Rejection reason is required"));
            }
            ticket.setRejectionReason(rejectionReason);
        }

        // IN_PROGRESS requires a technician to be assigned
        if ("IN_PROGRESS".equals(newStatus) && ticket.getAssignedTo() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Cannot move to IN_PROGRESS without an assigned technician"
            ));
        }

        // Set milestone timestamps
        if ("IN_PROGRESS".equals(newStatus) && ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(Instant.now());
        }

        // RESOLVED requires resolution notes from technician
        if ("RESOLVED".equals(newStatus)) {
            if (resolutionNotes == null || resolutionNotes.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Resolution notes are required"));
            }
            ticket.setResolutionNotes(resolutionNotes);
            ticket.setResolvedAt(Instant.now());
        }

        ticket.setStatus(newStatus);
        ticketRepository.save(ticket);

        return ResponseEntity.ok(ticket);
    }

    // ── ASSIGN TECHNICIAN ──
    @PutMapping("/{id}/assign")
    public Ticket assignTechnician(@PathVariable Long id, @RequestParam Long technicianId) {
        Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

        AppUser technician = appUserRepository.findById(technicianId)
            .orElseThrow(() -> new RuntimeException("Technician not found"));

        if (technician.getRole() != UserRole.ROLE_TECHNICIAN) {
            throw new RuntimeException("Assigned user must have technician role");
        }

        ticket.setAssignedTo(technicianId);
        ticket.setStatus("IN_PROGRESS");
        if (ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(Instant.now());
        }

        return ticketRepository.save(ticket);
    }

    // ── UPLOAD IMAGES ──
    @PostMapping("/{id}/upload")
    public ResponseEntity<?> uploadImages(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files) {

        if (files.size() > 3) {
            return ResponseEntity.badRequest().body(Map.of("message", "Maximum 3 images allowed"));
        }

        // Validate file types
        for (MultipartFile file : files) {
            String contentType = file.getContentType();
            if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Only JPG, JPEG, and PNG images are allowed. Got: " + contentType
                ));
            }
        }

        Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

        List<String> imageUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            String fileName = fileStorageService.saveFile(file);
            imageUrls.add(fileName);
        }

        ticket.setImageUrls(imageUrls);
        return ResponseEntity.ok(ticketRepository.save(ticket));
    }

    // ── Helper: resolve current user ──
    private AppUser resolveUser(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof AppUserDetails details) {
            return details.getAppUser();
        }
        throw new RuntimeException("Unable to resolve current user");
    }
}