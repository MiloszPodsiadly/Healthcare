package com.xelerit.milosz.podsiadly.backend.auth;

public record UserProfile(
        String provider,
        String id,
        String name,
        String email,
        String avatar
) {}
