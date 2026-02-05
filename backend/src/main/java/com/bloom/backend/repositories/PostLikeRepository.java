package com.bloom.backend.repositories;

import com.bloom.backend.models.Post;
import com.bloom.backend.models.PostLike;
import com.bloom.backend.models.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    Optional<PostLike> findByUserAndPost(User user, Post post);

    boolean existByUserAndPost(User user, Post post);

   @Query("SELECT pl.post.id FROM PostLike  pl WHERE pl.user.username = :username AND pl.post.id IN :postIds")
    Set<Long> findPostIdsLikedByUser(
            @Param("username") String username,
            @Param("postIds") List<Long> postIds
    );
}
