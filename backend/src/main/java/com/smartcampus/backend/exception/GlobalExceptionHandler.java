package com.smartcampus.backend.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "error", "Unauthorized",
                "message", "Please sign in to continue.",
                "code", "NOT_AUTHENTICATED",
                "timestamp", Instant.now().toString()
        ));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "error", "Forbidden",
                "message", "You don't have permission for this action.",
                "code", "ACCESS_DENIED",
                "timestamp", Instant.now().toString()
        ));
    }

    @ExceptionHandler(EmailInUseException.class)
    public ResponseEntity<Map<String, Object>> handleEmailInUse(EmailInUseException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "Conflict");
        body.put("message", "Email already in use");
        body.put("code", "EMAIL_IN_USE");
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", status.getReasonPhrase());
        body.put("message", ex.getReason() != null ? ex.getReason() : "Request failed.");
        body.put("code", status == HttpStatus.BAD_REQUEST ? "BAD_REQUEST" : "HTTP_ERROR");
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fields = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe ->
                fields.put(fe.getField(), fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Invalid value.")
        );
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "Validation failed");
        body.put("message", "Check the highlighted fields.");
        body.put("code", "VALIDATION_ERROR");
        body.put("fields", fields);
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleMessageNotReadable(org.springframework.http.converter.HttpMessageNotReadableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", "Bad Request",
                "message", "Malformed JSON request or missing body.",
                "code", "BAD_REQUEST_BODY",
                "timestamp", Instant.now().toString()
        ));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.warn("Data integrity violation: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", "Bad Request",
                "message", "Invalid data provided for this update.",
                "code", "DATA_INTEGRITY_VIOLATION",
                "timestamp", Instant.now().toString()
        ));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        log.error("Internal Error ({}): {}", ex.getClass().getSimpleName(), ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Internal Server Error",
                "message", "Something went wrong on our side. Please try again later.",
                "code", "INTERNAL_ERROR",
                "timestamp", Instant.now().toString()
        ));
    }
}
