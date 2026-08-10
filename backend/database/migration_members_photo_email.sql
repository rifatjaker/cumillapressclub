-- Optional: add email/photo columns if members table already exists
ALTER TABLE members
    ADD COLUMN email VARCHAR(190) NULL AFTER phone,
    ADD COLUMN photo_path VARCHAR(500) NULL AFTER email;
