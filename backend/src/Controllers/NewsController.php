<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Core\Request;
use PDO;

final class NewsController
{
    public function index(Request $request): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->query(
            'SELECT id, title, category, summary, published_at
             FROM news
             ORDER BY published_at DESC
             LIMIT 20'
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
        $title = trim((string) ($request->body['title'] ?? ''));
        $category = trim((string) ($request->body['category'] ?? 'general'));
        $summary = trim((string) ($request->body['summary'] ?? ''));

        if ($title === '' || $summary === '') {
            return [
                'data' => ['success' => false, 'message' => 'Title and summary are required'],
                'status' => 422,
            ];
        }

        $pdo = Database::connection();
        $stmt = $pdo->prepare('INSERT INTO news (title, category, summary, published_at) VALUES (:title, :category, :summary, NOW())');
        $stmt->execute([
            'title' => $title,
            'category' => $category,
            'summary' => $summary,
        ]);

        return [
            'data' => [
                'success' => true,
                'message' => 'News created',
                'data' => ['id' => (int) $pdo->lastInsertId()],
            ],
            'status' => 201,
        ];
    }
}
