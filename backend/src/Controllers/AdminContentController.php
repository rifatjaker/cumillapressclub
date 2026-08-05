<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Core\Request;
use PDO;

final class AdminContentController
{
    public function publicBySection(Request $request, array $params): array
    {
        $sectionKey = trim((string) ($params['sectionKey'] ?? ''));

        if ($sectionKey === '') {
            return [
                'data' => ['success' => false, 'message' => 'Section key is required'],
                'status' => 422,
            ];
        }

        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'SELECT id, section_key, title, body, sort_order, is_active, created_at, updated_at
             FROM dynamic_contents
             WHERE section_key = :section_key AND is_active = 1
             ORDER BY sort_order ASC, id DESC'
        );
        $stmt->execute(['section_key' => $sectionKey]);

        return [
            'data' => [
                'success' => true,
                'data' => $stmt->fetchAll(PDO::FETCH_ASSOC),
            ],
            'status' => 200,
        ];
    }

    public function index(Request $request): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->query(
            'SELECT id, section_key, title, body, sort_order, is_active, created_by, updated_by, created_at, updated_at
             FROM dynamic_contents
             ORDER BY sort_order ASC, id DESC'
        );

        return [
            'data' => [
                'success' => true,
                'data' => $stmt->fetchAll(PDO::FETCH_ASSOC),
            ],
            'status' => 200,
        ];
    }

    public function store(Request $request): array
    {
        $sectionKey = trim((string) ($request->body['section_key'] ?? ''));
        $title = trim((string) ($request->body['title'] ?? ''));
        $body = trim((string) ($request->body['body'] ?? ''));
        $sortOrder = (int) ($request->body['sort_order'] ?? 0);
        $isActive = (int) ((bool) ($request->body['is_active'] ?? true));

        $validation = $this->validateInput($sectionKey, $title, $body);
        if ($validation !== null) {
            return $validation;
        }

        $adminId = (int) (($request->user()['id'] ?? 0));

        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'INSERT INTO dynamic_contents (section_key, title, body, sort_order, is_active, created_by, updated_by)
             VALUES (:section_key, :title, :body, :sort_order, :is_active, :created_by, :updated_by)'
        );
        $stmt->execute([
            'section_key' => $sectionKey,
            'title' => $title,
            'body' => $body,
            'sort_order' => $sortOrder,
            'is_active' => $isActive,
            'created_by' => $adminId > 0 ? $adminId : null,
            'updated_by' => $adminId > 0 ? $adminId : null,
        ]);

        return [
            'data' => [
                'success' => true,
                'message' => 'Content created',
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
                'data' => ['success' => false, 'message' => 'Invalid content id'],
                'status' => 422,
            ];
        }

        $sectionKey = trim((string) ($request->body['section_key'] ?? ''));
        $title = trim((string) ($request->body['title'] ?? ''));
        $body = trim((string) ($request->body['body'] ?? ''));
        $sortOrder = (int) ($request->body['sort_order'] ?? 0);
        $isActive = (int) ((bool) ($request->body['is_active'] ?? true));

        $validation = $this->validateInput($sectionKey, $title, $body);
        if ($validation !== null) {
            return $validation;
        }

        $adminId = (int) (($request->user()['id'] ?? 0));

        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'UPDATE dynamic_contents
             SET section_key = :section_key,
                 title = :title,
                 body = :body,
                 sort_order = :sort_order,
                 is_active = :is_active,
                 updated_by = :updated_by
             WHERE id = :id'
        );
        $stmt->execute([
            'id' => $id,
            'section_key' => $sectionKey,
            'title' => $title,
            'body' => $body,
            'sort_order' => $sortOrder,
            'is_active' => $isActive,
            'updated_by' => $adminId > 0 ? $adminId : null,
        ]);

        if ($stmt->rowCount() === 0) {
            return [
                'data' => ['success' => false, 'message' => 'Content not found or unchanged'],
                'status' => 404,
            ];
        }

        return [
            'data' => [
                'success' => true,
                'message' => 'Content updated',
            ],
            'status' => 200,
        ];
    }

    public function destroy(Request $request, array $params): array
    {
        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            return [
                'data' => ['success' => false, 'message' => 'Invalid content id'],
                'status' => 422,
            ];
        }

        $pdo = Database::connection();
        $stmt = $pdo->prepare('DELETE FROM dynamic_contents WHERE id = :id');
        $stmt->execute(['id' => $id]);

        if ($stmt->rowCount() === 0) {
            return [
                'data' => ['success' => false, 'message' => 'Content not found'],
                'status' => 404,
            ];
        }

        return [
            'data' => [
                'success' => true,
                'message' => 'Content deleted',
            ],
            'status' => 200,
        ];
    }

    private function validateInput(string $sectionKey, string $title, string $body): ?array
    {
        if ($sectionKey === '' || $title === '' || $body === '') {
            return [
                'data' => ['success' => false, 'message' => 'section_key, title and body are required'],
                'status' => 422,
            ];
        }

        if (strlen($sectionKey) > 120 || strlen($title) > 255 || strlen($body) > 6000) {
            return [
                'data' => ['success' => false, 'message' => 'Input too long'],
                'status' => 422,
            ];
        }

        return null;
    }
}