package com.bloom.backend.dto;

import com.bloom.backend.models.User;

import java.time.LocalDateTime;

public record UserProfile(
    Long id,
    String username,
    String email,
    String name,
    String bio,
    String pfp,
    LocalDateTime joinedAt,
    boolean isOwner
) {
    public static UserProfile fromEntity(User user, boolean isOwner, String presignedPfpUrl) {
        return new UserProfile(
                user.getId(),
                user.getUsername(),
                isOwner ? user.getEmail() : null,
                user.getName(),
                user.getBio(),
                presignedPfpUrl,
                user.getCreatedAt(),
                isOwner
        );
    }
}
