package com.smartcampus.backend.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final String frontendRedirectUrl;

    public OAuth2LoginSuccessHandler(
            @Value("${app.oauth2.redirect-url:http://localhost:3000/auth/callback}") String frontendRedirectUrl
    ) {
        this.frontendRedirectUrl = frontendRedirectUrl;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        response.sendRedirect(frontendRedirectUrl);
    }
}

