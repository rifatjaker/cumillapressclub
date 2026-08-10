CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'member') NOT NULL DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_refresh_token_hash (token_hash),
    INDEX idx_refresh_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS members (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    member_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    media_house VARCHAR(180) NOT NULL,
    designation VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NULL,
    email VARCHAR(190) NULL,
    photo_path VARCHAR(500) NULL,
    status ENUM('active', 'inactive', 'expired') NOT NULL DEFAULT 'active',
    expires_at DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_members_name (name),
    INDEX idx_members_code (member_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS news (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(80) NOT NULL DEFAULT 'general',
    summary TEXT NOT NULL,
    published_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_news_published_at (published_at),
    INDEX idx_news_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS dynamic_contents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    section_key VARCHAR(120) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dynamic_contents_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_dynamic_contents_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_dynamic_contents_section (section_key),
    INDEX idx_dynamic_contents_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS slider_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slide_date VARCHAR(100) NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_slider_items_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_slider_items_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_slider_items_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS page_settings (
    id TINYINT UNSIGNED PRIMARY KEY,
    site_name VARCHAR(255) NOT NULL DEFAULT 'কুমিল্লা প্রেস ক্লাব',
    logo_path VARCHAR(500) NULL,
    address VARCHAR(500) NOT NULL DEFAULT '',
    phone VARCHAR(80) NOT NULL DEFAULT '',
    email VARCHAR(190) NOT NULL DEFAULT '',
    map_embed_url VARCHAR(1000) NOT NULL DEFAULT '',
    facebook_url VARCHAR(500) NOT NULL DEFAULT '',
    youtube_url VARCHAR(500) NOT NULL DEFAULT '',
    twitter_url VARCHAR(500) NOT NULL DEFAULT '',
    credit_line1 VARCHAR(500) NOT NULL DEFAULT '',
    credit_line2 VARCHAR(500) NOT NULL DEFAULT '',
    credit_line3 VARCHAR(500) NOT NULL DEFAULT '',
    important_links JSON NULL,
    local_newspaper_links JSON NULL,
    updated_by BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_page_settings_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO page_settings (
    id, site_name, address, phone, email, map_embed_url,
    facebook_url, youtube_url, twitter_url,
    credit_line1, credit_line2, credit_line3,
    important_links, local_newspaper_links
) VALUES (
    1,
    'কুমিল্লা প্রেস ক্লাব',
    'কুমিল্লা প্রেস ক্লাব, কুমিল্লা শহর, বাংলাদেশ',
    '+8801XXXXXXXXX',
    'info@cumillapressclub.org',
    'https://www.google.com/maps?q=Comilla%20Bangladesh&output=embed',
    'https://www.facebook.com/share/19Dr5t8wkK/',
    'https://www.youtube.com',
    'https://x.com',
    'সার্বিক পরিকল্পনা ও বাস্তবায়নে: মো: আসিফ হোসাইন মান্না',
    'বিজ্ঞান,তথ্য প্রযুক্তি ও গবেষণা সম্পাদক',
    'কুমিল্লা প্রেসক্লাব',
    JSON_ARRAY(
        JSON_OBJECT('label', 'জেলা প্রশাসন', 'url', '#'),
        JSON_OBJECT('label', 'পুলিশ সুপার কার্যালয়', 'url', '#'),
        JSON_OBJECT('label', 'তথ্য মন্ত্রণালয়', 'url', '#'),
        JSON_OBJECT('label', 'বাংলাদেশ প্রেস কাউন্সিল', 'url', '#')
    ),
    JSON_ARRAY(
        JSON_OBJECT('label', 'দৈনিক কুমিল্লা', 'url', '#'),
        JSON_OBJECT('label', 'সমকাল কুমিল্লা', 'url', '#'),
        JSON_OBJECT('label', 'কুমিল্লা বার্তা', 'url', '#'),
        JSON_OBJECT('label', 'প্রতিদিনের সংবাদ', 'url', '#')
    )
) ON DUPLICATE KEY UPDATE id = VALUES(id);

CREATE TABLE IF NOT EXISTS leadership_profiles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(120) NOT NULL,
    message TEXT NULL,
    phone VARCHAR(40) NULL,
    email VARCHAR(190) NULL,
    social VARCHAR(255) NULL,
    media VARCHAR(180) NULL,
    photo_tag VARCHAR(80) NULL,
    photo_path VARCHAR(500) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_leadership_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_leadership_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_leadership_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS committee_members (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(120) NOT NULL,
    message TEXT NULL,
    phone VARCHAR(40) NULL,
    email VARCHAR(190) NULL,
    social VARCHAR(255) NULL,
    media VARCHAR(180) NULL,
    photo_path VARCHAR(500) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_committee_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_committee_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_committee_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS archive_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    year_label VARCHAR(40) NOT NULL,
    title VARCHAR(255) NOT NULL,
    doc_type VARCHAR(120) NOT NULL,
    link_url VARCHAR(1000) NULL,
    file_path VARCHAR(500) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_archive_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_archive_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_archive_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS deceased_members (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(120) NOT NULL,
    tenure VARCHAR(120) NULL,
    photo_path VARCHAR(500) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_deceased_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_deceased_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_deceased_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS primary_members (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(120) NOT NULL,
    tenure VARCHAR(120) NULL,
    contribution TEXT NULL,
    photo_path VARCHAR(500) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_primary_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_primary_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_primary_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS club_notices (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date_label VARCHAR(120) NULL,
    details TEXT NULL,
    file_path VARCHAR(500) NULL,
    link_url VARCHAR(1000) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_notices_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_notices_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_notices_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS club_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date_label VARCHAR(120) NULL,
    time_label VARCHAR(120) NULL,
    venue VARCHAR(255) NULL,
    starts_at DATETIME NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_events_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_events_active_sort (is_active, sort_order),
    INDEX idx_events_starts_at (starts_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Demo admin user
-- Password: admin1234
INSERT INTO users (name, email, password_hash, role)
VALUES ('System Admin', 'admin@cumillapressclub.local', '$2y$10$2B9rW0fwnH5Q1J4D9i4Rbu2t3Q4mmL0zw5aXIPqAwYM1D4gji36hO', 'admin')
ON DUPLICATE KEY UPDATE email = VALUES(email);
