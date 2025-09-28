package com.xelerit.milosz.podsiadly.backend.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    @GetMapping("/providers")
    public Map<String, String> providers() {
        return Map.of(
                "google", "/oauth2/authorization/google",
                "github", "/oauth2/authorization/github"
        );
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfile> me(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) return ResponseEntity.status(401).build();

        var id = (String) principal.getAttributes().get("app_user_id");
        var provider = (String) principal.getAttributes().get("app_provider");

        String name = null, email = null, avatar = null;

        if (principal instanceof OidcUser oidc) {
            name = oidc.getFullName();
            email = oidc.getEmail();
            avatar = oidc.getPicture();
        } else {
            name = (String) (principal.getAttribute("name") != null ? principal.getAttribute("name") : principal.getAttribute("login"));
            email = (String) principal.getAttribute("email");
            avatar = (String) principal.getAttribute("avatar_url");
        }

        return ResponseEntity.ok(new UserProfile(id, provider, name, email, avatar));
    }

    @PostMapping("/login/{provider}")
    public ResponseEntity<Void> startLogin(@PathVariable String provider) {
        return ResponseEntity.status(303).location(URI.create("/oauth2/authorization/" + provider)).build();
    }
}
