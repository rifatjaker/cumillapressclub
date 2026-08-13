<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Core\Request;
use PDO;

final class MemberController
{
    public function publicIndex(Request $request): array
    {
        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $q = trim((string) ($request->query['q'] ?? ''));

        if ($q !== '') {
            $stmt = $pdo->prepare(
                'SELECT id, member_code, name, media_house, designation, phone, email, photo_path, status, expires_at, sort_order
                 FROM members
                 WHERE status = \'active\'
                   AND (
                     name LIKE :query
                     OR member_code LIKE :query
                     OR media_house LIKE :query
                     OR designation LIKE :query
                   )
                 ORDER BY sort_order ASC, name ASC
                 LIMIT 100'
            );
            $stmt->execute(['query' => '%' . $q . '%']);
        } else {
            $stmt = $pdo->query(
                'SELECT id, member_code, name, media_house, designation, phone, email, photo_path, status, expires_at, sort_order
                 FROM members
                 WHERE status = \'active\'
                 ORDER BY sort_order ASC, name ASC
                 LIMIT 500'
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

    public function search(Request $request): array
    {
        return $this->publicIndex($request);
    }

    public function verify(Request $request, array $params): array
    {
        $code = trim((string) ($params['code'] ?? ''));

        if ($code === '') {
            return [
                'data' => ['success' => false, 'message' => 'Member code is required'],
                'status' => 422,
            ];
        }

        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $stmt = $pdo->prepare(
            'SELECT id, member_code, name, media_house, designation, phone, email, photo_path, status, expires_at
             FROM members
             WHERE member_code = :code
             LIMIT 1'
        );
        $stmt->execute(['code' => $code]);
        $member = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$member) {
            return [
                'data' => ['success' => false, 'message' => 'Member not found'],
                'status' => 404,
            ];
        }

        return [
            'data' => [
                'success' => true,
                'data' => $this->mapPublicItem($member),
            ],
            'status' => 200,
        ];
    }

    public function publicLeadershipIndex(Request $request): array
    {
        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $stmt = $pdo->query(
            'SELECT id, name, designation AS role, profile_message AS message, phone, email,
                    media_house AS media, photo_path, leadership_sort_order AS sort_order
             FROM members
             WHERE show_in_leadership = 1
               AND status = \'active\'
             ORDER BY leadership_sort_order ASC, name ASC, id ASC'
        );

        $items = array_map(fn(array $item): array => $this->mapSpotlightItem($item, true), $stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);

        return [
            'data' => [
                'success' => true,
                'data' => $items,
            ],
            'status' => 200,
        ];
    }

    public function publicCommitteeIndex(Request $request): array
    {
        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $stmt = $pdo->query(
            'SELECT id, name, designation AS role, profile_message AS message, phone, email,
                    media_house AS media, photo_path, committee_sort_order AS sort_order
             FROM members
             WHERE show_in_committee = 1
               AND status = \'active\'
             ORDER BY committee_sort_order ASC, name ASC, id ASC'
        );

        $items = array_map(fn(array $item): array => $this->mapSpotlightItem($item, false), $stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);

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
            'SELECT id, member_code, name, media_house, designation, phone, email, photo_path, status, expires_at, sort_order,
                    show_in_leadership, show_in_committee, leadership_sort_order, committee_sort_order, profile_message,
                    created_at, updated_at
             FROM members
             ORDER BY sort_order ASC, id ASC'
        );

        $items = array_map(fn(array $item): array => [
            'id' => (int) $item['id'],
            'member_code' => (string) $item['member_code'],
            'name' => (string) $item['name'],
            'media_house' => (string) $item['media_house'],
            'designation' => (string) $item['designation'],
            'phone' => (string) ($item['phone'] ?? ''),
            'email' => (string) ($item['email'] ?? ''),
            'photo_path' => $item['photo_path'] !== null ? (string) $item['photo_path'] : null,
            'photo_url' => !empty($item['photo_path']) ? $this->toPublicUrl((string) $item['photo_path']) : null,
            'status' => (string) $item['status'],
            'expires_at' => $item['expires_at'] !== null ? (string) $item['expires_at'] : null,
            'sort_order' => (int) ($item['sort_order'] ?? 0),
            'show_in_leadership' => (int) ($item['show_in_leadership'] ?? 0) === 1,
            'show_in_committee' => (int) ($item['show_in_committee'] ?? 0) === 1,
            'leadership_sort_order' => (int) ($item['leadership_sort_order'] ?? 0),
            'committee_sort_order' => (int) ($item['committee_sort_order'] ?? 0),
            'profile_message' => (string) ($item['profile_message'] ?? ''),
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

        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        if ($this->memberCodeExists($pdo, $payload['member_code'])) {
            return [
                'data' => ['success' => false, 'message' => 'Member code already exists'],
                'status' => 422,
            ];
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

        $stmt = $pdo->prepare(
            'INSERT INTO members
             (member_code, name, media_house, designation, phone, email, photo_path, status, expires_at, sort_order,
              show_in_leadership, show_in_committee, leadership_sort_order, committee_sort_order, profile_message)
             VALUES
             (:member_code, :name, :media_house, :designation, :phone, :email, :photo_path, :status, :expires_at, :sort_order,
              :show_in_leadership, :show_in_committee, :leadership_sort_order, :committee_sort_order, :profile_message)'
        );
        $stmt->execute([
            'member_code' => $payload['member_code'],
            'name' => $payload['name'],
            'media_house' => $payload['media_house'],
            'designation' => $payload['designation'],
            'phone' => $payload['phone'] !== '' ? $payload['phone'] : null,
            'email' => $payload['email'] !== '' ? $payload['email'] : null,
            'photo_path' => $photoPath,
            'status' => $payload['status'],
            'expires_at' => $payload['expires_at'] !== '' ? $payload['expires_at'] : null,
            'sort_order' => $payload['sort_order'],
            'show_in_leadership' => $payload['show_in_leadership'],
            'show_in_committee' => $payload['show_in_committee'],
            'leadership_sort_order' => $payload['leadership_sort_order'],
            'committee_sort_order' => $payload['committee_sort_order'],
            'profile_message' => $payload['profile_message'] !== '' ? $payload['profile_message'] : null,
        ]);

        return [
            'data' => [
                'success' => true,
                'message' => 'Member created',
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
                'data' => ['success' => false, 'message' => 'Invalid member id'],
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

        $findStmt = $pdo->prepare('SELECT photo_path FROM members WHERE id = :id LIMIT 1');
        $findStmt->execute(['id' => $id]);
        $existing = $findStmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            return [
                'data' => ['success' => false, 'message' => 'Member not found'],
                'status' => 404,
            ];
        }

        if ($this->memberCodeExists($pdo, $payload['member_code'], $id)) {
            return [
                'data' => ['success' => false, 'message' => 'Member code already exists'],
                'status' => 422,
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

        $stmt = $pdo->prepare(
            'UPDATE members
             SET member_code = :member_code,
                 name = :name,
                 media_house = :media_house,
                 designation = :designation,
                 phone = :phone,
                 email = :email,
                 photo_path = :photo_path,
                 status = :status,
                 expires_at = :expires_at,
                 sort_order = :sort_order,
                 show_in_leadership = :show_in_leadership,
                 show_in_committee = :show_in_committee,
                 leadership_sort_order = :leadership_sort_order,
                 committee_sort_order = :committee_sort_order,
                 profile_message = :profile_message
             WHERE id = :id'
        );
        $stmt->execute([
            'id' => $id,
            'member_code' => $payload['member_code'],
            'name' => $payload['name'],
            'media_house' => $payload['media_house'],
            'designation' => $payload['designation'],
            'phone' => $payload['phone'] !== '' ? $payload['phone'] : null,
            'email' => $payload['email'] !== '' ? $payload['email'] : null,
            'photo_path' => $photoPath,
            'status' => $payload['status'],
            'expires_at' => $payload['expires_at'] !== '' ? $payload['expires_at'] : null,
            'sort_order' => $payload['sort_order'],
            'show_in_leadership' => $payload['show_in_leadership'],
            'show_in_committee' => $payload['show_in_committee'],
            'leadership_sort_order' => $payload['leadership_sort_order'],
            'committee_sort_order' => $payload['committee_sort_order'],
            'profile_message' => $payload['profile_message'] !== '' ? $payload['profile_message'] : null,
        ]);

        return [
            'data' => [
                'success' => true,
                'message' => 'Member updated',
            ],
            'status' => 200,
        ];
    }

    public function destroy(Request $request, array $params): array
    {
        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            return [
                'data' => ['success' => false, 'message' => 'Invalid member id'],
                'status' => 422,
            ];
        }

        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $findStmt = $pdo->prepare('SELECT photo_path FROM members WHERE id = :id LIMIT 1');
        $findStmt->execute(['id' => $id]);
        $existing = $findStmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            return [
                'data' => ['success' => false, 'message' => 'Member not found'],
                'status' => 404,
            ];
        }

        $deleteStmt = $pdo->prepare('DELETE FROM members WHERE id = :id');
        $deleteStmt->execute(['id' => $id]);
        if (!empty($existing['photo_path'])) {
            $this->deleteFileIfExists((string) $existing['photo_path']);
        }

        return [
            'data' => [
                'success' => true,
                'message' => 'Member deleted',
            ],
            'status' => 200,
        ];
    }

    private function mapPublicItem(array $item): array
    {
        return [
            'id' => (int) $item['id'],
            'member_code' => (string) $item['member_code'],
            'name' => (string) $item['name'],
            'media_house' => (string) $item['media_house'],
            'designation' => (string) $item['designation'],
            'phone' => (string) ($item['phone'] ?? ''),
            'email' => (string) ($item['email'] ?? ''),
            'photoUrl' => !empty($item['photo_path']) ? $this->toPublicUrl((string) $item['photo_path']) : null,
            'status' => (string) $item['status'],
            'expires_at' => $item['expires_at'] !== null ? (string) $item['expires_at'] : null,
            'sort_order' => (int) ($item['sort_order'] ?? 0),
        ];
    }

    private function mapSpotlightItem(array $item, bool $withPhotoTag): array
    {
        $mapped = [
            'id' => (int) $item['id'],
            'name' => (string) $item['name'],
            'role' => (string) $item['role'],
            'message' => (string) ($item['message'] ?? ''),
            'phone' => (string) ($item['phone'] ?? ''),
            'email' => (string) ($item['email'] ?? ''),
            'social' => '',
            'media' => (string) ($item['media'] ?? ''),
            'photoUrl' => !empty($item['photo_path']) ? $this->toPublicUrl((string) $item['photo_path']) : null,
            'sort_order' => (int) ($item['sort_order'] ?? 0),
        ];

        if ($withPhotoTag) {
            $mapped['photoTag'] = $this->initialsFromName((string) ($item['name'] ?? ''));
        }

        return $mapped;
    }

    private function initialsFromName(string $name): string
    {
        $parts = preg_split('/\s+/u', trim($name)) ?: [];
        $initials = '';
        foreach ($parts as $part) {
            if ($part === '') {
                continue;
            }
            $initials .= mb_strtoupper(mb_substr($part, 0, 1));
            if (mb_strlen($initials) >= 2) {
                break;
            }
        }

        return $initials !== '' ? $initials : 'CPC';
    }

    /** @return array{member_code: string, name: string, media_house: string, designation: string, phone: string, email: string, status: string, expires_at: string, sort_order: int, show_in_leadership: int, show_in_committee: int, leadership_sort_order: int, committee_sort_order: int, profile_message: string} */
    private function readFormPayload(): array
    {
        $status = strtolower(trim((string) ($_POST['status'] ?? 'active')));
        if (!in_array($status, ['active', 'inactive', 'expired'], true)) {
            $status = 'active';
        }

        $truthy = static fn($value): bool => in_array(strtolower(trim((string) $value)), ['1', 'true', 'on', 'yes'], true);

        return [
            'member_code' => trim((string) ($_POST['member_code'] ?? '')),
            'name' => trim((string) ($_POST['name'] ?? '')),
            'media_house' => trim((string) ($_POST['media_house'] ?? '')),
            'designation' => trim((string) ($_POST['designation'] ?? '')),
            'phone' => trim((string) ($_POST['phone'] ?? '')),
            'email' => trim((string) ($_POST['email'] ?? '')),
            'status' => $status,
            'expires_at' => trim((string) ($_POST['expires_at'] ?? '')),
            'sort_order' => (int) ($_POST['sort_order'] ?? 0),
            'show_in_leadership' => $truthy($_POST['show_in_leadership'] ?? '0') ? 1 : 0,
            'show_in_committee' => $truthy($_POST['show_in_committee'] ?? '0') ? 1 : 0,
            'leadership_sort_order' => (int) ($_POST['leadership_sort_order'] ?? 0),
            'committee_sort_order' => (int) ($_POST['committee_sort_order'] ?? 0),
            'profile_message' => trim((string) ($_POST['profile_message'] ?? '')),
        ];
    }

    private function validatePayload(array $payload, bool $_isCreate): ?array
    {
        if ($payload['member_code'] === '' || $payload['name'] === '' || $payload['media_house'] === '' || $payload['designation'] === '') {
            return [
                'data' => ['success' => false, 'message' => 'member_code, name, media_house and designation are required'],
                'status' => 422,
            ];
        }

        if (
            strlen($payload['member_code']) > 50
            || strlen($payload['name']) > 150
            || strlen($payload['media_house']) > 180
            || strlen($payload['designation']) > 120
            || strlen($payload['phone']) > 30
            || strlen($payload['email']) > 190
        ) {
            return [
                'data' => ['success' => false, 'message' => 'Input too long'],
                'status' => 422,
            ];
        }

        if ($payload['expires_at'] !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $payload['expires_at'])) {
            return [
                'data' => ['success' => false, 'message' => 'expires_at must be YYYY-MM-DD'],
                'status' => 422,
            ];
        }

        return null;
    }

    private function memberCodeExists(PDO $pdo, string $code, ?int $excludeId = null): bool
    {
        if ($excludeId !== null) {
            $stmt = $pdo->prepare('SELECT id FROM members WHERE member_code = :code AND id <> :id LIMIT 1');
            $stmt->execute(['code' => $code, 'id' => $excludeId]);
        } else {
            $stmt = $pdo->prepare('SELECT id FROM members WHERE member_code = :code LIMIT 1');
            $stmt->execute(['code' => $code]);
        }

        return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function ensureSchema(PDO $pdo): void
    {
        $pdo->exec(
            'CREATE TABLE IF NOT EXISTS members (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                member_code VARCHAR(50) NOT NULL UNIQUE,
                name VARCHAR(150) NOT NULL,
                media_house VARCHAR(180) NOT NULL,
                designation VARCHAR(120) NOT NULL,
                phone VARCHAR(30) NULL,
                email VARCHAR(190) NULL,
                photo_path VARCHAR(500) NULL,
                status ENUM(\'active\', \'inactive\', \'expired\') NOT NULL DEFAULT \'active\',
                expires_at DATE NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_members_name (name),
                INDEX idx_members_code (member_code)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
        );

        $columns = $pdo->query('SHOW COLUMNS FROM members')->fetchAll(PDO::FETCH_COLUMN);
        $columns = array_map('strval', $columns ?: []);

        if (!in_array('email', $columns, true)) {
            $pdo->exec('ALTER TABLE members ADD COLUMN email VARCHAR(190) NULL AFTER phone');
        }
        if (!in_array('photo_path', $columns, true)) {
            $pdo->exec('ALTER TABLE members ADD COLUMN photo_path VARCHAR(500) NULL AFTER email');
        }
        if (!in_array('sort_order', $columns, true)) {
            $pdo->exec('ALTER TABLE members ADD COLUMN sort_order INT NOT NULL DEFAULT 0 AFTER expires_at');
        }
        if (!in_array('show_in_leadership', $columns, true)) {
            $pdo->exec('ALTER TABLE members ADD COLUMN show_in_leadership TINYINT(1) NOT NULL DEFAULT 0 AFTER sort_order');
        }
        if (!in_array('show_in_committee', $columns, true)) {
            $pdo->exec('ALTER TABLE members ADD COLUMN show_in_committee TINYINT(1) NOT NULL DEFAULT 0 AFTER show_in_leadership');
        }
        if (!in_array('leadership_sort_order', $columns, true)) {
            $pdo->exec('ALTER TABLE members ADD COLUMN leadership_sort_order INT NOT NULL DEFAULT 0 AFTER show_in_committee');
        }
        if (!in_array('committee_sort_order', $columns, true)) {
            $pdo->exec('ALTER TABLE members ADD COLUMN committee_sort_order INT NOT NULL DEFAULT 0 AFTER leadership_sort_order');
        }
        if (!in_array('profile_message', $columns, true)) {
            $pdo->exec('ALTER TABLE members ADD COLUMN profile_message TEXT NULL AFTER committee_sort_order');
        }
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

        $uploadDir = PUBLIC_PATH . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'members';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
            return ['success' => false, 'message' => 'Cannot create upload directory'];
        }

        $fileName = 'member-' . bin2hex(random_bytes(12)) . '.' . $extension;
        $destination = $uploadDir . DIRECTORY_SEPARATOR . $fileName;

        if (!move_uploaded_file($tmpName, $destination)) {
            return ['success' => false, 'message' => 'Failed to move uploaded photo'];
        }

        return [
            'success' => true,
            'path' => '/uploads/members/' . $fileName,
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
