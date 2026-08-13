<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Core\Request;
use PDO;

final class PrimaryMemberController
{
    public function publicIndex(Request $request): array
    {
        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $stmt = $pdo->query(
            'SELECT id, name, role, tenure, contribution, photo_path, sort_order
             FROM primary_members
             WHERE is_active = 1
             ORDER BY sort_order ASC, id ASC'
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
            'SELECT id, name, role, tenure, contribution, photo_path, sort_order, is_active, created_at, updated_at
             FROM primary_members
             ORDER BY sort_order ASC, id ASC'
        );

        $items = array_map(fn(array $item): array => [
            'id' => (int) $item['id'],
            'name' => (string) $item['name'],
            'role' => (string) $item['role'],
            'tenure' => (string) ($item['tenure'] ?? ''),
            'contribution' => (string) ($item['contribution'] ?? ''),
            'photo_path' => $item['photo_path'] !== null ? (string) $item['photo_path'] : null,
            'photo_url' => !empty($item['photo_path']) ? $this->toPublicUrl((string) $item['photo_path']) : null,
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

        $photoPath = null;
        if (isset($_FILES['photo']) && is_array($_FILES['photo']) && (int) ($_FILES['photo']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
            $upload = $this->saveUploadedPhoto($_FILES['photo']);
            if (!$upload['success']) {
                return [
                    'data' => ['success' => false, 'message' => $upload['message']],
                    'status' => 422,
                ];
            }
            $photoPath = (string) $upload['path'];
        }

        $adminId = (int) (($request->user()['id'] ?? 0));
        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $stmt = $pdo->prepare(
            'INSERT INTO primary_members
             (name, role, tenure, contribution, photo_path, sort_order, is_active, created_by, updated_by)
             VALUES
             (:name, :role, :tenure, :contribution, :photo_path, :sort_order, :is_active, :created_by, :updated_by)'
        );
        $stmt->execute([
            'name' => $payload['name'],
            'role' => $payload['role'],
            'tenure' => $payload['tenure'],
            'contribution' => $payload['contribution'],
            'photo_path' => $photoPath,
            'sort_order' => $payload['sort_order'],
            'is_active' => $payload['is_active'],
            'created_by' => $adminId > 0 ? $adminId : null,
            'updated_by' => $adminId > 0 ? $adminId : null,
        ]);

        return [
            'data' => [
                'success' => true,
                'message' => 'Primary member created',
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
                'data' => ['success' => false, 'message' => 'Invalid primary member id'],
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

        $findStmt = $pdo->prepare('SELECT photo_path FROM primary_members WHERE id = :id LIMIT 1');
        $findStmt->execute(['id' => $id]);
        $existing = $findStmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            return [
                'data' => ['success' => false, 'message' => 'Primary member not found'],
                'status' => 404,
            ];
        }

        $photoPath = $existing['photo_path'] !== null ? (string) $existing['photo_path'] : null;
        if (isset($_FILES['photo']) && is_array($_FILES['photo']) && (int) ($_FILES['photo']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
            $upload = $this->saveUploadedPhoto($_FILES['photo']);
            if (!$upload['success']) {
                return [
                    'data' => ['success' => false, 'message' => $upload['message']],
                    'status' => 422,
                ];
            }
            if ($photoPath) {
                $this->deleteFileIfExists($photoPath);
            }
            $photoPath = (string) $upload['path'];
        }

        $adminId = (int) (($request->user()['id'] ?? 0));

        $stmt = $pdo->prepare(
            'UPDATE primary_members
             SET name = :name,
                 role = :role,
                 tenure = :tenure,
                 contribution = :contribution,
                 photo_path = :photo_path,
                 sort_order = :sort_order,
                 is_active = :is_active,
                 updated_by = :updated_by
             WHERE id = :id'
        );
        $stmt->execute([
            'id' => $id,
            'name' => $payload['name'],
            'role' => $payload['role'],
            'tenure' => $payload['tenure'],
            'contribution' => $payload['contribution'],
            'photo_path' => $photoPath,
            'sort_order' => $payload['sort_order'],
            'is_active' => $payload['is_active'],
            'updated_by' => $adminId > 0 ? $adminId : null,
        ]);

        return [
            'data' => [
                'success' => true,
                'message' => 'Primary member updated',
            ],
            'status' => 200,
        ];
    }

    public function destroy(Request $request, array $params): array
    {
        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            return [
                'data' => ['success' => false, 'message' => 'Invalid primary member id'],
                'status' => 422,
            ];
        }

        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $findStmt = $pdo->prepare('SELECT photo_path FROM primary_members WHERE id = :id LIMIT 1');
        $findStmt->execute(['id' => $id]);
        $existing = $findStmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            return [
                'data' => ['success' => false, 'message' => 'Primary member not found'],
                'status' => 404,
            ];
        }

        $deleteStmt = $pdo->prepare('DELETE FROM primary_members WHERE id = :id');
        $deleteStmt->execute(['id' => $id]);
        if (!empty($existing['photo_path'])) {
            $this->deleteFileIfExists((string) $existing['photo_path']);
        }

        return [
            'data' => [
                'success' => true,
                'message' => 'Primary member deleted',
            ],
            'status' => 200,
        ];
    }

    private function mapPublicItem(array $item): array
    {
        return [
            'id' => (int) $item['id'],
            'name' => (string) $item['name'],
            'role' => (string) $item['role'],
            'tenure' => (string) ($item['tenure'] ?? ''),
            'contribution' => (string) ($item['contribution'] ?? ''),
            'photoUrl' => !empty($item['photo_path']) ? $this->toPublicUrl((string) $item['photo_path']) : null,
            'sort_order' => (int) $item['sort_order'],
        ];
    }

    /** @return array{name: string, role: string, tenure: string, contribution: string, sort_order: int, is_active: int} */
    private function readFormPayload(): array
    {
        return [
            'name' => trim((string) ($_POST['name'] ?? '')),
            'role' => trim((string) ($_POST['role'] ?? '')),
            'tenure' => trim((string) ($_POST['tenure'] ?? '')),
            'contribution' => trim((string) ($_POST['contribution'] ?? '')),
            'sort_order' => (int) ($_POST['sort_order'] ?? 0),
            'is_active' => in_array(strtolower((string) ($_POST['is_active'] ?? '1')), ['1', 'true', 'on', 'yes'], true) ? 1 : 0,
        ];
    }

    private function validatePayload(array $payload): ?array
    {
        if ($payload['name'] === '' || $payload['role'] === '') {
            return [
                'data' => ['success' => false, 'message' => 'name and role are required'],
                'status' => 422,
            ];
        }

        if (
            strlen($payload['name']) > 150
            || strlen($payload['role']) > 120
            || strlen($payload['tenure']) > 120
            || strlen($payload['contribution']) > 1000
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
            'CREATE TABLE IF NOT EXISTS primary_members (
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
                INDEX idx_primary_active_sort (is_active, sort_order)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
        );
    }

    private function saveUploadedPhoto(array $file): array
    {
        $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
        if ($error !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => 'Photo upload failed'];
        }

        $size = (int) ($file['size'] ?? 0);
        if ($size <= 0 || $size > 5 * 1024 * 1024) {
            return ['success' => false, 'message' => 'Photo size must be between 1 byte and 5MB'];
        }

        $tmpName = (string) ($file['tmp_name'] ?? '');
        $originalName = (string) ($file['name'] ?? '');
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'webp'];

        if (!in_array($extension, $allowed, true)) {
            return ['success' => false, 'message' => 'Only jpg, jpeg, png, webp are allowed'];
        }

        $uploadDir = PUBLIC_PATH . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'primary';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
            return ['success' => false, 'message' => 'Cannot create upload directory'];
        }

        $fileName = 'primary-' . bin2hex(random_bytes(12)) . '.' . $extension;
        $destination = $uploadDir . DIRECTORY_SEPARATOR . $fileName;

        if (!move_uploaded_file($tmpName, $destination)) {
            return ['success' => false, 'message' => 'Failed to move uploaded photo'];
        }

        return [
            'success' => true,
            'path' => '/uploads/primary/' . $fileName,
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
