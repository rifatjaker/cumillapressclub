<?php

declare(strict_types=1);

namespace App\Core;

use Closure;

final class Router
{
    private array $routes = [];

    public function get(string $path, callable|array $handler, array $middlewares = []): void
    {
        $this->add('GET', $path, $handler, $middlewares);
    }

    public function post(string $path, callable|array $handler, array $middlewares = []): void
    {
        $this->add('POST', $path, $handler, $middlewares);
    }

    public function add(string $method, string $path, callable|array $handler, array $middlewares = []): void
    {
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => $path,
            'handler' => $handler,
            'middlewares' => $middlewares,
        ];
    }

    public function dispatch(string $method, string $path): void
    {
        $method = strtoupper($method);
        $request = Request::capture($method, $path);

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            $params = $this->matchPath($route['path'], $path);
            if ($params === null) {
                continue;
            }

            foreach ($route['middlewares'] as $middleware) {
                $ok = $middleware($request);
                if ($ok !== true) {
                    return;
                }
            }

            $handler = $route['handler'];
            $response = $handler($request, $params);

            if (is_array($response) && isset($response['data'])) {
                Response::json($response['data'], $response['status'] ?? 200);
            }

            return;
        }

        Response::json([
            'success' => false,
            'message' => 'Route not found',
        ], 404);
    }

    private function matchPath(string $routePath, string $requestPath): ?array
    {
        $pattern = preg_replace('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', '(?P<$1>[^/]+)', $routePath);
        $pattern = '#^' . $pattern . '$#';

        if (preg_match($pattern, $requestPath, $matches) !== 1) {
            return null;
        }

        $params = [];
        foreach ($matches as $key => $value) {
            if (is_string($key)) {
                $params[$key] = urldecode($value);
            }
        }

        return $params;
    }
}
