ALTER TABLE posts
ADD COLUMN original_post_id BIGINT;

ALTER TABLE posts
ADD COLUMN repost_count BIGINT DEFAULT 0;

ALTER TABLE posts
ADD CONSTRAINT fk_posts_original FOREIGN KEY (original_post_id) REFERENCES posts(id) ON DELETE CASCADE;

CREATE INDEX idx_posts_original ON posts(original_post_id);
