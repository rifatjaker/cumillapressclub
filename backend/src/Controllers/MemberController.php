<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Core\Request;
use PDO;

final class MemberController
{
    public function search(Request $request): array
    {
        $q = trim((string) ($request->query['q'] ?? ''));

        if ($q === '') {
            return [
                'data' => ['success' => false, 'message' => 'Query parameter q is required'],
                'status' => 422,
            ];
        }

        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'SELECT id, member_code, name, media_house, designation, phone, status
             FROM members
             WHERE name LIKE :query OR member_code LIKE :query
             ORDER BY name ASC
             LIMIT 20'
        );
        $stmt->execute(['query' => '%' . $q . '%']);

        return [
            'data' => [
                'success' => true,
                'data' => $stmt->fetchAll(PDO::FETCH_ASSOC),
            ],
            'status' => 200,
        ];
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
        $stmt = $pdo->prepare(
            'SELECT id, member_code, name, media_house, designation, phone, status, expires_at
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
                'data' => $member,
            ],
            'status' => 200,
        ];
    }
}
