<?php

declare(strict_types=1);

namespace App\Core;

final class Request
{
    public string $method;
    public string $path;
    public array $query;
    public array $body;
    public array $headers;
    private ?array $user = null;

    public function __construct(string $method, string $path, array $query, array $body, array $headers)
    {
        $this->method = strtoupper($method);
        $this->path = $path;
        $this->query = $query;
        $this->body = $body;
        $this->headers = $headers;
    }

    public static function capture(string $method, string $path): self
    {
        $rawBody = file_get_contents('php://input') ?: '';
        $decoded = json_decode($rawBody, true);
        $body = is_array($decoded) ? $decoded : $_POST;

        return new self(
            $method,
            $path,
            $_GET,
            $body,
            self::normalizeHeaders(self::getRawHeaders())
        );
    }

    public function setUser(array $user): void
    {
        $this->user = $user;
    }

    public function user(): ?array
    {
        return $this->user;
    }

    public function bearerToken(): ?string
    {
        $header = $this->headers['authorization'] ?? '';

        if (preg_match('/Bearer\s+(.*)$/i', $header, $matches) !== 1) {
            return null;
        }

        return trim($matches[1]);
    }

    public function clientIp(): string
    {
        $candidates = [
            $this->headers['cf-connecting-ip'] ?? '',
            $this->headers['true-client-ip'] ?? '',
            $this->headers['x-real-ip'] ?? '',
            $this->headers['x-forwarded-for'] ?? '',
            (string) ($_SERVER['REMOTE_ADDR'] ?? ''),
        ];

        foreach ($candidates as $raw) {
            $raw = trim((string) $raw);
            if ($raw === '') {
                continue;
            }

            $ip = trim(explode(',', $raw)[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }

        return 'unknown';
    }

    public function userAgent(): string
    {
        $ua = trim((string) ($this->headers['user-agent'] ?? ($_SERVER['HTTP_USER_AGENT'] ?? '')));
        if ($ua === '') {
            return '';
        }

        return mb_substr($ua, 0, 500);
    }

    private static function getRawHeaders(): array
    {
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            return is_array($headers) ? $headers : [];
        }

        $headers = [];

        foreach ($_SERVER as $name => $value) {
            if (str_starts_with($name, 'HTTP_')) {
                $headerName = str_replace('_', '-', strtolower(substr($name, 5)));
                $headers[$headerName] = (string) $value;
            }
        }

        return $headers;
    }

    private static function normalizeHeaders(array $headers): array
    {
        $normalized = [];

        foreach ($headers as $key => $value) {
            $normalized[strtolower($key)] = (string) $value;
        }

        return $normalized;
    }
}
