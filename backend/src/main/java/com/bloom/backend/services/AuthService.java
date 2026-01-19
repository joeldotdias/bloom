package com.bloom.backend.services;

import com.bloom.backend.dto.LoginRequest;
import com.bloom.backend.dto.RegisterRequest;
import com.bloom.backend.models.Role;
import com.bloom.backend.models.User;
import com.bloom.backend.repositories.UserRepository;
import com.bloom.backend.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, JwtUtils jwtUtils, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
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

        String token = jwtUtils.generateToken(savedUser.getUsername(), savedUser.getRole());
        return token;
    }

    public String login(LoginRequest request) {
        User user = userRepository.findUserByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("couldn't find user: " + request.getUsername()));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("wrong password");
        }

        if (user.isBanned()) {
            throw new RuntimeException("oops your account is banned");
        }

        String token = jwtUtils.generateToken(user.getUsername(), user.getRole());
        return token;
    }
}
