package com.smartcampus.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RequestThrottleService {

    private final Map<String, Deque<Long>> buckets = new ConcurrentHashMap<>();

    @Value("${app.security.throttle.signin.max-attempts:8}")
    private int signinMaxAttempts;

    @Value("${app.security.throttle.signin.window-seconds:60}")
    private long signinWindowSeconds;

    @Value("${app.security.throttle.forgot-password.max-attempts:5}")
    private int forgotPasswordMaxAttempts;

    @Value("${app.security.throttle.forgot-password.window-seconds:300}")
    private long forgotPasswordWindowSeconds;

    public boolean allowSignin(String ip, String email) {
        return allow("signin", ip, email, signinMaxAttempts, signinWindowSeconds);
    }

    public boolean allowForgotPassword(String ip, String email) {
        return allow("forgot", ip, email, forgotPasswordMaxAttempts, forgotPasswordWindowSeconds);
    }

    private boolean allow(String scope, String ip, String email, int maxAttempts, long windowSeconds) {
        if (maxAttempts <= 0 || windowSeconds <= 0) {
            return true;
        }
        String key = scope + "|" + normalize(ip) + "|" + normalize(email);
        long now = Instant.now().toEpochMilli();
        long lowerBound = now - (windowSeconds * 1000L);

        Deque<Long> deque = buckets.computeIfAbsent(key, ignored -> new ArrayDeque<>());
        synchronized (deque) {
            while (!deque.isEmpty() && deque.peekFirst() < lowerBound) {
                deque.removeFirst();
            }
            if (deque.size() >= maxAttempts) {
                return false;
            }
            deque.addLast(now);
            return true;
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }
}
