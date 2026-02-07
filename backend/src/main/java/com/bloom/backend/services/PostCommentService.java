package com.bloom.backend.services;

import com.bloom.backend.dto.CommentDto;
import com.bloom.backend.dto.PostDto;
import com.bloom.backend.models.Post;
import com.bloom.backend.models.PostComment;
import com.bloom.backend.models.User;
import com.bloom.backend.repositories.PostCommentRepository;
import com.bloom.backend.repositories.PostRepository;
import com.bloom.backend.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PostCommentService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostCommentRepository commentRepository;
    private final S3Service s3Service;

    public PostCommentService(PostRepository postRepository, UserRepository userRepository, PostCommentRepository commentRepository, S3Service s3Service) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.s3Service = s3Service;
    }

    @Transactional
    public CommentDto addComment(Long postId, String username, String content) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("post not found: " + postId));

        User user = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("post not found: " + postId));

        PostComment comment = PostComment.builder()
                .post(post)
                .user(user)
                .content(content)
                .build();

        PostComment saved = commentRepository.save(comment);

        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);

        return CommentDto.fromEntity(saved, s3Service::createPresignedViewUrl);
    }

    public List<CommentDto> getComments(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId)
                .stream()
                .map(comment -> CommentDto.fromEntity(comment, s3Service::createPresignedViewUrl))
                .toList();
    }
}
