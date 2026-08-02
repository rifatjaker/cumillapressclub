<?php

declare(strict_types=1);

namespace App\Core;

use RuntimeException;

final class AuthMiddleware
{
    public static function handle(Request $request): bool
    {
        $token = $request->bearerToken();

        if ($token === null) {
            Response::json([
                'success' => false,
                'message' => 'Missing bearer token',
            ], 401);
            return false;
        }

        $secret = getenv('JWT_SECRET') ?: 'change_this_secret';

        try {
            $payload = JWT::decode($token, $secret);
        } catch (RuntimeException $e) {
            Response::json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 401);
            return false;
        }

        $request->setUser([
            'id' => (int) ($payload['sub'] ?? 0),
            'name' => (string) ($payload['name'] ?? ''),
            'role' => (string) ($payload['role'] ?? 'member'),
        ]);

        return true;
    }
}
