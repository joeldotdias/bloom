package com.bloom.backend.services;

import com.bloom.backend.dto.CreatePostRequest;
import com.bloom.backend.dto.PostDto;
import com.bloom.backend.models.Post;
import com.bloom.backend.models.PostLike;
import com.bloom.backend.models.User;
import com.bloom.backend.repositories.PostLikeRepository;
import com.bloom.backend.repositories.PostRepository;
import com.bloom.backend.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository postLikeRepository;
    private final S3Service s3Service;

    public PostService(PostRepository postRepository, UserRepository userRepository, PostLikeRepository postLikeRepository, S3Service s3Service) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.postLikeRepository = postLikeRepository;
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

    public List<PostDto> getFeed(String currentUsername) {
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        Set<Long> likedPostIds = getLikedPosts(posts, currentUsername);
        Set<Long> repostedPostIds = getRepostedPosts(posts, currentUsername);

        return posts
                .stream()
                .map(post ->
                        PostDto.fromEntity(
                                post,
                                s3Service::createPresignedViewUrl,
                                likedPostIds.contains(post.getId()),
                                repostedPostIds.contains(post.getId())
                        )
                )
                .toList();
    }

    public List<PostDto> getUserPosts(String authorUsername, String currentUsername) {
        List<Post> posts =  postRepository.findByAuthorUsernameOrderByCreatedAtDesc(authorUsername);
        Set<Long> likedPostIds = getLikedPosts(posts, currentUsername);
        Set<Long> repostedPostIds = getRepostedPosts(posts, currentUsername);

        return posts
                .stream()
                .map(post ->
                        PostDto.fromEntity(
                                post,
                                s3Service::createPresignedViewUrl,
                                likedPostIds.contains(post.getId()),
                                repostedPostIds.contains(post.getId())
                        )
                )
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

    @Transactional
    public void toggleLike(Long postId, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("post not found: " + postId));

        User user = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("user not found: " + username));

        Optional<PostLike> existingLike = postLikeRepository.findByUserAndPost(user, post);

        if (existingLike.isPresent()) {
            postLikeRepository.delete(existingLike.get());
            // unliking on a <0 like post shouldn't be possible
            // but just for safety better to do a max with 0
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
        } else {
            PostLike newLike = new PostLike();
            newLike.setPost(post);
            newLike.setUser(user);
            postLikeRepository.save(newLike);

            post.setLikeCount(post.getLikeCount() + 1);
        }

        postRepository.save(post);
    }

    @Transactional
    public void toggleRepost(Long targetPostId, String username, String caption) {
        User reposter = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("user not found: " + username));

        Post targetPost = postRepository.findById(targetPostId)
                .orElseThrow(() -> new EntityNotFoundException("post not found: " + targetPostId));

        // basically flattening the repost cycle until the root is found
        Post rootPost = (targetPost.getOriginalPost() != null)
                ? targetPost.getOriginalPost()
                : targetPost;

        Optional<Post> existingRepost = postRepository.findByAuthorAndOriginalPost(reposter, rootPost);

        if (existingRepost.isPresent()) {
            postRepository.delete(existingRepost.get());
            postRepository.decrementRepostCount(rootPost.getId());
        } else {
            try {
                Post repost = new Post();
                        repost.setAuthor(reposter);
                        repost.setOriginalPost(rootPost);
                        repost.setCaption(caption);

                postRepository.save(repost);
                postRepository.incrementRepostCount(rootPost.getId());
            } catch (DataIntegrityViolationException _) {
                // this can only happen if the repost button was double clicked or somehow concurrent requests were fired
                // i don't need to do anything here
                // since the current state is what we'd end up with anyways
            }
        }
    }

    private Set<Long> getLikedPosts(List<Post> posts, String username) {
        if (posts.isEmpty() || username == null) {
            return Collections.emptySet();
        }

        return postLikeRepository.findPostIdsLikedByUser(
                username,
                posts.stream().map(Post::getId).toList()
        );
    }

    private Set<Long> getRepostedPosts(List<Post> posts, String username) {
        if (posts.isEmpty() || username == null) {
            return Collections.emptySet();
        }

        return postRepository.findPostIdsRepostedByUser(
                username,
                posts.stream().map(Post::getId).toList()
        );
    }
}
