package com.xelerit.milosz.podsiadly.backend.config;

import com.xelerit.milosz.podsiadly.backend.auth.DbBackedOAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final DbBackedOAuth2UserService oAuth2UserService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable);

        http.authorizeHttpRequests(reg -> reg
                .requestMatchers("/actuator/health", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/providers").permitAll()
                .requestMatchers("/api/me").authenticated()
                .anyRequest().authenticated()
        );

        http.exceptionHandling(ex -> ex
                .defaultAuthenticationEntryPointFor(
                        new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                        request -> request.getRequestURI().startsWith("/api/")
                )
        );

        http.oauth2Login(oauth -> oauth
                .userInfoEndpoint(u -> u.userService(oAuth2UserService))
                .loginPage("/api/providers")
                .successHandler(successHandler())
        );

        http.logout(logout -> logout
                .logoutUrl("/api/logout")
                .logoutSuccessHandler(logoutSuccessHandler())
        );

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        var cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of(frontendUrl));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization","Content-Type","X-XSRF-TOKEN"));
        cfg.setAllowCredentials(true);
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    @Bean
    SavedRequestAwareAuthenticationSuccessHandler successHandler() {
        var h = new SavedRequestAwareAuthenticationSuccessHandler();
        h.setDefaultTargetUrl(frontendUrl + "/auth/success");
        h.setAlwaysUseDefaultTargetUrl(true);
        return h;
    }

    @Bean
    LogoutSuccessHandler logoutSuccessHandler() {
        return (request, response, authentication) ->
                response.sendRedirect(frontendUrl + "/auth/logout");
    }
}
