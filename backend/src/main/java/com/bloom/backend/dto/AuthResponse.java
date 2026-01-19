package com.bloom.backend.dto;

import com.bloom.backend.models.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String username;
    private String name;
    private Role role;
}
