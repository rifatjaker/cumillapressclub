-- Seed / reset demo admin for production
-- Run once in phpMyAdmin on cumillap_website_db

INSERT INTO users (name, email, password_hash, role)
VALUES (
  'System Admin',
  'admin@cumillapressclub.local',
  '$2y$10$2B9rW0fwnH5Q1J4D9i4Rbu2t3Q4mmL0zw5aXIPqAwYM1D4gji36hO',
  'admin'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password_hash = VALUES(password_hash),
  role = 'admin';

-- Login:
-- Email: admin@cumillapressclub.local
-- Password: admin1234
