package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.AppUser;
import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.model.UserRole;
import com.smartcampus.backend.repository.AppUserRepository;
import com.smartcampus.backend.repository.TicketRepository;
import com.smartcampus.backend.service.FileStorageService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private AppUserRepository appUserRepository;

    //  GET ALL
    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    //  CREATE
    @PostMapping
    public Ticket createTicket(@RequestBody Ticket ticket) {
        ticket.setStatus("OPEN");
        return ticketRepository.save(ticket);
    }

    // DELETE
@DeleteMapping("/{id}")
public String deleteTicket(@PathVariable Long id) {
    Ticket ticket = ticketRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Ticket not found"));

    ticketRepository.delete(ticket);
    return "Deleted";
}

// UPDATE
@PutMapping("/{id}")
public Ticket updateTicket(@PathVariable Long id, @RequestBody Ticket updated) {
    Ticket ticket = ticketRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Ticket not found"));

    ticket.setCategory(updated.getCategory());
    ticket.setDescription(updated.getDescription());
    ticket.setPriority(updated.getPriority());
    ticket.setResourceId(updated.getResourceId());

    return ticketRepository.save(ticket);
}

    //  ASSIGN TECHNICIAN
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

        return ticketRepository.save(ticket);
    }

    // UPLOAD IMAGE
    @PostMapping("/{id}/upload")
    public Ticket uploadImages(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files) {

        if (files.size() > 3) {
            throw new RuntimeException("Maximum 3 images allowed");
        }

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        List<String> imageUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            String fileName = fileStorageService.saveFile(file);
            imageUrls.add(fileName);
        }

        ticket.setImageUrls(imageUrls);

        return ticketRepository.save(ticket);
    }
}