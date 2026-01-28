package com.bloom.backend.security;

public record TokenPair (
    String accessToken,
    String refreshToken
){}
