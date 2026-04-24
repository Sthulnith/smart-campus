package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.AppUser;
import com.smartcampus.backend.model.TicketComment;
import com.smartcampus.backend.model.UserRole;
import com.smartcampus.backend.repository.TicketCommentRepository;
import com.smartcampus.backend.repository.TicketRepository;
import com.smartcampus.backend.security.AppUserDetails;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
public class TicketCommentController {

    @Autowired
    private TicketCommentRepository commentRepository;

    @Autowired
    private TicketRepository ticketRepository;

    // ── LIST COMMENTS ──
    @GetMapping
    public List<TicketComment> getComments(@PathVariable Long ticketId) {
        ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return commentRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }

    // ── ADD COMMENT ──
    @PostMapping
    public TicketComment addComment(
            @PathVariable Long ticketId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

        AppUser user = resolveUser(authentication);
        String content = body.get("content");

        if (content == null || content.isBlank()) {
            throw new RuntimeException("Comment content is required");
        }

        TicketComment comment = new TicketComment();
        comment.setTicketId(ticketId);
        comment.setUserId(user.getId());
        comment.setUserName(user.getName());
        comment.setContent(content);

        return commentRepository.save(comment);
    }

    // ── EDIT COMMENT (owner only) ──
    @PutMapping("/{commentId}")
    public ResponseEntity<?> editComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        TicketComment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getTicketId().equals(ticketId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Comment does not belong to this ticket"));
        }

        AppUser user = resolveUser(authentication);

        // Only the comment owner can edit
        if (!comment.getUserId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "You can only edit your own comments"));
        }

        String content = body.get("content");
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Comment content is required"));
        }

        comment.setContent(content);
        return ResponseEntity.ok(commentRepository.save(comment));
    }

    // ── DELETE COMMENT (owner or admin) ──
    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            Authentication authentication) {

        TicketComment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getTicketId().equals(ticketId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Comment does not belong to this ticket"));
        }

        AppUser user = resolveUser(authentication);

        // Owner or admin can delete
        boolean isOwner = comment.getUserId().equals(user.getId());
        boolean isAdmin = user.getRole() == UserRole.ROLE_ADMIN;

        if (!isOwner && !isAdmin) {
            return ResponseEntity.status(403).body(Map.of("message", "Only the comment owner or an admin can delete this comment"));
        }

        commentRepository.delete(comment);
        return ResponseEntity.ok(Map.of("message", "Comment deleted"));
    }

    private AppUser resolveUser(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof AppUserDetails details) {
            return details.getAppUser();
        }
        throw new RuntimeException("Unable to resolve current user");
    }
}
