package com.bloom.backend.controllers;

import com.bloom.backend.dto.CreatePostRequest;
import com.bloom.backend.dto.PostDto;
import com.bloom.backend.models.Post;
import com.bloom.backend.models.User;
import com.bloom.backend.repositories.UserRepository;
import com.bloom.backend.security.AuthUserDetails;
import com.bloom.backend.services.PostService;
import com.bloom.backend.services.S3Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final S3Service s3Service;
    private final UserRepository userRepository;

    public PostController(PostService postService, S3Service s3Service, UserRepository userRepository) {
        this.postService = postService;
        this.s3Service = s3Service;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<Post> createPost(
            @RequestBody CreatePostRequest createPostRequest,
            @AuthenticationPrincipal AuthUserDetails userDetails
    ) {
        User author = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("user not found"));

        Post savedPost = postService.createPost(createPostRequest, author);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);
    }

    @GetMapping
    public ResponseEntity<List<PostDto>> getPosts(
            @RequestParam(required = false) String username
    ) {
        if (username != null && !username.isBlank()) {
            return ResponseEntity.ok(postService.getUserPosts(username));
        } else {
            return ResponseEntity.ok(postService.getFeed());
        }
    }

    @GetMapping("/upload-url")
    public ResponseEntity<Map<String, String>> getUploadUrl(
            @RequestParam String filename,
            @RequestParam String contentType,
            @AuthenticationPrincipal AuthUserDetails userDetails
    ) {
        String sanitizedFilename = filename.replaceAll("[^a-zA-Z0-9.-]", "_");
        String key = "posts/" + userDetails.getId() + "/" + UUID.randomUUID() + "-" + sanitizedFilename;
        String presignedUrl = s3Service.createUploadUrl(key, contentType);

        return ResponseEntity.ok(Map.of(
                "url", presignedUrl,
                "key", key
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> getUploadUrl(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthUserDetails userDetails
    ) {
        postService.deletePost(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
