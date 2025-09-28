package com.xelerit.milosz.podsiadly.backend.user;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users", uniqueConstraints =
@UniqueConstraint(name = "uq_provider_providerid", columnNames = {"provider","provider_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Provider provider;

    @Column(name="provider_id", nullable=false, length=191)
    private String providerId;

    @Column(length = 255)
    private String email;

    @Column(length = 255)
    private String name;

    @Column(name="avatar_url", length = 512)
    private String avatarUrl;

    @Column(name="created_at", nullable=false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name="updated_at", nullable=false)
    private OffsetDateTime updatedAt;

    @Column(name="last_login_at", nullable=false)
    private OffsetDateTime lastLoginAt;

    public enum Provider { GOOGLE, GITHUB }
}
