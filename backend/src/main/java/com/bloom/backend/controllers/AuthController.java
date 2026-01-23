package com.bloom.backend.controllers;

import com.bloom.backend.dto.LoginRequest;
import com.bloom.backend.dto.RegisterRequest;
import com.bloom.backend.services.AuthService;
import com.bloom.backend.services.TokenPair;
import jakarta.servlet.http.Cookie;
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
        String ipAddr = getClientIp(request);
        String deviceInfo = request.getHeader("User-Agent");

        TokenPair tokenPair = authService.register(registerRequest, ipAddr, deviceInfo);
        setAccessTokenCookie(response, tokenPair.accessToken());
        setRefreshTokenCookie(response, tokenPair.refreshToken());

        return ResponseEntity.status(HttpStatus.CREATED).body("created User");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String ipAddr = getClientIp(request);
        String deviceInfo = request.getHeader("User-Agent");

        TokenPair tokenPair = authService.login(loginRequest, ipAddr, deviceInfo);
        setAccessTokenCookie(response, tokenPair.accessToken());
        setRefreshTokenCookie(response, tokenPair.refreshToken());

        return ResponseEntity.ok("logged in User");
    }

    @PostMapping("/refresh")
    public ResponseEntity<String> refresh(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String refreshToken = extractRefreshTokenFromCookie(request);
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token not found");
        }

        try {
            String ipAddress = getClientIp(request);
            String deviceInfo = request.getHeader("User-Agent");

            TokenPair tokenPair = authService.regenerateTokenPair(refreshToken, ipAddress, deviceInfo);

            setAccessTokenCookie(response, tokenPair.accessToken());
            setRefreshTokenCookie(response, tokenPair.refreshToken());

            return ResponseEntity.ok("tokens been regenerated");
        } catch (RuntimeException e) {
            clearAllCookies(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("invalid refresh token");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response) {
        String accessToken = extractAccessTokenFromCookie(request);
        String refreshToken = extractRefreshTokenFromCookie(request);

        authService.logout(accessToken, refreshToken);
        clearAllCookies(response);

        return ResponseEntity.ok("logged out user");
    }

    private String extractAccessTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refresh_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }

        // in case of multiple IPs
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    private void setAccessTokenCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
//        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(15 * 60);
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
         Cookie cookie = new Cookie("refresh_token", refreshToken);
        cookie.setHttpOnly(true);
        // cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(30 * 24 * 60 * 60); // 30 days
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    private void clearAllCookies(HttpServletResponse response) {
        Cookie accessTokenCookie = new Cookie("token", null);
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(0);
        response.addCookie(accessTokenCookie);

        Cookie refreshTokenCookie = new Cookie("refresh_token", null);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(0);
        response.addCookie(refreshTokenCookie);
    }
}
