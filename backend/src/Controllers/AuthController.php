<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Core\JWT;
use App\Core\Request;
use DateTimeImmutable;
use PDO;

final class AuthController
{
    public function login(Request $request): array
    {
        $email = trim((string) ($request->body['email'] ?? ''));
        $password = (string) ($request->body['password'] ?? '');

        if ($email === '' || $password === '') {
            return [
                'data' => ['success' => false, 'message' => 'Email and password are required'],
                'status' => 422,
            ];
        }

        $pdo = Database::connection();
        $stmt = $pdo->prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            return [
                'data' => ['success' => false, 'message' => 'Invalid credentials'],
                'status' => 401,
            ];
        }

        $accessToken = $this->createAccessToken($user);
        $refreshToken = $this->issueRefreshToken($pdo, (int) $user['id']);

        return [
            'data' => [
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'access_token' => $accessToken,
                    'refresh_token' => $refreshToken,
                    'token_type' => 'Bearer',
                    'expires_in' => (int) (getenv('JWT_ACCESS_TTL') ?: 900),
                    'user' => [
                        'id' => (int) $user['id'],
                        'name' => (string) $user['name'],
                        'email' => (string) $user['email'],
                        'role' => (string) $user['role'],
                    ],
                ],
            ],
            'status' => 200,
        ];
    }

    public function refresh(Request $request): array
    {
        $refreshToken = trim((string) ($request->body['refresh_token'] ?? ''));

        if ($refreshToken === '') {
            return [
                'data' => ['success' => false, 'message' => 'Refresh token is required'],
                'status' => 422,
            ];
        }

        $pdo = Database::connection();
        $tokenHash = hash('sha256', $refreshToken);

        $stmt = $pdo->prepare('SELECT id, user_id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = :token_hash LIMIT 1');
        $stmt->execute(['token_hash' => $tokenHash]);
        $tokenRow = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$tokenRow) {
            return [
                'data' => ['success' => false, 'message' => 'Invalid refresh token'],
                'status' => 401,
            ];
        }

        if ($tokenRow['revoked_at'] !== null || new DateTimeImmutable((string) $tokenRow['expires_at']) < new DateTimeImmutable('now')) {
            return [
                'data' => ['success' => false, 'message' => 'Refresh token expired or revoked'],
                'status' => 401,
            ];
        }

        $userStmt = $pdo->prepare('SELECT id, name, email, role FROM users WHERE id = :id LIMIT 1');
        $userStmt->execute(['id' => (int) $tokenRow['user_id']]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return [
                'data' => ['success' => false, 'message' => 'User not found'],
                'status' => 404,
            ];
        }

        $revokeStmt = $pdo->prepare('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = :id');
        $revokeStmt->execute(['id' => (int) $tokenRow['id']]);

        $newAccessToken = $this->createAccessToken($user);
        $newRefreshToken = $this->issueRefreshToken($pdo, (int) $user['id']);

        return [
            'data' => [
                'success' => true,
                'message' => 'Token refreshed',
                'data' => [
                    'access_token' => $newAccessToken,
                    'refresh_token' => $newRefreshToken,
                    'token_type' => 'Bearer',
                    'expires_in' => (int) (getenv('JWT_ACCESS_TTL') ?: 900),
                ],
            ],
            'status' => 200,
        ];
    }

    public function me(Request $request): array
    {
        return [
            'data' => [
                'success' => true,
                'data' => $request->user(),
            ],
            'status' => 200,
        ];
    }

    public function logout(Request $request): array
    {
        $refreshToken = trim((string) ($request->body['refresh_token'] ?? ''));

        if ($refreshToken !== '') {
            $pdo = Database::connection();
            $tokenHash = hash('sha256', $refreshToken);
            $stmt = $pdo->prepare('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = :token_hash');
            $stmt->execute(['token_hash' => $tokenHash]);
        }

        return [
            'data' => [
                'success' => true,
                'message' => 'Logged out',
            ],
            'status' => 200,
        ];
    }

    private function createAccessToken(array $user): string
    {
        $secret = getenv('JWT_SECRET') ?: 'change_this_secret';
        $ttl = (int) (getenv('JWT_ACCESS_TTL') ?: 900);

        return JWT::encode([
            'sub' => (int) $user['id'],
            'name' => (string) $user['name'],
            'role' => (string) $user['role'],
            'email' => (string) $user['email'],
        ], $secret, $ttl);
    }

    private function issueRefreshToken(PDO $pdo, int $userId): string
    {
        $refreshToken = bin2hex(random_bytes(48));
        $tokenHash = hash('sha256', $refreshToken);
        $ttlDays = (int) (getenv('JWT_REFRESH_TTL_DAYS') ?: 14);

        $stmt = $pdo->prepare('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (:user_id, :token_hash, DATE_ADD(NOW(), INTERVAL :ttl_days DAY))');
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':token_hash', $tokenHash, PDO::PARAM_STR);
        $stmt->bindValue(':ttl_days', $ttlDays, PDO::PARAM_INT);
        $stmt->execute();

        return $refreshToken;
    }
}
