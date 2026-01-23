package com.bloom.backend.services;

public record TokenPair (
    String accessToken,
    String refreshToken
){}
