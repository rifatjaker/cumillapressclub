<?php

declare(strict_types=1);

use App\Controllers\AuthController;
use App\Controllers\AdminContentController;
use App\Controllers\ArchiveController;
use App\Controllers\ClubEventController;
use App\Controllers\CommitteeController;
use App\Controllers\ComplaintController;
use App\Controllers\DeceasedMemberController;
use App\Controllers\LeadershipController;
use App\Controllers\MemberController;
use App\Controllers\NewsController;
use App\Controllers\NoticeController;
use App\Controllers\PageSettingsController;
use App\Controllers\PrimaryMemberController;
use App\Controllers\SliderController;
use App\Core\AuthMiddleware;
use App\Core\RoleMiddleware;

$authController = new AuthController();
$adminContentController = new AdminContentController();
$archiveController = new ArchiveController();
$clubEventController = new ClubEventController();
$committeeController = new CommitteeController();
$complaintController = new ComplaintController();
$deceasedMemberController = new DeceasedMemberController();
$leadershipController = new LeadershipController();
$memberController = new MemberController();
$newsController = new NewsController();
$noticeController = new NoticeController();
$pageSettingsController = new PageSettingsController();
$primaryMemberController = new PrimaryMemberController();
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
$router->get('/api/v1/page-settings', [$pageSettingsController, 'publicShow']);
$router->get('/api/v1/leadership-profiles', [$leadershipController, 'publicIndex']);
$router->get('/api/v1/committee-members', [$committeeController, 'publicIndex']);
$router->get('/api/v1/archive-items', [$archiveController, 'publicIndex']);
$router->get('/api/v1/deceased-members', [$deceasedMemberController, 'publicIndex']);
$router->get('/api/v1/primary-members', [$primaryMemberController, 'publicIndex']);
$router->get('/api/v1/notices', [$noticeController, 'publicIndex']);
$router->get('/api/v1/club-events', [$clubEventController, 'publicIndex']);
$router->post('/api/v1/admin/news', [$newsController, 'store'], [$auth, $adminOnly]);
$router->get('/api/v1/admin/contents', [$adminContentController, 'index'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/contents', [$adminContentController, 'store'], [$auth, $adminOnly]);
$router->add('PUT', '/api/v1/admin/contents/{id}', [$adminContentController, 'update'], [$auth, $adminOnly]);
$router->add('DELETE', '/api/v1/admin/contents/{id}', [$adminContentController, 'destroy'], [$auth, $adminOnly]);
$router->get('/api/v1/admin/slider-items', [$sliderController, 'adminIndex'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/slider-items', [$sliderController, 'store'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/slider-items/{id}', [$sliderController, 'update'], [$auth, $adminOnly]);
$router->add('DELETE', '/api/v1/admin/slider-items/{id}', [$sliderController, 'destroy'], [$auth, $adminOnly]);
$router->get('/api/v1/admin/page-settings', [$pageSettingsController, 'adminShow'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/page-settings', [$pageSettingsController, 'update'], [$auth, $adminOnly]);
$router->get('/api/v1/admin/leadership-profiles', [$leadershipController, 'adminIndex'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/leadership-profiles', [$leadershipController, 'store'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/leadership-profiles/{id}', [$leadershipController, 'update'], [$auth, $adminOnly]);
$router->add('DELETE', '/api/v1/admin/leadership-profiles/{id}', [$leadershipController, 'destroy'], [$auth, $adminOnly]);
$router->get('/api/v1/admin/committee-members', [$committeeController, 'adminIndex'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/committee-members', [$committeeController, 'store'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/committee-members/{id}', [$committeeController, 'update'], [$auth, $adminOnly]);
$router->add('DELETE', '/api/v1/admin/committee-members/{id}', [$committeeController, 'destroy'], [$auth, $adminOnly]);

$router->get('/api/v1/members', [$memberController, 'publicIndex']);
$router->get('/api/v1/members/search', [$memberController, 'search']);
$router->get('/api/v1/members/verify/{code}', [$memberController, 'verify']);
$router->get('/api/v1/admin/members', [$memberController, 'adminIndex'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/members', [$memberController, 'store'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/members/{id}', [$memberController, 'update'], [$auth, $adminOnly]);
$router->add('DELETE', '/api/v1/admin/members/{id}', [$memberController, 'destroy'], [$auth, $adminOnly]);
$router->get('/api/v1/admin/archive-items', [$archiveController, 'adminIndex'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/archive-items', [$archiveController, 'store'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/archive-items/{id}', [$archiveController, 'update'], [$auth, $adminOnly]);
$router->add('DELETE', '/api/v1/admin/archive-items/{id}', [$archiveController, 'destroy'], [$auth, $adminOnly]);
$router->get('/api/v1/admin/deceased-members', [$deceasedMemberController, 'adminIndex'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/deceased-members', [$deceasedMemberController, 'store'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/deceased-members/{id}', [$deceasedMemberController, 'update'], [$auth, $adminOnly]);
$router->add('DELETE', '/api/v1/admin/deceased-members/{id}', [$deceasedMemberController, 'destroy'], [$auth, $adminOnly]);
$router->get('/api/v1/admin/primary-members', [$primaryMemberController, 'adminIndex'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/primary-members', [$primaryMemberController, 'store'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/primary-members/{id}', [$primaryMemberController, 'update'], [$auth, $adminOnly]);
$router->add('DELETE', '/api/v1/admin/primary-members/{id}', [$primaryMemberController, 'destroy'], [$auth, $adminOnly]);
$router->get('/api/v1/admin/notices', [$noticeController, 'adminIndex'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/notices', [$noticeController, 'store'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/notices/{id}', [$noticeController, 'update'], [$auth, $adminOnly]);
$router->add('DELETE', '/api/v1/admin/notices/{id}', [$noticeController, 'destroy'], [$auth, $adminOnly]);
$router->get('/api/v1/admin/club-events', [$clubEventController, 'adminIndex'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/club-events', [$clubEventController, 'store'], [$auth, $adminOnly]);
$router->post('/api/v1/admin/club-events/{id}', [$clubEventController, 'update'], [$auth, $adminOnly]);
$router->add('DELETE', '/api/v1/admin/club-events/{id}', [$clubEventController, 'destroy'], [$auth, $adminOnly]);
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
