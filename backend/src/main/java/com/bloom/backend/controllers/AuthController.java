package com.bloom.backend.controllers;

import com.bloom.backend.dto.LoginRequest;
import com.bloom.backend.dto.RegisterRequest;
import com.bloom.backend.services.AuthService;
import com.bloom.backend.services.TokenPair;
import com.bloom.backend.utils.CookieUtils;
import com.bloom.backend.utils.RequestUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegisterRequest registerRequest,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String ipAddr = RequestUtils.getClientIpAddr(request);
        String deviceInfo = RequestUtils.getUserAgent(request);

        TokenPair tokenPair = authService.register(registerRequest, ipAddr, deviceInfo);
        CookieUtils.setAccessTokenCookie(response, tokenPair.accessToken());
        CookieUtils.setRefreshTokenCookie(response, tokenPair.refreshToken());

        return ResponseEntity.status(HttpStatus.CREATED).body("created User");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String ipAddr = RequestUtils.getClientIpAddr(request);
        String deviceInfo = RequestUtils.getUserAgent(request);

        TokenPair tokenPair = authService.login(loginRequest, ipAddr, deviceInfo);
        CookieUtils.setAccessTokenCookie(response, tokenPair.accessToken());
        CookieUtils.setRefreshTokenCookie(response, tokenPair.refreshToken());

        return ResponseEntity.ok("logged in User");
    }

    @PostMapping("/refresh")
    public ResponseEntity<String> refresh(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String refreshToken = CookieUtils.extractRefreshToken(request);
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token not found");
        }

        try {
            String ipAddress = RequestUtils.getClientIpAddr(request);
            String deviceInfo = RequestUtils.getUserAgent(request);

            TokenPair tokenPair = authService.regenerateTokenPair(refreshToken, ipAddress, deviceInfo);

            CookieUtils.setAccessTokenCookie(response, tokenPair.accessToken());
            CookieUtils.setRefreshTokenCookie(response, tokenPair.refreshToken());

            return ResponseEntity.ok("tokens been regenerated");
        } catch (RuntimeException e) {
            CookieUtils.clearAuthCookies(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("invalid refresh token");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response) {
        String accessToken = CookieUtils.extractAccessToken(request);
        String refreshToken = CookieUtils.extractRefreshToken(request);

        authService.logout(accessToken, refreshToken);
        CookieUtils.clearAuthCookies(response);

        return ResponseEntity.ok("logged out user");
    }
}
