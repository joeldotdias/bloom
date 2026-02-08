package com.bloom.backend.repositories;

import com.bloom.backend.models.Post;
import com.bloom.backend.models.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findAllByOrderByCreatedAtDesc();

    // peak naming
    List<Post> findByAuthorUsernameOrderByCreatedAtDesc(String username);

    boolean existsByAuthorAndOriginalPost(User author, Post originalPost);

    @Modifying
    @Query("UPDATE Post p SET p.repostCount = p.repostCount + 1 WHERE p.id = :postId")
    void incrementRepostCount(@Param("postId") Long postId);

    @Modifying
    @Query("UPDATE Post p SET p.repostCount = GREATEST(0, p.repostCount - 1) WHERE p.id = :postId")
    void decrementRepostCount(@Param("postId") Long postId);

    Optional<Post> findByAuthorAndOriginalPost(User author, Post originalPost);

    @Query("SELECT p.originalPost.id FROM Post p WHERE p.author.username = :username AND p.originalPost.id IN :postIds")
    Set<Long> findPostIdsRepostedByUser(
            @Param("username") String username,
            @Param("postIds") List<Long> postIds
    );

}
