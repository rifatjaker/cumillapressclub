<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Core\Request;
use PDO;

final class SliderController
{
    public function publicIndex(Request $request): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->query(
            'SELECT id, title, slide_date, image_path, sort_order
             FROM slider_items
             WHERE is_active = 1
             ORDER BY sort_order ASC, id DESC'
        );

        $items = array_map(fn(array $item): array => [
            'id' => (int) $item['id'],
            'title' => (string) $item['title'],
            'date' => (string) $item['slide_date'],
            'imageUrl' => $this->toPublicUrl((string) $item['image_path']),
            'sort_order' => (int) $item['sort_order'],
        ], $stmt->fetchAll(PDO::FETCH_ASSOC));

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
        $stmt = $pdo->query(
            'SELECT id, title, slide_date, image_path, sort_order, is_active, created_at, updated_at
             FROM slider_items
             ORDER BY sort_order ASC, id DESC'
        );

        $items = array_map(fn(array $item): array => [
            'id' => (int) $item['id'],
            'title' => (string) $item['title'],
            'slide_date' => (string) $item['slide_date'],
            'image_path' => (string) $item['image_path'],
            'image_url' => $this->toPublicUrl((string) $item['image_path']),
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
        $title = trim((string) ($_POST['title'] ?? ''));
        $slideDate = trim((string) ($_POST['slide_date'] ?? ''));
        $sortOrder = (int) ($_POST['sort_order'] ?? 0);
        $isActive = (int) ((bool) ($_POST['is_active'] ?? true));

        if ($title === '' || $slideDate === '') {
            return [
                'data' => ['success' => false, 'message' => 'title and slide_date are required'],
                'status' => 422,
            ];
        }

        if (!isset($_FILES['image']) || !is_array($_FILES['image'])) {
            return [
                'data' => ['success' => false, 'message' => 'Slider image is required'],
                'status' => 422,
            ];
        }

        $upload = $this->saveUploadedFile($_FILES['image']);
        if (!$upload['success']) {
            return [
                'data' => ['success' => false, 'message' => $upload['message']],
                'status' => 422,
            ];
        }

        $adminId = (int) (($request->user()['id'] ?? 0));

        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'INSERT INTO slider_items (title, slide_date, image_path, sort_order, is_active, created_by, updated_by)
             VALUES (:title, :slide_date, :image_path, :sort_order, :is_active, :created_by, :updated_by)'
        );
        $stmt->execute([
            'title' => $title,
            'slide_date' => $slideDate,
            'image_path' => $upload['path'],
            'sort_order' => $sortOrder,
            'is_active' => $isActive,
            'created_by' => $adminId > 0 ? $adminId : null,
            'updated_by' => $adminId > 0 ? $adminId : null,
        ]);

        return [
            'data' => [
                'success' => true,
                'message' => 'Slider item created',
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
                'data' => ['success' => false, 'message' => 'Invalid slider id'],
                'status' => 422,
            ];
        }

        $title = trim((string) ($_POST['title'] ?? ''));
        $slideDate = trim((string) ($_POST['slide_date'] ?? ''));
        $sortOrder = (int) ($_POST['sort_order'] ?? 0);
        $isActive = (int) ((bool) ($_POST['is_active'] ?? true));

        if ($title === '' || $slideDate === '') {
            return [
                'data' => ['success' => false, 'message' => 'title and slide_date are required'],
                'status' => 422,
            ];
        }

        $pdo = Database::connection();
        $findStmt = $pdo->prepare('SELECT image_path FROM slider_items WHERE id = :id LIMIT 1');
        $findStmt->execute(['id' => $id]);
        $existing = $findStmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            return [
                'data' => ['success' => false, 'message' => 'Slider item not found'],
                'status' => 404,
            ];
        }

        $imagePath = (string) $existing['image_path'];
        if (isset($_FILES['image']) && is_array($_FILES['image']) && (int) ($_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
            $upload = $this->saveUploadedFile($_FILES['image']);
            if (!$upload['success']) {
                return [
                    'data' => ['success' => false, 'message' => $upload['message']],
                    'status' => 422,
                ];
            }

            $this->deleteFileIfExists($imagePath);
            $imagePath = (string) $upload['path'];
        }

        $adminId = (int) (($request->user()['id'] ?? 0));

        $stmt = $pdo->prepare(
            'UPDATE slider_items
             SET title = :title,
                 slide_date = :slide_date,
                 image_path = :image_path,
                 sort_order = :sort_order,
                 is_active = :is_active,
                 updated_by = :updated_by
             WHERE id = :id'
        );
        $stmt->execute([
            'id' => $id,
            'title' => $title,
            'slide_date' => $slideDate,
            'image_path' => $imagePath,
            'sort_order' => $sortOrder,
            'is_active' => $isActive,
            'updated_by' => $adminId > 0 ? $adminId : null,
        ]);

        return [
            'data' => [
                'success' => true,
                'message' => 'Slider item updated',
            ],
            'status' => 200,
        ];
    }

    public function destroy(Request $request, array $params): array
    {
        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            return [
                'data' => ['success' => false, 'message' => 'Invalid slider id'],
                'status' => 422,
            ];
        }

        $pdo = Database::connection();
        $findStmt = $pdo->prepare('SELECT image_path FROM slider_items WHERE id = :id LIMIT 1');
        $findStmt->execute(['id' => $id]);
        $existing = $findStmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            return [
                'data' => ['success' => false, 'message' => 'Slider item not found'],
                'status' => 404,
            ];
        }

        $deleteStmt = $pdo->prepare('DELETE FROM slider_items WHERE id = :id');
        $deleteStmt->execute(['id' => $id]);
+        $this->deleteFileIfExists((string) $existing['image_path']);

        return [
            'data' => [
                'success' => true,
                'message' => 'Slider item deleted',
            ],
            'status' => 200,
        ];
    }

    private function saveUploadedFile(array $file): array
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

        $uploadDir = BASE_PATH . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'sliders';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
            return ['success' => false, 'message' => 'Cannot create upload directory'];
        }

        $fileName = 'slide-' . bin2hex(random_bytes(12)) . '.' . $extension;
        $destination = $uploadDir . DIRECTORY_SEPARATOR . $fileName;

        if (!move_uploaded_file($tmpName, $destination)) {
            return ['success' => false, 'message' => 'Failed to move uploaded file'];
        }

        return [
            'success' => true,
            'path' => '/uploads/sliders/' . $fileName,
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
