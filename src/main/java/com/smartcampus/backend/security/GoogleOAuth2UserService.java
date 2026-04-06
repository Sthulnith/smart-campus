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

        AppUser appUser = appUserRepository.findByEmail(email).orElseGet(AppUser::new);
        if (appUser.getRole() == null) {
            appUser.setRole(UserRole.ROLE_USER);
        }
        appUser.setEmail(email);
        appUser.setName(name != null ? name : email);
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

