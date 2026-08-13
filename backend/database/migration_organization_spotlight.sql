CREATE TABLE IF NOT EXISTS organization_spotlight (
    id TINYINT UNSIGNED PRIMARY KEY,
    badge VARCHAR(120) NOT NULL DEFAULT 'কুমিল্লা প্রেস ক্লাব',
    title VARCHAR(255) NOT NULL DEFAULT 'জনতার আস্থা, জনতার অধিকার',
    established VARCHAR(40) NOT NULL DEFAULT '১৯৬৮',
    summary TEXT NULL,
    stat_number VARCHAR(40) NOT NULL DEFAULT '৮০০+',
    stat_label VARCHAR(120) NOT NULL DEFAULT 'পেশাদার সাংবাদিক',
    stat_caption VARCHAR(190) NOT NULL DEFAULT 'কুমিল্লা প্রেস ক্লাবের সদস্য',
    image_path VARCHAR(500) NULL,
    image_url VARCHAR(1000) NULL,
    highlights JSON NULL,
    updated_by BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_spotlight_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO organization_spotlight (
    id, badge, title, established, summary,
    stat_number, stat_label, stat_caption, image_url, highlights
) VALUES (
    1,
    'কুমিল্লা প্রেস ক্লাব',
    'জনতার আস্থা, জনতার অধিকার',
    '১৯৬৮',
    '১৯৬৮ সালে প্রতিষ্ঠিত কুমিল্লা প্রেস ক্লাব সাংবাদিকদের একটি ঐতিহ্যবাহী পেশাগত প্ল্যাটফর্ম। বস্তুনিষ্ঠ সাংবাদিকতা, পেশাগত মানোন্নয়ন, গণমাধ্যমের স্বাধীনতা এবং জনস্বার্থভিত্তিক সংবাদচর্চায় এই সংগঠন দীর্ঘদিন ধরে অগ্রণী ভূমিকা পালন করে আসছে। নতুন প্রজন্মের সাংবাদিকদের দক্ষতা বৃদ্ধি, নৈতিক সাংবাদিকতা চর্চা এবং সামাজিক দায়বদ্ধতা নিশ্চিত করাই আমাদের প্রধান লক্ষ্য।',
    '৮০০+',
    'পেশাদার সাংবাদিক',
    'কুমিল্লা প্রেস ক্লাবের সদস্য',
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1400&q=80',
    JSON_ARRAY(
        JSON_OBJECT('label', 'কুমিল্লা প্রেস ক্লাবের ইতিহাস', 'url', '#about'),
        JSON_OBJECT('label', 'কুমিল্লা প্রেস ক্লাবের গঠনতন্ত্র', 'url', '#about'),
        JSON_OBJECT('label', 'কুমিল্লা প্রেস ক্লাবের লক্ষ্য ও উদ্দেশ্য', 'url', '#about')
    )
) ON DUPLICATE KEY UPDATE id = VALUES(id);
