<?php

declare(strict_types=1);

/**
 * Tiny host check (no framework).
 * Visit: https://cumillapressclub.com/api/ping.php
 */
header('Content-Type: application/json; charset=utf-8');

$bootstrap = dirname(__DIR__) . '/src/bootstrap.php';

echo json_encode([
    'success' => true,
    'php' => PHP_VERSION,
    'php_ok' => PHP_VERSION_ID >= 80100,
    'script' => __FILE__,
    'dir' => __DIR__,
    'parent' => dirname(__DIR__),
    'bootstrap_exists' => is_file($bootstrap),
    'bootstrap_path' => $bootstrap,
    'env_exists' => is_file(dirname(__DIR__) . '/.env'),
    'uploads_writable' => is_dir(__DIR__ . '/uploads') ? is_writable(__DIR__ . '/uploads') : 'uploads_missing',
], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
