package com.bloom.backend.controllers;

import com.bloom.backend.dto.UpdateProfileRequest;
import com.bloom.backend.dto.UserProfile;
import com.bloom.backend.security.AuthUserDetails;
import com.bloom.backend.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfile> getCurrentUser(
            @AuthenticationPrincipal AuthUserDetails userDetails
    ) {
        UserProfile profile = userService.getUserProfile(userDetails.getUsername(), userDetails.getId());
        return ResponseEntity.ok(profile);
    }

    @PostMapping(value = "/me/pfp", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadPfp(
            @RequestParam("image")MultipartFile file,
            @AuthenticationPrincipal AuthUserDetails userDetails
    ) {
        String newPfpUrl = userService.uploadPfp(userDetails.getId(), file);
        return ResponseEntity.ok(newPfpUrl);
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserProfile> getUserProfile(
            @PathVariable String username,
            @AuthenticationPrincipal AuthUserDetails currenUser
    ) {
        Long viewerId = (currenUser != null) ? currenUser.getId() : null;
        return ResponseEntity.ok(userService.getUserProfile(username, viewerId));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfile> updateProfile(
            @Valid @RequestBody UpdateProfileRequest updateProfileRequest,
            @AuthenticationPrincipal AuthUserDetails userDetails
    ) {
        return ResponseEntity.ok(userService.updateProfileDetails(userDetails.getId(),  updateProfileRequest));
    }
}
