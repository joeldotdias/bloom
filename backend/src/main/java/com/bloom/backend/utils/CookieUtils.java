package com.bloom.backend.utils;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class CookieUtils {

    private static final String ACCESS_TOKEN_COOKIE_NAME = "access_token";
    private static final String REFRESH_TOKEN_COOKIE_NAME = "refresh_token";
    private static final int ACCESS_TOKEN_MAX_AGE = 15 * 60;
    private static final int REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60;

    public static String extractAccessToken(HttpServletRequest request) {
        return extractCookie(request, ACCESS_TOKEN_COOKIE_NAME);
    }

    public static String extractRefreshToken(HttpServletRequest request) {
        return extractCookie(request, REFRESH_TOKEN_COOKIE_NAME);
    }


    public static void setAccessTokenCookie(HttpServletResponse response, String token) {
        Cookie cookie = createCookie(ACCESS_TOKEN_COOKIE_NAME, token, ACCESS_TOKEN_MAX_AGE);
        response.addCookie(cookie);
    }

    public static void setRefreshTokenCookie(HttpServletResponse response, String token) {
        Cookie cookie = createCookie(REFRESH_TOKEN_COOKIE_NAME, token, REFRESH_TOKEN_MAX_AGE);
        response.addCookie(cookie);
    }

    public static void clearAuthCookies(HttpServletResponse response) {
        clearCookie(response, ACCESS_TOKEN_COOKIE_NAME);
        clearCookie(response, REFRESH_TOKEN_COOKIE_NAME);
    }

    private static String extractCookie(HttpServletRequest request, String cookieName) {
        if (request.getCookies() != null) {
            for (Cookie cookie: request.getCookies()) {
                if (cookieName.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        return null;
    }

    private static Cookie createCookie(String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        // cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        cookie.setAttribute("SameSite", "Strict");

        return cookie;
    }

    private static void clearCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);

        response.addCookie(cookie);
    }

}
