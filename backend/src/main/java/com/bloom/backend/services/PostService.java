package com.bloom.backend.services;

import com.bloom.backend.dto.CreatePostRequest;
import com.bloom.backend.dto.PostDto;
import com.bloom.backend.models.Post;
import com.bloom.backend.models.User;
import com.bloom.backend.repositories.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final S3Service s3Service;

    public PostService(PostRepository postRepository, S3Service s3Service) {
        this.postRepository = postRepository;
        this.s3Service = s3Service;
    }

    public Post createPost(CreatePostRequest request, User author) {
        Post post = new Post();
        post.setCaption(request.caption());
        post.setImageUrl(request.imageUrl());
        post.setTags(request.tags());
        post.setAuthor(author);

        return postRepository.save(post);
    }

    public List<PostDto> getFeed() {
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(post -> PostDto.fromEntity(post, s3Service::createPresignedViewUrl))
                .toList();
    }

    public List<PostDto> getUserPosts(String username) {
        return postRepository.findByAuthorUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(post -> PostDto.fromEntity(post, s3Service::createPresignedViewUrl))
                .toList();
    }

    @Transactional
    public void deletePost(Long postId, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("post not found: " + postId));

        if (!post.getAuthor().getUsername().equals(username)) {
            throw new RuntimeException("unauthorized");
        }

        s3Service.deleteFile(post.getImageUrl());
        postRepository.delete(post);
    }
}
