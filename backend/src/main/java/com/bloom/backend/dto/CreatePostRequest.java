package com.bloom.backend.dto;

import java.util.List;

public record CreatePostRequest(
        String caption,
        String imageUrl,
        List<String> tags
) { }
