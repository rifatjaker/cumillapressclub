-- Directory display order for members list
ALTER TABLE members
    ADD COLUMN sort_order INT NOT NULL DEFAULT 0 AFTER expires_at;

ALTER TABLE members
    ADD INDEX idx_members_sort (sort_order, name);
