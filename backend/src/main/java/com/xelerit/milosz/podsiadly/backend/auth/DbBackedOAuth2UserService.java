package com.xelerit.milosz.podsiadly.backend.auth;

import com.xelerit.milosz.podsiadly.backend.user.User;
import com.xelerit.milosz.podsiadly.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DbBackedOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository users;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest req) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(req);

        String regId = req.getClientRegistration().getRegistrationId();
        Map<String, Object> attrs = oAuth2User.getAttributes();

        User.Provider provider = "google".equals(regId) ? User.Provider.GOOGLE : User.Provider.GITHUB;

        String providerId;
        String name;
        String email;
        String avatar;

        if (provider == User.Provider.GOOGLE) {
            providerId = (String) attrs.get("sub");
            name = (String) attrs.getOrDefault("name", "");
            email = (String) attrs.get("email");
            avatar = (String) attrs.get("picture");
        } else {
            providerId = String.valueOf(attrs.get("id"));
            name = (String) (attrs.getOrDefault("name", attrs.get("login")));
            email = (String) attrs.get("email");
            avatar = (String) attrs.get("avatar_url");
        }

        var now = OffsetDateTime.now();
        var user = users.findByProviderAndProviderId(provider, providerId)
                .map(u -> {
                    u.setName(name);
                    if (email != null) u.setEmail(email);
                    if (avatar != null) u.setAvatarUrl(avatar);
                    u.setLastLoginAt(now);
                    return u;
                })
                .orElseGet(() -> User.builder()
                        .id(UUID.randomUUID())
                        .provider(provider)
                        .providerId(providerId)
                        .name(name)
                        .email(email)
                        .avatarUrl(avatar)
                        .createdAt(now)
                        .lastLoginAt(now)
                        .build());

        users.save(user);

        var authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
        var enriched = new java.util.HashMap<>(attrs);
        enriched.put("app_user_id", user.getId().toString());
        enriched.put("app_provider", provider.name());

        String nameAttributeKey = req.getClientRegistration().getProviderDetails()
                .getUserInfoEndpoint().getUserNameAttributeName();

        return new DefaultOAuth2User(authorities, enriched, nameAttributeKey);
    }
}
