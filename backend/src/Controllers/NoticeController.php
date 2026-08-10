<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Core\Request;
use PDO;

final class NoticeController
{
    public function publicIndex(Request $request): array
    {
        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $stmt = $pdo->query(
            'SELECT id, title, date_label, details, file_path, link_url, sort_order
             FROM club_notices
             WHERE is_active = 1
             ORDER BY sort_order ASC, id DESC'
        );

        $items = array_map(fn(array $item): array => $this->mapPublicItem($item), $stmt->fetchAll(PDO::FETCH_ASSOC));

        return [
            'data' => [
                'success' => true,
                'data' => $items,
            ],
            'status' => 200,
        ];
    }

    public function adminIndex(Request $request): array
    {
        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $stmt = $pdo->query(
            'SELECT id, title, date_label, details, file_path, link_url, sort_order, is_active, created_at, updated_at
             FROM club_notices
             ORDER BY sort_order ASC, id DESC'
        );

        $items = array_map(fn(array $item): array => [
            'id' => (int) $item['id'],
            'title' => (string) $item['title'],
            'date_label' => (string) ($item['date_label'] ?? ''),
            'details' => (string) ($item['details'] ?? ''),
            'file_path' => $item['file_path'] !== null ? (string) $item['file_path'] : null,
            'file_url' => !empty($item['file_path']) ? $this->toPublicUrl((string) $item['file_path']) : null,
            'link_url' => (string) ($item['link_url'] ?? ''),
            'sort_order' => (int) $item['sort_order'],
            'is_active' => (int) $item['is_active'],
            'created_at' => (string) $item['created_at'],
            'updated_at' => (string) $item['updated_at'],
        ], $stmt->fetchAll(PDO::FETCH_ASSOC));

        return [
            'data' => [
                'success' => true,
                'data' => $items,
            ],
            'status' => 200,
        ];
    }

    public function store(Request $request): array
    {
        $payload = $this->readFormPayload();
        $validation = $this->validatePayload($payload);
        if ($validation !== null) {
            return $validation;
        }

        $filePath = null;
        if (isset($_FILES['file']) && is_array($_FILES['file']) && (int) ($_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
            $upload = $this->saveUploadedFile($_FILES['file']);
            if (!$upload['success']) {
                return [
                    'data' => ['success' => false, 'message' => $upload['message']],
                    'status' => 422,
                ];
            }
            $filePath = (string) $upload['path'];
        }

        if ($filePath === null && $payload['link_url'] === '') {
            return [
                'data' => ['success' => false, 'message' => 'PDF file or link_url is required'],
                'status' => 422,
            ];
        }

        $adminId = (int) (($request->user()['id'] ?? 0));
        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $stmt = $pdo->prepare(
            'INSERT INTO club_notices
             (title, date_label, details, file_path, link_url, sort_order, is_active, created_by, updated_by)
             VALUES
             (:title, :date_label, :details, :file_path, :link_url, :sort_order, :is_active, :created_by, :updated_by)'
        );
        $stmt->execute([
            'title' => $payload['title'],
            'date_label' => $payload['date_label'],
            'details' => $payload['details'],
            'file_path' => $filePath,
            'link_url' => $payload['link_url'] !== '' ? $payload['link_url'] : null,
            'sort_order' => $payload['sort_order'],
            'is_active' => $payload['is_active'],
            'created_by' => $adminId > 0 ? $adminId : null,
            'updated_by' => $adminId > 0 ? $adminId : null,
        ]);

        return [
            'data' => [
                'success' => true,
                'message' => 'Notice created',
                'data' => ['id' => (int) $pdo->lastInsertId()],
            ],
            'status' => 201,
        ];
    }

    public function update(Request $request, array $params): array
    {
        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            return [
                'data' => ['success' => false, 'message' => 'Invalid notice id'],
                'status' => 422,
            ];
        }

        $payload = $this->readFormPayload();
        $validation = $this->validatePayload($payload);
        if ($validation !== null) {
            return $validation;
        }

        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $findStmt = $pdo->prepare('SELECT file_path FROM club_notices WHERE id = :id LIMIT 1');
        $findStmt->execute(['id' => $id]);
        $existing = $findStmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            return [
                'data' => ['success' => false, 'message' => 'Notice not found'],
                'status' => 404,
            ];
        }

        $filePath = $existing['file_path'] !== null ? (string) $existing['file_path'] : null;
        if (isset($_FILES['file']) && is_array($_FILES['file']) && (int) ($_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
            $upload = $this->saveUploadedFile($_FILES['file']);
            if (!$upload['success']) {
                return [
                    'data' => ['success' => false, 'message' => $upload['message']],
                    'status' => 422,
                ];
            }
            if ($filePath) {
                $this->deleteFileIfExists($filePath);
            }
            $filePath = (string) $upload['path'];
        }

        if ($filePath === null && $payload['link_url'] === '') {
            return [
                'data' => ['success' => false, 'message' => 'PDF file or link_url is required'],
                'status' => 422,
            ];
        }

        $adminId = (int) (($request->user()['id'] ?? 0));

        $stmt = $pdo->prepare(
            'UPDATE club_notices
             SET title = :title,
                 date_label = :date_label,
                 details = :details,
                 file_path = :file_path,
                 link_url = :link_url,
                 sort_order = :sort_order,
                 is_active = :is_active,
                 updated_by = :updated_by
             WHERE id = :id'
        );
        $stmt->execute([
            'id' => $id,
            'title' => $payload['title'],
            'date_label' => $payload['date_label'],
            'details' => $payload['details'],
            'file_path' => $filePath,
            'link_url' => $payload['link_url'] !== '' ? $payload['link_url'] : null,
            'sort_order' => $payload['sort_order'],
            'is_active' => $payload['is_active'],
            'updated_by' => $adminId > 0 ? $adminId : null,
        ]);

        return [
            'data' => [
                'success' => true,
                'message' => 'Notice updated',
            ],
            'status' => 200,
        ];
    }

