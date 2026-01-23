package com.bloom.backend.services;

import com.bloom.backend.models.RefreshToken;
import com.bloom.backend.models.Role;
import com.bloom.backend.repositories.RefreshTokenRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public RefreshToken createRefreshToken(String username, Role role, String ipAddr, String deviceInfo) {
        String opaqueId = UUID.randomUUID().toString();
        RefreshToken token = new RefreshToken(opaqueId, username, role, ipAddr, deviceInfo);
        return refreshTokenRepository.save(token);
    }

    public RefreshToken verifyRefreshToken(String tokenId) {
        return refreshTokenRepository.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("couldn't find refresh token: " + tokenId + " or it might've expired"));
    }

    public void deleteRefreshToken(String tokenId) {
        refreshTokenRepository.deleteById(tokenId);
    }

    public List<RefreshToken> getAllRefreshTokensForUser(String username) {
        return refreshTokenRepository.findByUsername(username);
    }

    public void deleteAllRefreshTokensForUser(String username) {
        List<RefreshToken> tokens = refreshTokenRepository.findByUsername(username);
        refreshTokenRepository.deleteAll(tokens);
    }
}
