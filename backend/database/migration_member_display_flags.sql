-- Show directory members also on Leadership / Executive Council sections
ALTER TABLE members
    ADD COLUMN show_in_leadership TINYINT(1) NOT NULL DEFAULT 0 AFTER expires_at,
    ADD COLUMN show_in_committee TINYINT(1) NOT NULL DEFAULT 0 AFTER show_in_leadership,
    ADD COLUMN leadership_sort_order INT NOT NULL DEFAULT 0 AFTER show_in_committee,
    ADD COLUMN committee_sort_order INT NOT NULL DEFAULT 0 AFTER leadership_sort_order,
    ADD COLUMN profile_message TEXT NULL AFTER committee_sort_order;

ALTER TABLE members
    ADD INDEX idx_members_leadership (show_in_leadership, leadership_sort_order),
    ADD INDEX idx_members_committee (show_in_committee, committee_sort_order);
