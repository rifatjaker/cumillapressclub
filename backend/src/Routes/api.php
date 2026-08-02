<?php

declare(strict_types=1);

use App\Controllers\AuthController;
use App\Controllers\MemberController;
use App\Controllers\NewsController;
use App\Core\AuthMiddleware;
use App\Core\RoleMiddleware;

$authController = new AuthController();
$memberController = new MemberController();
$newsController = new NewsController();

$auth = static fn($request): bool => AuthMiddleware::handle($request);
$adminOnly = RoleMiddleware::require('admin');

$router->post('/api/v1/auth/login', [$authController, 'login']);
$router->post('/api/v1/auth/refresh', [$authController, 'refresh']);
$router->post('/api/v1/auth/logout', [$authController, 'logout'], [$auth]);
$router->get('/api/v1/auth/me', [$authController, 'me'], [$auth]);

$router->get('/api/v1/news', [$newsController, 'index']);
$router->post('/api/v1/admin/news', [$newsController, 'store'], [$auth, $adminOnly]);

$router->get('/api/v1/members/search', [$memberController, 'search'], [$auth]);
$router->get('/api/v1/members/verify/{code}', [$memberController, 'verify']);

$router->get('/api/v1/health', static function (): array {
    return [
        'data' => [
            'success' => true,
            'message' => 'API is running',
            'timestamp' => date('c'),
        ],
        'status' => 200,
    ];
});
