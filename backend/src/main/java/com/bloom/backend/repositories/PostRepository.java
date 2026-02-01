package com.bloom.backend.repositories;

import com.bloom.backend.models.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findAllByOrderByCreatedAtDesc();

    // peak naming
    List<Post> findByAuthorUsernameOrderByCreatedAtDesc(String username);
}
