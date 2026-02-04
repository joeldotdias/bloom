package com.bloom.backend.dto;

import com.bloom.backend.models.User;

import java.util.function.Function;

public record UserSummary(
        String username,
        String name,
        String pfp
) {
    public static UserSummary fromEntity(User user, Function<String, String> urlSigner) {
        return new UserSummary(
                user.getUsername(),
                user.getName(),
                urlSigner.apply(user.getPfp())
        );
    }
}
