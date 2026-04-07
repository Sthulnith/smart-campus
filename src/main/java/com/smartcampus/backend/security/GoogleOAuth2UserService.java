package com.smartcampus.backend.security;

import com.smartcampus.backend.model.AppUser;
import com.smartcampus.backend.model.UserRole;
import com.smartcampus.backend.repository.AppUserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class GoogleOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final AppUserRepository appUserRepository;
    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();

    public GoogleOAuth2UserService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauthUser = delegate.loadUser(userRequest);
        Map<String, Object> attributes = oauthUser.getAttributes();

        String email = getStringAttribute(attributes, "email");
        String name = getStringAttribute(attributes, "name");
        String providerId = getStringAttribute(attributes, "sub");
        String provider = userRequest.getClientRegistration().getRegistrationId();

        if (email == null || providerId == null) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("invalid_user_info"),
                    "Google account is missing required profile fields."
            );
        }

        String normalizedEmail = email.trim().toLowerCase();
        AppUser appUser = appUserRepository.findByEmail(normalizedEmail).orElseGet(AppUser::new);

        if (appUser.getId() != null
                && AuthProviders.LOCAL.equalsIgnoreCase(appUser.getProvider())
                && appUser.getPasswordHash() != null
                && !appUser.getPasswordHash().isBlank()) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("account_exists"),
                    "This email is already registered with a password. Sign in with email instead."
            );
        }

        if (appUser.getRole() == null) {
            appUser.setRole(UserRole.ROLE_USER);
        }
        appUser.setEmail(normalizedEmail);
        appUser.setName(name != null ? name : normalizedEmail);
        appUser.setProvider(provider);
        appUser.setProviderId(providerId);
        AppUser savedUser = appUserRepository.save(appUser);

        return new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority(savedUser.getRole().name())),
                attributes,
                "email"
        );
    }

    private String getStringAttribute(Map<String, Object> attributes, String key) {
        Object value = attributes.get(key);
        return value == null ? null : String.valueOf(value);
    }
}