    public function destroy(Request $request, array $params): array
    {
        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            return [
                'data' => ['success' => false, 'message' => 'Invalid notice id'],
                'status' => 422,
            ];
        }

        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $findStmt = $pdo->prepare('SELECT file_path FROM club_notices WHERE id = :id LIMIT 1');
        $findStmt->execute(['id' => $id]);
        $existing = $findStmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            return [
                'data' => ['success' => false, 'message' => 'Notice not found'],
                'status' => 404,
            ];
        }

        $deleteStmt = $pdo->prepare('DELETE FROM club_notices WHERE id = :id');
        $deleteStmt->execute(['id' => $id]);
        if (!empty($existing['file_path'])) {
            $this->deleteFileIfExists((string) $existing['file_path']);
        }

        return [
            'data' => [
                'success' => true,
                'message' => 'Notice deleted',
            ],
            'status' => 200,
        ];
    }

    private function mapPublicItem(array $item): array
    {
        $fileUrl = !empty($item['file_path']) ? $this->toPublicUrl((string) $item['file_path']) : null;
        $linkUrl = trim((string) ($item['link_url'] ?? ''));

        return [
            'id' => (int) $item['id'],
            'title' => (string) $item['title'],
            'date' => (string) ($item['date_label'] ?? ''),
            'details' => (string) ($item['details'] ?? ''),
            'fileUrl' => $fileUrl,
            'linkUrl' => $linkUrl !== '' ? $linkUrl : null,
            'url' => $fileUrl ?: ($linkUrl !== '' ? $linkUrl : null),
            'sort_order' => (int) $item['sort_order'],
        ];
    }

    /** @return array{title: string, date_label: string, details: string, link_url: string, sort_order: int, is_active: int} */
    private function readFormPayload(): array
    {
        return [
            'title' => trim((string) ($_POST['title'] ?? '')),
            'date_label' => trim((string) ($_POST['date_label'] ?? '')),
            'details' => trim((string) ($_POST['details'] ?? '')),
            'link_url' => trim((string) ($_POST['link_url'] ?? '')),
            'sort_order' => (int) ($_POST['sort_order'] ?? 0),
            'is_active' => in_array(strtolower((string) ($_POST['is_active'] ?? '1')), ['1', 'true', 'on', 'yes'], true) ? 1 : 0,
        ];
    }

    private function validatePayload(array $payload): ?array
    {
        if ($payload['title'] === '') {
            return [
                'data' => ['success' => false, 'message' => 'title is required'],
                'status' => 422,
            ];
        }

        if (
            strlen($payload['title']) > 255
            || strlen($payload['date_label']) > 120
            || strlen($payload['details']) > 5000
            || strlen($payload['link_url']) > 1000
        ) {
            return [
                'data' => ['success' => false, 'message' => 'Input too long'],
                'status' => 422,
            ];
        }

        return null;
    }

    private function ensureSchema(PDO $pdo): void
    {
        $pdo->exec(
            'CREATE TABLE IF NOT EXISTS club_notices (
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
                INDEX idx_notices_active_sort (is_active, sort_order)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
        );
    }

    private function saveUploadedFile(array $file): array
    {
        $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
        if ($error !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => 'File upload failed'];
        }

        $size = (int) ($file['size'] ?? 0);
        if ($size <= 0 || $size > 15 * 1024 * 1024) {
            return ['success' => false, 'message' => 'File size must be between 1 byte and 15MB'];
        }

        $tmpName = (string) ($file['tmp_name'] ?? '');
        $originalName = (string) ($file['name'] ?? '');
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $allowed = ['pdf', 'doc', 'docx'];

        if (!in_array($extension, $allowed, true)) {
            return ['success' => false, 'message' => 'Only pdf, doc, docx are allowed'];
        }

        $uploadDir = BASE_PATH . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'notices';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
            return ['success' => false, 'message' => 'Cannot create upload directory'];
        }

        $fileName = 'notice-' . bin2hex(random_bytes(12)) . '.' . $extension;
        $destination = $uploadDir . DIRECTORY_SEPARATOR . $fileName;

        if (!move_uploaded_file($tmpName, $destination)) {
            return ['success' => false, 'message' => 'Failed to move uploaded file'];
        }

        return [
            'success' => true,
            'path' => '/uploads/notices/' . $fileName,
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
