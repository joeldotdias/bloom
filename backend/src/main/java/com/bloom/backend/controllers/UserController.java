package com.bloom.backend.controllers;

import com.bloom.backend.dto.UserProfile;
import com.bloom.backend.models.User;
import com.bloom.backend.repositories.UserRepository;
import com.bloom.backend.security.AuthUserDetails;
import com.bloom.backend.services.UserService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    public UserController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfile> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("user not found: " + username));

        UserProfile profile = new UserProfile(user.getUsername(), user.getEmail(), user.getName());

        return ResponseEntity.ok(profile);
    }

    @PostMapping(value = "/pfp", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadPfp(
            @RequestParam("image")MultipartFile file,
            @AuthenticationPrincipal AuthUserDetails userDetails
    ) {
        String newPfpUrl = userService.uploadPfp(userDetails.getId(), file);
        return ResponseEntity.ok(newPfpUrl);
    }

}
