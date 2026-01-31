package com.bloom.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PostDto(
        Long id,
        String caption,
        String viewUrl,
        List<String> tags,
        LocalDateTime createdAt,
        AuthorDto author
) { }
