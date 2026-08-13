<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Core\Request;
use PDO;

final class OrganizationSpotlightController
{
    private const ROW_ID = 1;

    public function publicShow(Request $request): array
    {
        return [
            'data' => [
                'success' => true,
                'data' => $this->getPayload(),
            ],
            'status' => 200,
        ];
    }

    public function adminShow(Request $request): array
    {
        return [
            'data' => [
                'success' => true,
                'data' => $this->getPayload(),
            ],
            'status' => 200,
        ];
    }

    public function update(Request $request): array
    {
        $badge = trim((string) ($_POST['badge'] ?? ''));
        $title = trim((string) ($_POST['title'] ?? ''));
        $established = trim((string) ($_POST['established'] ?? ''));
        $summary = trim((string) ($_POST['summary'] ?? ''));
        $statNumber = trim((string) ($_POST['stat_number'] ?? ''));
        $statLabel = trim((string) ($_POST['stat_label'] ?? ''));
        $statCaption = trim((string) ($_POST['stat_caption'] ?? ''));
        $imageUrl = trim((string) ($_POST['image_url'] ?? ''));
        $highlights = $this->parseHighlightsInput($_POST['highlights'] ?? '[]');

        if ($highlights === null) {
            return [
                'data' => ['success' => false, 'message' => 'highlights must be valid JSON'],
                'status' => 422,
            ];
        }

        if ($title === '') {
            return [
                'data' => ['success' => false, 'message' => 'title is required'],
                'status' => 422,
            ];
        }

        if (
            strlen($badge) > 120
            || strlen($title) > 255
            || strlen($established) > 40
            || strlen($summary) > 5000
            || strlen($statNumber) > 40
            || strlen($statLabel) > 120
            || strlen($statCaption) > 190
            || strlen($imageUrl) > 1000
        ) {
            return [
                'data' => ['success' => false, 'message' => 'Input too long'],
                'status' => 422,
            ];
        }

        $pdo = Database::connection();
        $this->ensureSchema($pdo);
        $this->ensureRowExists($pdo);

        $findStmt = $pdo->prepare('SELECT image_path FROM organization_spotlight WHERE id = :id LIMIT 1');
        $findStmt->execute(['id' => self::ROW_ID]);
        $existing = $findStmt->fetch(PDO::FETCH_ASSOC) ?: ['image_path' => null];
        $imagePath = $existing['image_path'] !== null ? (string) $existing['image_path'] : null;

        if (isset($_FILES['image']) && is_array($_FILES['image']) && (int) ($_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
            $upload = $this->saveUploadedImage($_FILES['image']);
            if (!$upload['success']) {
                return [
                    'data' => ['success' => false, 'message' => $upload['message']],
                    'status' => 422,
                ];
            }
            if ($imagePath) {
                $this->deleteFileIfExists($imagePath);
            }
            $imagePath = (string) $upload['path'];
        }

        $adminId = (int) (($request->user()['id'] ?? 0));

        $stmt = $pdo->prepare(
            'UPDATE organization_spotlight
             SET badge = :badge,
                 title = :title,
                 established = :established,
                 summary = :summary,
                 stat_number = :stat_number,
                 stat_label = :stat_label,
                 stat_caption = :stat_caption,
                 image_path = :image_path,
                 image_url = :image_url,
                 highlights = :highlights,
                 updated_by = :updated_by
             WHERE id = :id'
        );
        $stmt->execute([
            'id' => self::ROW_ID,
            'badge' => $badge !== '' ? $badge : 'কুমিল্লা প্রেস ক্লাব',
            'title' => $title,
            'established' => $established !== '' ? $established : '১৯৬৮',
            'summary' => $summary,
            'stat_number' => $statNumber !== '' ? $statNumber : '৮০০+',
            'stat_label' => $statLabel !== '' ? $statLabel : 'পেশাদার সাংবাদিক',
            'stat_caption' => $statCaption !== '' ? $statCaption : 'কুমিল্লা প্রেস ক্লাবের সদস্য',
            'image_path' => $imagePath,
            'image_url' => $imageUrl !== '' ? $imageUrl : null,
            'highlights' => json_encode($highlights, JSON_UNESCAPED_UNICODE),
            'updated_by' => $adminId > 0 ? $adminId : null,
        ]);

        return [
            'data' => [
                'success' => true,
                'message' => 'Organization spotlight updated',
                'data' => $this->getPayload(),
            ],
            'status' => 200,
        ];
    }

    private function getPayload(): array
    {
        $pdo = Database::connection();
        $this->ensureSchema($pdo);
        $this->ensureRowExists($pdo);

        $stmt = $pdo->prepare(
            'SELECT badge, title, established, summary, stat_number, stat_label, stat_caption, image_path, image_url, highlights
             FROM organization_spotlight
             WHERE id = :id
             LIMIT 1'
        );
        $stmt->execute(['id' => self::ROW_ID]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

        $uploadedUrl = !empty($row['image_path']) ? $this->toPublicUrl((string) $row['image_path']) : null;
        $externalUrl = trim((string) ($row['image_url'] ?? ''));

        return [
            'badge' => (string) ($row['badge'] ?? 'কুমিল্লা প্রেস ক্লাব'),
            'title' => (string) ($row['title'] ?? 'জনতার আস্থা, জনতার অধিকার'),
            'established' => (string) ($row['established'] ?? '১৯৬৮'),
            'summary' => (string) ($row['summary'] ?? ''),
            'statNumber' => (string) ($row['stat_number'] ?? '৮০০+'),
            'statLabel' => (string) ($row['stat_label'] ?? 'পেশাদার সাংবাদিক'),
            'statCaption' => (string) ($row['stat_caption'] ?? 'কুমিল্লা প্রেস ক্লাবের সদস্য'),
            'imageUrl' => $uploadedUrl ?: ($externalUrl !== '' ? $externalUrl : null),
            'image_path' => !empty($row['image_path']) ? (string) $row['image_path'] : null,
            'image_url' => $externalUrl !== '' ? $externalUrl : null,
            'highlights' => $this->decodeHighlights($row['highlights'] ?? null),
        ];
    }

    private function ensureSchema(PDO $pdo): void
    {
        $pdo->exec(
            'CREATE TABLE IF NOT EXISTS organization_spotlight (
                id TINYINT UNSIGNED PRIMARY KEY,
                badge VARCHAR(120) NOT NULL DEFAULT \'কুমিল্লা প্রেস ক্লাব\',
                title VARCHAR(255) NOT NULL DEFAULT \'জনতার আস্থা, জনতার অধিকার\',
                established VARCHAR(40) NOT NULL DEFAULT \'১৯৬৮\',
                summary TEXT NULL,
                stat_number VARCHAR(40) NOT NULL DEFAULT \'৮০০+\',
                stat_label VARCHAR(120) NOT NULL DEFAULT \'পেশাদার সাংবাদিক\',
                stat_caption VARCHAR(190) NOT NULL DEFAULT \'কুমিল্লা প্রেস ক্লাবের সদস্য\',
                image_path VARCHAR(500) NULL,
                image_url VARCHAR(1000) NULL,
                highlights JSON NULL,
                updated_by BIGINT UNSIGNED NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
        );
    }

    private function ensureRowExists(PDO $pdo): void
    {
        $stmt = $pdo->prepare('SELECT id FROM organization_spotlight WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => self::ROW_ID]);
        if ($stmt->fetch(PDO::FETCH_ASSOC)) {
            return;
        }

        $insert = $pdo->prepare(
            'INSERT INTO organization_spotlight
             (id, badge, title, established, summary, stat_number, stat_label, stat_caption, image_url, highlights)
             VALUES
             (:id, :badge, :title, :established, :summary, :stat_number, :stat_label, :stat_caption, :image_url, :highlights)'
        );
        $insert->execute([
            'id' => self::ROW_ID,
            'badge' => 'কুমিল্লা প্রেস ক্লাব',
            'title' => 'জনতার আস্থা, জনতার অধিকার',
            'established' => '১৯৬৮',
            'summary' => '১৯৬৮ সালে প্রতিষ্ঠিত কুমিল্লা প্রেস ক্লাব সাংবাদিকদের একটি ঐতিহ্যবাহী পেশাগত প্ল্যাটফর্ম। বস্তুনিষ্ঠ সাংবাদিকতা, পেশাগত মানোন্নয়ন, গণমাধ্যমের স্বাধীনতা এবং জনস্বার্থভিত্তিক সংবাদচর্চায় এই সংগঠন দীর্ঘদিন ধরে অগ্রণী ভূমিকা পালন করে আসছে। নতুন প্রজন্মের সাংবাদিকদের দক্ষতা বৃদ্ধি, নৈতিক সাংবাদিকতা চর্চা এবং সামাজিক দায়বদ্ধতা নিশ্চিত করাই আমাদের প্রধান লক্ষ্য।',
            'stat_number' => '৮০০+',
            'stat_label' => 'পেশাদার সাংবাদিক',
            'stat_caption' => 'কুমিল্লা প্রেস ক্লাবের সদস্য',
            'image_url' => 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1400&q=80',
            'highlights' => json_encode($this->defaultHighlights(), JSON_UNESCAPED_UNICODE),
        ]);
    }

    /** @return list<array{label: string, url: string}>|null */
    private function parseHighlightsInput(mixed $raw): ?array
    {
        if (is_array($raw)) {
            $decoded = $raw;
        } else {
            $decoded = json_decode((string) $raw, true);
            if (!is_array($decoded)) {
                return null;
            }
        }

        $items = [];
        foreach ($decoded as $item) {
            if (is_string($item)) {
                $label = trim($item);
                if ($label === '') {
                    continue;
                }
                $items[] = ['label' => $label, 'body' => ''];
                continue;
            }
            if (!is_array($item)) {
                continue;
            }
            $label = trim((string) ($item['label'] ?? ''));
            $body = trim((string) ($item['body'] ?? $item['content'] ?? $item['information'] ?? ''));
            if ($label === '') {
                continue;
            }
            $items[] = ['label' => $label, 'body' => $body];
        }

        return $items;
    }

    /** @return list<array{label: string, body: string}> */
    private function decodeHighlights(mixed $raw): array
    {
        if ($raw === null || $raw === '') {
            return $this->defaultHighlights();
        }

        if (is_array($raw)) {
            $decoded = $raw;
        } else {
            $decoded = json_decode((string) $raw, true);
        }

        if (!is_array($decoded)) {
            return $this->defaultHighlights();
        }

        $items = [];
        foreach ($decoded as $item) {
            if (is_string($item)) {
                $label = trim($item);
                if ($label !== '') {
                    $items[] = ['label' => $label, 'body' => ''];
                }
                continue;
            }
            if (!is_array($item)) {
                continue;
            }
            $label = trim((string) ($item['label'] ?? ''));
            $body = trim((string) ($item['body'] ?? $item['content'] ?? $item['information'] ?? ''));
            if ($label === '') {
                continue;
            }
            $items[] = ['label' => $label, 'body' => $body];
        }

        return $items !== [] ? $items : $this->defaultHighlights();
    }

    /** @return list<array{label: string, body: string}> */
    private function defaultHighlights(): array
    {
        return [
            ['label' => 'কুমিল্লা প্রেস ক্লাবের ইতিহাস', 'body' => ''],
            ['label' => 'কুমিল্লা প্রেস ক্লাবের গঠনতন্ত্র', 'body' => ''],
            ['label' => 'কুমিল্লা প্রেস ক্লাবের লক্ষ্য ও উদ্দেশ্য', 'body' => ''],
        ];
    }

    private function saveUploadedImage(array $file): array
    {
        $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
        if ($error !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => 'Image upload failed'];
        }

        $size = (int) ($file['size'] ?? 0);
        if ($size <= 0 || $size > 5 * 1024 * 1024) {
            return ['success' => false, 'message' => 'Image size must be between 1 byte and 5MB'];
        }

        $tmpName = (string) ($file['tmp_name'] ?? '');
        $originalName = (string) ($file['name'] ?? '');
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'webp'];

        if (!in_array($extension, $allowed, true)) {
            return ['success' => false, 'message' => 'Only jpg, jpeg, png, webp are allowed'];
        }

        $uploadDir = PUBLIC_PATH . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'spotlight';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
            return ['success' => false, 'message' => 'Cannot create upload directory'];
        }

        $fileName = 'spotlight-' . bin2hex(random_bytes(12)) . '.' . $extension;
        $destination = $uploadDir . DIRECTORY_SEPARATOR . $fileName;

        if (!move_uploaded_file($tmpName, $destination)) {
            return ['success' => false, 'message' => 'Failed to move uploaded image'];
        }

        return [
            'success' => true,
            'path' => '/uploads/spotlight/' . $fileName,
        ];
    }

    private function deleteFileIfExists(string $relativePath): void
    {
        $relativePath = trim($relativePath);
        if ($relativePath === '') {
            return;
        }

        $fullPath = PUBLIC_PATH . str_replace('/', DIRECTORY_SEPARATOR, $relativePath);
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
