package com.smartcampus.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class PasswordResetMailService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetMailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public PasswordResetMailService(
            JavaMailSender mailSender,
            @Value("${app.mail.from:}") String fromAddress
    ) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress == null ? "" : fromAddress.trim();
    }

    public void sendPasswordResetEmail(String recipientEmail, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        if (!fromAddress.isBlank()) {
            message.setFrom(fromAddress);
        }
        message.setTo(recipientEmail);
        message.setSubject("Smart Campus - Password Reset Instructions");
        message.setText(buildBody(resetLink));

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            log.warn("Password reset email delivery failed (email redacted): {}", ex.getMessage());
            throw ex;
        }
    }

    private String buildBody(String resetLink) {
        return String.join("\n",
                "We received a request to reset your Smart Campus password.",
                "",
                "Use the link below to set a new password:",
                resetLink,
                "",
                "This link expires in 1 hour.",
                "If you did not request this, you can ignore this email."
        );
    }
}

