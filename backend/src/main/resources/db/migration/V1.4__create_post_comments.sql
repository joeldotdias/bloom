CREATE TABLE post_comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL CHECK (length(content) > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_post_comments_user FOREIGN KEY (user_id) REFERENCES  users(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_comments_post FOREIGN KEY (post_id) REFERENCES  posts(id) ON DELETE CASCADE
);

CREATE INDEX idx_post_comments_post ON post_comments(post_id);

ALTER TABLE posts
ADD COLUMN comment_count BIGINT DEFAULT 0;