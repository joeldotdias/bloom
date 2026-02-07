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
        AuthorDto author,
        Long likeCount,
        Long commentCount,
        boolean isLikedByMe
) {
    public static PostDto fromEntity(
            Post post,
            Function<String, String> urlSigner,
            boolean isLikedByMe
    ) {
        return new PostDto(
                post.getId(),
                post.getCaption(),
                urlSigner.apply(post.getImageUrl()),
                post.getTags(),
                post.getCreatedAt(),
                AuthorDto.fromEntity(post.getAuthor(), urlSigner),
                post.getLikeCount(),
                post.getCommentCount(),
                isLikedByMe
        );
    }
}
