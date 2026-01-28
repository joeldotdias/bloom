package com.bloom.backend.services;

import com.bloom.backend.dto.LoginRequest;
import com.bloom.backend.dto.RegisterRequest;
import com.bloom.backend.models.RefreshToken;
import com.bloom.backend.models.Role;
import com.bloom.backend.models.User;
import com.bloom.backend.repositories.UserRepository;
import com.bloom.backend.security.AuthUserDetails;
import com.bloom.backend.security.JwtUtils;
import com.bloom.backend.security.TokenPair;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final BlacklistService blacklistService;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            JwtUtils jwtUtils,
            PasswordEncoder passwordEncoder,
            RefreshTokenService refreshTokenService,
            BlacklistService blacklistService
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
        this.blacklistService = blacklistService;
    }

    public TokenPair register(RegisterRequest request, String ipAddr, String deviceInfo) {
        if (userRepository.findUserByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);

        User savedUser = userRepository.save(user);

        String accessToken = jwtUtils.generateToken(savedUser.getUsername(), savedUser.getRole());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(
            savedUser.getUsername(),
            savedUser.getRole(),
            ipAddr,
            deviceInfo
        );

        return new TokenPair(accessToken, refreshToken.getId());
    }

    public TokenPair login(LoginRequest request, String ipAddr, String deviceInfo) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        AuthUserDetails userDetails = (AuthUserDetails) authentication.getPrincipal();
        if (userDetails == null) {
            throw new RuntimeException("Invalid details");
        }

        String accessToken = jwtUtils.generateToken(userDetails.getUsername(), Role.USER);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(
                userDetails.getUsername(),
                Role.USER, // change this
                ipAddr,
                deviceInfo
        );

        return new TokenPair(accessToken, refreshToken.getId());
    }

    public TokenPair regenerateTokenPair(String refreshTokenId, String ipAddress, String deviceInfo) {
        RefreshToken oldRefreshToken = refreshTokenService.verifyRefreshToken(refreshTokenId);

        refreshTokenService.deleteRefreshToken(refreshTokenId);

        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(
            oldRefreshToken.getUsername(),
            oldRefreshToken.getRole(),
            ipAddress,
            deviceInfo
        );

        String newAccessToken = jwtUtils.generateToken(
            oldRefreshToken.getUsername(),
            oldRefreshToken.getRole()
        );

        return new TokenPair(newAccessToken, newRefreshToken.getId());
    }

    public void logout(String accessToken, String refreshTokenId) {
        if (accessToken != null) {
            blacklistService.blacklistToken(accessToken);
        }

        if (refreshTokenId != null) {
            refreshTokenService.deleteRefreshToken(refreshTokenId);
        }
    }
}
