-- Run once if page_settings table already exists
ALTER TABLE page_settings
    ADD COLUMN important_links JSON NULL AFTER credit_line3,
    ADD COLUMN local_newspaper_links JSON NULL AFTER important_links;

UPDATE page_settings
SET
    important_links = COALESCE(important_links, JSON_ARRAY(
        JSON_OBJECT('label', 'জেলা প্রশাসন', 'url', '#'),
        JSON_OBJECT('label', 'পুলিশ সুপার কার্যালয়', 'url', '#'),
        JSON_OBJECT('label', 'তথ্য মন্ত্রণালয়', 'url', '#'),
        JSON_OBJECT('label', 'বাংলাদেশ প্রেস কাউন্সিল', 'url', '#')
    )),
    local_newspaper_links = COALESCE(local_newspaper_links, JSON_ARRAY(
        JSON_OBJECT('label', 'দৈনিক কুমিল্লা', 'url', '#'),
        JSON_OBJECT('label', 'সমকাল কুমিল্লা', 'url', '#'),
        JSON_OBJECT('label', 'কুমিল্লা বার্তা', 'url', '#'),
        JSON_OBJECT('label', 'প্রতিদিনের সংবাদ', 'url', '#')
    ))
WHERE id = 1;
