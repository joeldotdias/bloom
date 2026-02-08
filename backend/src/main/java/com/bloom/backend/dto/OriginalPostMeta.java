package com.bloom.backend.dto;

import com.bloom.backend.models.Post;

import java.time.LocalDateTime;
import java.util.function.Function;

public record OriginalPostMeta(
        Long id,
        String caption,
        String viewUrl,
        LocalDateTime createdAt,
        AuthorDto author
) {
    public static OriginalPostMeta fromEntity(
            Post post,
            Function<String, String> urlSigner
    ) {
        return new OriginalPostMeta(
                post.getId(),
                post.getCaption(),
                (post.getImageUrl() != null) ? urlSigner.apply(post.getImageUrl()) : null,
                post.getCreatedAt(),
                AuthorDto.fromEntity(post.getAuthor(), urlSigner)
        );
    }
}
