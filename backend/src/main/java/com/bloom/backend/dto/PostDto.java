package com.bloom.backend.dto;

import com.bloom.backend.models.Post;

import java.time.LocalDateTime;
import java.util.List;
import java.util.function.Function;

public record PostDto(
        Long id,
        String caption,
        String viewUrl,
        List<String> tags,
        LocalDateTime createdAt,
        AuthorDto author
) {
    public static PostDto fromEntity(Post post, Function<String, String> urlSigner) {
        return new PostDto(
                post.getId(),
                post.getCaption(),
                urlSigner.apply(post.getImageUrl()),
                post.getTags(),
                post.getCreatedAt(),
                AuthorDto.fromEntity(post.getAuthor(), urlSigner)
        );
    }
}
