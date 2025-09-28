package com.xelerit.milosz.podsiadly.backend.goals.service;
import com.xelerit.milosz.podsiadly.backend.user.User;
import com.xelerit.milosz.podsiadly.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository users;

    public UUID currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!(auth instanceof OAuth2AuthenticationToken token)) {
            throw new IllegalStateException("Unsupported authentication type: " + auth);
        }
        OAuth2User principal = token.getPrincipal();
        String provider = token.getAuthorizedClientRegistrationId();
        String providerId = resolveProviderId(provider, principal);

        User user = users.findByProviderAndProviderId(User.Provider.valueOf(provider.toUpperCase()), providerId)
                .orElseThrow(() -> new IllegalStateException("User not found for " + provider + ":" + providerId));

        return user.getId();
    }

    private String resolveProviderId(String provider, OAuth2User principal) {
        Object val = switch (provider.toLowerCase()) {
            case "google" -> principal.getAttributes().get("sub");
            case "github" -> principal.getAttributes().get("id");
            default -> principal.getName();
        };
        return String.valueOf(val);
    }
}