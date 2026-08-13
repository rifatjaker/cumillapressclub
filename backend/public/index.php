<?php

declare(strict_types=1);

use App\Core\Router;

header('Content-Type: application/json; charset=utf-8');

set_exception_handler(static function (Throwable $e): void {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unhandled exception',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
});

set_error_handler(static function (int $severity, string $message, string $file, int $line): bool {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

if (PHP_VERSION_ID < 80100) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'PHP 8.1+ is required',
        'php' => PHP_VERSION,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$bootstrapCandidates = [
    // Symlink Option A / local: .../private_api/public or .../backend/public
    dirname(__DIR__) . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR . 'bootstrap.php',
    // Copy Option A: public_html/api → ../private_api/src
    dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'private_api' . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR . 'bootstrap.php',
];

$bootstrapFile = null;
foreach ($bootstrapCandidates as $candidate) {
    if (is_file($candidate)) {
        $bootstrapFile = $candidate;
        break;
    }
}

if ($bootstrapFile === null) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'API bootstrap not found',
        'api_dir' => __DIR__,
        'parent_dir' => dirname(__DIR__),
        'looked_in' => $bootstrapCandidates,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

require_once $bootstrapFile;

$router = new Router();
require_once dirname($bootstrapFile) . DIRECTORY_SEPARATOR . 'Routes' . DIRECTORY_SEPARATOR . 'api.php';

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$router->dispatch($_SERVER['REQUEST_METHOD'] ?? 'GET', $path);
