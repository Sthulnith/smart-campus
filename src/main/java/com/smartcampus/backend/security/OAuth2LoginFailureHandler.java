package com.smartcampus.backend.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    private final String frontendLoginUrl;

    public OAuth2LoginFailureHandler(
            @Value("${app.frontend-login-url:http://localhost:3000/login}") String frontendLoginUrl
    ) {
        this.frontendLoginUrl = frontendLoginUrl;
    }

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException, ServletException {
        String safe = sanitizeOauthFailureMessage(exception);
        String message = URLEncoder.encode(safe, StandardCharsets.UTF_8);
        response.sendRedirect(frontendLoginUrl + "?error=oauth&message=" + message);
    }

    private static String sanitizeOauthFailureMessage(AuthenticationException exception) {
        if (exception instanceof OAuth2AuthenticationException oauthEx && oauthEx.getError() != null) {
            String code = oauthEx.getError().getErrorCode();
            if ("account_exists".equals(code)) {
                return "This email already has a password. Sign in with email instead.";
            }
            if ("invalid_user_info".equals(code)) {
                return "Google did not share your email. Try another account.";
            }
        }
        return "Google sign-in did not work. Try again or use email.";
    }
}

