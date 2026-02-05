CREATE TABLE post_likes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_post_likes_user_post UNIQUE (user_id, post_id),

    CONSTRAINT fk_post_likes_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE  CASCADE,
    CONSTRAINT fk_post_likes_posts FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE  CASCADE
);

ALTER TABLE posts
ADD COLUMN like_count BIGINT DEFAULT 0;