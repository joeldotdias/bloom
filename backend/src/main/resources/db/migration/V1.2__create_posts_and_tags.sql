CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    author_id BIGINT NOT NULL,
    caption TEXT NOT NULL,
    image_url TEXT,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_author FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE post_tags (
    post_id BIGINT NOT NULL,
    tag VARCHAR(50) NOT NULL,
    CONSTRAINT fk_tags_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag) -- a post shouldn't have the same tag twice
);

CREATE INDEX idx_post_tags_tag ON post_tags(tag);