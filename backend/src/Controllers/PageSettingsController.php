<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Core\Request;
use PDO;

final class PageSettingsController
{
    private const SETTINGS_ID = 1;

    public function publicShow(Request $request): array
    {
        return [
            'data' => [
                'success' => true,
                'data' => $this->getSettingsPayload(),
            ],
            'status' => 200,
        ];
    }

    public function adminShow(Request $request): array
    {
        return [
            'data' => [
                'success' => true,
                'data' => $this->getSettingsPayload(),
            ],
            'status' => 200,
        ];
    }

    public function update(Request $request): array
    {
        $siteName = trim((string) ($_POST['site_name'] ?? ''));
        $address = trim((string) ($_POST['address'] ?? ''));
        $phone = trim((string) ($_POST['phone'] ?? ''));
        $email = trim((string) ($_POST['email'] ?? ''));
        $mapEmbedUrl = trim((string) ($_POST['map_embed_url'] ?? ''));
        $facebookUrl = trim((string) ($_POST['facebook_url'] ?? ''));
        $youtubeUrl = trim((string) ($_POST['youtube_url'] ?? ''));
        $twitterUrl = trim((string) ($_POST['twitter_url'] ?? ''));
        $creditLine1 = trim((string) ($_POST['credit_line1'] ?? ''));
        $creditLine2 = trim((string) ($_POST['credit_line2'] ?? ''));
        $creditLine3 = trim((string) ($_POST['credit_line3'] ?? ''));

        $importantLinks = $this->parseLinksInput($_POST['important_links'] ?? '[]');
        $localNewspaperLinks = $this->parseLinksInput($_POST['local_newspaper_links'] ?? '[]');

        if ($importantLinks === null || $localNewspaperLinks === null) {
            return [
                'data' => ['success' => false, 'message' => 'লিংক ডেটা সঠিক JSON ফরম্যাটে পাঠান'],
                'status' => 422,
            ];
        }

        if ($siteName === '') {
            return [
                'data' => ['success' => false, 'message' => 'site_name is required'],
                'status' => 422,
            ];
        }

        if (strlen($siteName) > 255 || strlen($address) > 500 || strlen($phone) > 80 || strlen($email) > 190) {
            return [
                'data' => ['success' => false, 'message' => 'Input too long'],
                'status' => 422,
            ];
        }

        if (strlen($mapEmbedUrl) > 1000 || strlen($facebookUrl) > 500 || strlen($youtubeUrl) > 500 || strlen($twitterUrl) > 500) {
            return [
                'data' => ['success' => false, 'message' => 'URL too long'],
                'status' => 422,
            ];
        }

        if (strlen($creditLine1) > 500 || strlen($creditLine2) > 500 || strlen($creditLine3) > 500) {
            return [
                'data' => ['success' => false, 'message' => 'Credit text too long'],
                'status' => 422,
            ];
        }

        $pdo = Database::connection();
        $this->ensureSchema($pdo);
        $this->ensureRowExists($pdo);

        $findStmt = $pdo->prepare('SELECT logo_path FROM page_settings WHERE id = :id LIMIT 1');
        $findStmt->execute(['id' => self::SETTINGS_ID]);
        $existing = $findStmt->fetch(PDO::FETCH_ASSOC) ?: ['logo_path' => null];
        $logoPath = $existing['logo_path'] !== null ? (string) $existing['logo_path'] : null;

        if (isset($_FILES['logo']) && is_array($_FILES['logo']) && (int) ($_FILES['logo']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
            $upload = $this->saveUploadedLogo($_FILES['logo']);
            if (!$upload['success']) {
                return [
                    'data' => ['success' => false, 'message' => $upload['message']],
                    'status' => 422,
                ];
            }

            if ($logoPath) {
                $this->deleteFileIfExists($logoPath);
            }
            $logoPath = (string) $upload['path'];
        }

        $adminId = (int) (($request->user()['id'] ?? 0));

        $stmt = $pdo->prepare(
            'UPDATE page_settings
             SET site_name = :site_name,
                 logo_path = :logo_path,
                 address = :address,
                 phone = :phone,
                 email = :email,
                 map_embed_url = :map_embed_url,
                 facebook_url = :facebook_url,
                 youtube_url = :youtube_url,
                 twitter_url = :twitter_url,
                 credit_line1 = :credit_line1,
                 credit_line2 = :credit_line2,
                 credit_line3 = :credit_line3,
                 important_links = :important_links,
                 local_newspaper_links = :local_newspaper_links,
                 updated_by = :updated_by
             WHERE id = :id'
        );
        $stmt->execute([
            'id' => self::SETTINGS_ID,
            'site_name' => $siteName,
            'logo_path' => $logoPath,
            'address' => $address,
            'phone' => $phone,
            'email' => $email,
            'map_embed_url' => $mapEmbedUrl,
            'facebook_url' => $facebookUrl,
            'youtube_url' => $youtubeUrl,
            'twitter_url' => $twitterUrl,
            'credit_line1' => $creditLine1,
            'credit_line2' => $creditLine2,
            'credit_line3' => $creditLine3,
            'important_links' => json_encode($importantLinks, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'local_newspaper_links' => json_encode($localNewspaperLinks, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'updated_by' => $adminId > 0 ? $adminId : null,
        ]);

        return [
            'data' => [
                'success' => true,
                'message' => 'Page settings updated',
                'data' => $this->getSettingsPayload(),
            ],
            'status' => 200,
        ];
    }

    private function getSettingsPayload(): array
    {
        $pdo = Database::connection();
        $this->ensureSchema($pdo);
        $this->ensureRowExists($pdo);

        $stmt = $pdo->prepare(
            'SELECT site_name, logo_path, address, phone, email, map_embed_url,
                    facebook_url, youtube_url, twitter_url,
                    credit_line1, credit_line2, credit_line3,
                    important_links, local_newspaper_links, updated_at
             FROM page_settings
             WHERE id = :id
             LIMIT 1'
        );
        $stmt->execute(['id' => self::SETTINGS_ID]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

        $logoPath = isset($row['logo_path']) && $row['logo_path'] !== null && $row['logo_path'] !== ''
            ? (string) $row['logo_path']
            : null;

        return [
            'site_name' => (string) ($row['site_name'] ?? 'কুমিল্লা প্রেস ক্লাব'),
            'logo_path' => $logoPath,
            'logo_url' => $logoPath ? $this->toPublicUrl($logoPath) : null,
            'address' => (string) ($row['address'] ?? ''),
            'phone' => (string) ($row['phone'] ?? ''),
            'email' => (string) ($row['email'] ?? ''),
            'map_embed_url' => (string) ($row['map_embed_url'] ?? ''),
            'facebook_url' => (string) ($row['facebook_url'] ?? ''),
            'youtube_url' => (string) ($row['youtube_url'] ?? ''),
            'twitter_url' => (string) ($row['twitter_url'] ?? ''),
            'credit_line1' => (string) ($row['credit_line1'] ?? ''),
            'credit_line2' => (string) ($row['credit_line2'] ?? ''),
            'credit_line3' => (string) ($row['credit_line3'] ?? ''),
            'important_links' => $this->decodeLinks($row['important_links'] ?? null, $this->defaultImportantLinks()),
            'local_newspaper_links' => $this->decodeLinks($row['local_newspaper_links'] ?? null, $this->defaultLocalNewspaperLinks()),
            'updated_at' => (string) ($row['updated_at'] ?? ''),
        ];
    }

    private function ensureSchema(PDO $pdo): void
    {
        $columns = $pdo->query('SHOW COLUMNS FROM page_settings')->fetchAll(PDO::FETCH_COLUMN);
        $columns = array_map('strval', $columns ?: []);

        if (!in_array('important_links', $columns, true)) {
            $pdo->exec('ALTER TABLE page_settings ADD COLUMN important_links JSON NULL AFTER credit_line3');
        }
        if (!in_array('local_newspaper_links', $columns, true)) {
            $pdo->exec('ALTER TABLE page_settings ADD COLUMN local_newspaper_links JSON NULL AFTER important_links');
        }
    }

    private function ensureRowExists(PDO $pdo): void
    {
        $check = $pdo->prepare('SELECT id FROM page_settings WHERE id = :id LIMIT 1');
        $check->execute(['id' => self::SETTINGS_ID]);

        if ($check->fetch(PDO::FETCH_ASSOC)) {
            return;
        }

        $insert = $pdo->prepare(
            'INSERT INTO page_settings (
                id, site_name, address, phone, email, map_embed_url,
                facebook_url, youtube_url, twitter_url,
                credit_line1, credit_line2, credit_line3,
                important_links, local_newspaper_links
             ) VALUES (
                :id, :site_name, :address, :phone, :email, :map_embed_url,
                :facebook_url, :youtube_url, :twitter_url,
                :credit_line1, :credit_line2, :credit_line3,
                :important_links, :local_newspaper_links
             )'
        );
        $insert->execute([
            'id' => self::SETTINGS_ID,
            'site_name' => 'কুমিল্লা প্রেস ক্লাব',
            'address' => 'কুমিল্লা প্রেস ক্লাব, কুমিল্লা শহর, বাংলাদেশ',
            'phone' => '+8801XXXXXXXXX',
            'email' => 'info@cumillapressclub.org',
            'map_embed_url' => 'https://www.google.com/maps?q=Comilla%20Bangladesh&output=embed',
            'facebook_url' => 'https://www.facebook.com/share/19Dr5t8wkK/',
            'youtube_url' => 'https://www.youtube.com',
            'twitter_url' => 'https://x.com',
            'credit_line1' => 'সার্বিক পরিকল্পনা ও বাস্তবায়নে: মো: আসিফ হোসাইন মান্না',
            'credit_line2' => 'বিজ্ঞান,তথ্য প্রযুক্তি ও গবেষণা সম্পাদক',
            'credit_line3' => 'কুমিল্লা প্রেসক্লাব',
            'important_links' => json_encode($this->defaultImportantLinks(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'local_newspaper_links' => json_encode($this->defaultLocalNewspaperLinks(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);
    }

    /** @return list<array{label: string, url: string}>|null */
    private function parseLinksInput(mixed $raw): ?array
    {
        if (is_array($raw)) {
            $decoded = $raw;
        } else {
            $json = trim((string) $raw);
            if ($json === '') {
                return [];
            }
            $decoded = json_decode($json, true);
            if (!is_array($decoded)) {
                return null;
            }
        }

        $links = [];
        foreach ($decoded as $item) {
            if (!is_array($item)) {
                continue;
            }
            $label = trim((string) ($item['label'] ?? ''));
            $url = trim((string) ($item['url'] ?? ''));
            if ($label === '') {
                continue;
            }
            if (strlen($label) > 180 || strlen($url) > 500) {
                return null;
            }
            $links[] = [
                'label' => $label,
                'url' => $url !== '' ? $url : '#',
            ];
        }

        if (count($links) > 30) {
            return null;
        }

        return $links;
    }

    /** @return list<array{label: string, url: string}> */
    private function decodeLinks(mixed $raw, array $fallback): array
    {
        if ($raw === null || $raw === '') {
            return $fallback;
        }

        if (is_array($raw)) {
            $decoded = $raw;
        } else {
            $decoded = json_decode((string) $raw, true);
        }

        if (!is_array($decoded)) {
            return $fallback;
        }

        $links = [];
        foreach ($decoded as $item) {
            if (!is_array($item)) {
                continue;
            }
            $label = trim((string) ($item['label'] ?? ''));
            $url = trim((string) ($item['url'] ?? '#'));
            if ($label === '') {
                continue;
            }
            $links[] = ['label' => $label, 'url' => $url !== '' ? $url : '#'];
        }

        return $links !== [] ? $links : $fallback;
    }

    /** @return list<array{label: string, url: string}> */
    private function defaultImportantLinks(): array
    {
        return [
            ['label' => 'জেলা প্রশাসন', 'url' => '#'],
            ['label' => 'পুলিশ সুপার কার্যালয়', 'url' => '#'],
            ['label' => 'তথ্য মন্ত্রণালয়', 'url' => '#'],
            ['label' => 'বাংলাদেশ প্রেস কাউন্সিল', 'url' => '#'],
        ];
    }

    /** @return list<array{label: string, url: string}> */
    private function defaultLocalNewspaperLinks(): array
    {
        return [
            ['label' => 'দৈনিক কুমিল্লা', 'url' => '#'],
            ['label' => 'সমকাল কুমিল্লা', 'url' => '#'],
            ['label' => 'কুমিল্লা বার্তা', 'url' => '#'],
            ['label' => 'প্রতিদিনের সংবাদ', 'url' => '#'],
        ];
    }

    private function saveUploadedLogo(array $file): array
    {
        $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
        if ($error !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => 'Logo upload failed'];
        }

        $size = (int) ($file['size'] ?? 0);
        if ($size <= 0 || $size > 5 * 1024 * 1024) {
            return ['success' => false, 'message' => 'Logo size must be between 1 byte and 5MB'];
        }

        $tmpName = (string) ($file['tmp_name'] ?? '');
        $originalName = (string) ($file['name'] ?? '');
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'webp'];

        if (!in_array($extension, $allowed, true)) {
            return ['success' => false, 'message' => 'Only jpg, jpeg, png, webp are allowed'];
        }

        $uploadDir = BASE_PATH . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'branding';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
            return ['success' => false, 'message' => 'Cannot create upload directory'];
        }

        $fileName = 'logo-' . bin2hex(random_bytes(12)) . '.' . $extension;
        $destination = $uploadDir . DIRECTORY_SEPARATOR . $fileName;

        if (!move_uploaded_file($tmpName, $destination)) {
            return ['success' => false, 'message' => 'Failed to move uploaded logo'];
        }

        return [
            'success' => true,
            'path' => '/uploads/branding/' . $fileName,
        ];
    }

    private function deleteFileIfExists(string $relativePath): void
    {
        $relativePath = trim($relativePath);
        if ($relativePath === '') {
            return;
        }

        $fullPath = BASE_PATH . DIRECTORY_SEPARATOR . 'public' . str_replace('/', DIRECTORY_SEPARATOR, $relativePath);
        if (is_file($fullPath)) {
            @unlink($fullPath);
        }
    }

    private function toPublicUrl(string $path): string
    {
        $base = rtrim((string) (getenv('APP_URL') ?: ''), '/');
        if ($base !== '') {
            return $base . '/' . ltrim($path, '/');
        }

        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = (string) ($_SERVER['HTTP_HOST'] ?? 'localhost:8080');

        return $scheme . '://' . $host . '/' . ltrim($path, '/');
    }
}
