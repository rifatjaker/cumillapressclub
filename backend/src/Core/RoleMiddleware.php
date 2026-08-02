<?php

declare(strict_types=1);

namespace App\Core;

final class RoleMiddleware
{
    public static function require(string $role): callable
    {
        return static function (Request $request) use ($role): bool {
            $user = $request->user();

            if ($user === null || ($user['role'] ?? '') !== $role) {
                Response::json([
                    'success' => false,
                    'message' => 'Forbidden',
                ], 403);
                return false;
            }

            return true;
        };
    }
}
