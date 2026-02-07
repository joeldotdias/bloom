package com.bloom.backend.dto;

import com.bloom.backend.models.PostComment;

import java.time.LocalDateTime;
import java.util.function.Function;

public record CommentDto(
        Long id,
        String content,
        LocalDateTime createdAt,
        AuthorDto author
) {
    public static CommentDto fromEntity(
            PostComment comment,
            Function<String, String> urlSigner
    ) {
        return new CommentDto(
                comment.getId(),
                comment.getContent(),
                comment.getCreatedAt(),
                AuthorDto.fromEntity(comment.getUser(), urlSigner)
        );
    }
}
