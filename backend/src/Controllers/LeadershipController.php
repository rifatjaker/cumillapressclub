<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Core\Request;
use PDO;

final class LeadershipController
{
    public function publicIndex(Request $request): array
    {
        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $stmt = $pdo->query(
            'SELECT id, name, role, message, phone, email, social, media, photo_tag, photo_path, sort_order
             FROM leadership_profiles
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
            'SELECT id, name, role, message, phone, email, social, media, photo_tag, photo_path,
                    sort_order, is_active, created_at, updated_at
             FROM leadership_profiles
             ORDER BY sort_order ASC, id ASC'
        );

        $items = array_map(fn(array $item): array => [
            'id' => (int) $item['id'],
            'name' => (string) $item['name'],
            'role' => (string) $item['role'],
            'message' => (string) ($item['message'] ?? ''),
            'phone' => (string) ($item['phone'] ?? ''),
            'email' => (string) ($item['email'] ?? ''),
            'social' => (string) ($item['social'] ?? ''),
            'media' => (string) ($item['media'] ?? ''),
            'photo_tag' => (string) ($item['photo_tag'] ?? ''),
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
        $validation = $this->validatePayload($payload, true);
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
            'INSERT INTO leadership_profiles
             (name, role, message, phone, email, social, media, photo_tag, photo_path, sort_order, is_active, created_by, updated_by)
             VALUES
             (:name, :role, :message, :phone, :email, :social, :media, :photo_tag, :photo_path, :sort_order, :is_active, :created_by, :updated_by)'
        );
        $stmt->execute([
            'name' => $payload['name'],
            'role' => $payload['role'],
            'message' => $payload['message'],
            'phone' => $payload['phone'],
            'email' => $payload['email'],
            'social' => $payload['social'],
            'media' => $payload['media'],
            'photo_tag' => $payload['photo_tag'],
            'photo_path' => $photoPath,
            'sort_order' => $payload['sort_order'],
            'is_active' => $payload['is_active'],
            'created_by' => $adminId > 0 ? $adminId : null,
            'updated_by' => $adminId > 0 ? $adminId : null,
        ]);

        return [
            'data' => [
                'success' => true,
                'message' => 'Leadership profile created',
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
                'data' => ['success' => false, 'message' => 'Invalid leadership id'],
                'status' => 422,
            ];
        }

        $payload = $this->readFormPayload();
        $validation = $this->validatePayload($payload, false);
        if ($validation !== null) {
            return $validation;
        }

        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $findStmt = $pdo->prepare('SELECT photo_path FROM leadership_profiles WHERE id = :id LIMIT 1');
        $findStmt->execute(['id' => $id]);
        $existing = $findStmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            return [
                'data' => ['success' => false, 'message' => 'Leadership profile not found'],
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
            'UPDATE leadership_profiles
             SET name = :name,
                 role = :role,
                 message = :message,
                 phone = :phone,
                 email = :email,
                 social = :social,
                 media = :media,
                 photo_tag = :photo_tag,
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
            'message' => $payload['message'],
            'phone' => $payload['phone'],
            'email' => $payload['email'],
            'social' => $payload['social'],
            'media' => $payload['media'],
            'photo_tag' => $payload['photo_tag'],
            'photo_path' => $photoPath,
            'sort_order' => $payload['sort_order'],
            'is_active' => $payload['is_active'],
            'updated_by' => $adminId > 0 ? $adminId : null,
        ]);

        return [
            'data' => [
                'success' => true,
                'message' => 'Leadership profile updated',
            ],
            'status' => 200,
        ];
    }

    public function destroy(Request $request, array $params): array
    {
        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            return [
                'data' => ['success' => false, 'message' => 'Invalid leadership id'],
                'status' => 422,
            ];
        }

        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $findStmt = $pdo->prepare('SELECT photo_path FROM leadership_profiles WHERE id = :id LIMIT 1');
        $findStmt->execute(['id' => $id]);
        $existing = $findStmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            return [
                'data' => ['success' => false, 'message' => 'Leadership profile not found'],
                'status' => 404,
            ];
        }

        $deleteStmt = $pdo->prepare('DELETE FROM leadership_profiles WHERE id = :id');
        $deleteStmt->execute(['id' => $id]);
        if (!empty($existing['photo_path'])) {
            $this->deleteFileIfExists((string) $existing['photo_path']);
        }

        return [
            'data' => [
                'success' => true,
                'message' => 'Leadership profile deleted',
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
            'message' => (string) ($item['message'] ?? ''),
            'phone' => (string) ($item['phone'] ?? ''),
            'email' => (string) ($item['email'] ?? ''),
            'social' => (string) ($item['social'] ?? ''),
            'media' => (string) ($item['media'] ?? ''),
            'photoTag' => (string) ($item['photo_tag'] ?? ''),
            'photoUrl' => !empty($item['photo_path']) ? $this->toPublicUrl((string) $item['photo_path']) : null,
            'sort_order' => (int) $item['sort_order'],
        ];
    }

    /** @return array{name: string, role: string, message: string, phone: string, email: string, social: string, media: string, photo_tag: string, sort_order: int, is_active: int} */
    private function readFormPayload(): array
    {
        return [
            'name' => trim((string) ($_POST['name'] ?? '')),
            'role' => trim((string) ($_POST['role'] ?? '')),
            'message' => trim((string) ($_POST['message'] ?? '')),
            'phone' => trim((string) ($_POST['phone'] ?? '')),
            'email' => trim((string) ($_POST['email'] ?? '')),
            'social' => trim((string) ($_POST['social'] ?? '')),
            'media' => trim((string) ($_POST['media'] ?? '')),
            'photo_tag' => trim((string) ($_POST['photo_tag'] ?? '')),
            'sort_order' => (int) ($_POST['sort_order'] ?? 0),
            'is_active' => in_array(strtolower((string) ($_POST['is_active'] ?? '1')), ['1', 'true', 'on', 'yes'], true) ? 1 : 0,
        ];
    }

    private function validatePayload(array $payload, bool $_isCreate): ?array
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
            || strlen($payload['message']) > 2000
            || strlen($payload['phone']) > 40
            || strlen($payload['email']) > 190
            || strlen($payload['social']) > 255
            || strlen($payload['media']) > 180
            || strlen($payload['photo_tag']) > 80
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
            'CREATE TABLE IF NOT EXISTS leadership_profiles (
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
                INDEX idx_leadership_active_sort (is_active, sort_order)
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

        $uploadDir = BASE_PATH . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'leadership';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
            return ['success' => false, 'message' => 'Cannot create upload directory'];
        }

        $fileName = 'leader-' . bin2hex(random_bytes(12)) . '.' . $extension;
        $destination = $uploadDir . DIRECTORY_SEPARATOR . $fileName;

        if (!move_uploaded_file($tmpName, $destination)) {
            return ['success' => false, 'message' => 'Failed to move uploaded photo'];
        }

        return [
            'success' => true,
            'path' => '/uploads/leadership/' . $fileName,
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
