package com.bloom.backend.services;

import com.bloom.backend.dto.AuthorDto;
import com.bloom.backend.dto.CreatePostRequest;
import com.bloom.backend.dto.PostDto;
import com.bloom.backend.models.Post;
import com.bloom.backend.models.User;
import com.bloom.backend.repositories.PostRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

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
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();

        return posts.stream().map(post -> {
            String presignedPostUrl = s3Service.createPresignedViewUrl(post.getImageUrl());
            String presignedPfpUrl = s3Service.createPresignedViewUrl(post.getAuthor().getPfp());

            return new PostDto(
                    post.getId(),
                    post.getCaption(),
                    presignedPostUrl,
                    post.getTags(),
                    post.getCreatedAt(),
                    new AuthorDto(
                            post.getAuthor().getUsername(),
                            post.getAuthor().getName(),
                            presignedPfpUrl
                    )
            );
        }).collect(Collectors.toList());
    }
}
