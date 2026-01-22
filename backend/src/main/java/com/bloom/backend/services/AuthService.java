package com.bloom.backend.services;

import com.bloom.backend.dto.LoginRequest;
import com.bloom.backend.dto.RegisterRequest;
import com.bloom.backend.models.Role;
import com.bloom.backend.models.User;
import com.bloom.backend.repositories.UserRepository;
import com.bloom.backend.security.AuthUserDetails;
import com.bloom.backend.security.JwtUtils;
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
    private final BlacklistService blacklistService;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository, JwtUtils jwtUtils, PasswordEncoder passwordEncoder, BlacklistService blacklistService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
        this.blacklistService = blacklistService;
    }

    public String register(RegisterRequest request) {
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

        return jwtUtils.generateToken(savedUser.getUsername(), savedUser.getRole());
    }

    public String login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        AuthUserDetails userDetails = (AuthUserDetails) authentication.getPrincipal();
        if (userDetails == null) {
            throw new RuntimeException("Invalid details");
        }

        return jwtUtils.generateToken(userDetails.getUsername(), Role.USER);
    }

//    public String login(LoginRequest request) {
//        User user = userRepository.findUserByUsername(request.getUsername())
//                .orElseThrow(() -> new RuntimeException("couldn't find user: " + request.getUsername()));
//
//        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
//            throw new RuntimeException("wrong password");
//        }
//
//        if (user.isBanned()) {
//            throw new RuntimeException("oops your account is banned");
//        }
//
//        String token = jwtUtils.generateToken(user.getUsername(), user.getRole());
//        return token;
//    }

    public void logout(String token) {
        blacklistService.blacklistToken(token);
    }
}
