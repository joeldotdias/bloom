package com.bloom.backend.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest (

        @Size(min = 1, max = 50, message = "Name must be between 1 and 50 characters")
        String name,

        @Size(max = 160, message = "Bio cannot exceed 160 characters")
        String bio,

        @Size(max = 100)
        String location
) { }
