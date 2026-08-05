<?php

declare(strict_types=1);

use App\Controllers\AuthController;
use App\Controllers\AdminContentController;
use App\Controllers\ComplaintController;
use App\Controllers\MemberController;
use App\Controllers\NewsController;
use App\Controllers\SliderController;
use App\Core\AuthMiddleware;
use App\Core\RoleMiddleware;

$authController = new AuthController();
$adminContentController = new AdminContentController();
$complaintController = new ComplaintController();
$memberController = new MemberController();
$newsController = new NewsController();
$sliderController = new SliderController();

$auth = static fn($request): bool => AuthMiddleware::handle($request);
$adminOnly = RoleMiddleware::require('admin');

$router->post('/api/v1/auth/login', [$authController, 'login']);
$router->post('/api/v1/auth/refresh', [$authController, 'refresh']);
$router->post('/api/v1/auth/logout', [$authController, 'logout'], [$auth]);
$router->get('/api/v1/auth/me', [$authController, 'me'], [$auth]);

$router->get('/api/v1/news', [$newsController, 'index']);
$router->get('/api/v1/contents/{sectionKey}', [$adminContentController, 'publicBySection']);
$router->get('/api/v1/slider-items', [$sliderController, 'publicIndex']);
$router->post('/api/v1/admin/news', [$newsController, 'store'], [$auth, $adminOnly]);
$router->get('/api/v1/admin/contents', [$adminContentController, 'index'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/contents', [$adminContentController, 'store'], [$auth, $adminOnly]);
$router->add('PUT', '/api/v1/admin/contents/{id}', [$adminContentController, 'update'], [$auth, $adminOnly]);
$router->add('DELETE', '/api/v1/admin/contents/{id}', [$adminContentController, 'destroy'], [$auth, $adminOnly]);
$router->get('/api/v1/admin/slider-items', [$sliderController, 'adminIndex'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/slider-items', [$sliderController, 'store'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/slider-items/{id}', [$sliderController, 'update'], [$auth, $adminOnly]);
$router->add('DELETE', '/api/v1/admin/slider-items/{id}', [$sliderController, 'destroy'], [$auth, $adminOnly]);

$router->get('/api/v1/members/search', [$memberController, 'search'], [$auth]);
$router->get('/api/v1/members/verify/{code}', [$memberController, 'verify']);
$router->post('/api/v1/complaints', [$complaintController, 'submit']);

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
