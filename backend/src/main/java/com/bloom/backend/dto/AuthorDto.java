package com.bloom.backend.dto;

import com.bloom.backend.models.User;

import java.util.function.Function;

public record AuthorDto(
        String username,
        String name,
        String pfp
) {
    public static AuthorDto fromEntity(User author, Function<String, String> urlSigner) {
        return new AuthorDto(
                author.getUsername(),
                author.getName(),
                urlSigner.apply(author.getPfp())
        );
    }
}
