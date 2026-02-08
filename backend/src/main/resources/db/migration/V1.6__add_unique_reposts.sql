ALTER TABLE posts
ADD CONSTRAINT uq_reposts UNIQUE (author_id, original_post_id);