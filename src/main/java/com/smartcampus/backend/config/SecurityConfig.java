package com.smartcampus.backend.config;

import com.smartcampus.backend.security.GoogleOAuth2UserService;
import com.smartcampus.backend.security.OAuth2LoginFailureHandler;
import com.smartcampus.backend.security.OAuth2LoginSuccessHandler;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            GoogleOAuth2UserService googleOAuth2UserService,
            OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
            OAuth2LoginFailureHandler oAuth2LoginFailureHandler,
            @Value("${app.security.csrf.ignore:/api/auth/signin,/api/auth/signup,/api/auth/register,/api/auth/forgot-password,/api/auth/reset-password,/api/auth/logout,/oauth2/**,/login/**}") String csrfIgnore
    ) throws Exception {
        String[] csrfIgnoredPaths = Arrays.stream(csrfIgnore.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toArray(String[]::new);

        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .ignoringRequestMatchers(csrfIgnoredPaths)
                )
                .cors(cors -> {})
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/error").permitAll()
                        .requestMatchers("/oauth2/**", "/login/**").permitAll()
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/api/auth/register",
                                "/api/auth/signup",
                                "/api/auth/signin",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password"
                        ).permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/resources/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/resources/**").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/resources/**").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/resources/**").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/admin/users").hasRole("ADMIN")

                        .requestMatchers("/api/bookings/**").hasAnyRole("USER", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/tickets/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/tickets/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/tickets/*/assign").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/tickets/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/tickets/**").hasAnyRole("USER", "ADMIN")

                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            if (request.getRequestURI().startsWith("/api/")) {
                                writeApiError(
                                        response,
                                        HttpServletResponse.SC_UNAUTHORIZED,
                                        "Unauthorized",
                                        "Please sign in to continue.",
                                        "NOT_AUTHENTICATED",
                                        request.getRequestURI()
                                );
                                return;
                            }
                            response.sendRedirect("/api/auth/login");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            writeApiError(
                                    response,
                                    HttpServletResponse.SC_FORBIDDEN,
                                    "Forbidden",
                                    "You don't have permission for this action.",
                                    "ACCESS_DENIED",
                                    request.getRequestURI()
                            );
                        })
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(googleOAuth2UserService))
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureHandler(oAuth2LoginFailureHandler)
                )
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((request, response, authentication) -> {
                            writeApiSuccess(response, HttpServletResponse.SC_OK, "Logged out", "LOGGED_OUT");
                        })
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.frontend-url:http://localhost:3000}") String frontendUrl
    ) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(frontendUrl));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private void writeApiError(
            HttpServletResponse response,
            int status,
            String error,
            String message,
            String code,
            String path
    ) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String safePath = path == null ? "" : jsonEscape(path);
        response.getWriter().write(String.format(
                Locale.ROOT,
                "{\"error\":\"%s\",\"message\":\"%s\",\"code\":\"%s\",\"path\":\"%s\",\"timestamp\":\"%s\"}",
                jsonEscape(error),
                jsonEscape(message),
                jsonEscape(code),
                safePath,
                Instant.now()
        ));
    }

    private void writeApiSuccess(
            HttpServletResponse response,
            int status,
            String message,
            String code
    ) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(String.format(
                Locale.ROOT,
                "{\"message\":\"%s\",\"code\":\"%s\",\"timestamp\":\"%s\"}",
                jsonEscape(message),
                jsonEscape(code),
                Instant.now()
        ));
    }

    private static String jsonEscape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}