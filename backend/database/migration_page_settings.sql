-- Run once on existing databases
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
    credit_line1, credit_line2, credit_line3
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
    'কুমিল্লা প্রেসক্লাব'
) ON DUPLICATE KEY UPDATE id = VALUES(id);
