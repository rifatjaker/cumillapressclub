<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Core\Request;
use PDO;

final class ArchiveController
{
    public function publicIndex(Request $request): array
    {
        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $q = trim((string) ($request->query['q'] ?? ''));

        if ($q !== '') {
            $stmt = $pdo->prepare(
                'SELECT id, year_label, title, doc_type, link_url, file_path, sort_order
                 FROM archive_items
                 WHERE is_active = 1
                   AND (
                     year_label LIKE :query
                     OR title LIKE :query
                     OR doc_type LIKE :query
                   )
                 ORDER BY sort_order ASC, id DESC'
            );
            $stmt->execute(['query' => '%' . $q . '%']);
        } else {
            $stmt = $pdo->query(
                'SELECT id, year_label, title, doc_type, link_url, file_path, sort_order
                 FROM archive_items
                 WHERE is_active = 1
                 ORDER BY sort_order ASC, id DESC'
            );
        }

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
            'SELECT id, year_label, title, doc_type, link_url, file_path, sort_order, is_active, created_at, updated_at
             FROM archive_items
             ORDER BY sort_order ASC, id DESC'
        );

        $items = array_map(fn(array $item): array => [
            'id' => (int) $item['id'],
            'year_label' => (string) $item['year_label'],
            'title' => (string) $item['title'],
            'doc_type' => (string) $item['doc_type'],
            'link_url' => (string) ($item['link_url'] ?? ''),
            'file_path' => $item['file_path'] !== null ? (string) $item['file_path'] : null,
            'file_url' => !empty($item['file_path']) ? $this->toPublicUrl((string) $item['file_path']) : null,
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

        if ($payload['link_url'] === '' && $filePath === null) {
            return [
                'data' => ['success' => false, 'message' => 'লিংক অথবা ফাইল আপলোড আবশ্যক'],
                'status' => 422,
            ];
        }

        $adminId = (int) (($request->user()['id'] ?? 0));
        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $stmt = $pdo->prepare(
            'INSERT INTO archive_items
             (year_label, title, doc_type, link_url, file_path, sort_order, is_active, created_by, updated_by)
             VALUES
             (:year_label, :title, :doc_type, :link_url, :file_path, :sort_order, :is_active, :created_by, :updated_by)'
        );
        $stmt->execute([
            'year_label' => $payload['year_label'],
            'title' => $payload['title'],
            'doc_type' => $payload['doc_type'],
            'link_url' => $payload['link_url'] !== '' ? $payload['link_url'] : null,
            'file_path' => $filePath,
            'sort_order' => $payload['sort_order'],
            'is_active' => $payload['is_active'],
            'created_by' => $adminId > 0 ? $adminId : null,
            'updated_by' => $adminId > 0 ? $adminId : null,
        ]);

        return [
            'data' => [
                'success' => true,
                'message' => 'Archive item created',
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
                'data' => ['success' => false, 'message' => 'Invalid archive id'],
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

        $findStmt = $pdo->prepare('SELECT file_path, link_url FROM archive_items WHERE id = :id LIMIT 1');
        $findStmt->execute(['id' => $id]);
        $existing = $findStmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            return [
                'data' => ['success' => false, 'message' => 'Archive item not found'],
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

        $linkUrl = $payload['link_url'] !== '' ? $payload['link_url'] : null;
        if ($linkUrl === null && $filePath === null) {
            return [
                'data' => ['success' => false, 'message' => 'লিংক অথবা ফাইল আপলোড আবশ্যক'],
                'status' => 422,
            ];
        }

        $adminId = (int) (($request->user()['id'] ?? 0));

        $stmt = $pdo->prepare(
            'UPDATE archive_items
             SET year_label = :year_label,
                 title = :title,
                 doc_type = :doc_type,
                 link_url = :link_url,
                 file_path = :file_path,
                 sort_order = :sort_order,
                 is_active = :is_active,
                 updated_by = :updated_by
             WHERE id = :id'
        );
        $stmt->execute([
            'id' => $id,
            'year_label' => $payload['year_label'],
            'title' => $payload['title'],
            'doc_type' => $payload['doc_type'],
            'link_url' => $linkUrl,
            'file_path' => $filePath,
            'sort_order' => $payload['sort_order'],
            'is_active' => $payload['is_active'],
            'updated_by' => $adminId > 0 ? $adminId : null,
        ]);

        return [
            'data' => [
                'success' => true,
                'message' => 'Archive item updated',
            ],
            'status' => 200,
        ];
    }

    public function destroy(Request $request, array $params): array
    {
        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            return [
                'data' => ['success' => false, 'message' => 'Invalid archive id'],
                'status' => 422,
            ];
        }

        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $findStmt = $pdo->prepare('SELECT file_path FROM archive_items WHERE id = :id LIMIT 1');
        $findStmt->execute(['id' => $id]);
        $existing = $findStmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            return [
                'data' => ['success' => false, 'message' => 'Archive item not found'],
                'status' => 404,
            ];
        }

        $deleteStmt = $pdo->prepare('DELETE FROM archive_items WHERE id = :id');
        $deleteStmt->execute(['id' => $id]);
        if (!empty($existing['file_path'])) {
            $this->deleteFileIfExists((string) $existing['file_path']);
        }

        return [
            'data' => [
                'success' => true,
                'message' => 'Archive item deleted',
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
            'year' => (string) $item['year_label'],
            'title' => (string) $item['title'],
            'type' => (string) $item['doc_type'],
            'url' => $fileUrl ?: ($linkUrl !== '' ? $linkUrl : '#'),
            'sort_order' => (int) $item['sort_order'],
        ];
    }

    /** @return array{year_label: string, title: string, doc_type: string, link_url: string, sort_order: int, is_active: int} */
    private function readFormPayload(): array
    {
        return [
            'year_label' => trim((string) ($_POST['year_label'] ?? '')),
            'title' => trim((string) ($_POST['title'] ?? '')),
            'doc_type' => trim((string) ($_POST['doc_type'] ?? '')),
            'link_url' => trim((string) ($_POST['link_url'] ?? '')),
            'sort_order' => (int) ($_POST['sort_order'] ?? 0),
            'is_active' => in_array(strtolower((string) ($_POST['is_active'] ?? '1')), ['1', 'true', 'on', 'yes'], true) ? 1 : 0,
        ];
    }

    private function validatePayload(array $payload): ?array
    {
        if ($payload['year_label'] === '' || $payload['title'] === '' || $payload['doc_type'] === '') {
            return [
                'data' => ['success' => false, 'message' => 'year_label, title and doc_type are required'],
                'status' => 422,
            ];
        }

        if (
            strlen($payload['year_label']) > 40
            || strlen($payload['title']) > 255
            || strlen($payload['doc_type']) > 120
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
            'CREATE TABLE IF NOT EXISTS archive_items (
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
                INDEX idx_archive_active_sort (is_active, sort_order)
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
        $allowed = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp'];

        if (!in_array($extension, $allowed, true)) {
            return ['success' => false, 'message' => 'Only pdf, doc, docx, jpg, jpeg, png, webp are allowed'];
        }

        $uploadDir = BASE_PATH . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'archive';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
            return ['success' => false, 'message' => 'Cannot create upload directory'];
        }

        $fileName = 'archive-' . bin2hex(random_bytes(12)) . '.' . $extension;
        $destination = $uploadDir . DIRECTORY_SEPARATOR . $fileName;

        if (!move_uploaded_file($tmpName, $destination)) {
            return ['success' => false, 'message' => 'Failed to move uploaded file'];
        }

        return [
            'success' => true,
            'path' => '/uploads/archive/' . $fileName,
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
