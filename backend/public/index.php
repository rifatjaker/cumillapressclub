<?php

declare(strict_types=1);

use App\Core\Router;

require_once dirname(__DIR__) . '/src/bootstrap.php';

$router = new Router();
require_once dirname(__DIR__) . '/src/Routes/api.php';

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$router->dispatch($_SERVER['REQUEST_METHOD'] ?? 'GET', $path);
