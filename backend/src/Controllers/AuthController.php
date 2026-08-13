<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Core\JWT;
use App\Core\Request;
use DateTimeImmutable;
use DateTimeZone;
use PDO;
use Throwable;

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

        $passwordHash = trim((string) ($user['password_hash'] ?? ''));
        $passwordOk = $user && $passwordHash !== '' && password_verify($password, $passwordHash);

        if (!$passwordOk) {
            return [
                'data' => ['success' => false, 'message' => 'Invalid credentials'],
                'status' => 401,
            ];
        }

        $ip = $request->clientIp();
        $userAgent = $request->userAgent();
        $this->recordLogin($pdo, $user, $ip, $userAgent);

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
        $authUser = $request->user();
        $userId = (int) ($authUser['id'] ?? 0);

        if ($userId <= 0) {
            return [
                'data' => ['success' => false, 'message' => 'Unauthorized'],
                'status' => 401,
            ];
        }

        $pdo = Database::connection();
        $user = null;

        try {
            $stmt = $pdo->prepare(
                'SELECT id, name, email, role,
                        last_login_at, last_login_ip, last_login_user_agent,
                        previous_login_at, previous_login_ip, previous_login_user_agent
                 FROM users WHERE id = :id LIMIT 1'
            );
            $stmt->execute(['id' => $userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Throwable) {
            $stmt = $pdo->prepare('SELECT id, name, email, role FROM users WHERE id = :id LIMIT 1');
            $stmt->execute(['id' => $userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        if (!$user) {
            return [
                'data' => ['success' => false, 'message' => 'User not found'],
                'status' => 404,
            ];
        }

        $logs = [];
        try {
            $logStmt = $pdo->prepare(
                'SELECT id, ip_address, user_agent, logged_in_at
                 FROM admin_login_logs
                 WHERE user_id = :user_id
                 ORDER BY logged_in_at DESC, id DESC
                 LIMIT 10'
            );
            $logStmt->execute(['user_id' => $userId]);
            $rows = $logStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
            foreach ($rows as $row) {
                $logs[] = $this->formatLoginSnapshot(
                    $row['logged_in_at'] ?? null,
                    $row['ip_address'] ?? null,
                    $row['user_agent'] ?? null
                ) + ['id' => (int) ($row['id'] ?? 0)];
            }
        } catch (Throwable) {
            $logs = [];
        }

        return [
            'data' => [
                'success' => true,
                'data' => [
                    'id' => (int) $user['id'],
                    'name' => (string) $user['name'],
                    'email' => (string) $user['email'],
                    'role' => (string) $user['role'],
                    'status' => 'logged_in',
                    'status_label' => 'লগইন আছে',
                    'current_request_ip' => $request->clientIp(),
                    'current_login' => $this->formatLoginSnapshot(
                        $user['last_login_at'] ?? null,
                        $user['last_login_ip'] ?? null,
                        $user['last_login_user_agent'] ?? null
                    ),
                    'previous_login' => $this->formatLoginSnapshot(
                        $user['previous_login_at'] ?? null,
                        $user['previous_login_ip'] ?? null,
                        $user['previous_login_user_agent'] ?? null
                    ),
                    'recent_logins' => $logs,
                ],
            ],
            'status' => 200,
        ];
    }

    public function changePassword(Request $request): array
    {
        $authUser = $request->user();
        $userId = (int) ($authUser['id'] ?? 0);

        if ($userId <= 0) {
            return [
                'data' => ['success' => false, 'message' => 'Unauthorized'],
                'status' => 401,
            ];
        }

        $currentPassword = (string) ($request->body['current_password'] ?? '');
        $newPassword = (string) ($request->body['new_password'] ?? '');
        $confirmPassword = (string) ($request->body['new_password_confirmation'] ?? $request->body['confirm_password'] ?? '');

        if ($currentPassword === '' || $newPassword === '' || $confirmPassword === '') {
            return [
                'data' => ['success' => false, 'message' => 'সব পাসওয়ার্ড ফিল্ড পূরণ করুন'],
                'status' => 422,
            ];
        }

        if (strlen($newPassword) < 8) {
            return [
                'data' => ['success' => false, 'message' => 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে'],
                'status' => 422,
            ];
        }

        if ($newPassword !== $confirmPassword) {
            return [
                'data' => ['success' => false, 'message' => 'নতুন পাসওয়ার্ড ও নিশ্চিতকরণ মিলছে না'],
                'status' => 422,
            ];
        }

        if ($currentPassword === $newPassword) {
            return [
                'data' => ['success' => false, 'message' => 'নতুন পাসওয়ার্ড পুরোনো পাসওয়ার্ডের থেকে আলাদা হতে হবে'],
                'status' => 422,
            ];
        }

        $pdo = Database::connection();
        $stmt = $pdo->prepare('SELECT id, password_hash FROM users WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return [
                'data' => ['success' => false, 'message' => 'User not found'],
                'status' => 404,
            ];
        }

        $hash = trim((string) ($user['password_hash'] ?? ''));
        if ($hash === '' || !password_verify($currentPassword, $hash)) {
            return [
                'data' => ['success' => false, 'message' => 'বর্তমান পাসওয়ার্ড সঠিক নয়'],
                'status' => 422,
            ];
        }

        $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
        $update = $pdo->prepare('UPDATE users SET password_hash = :password_hash WHERE id = :id');
        $update->execute([
            'password_hash' => $newHash,
            'id' => $userId,
        ]);

        return [
            'data' => [
                'success' => true,
                'message' => 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে',
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

    private function recordLogin(PDO $pdo, array $user, string $ip, string $userAgent): void
    {
        $userId = (int) $user['id'];

        try {
            $update = $pdo->prepare(
                'UPDATE users SET
                    previous_login_at = last_login_at,
                    previous_login_ip = last_login_ip,
                    previous_login_user_agent = last_login_user_agent,
                    last_login_at = NOW(),
                    last_login_ip = :ip,
                    last_login_user_agent = :user_agent
                 WHERE id = :id'
            );
            $update->execute([
                'ip' => $ip,
                'user_agent' => $userAgent !== '' ? $userAgent : null,
                'id' => $userId,
            ]);

            $log = $pdo->prepare(
                'INSERT INTO admin_login_logs (user_id, ip_address, user_agent, logged_in_at)
                 VALUES (:user_id, :ip_address, :user_agent, NOW())'
            );
            $log->execute([
                'user_id' => $userId,
                'ip_address' => $ip,
                'user_agent' => $userAgent !== '' ? $userAgent : null,
            ]);
        } catch (Throwable) {
            // Older DBs without migration should still allow login.
        }
    }

    private function formatLoginSnapshot(?string $at, ?string $ip, ?string $userAgent): ?array
    {
        if ($at === null || trim($at) === '') {
            return null;
        }

        try {
            $dt = new DateTimeImmutable($at, new DateTimeZone('Asia/Dhaka'));
        } catch (Throwable) {
            try {
                $dt = new DateTimeImmutable($at);
                $dt = $dt->setTimezone(new DateTimeZone('Asia/Dhaka'));
            } catch (Throwable) {
                return [
                    'at' => $at,
                    'date' => $at,
                    'time' => '',
                    'ip' => $ip ?: 'unknown',
                    'user_agent' => $userAgent ?: '',
                ];
            }
        }

        return [
            'at' => $dt->format('Y-m-d H:i:s'),
            'date' => $dt->format('Y-m-d'),
            'time' => $dt->format('h:i:s A'),
            'date_bn' => $dt->format('d/m/Y'),
            'ip' => $ip ?: 'unknown',
            'user_agent' => $userAgent ?: '',
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
