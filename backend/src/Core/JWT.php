<?php

declare(strict_types=1);

namespace App\Core;

use RuntimeException;

final class JWT
{
    public static function encode(array $payload, string $secret, int $expiresInSeconds): string
    {
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $issuedAt = time();

        $payload['iat'] = $issuedAt;
        $payload['exp'] = $issuedAt + $expiresInSeconds;

        $headerEncoded = self::base64UrlEncode(json_encode($header, JSON_THROW_ON_ERROR));
        $payloadEncoded = self::base64UrlEncode(json_encode($payload, JSON_THROW_ON_ERROR));

        $signature = hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, $secret, true);
        $signatureEncoded = self::base64UrlEncode($signature);

        return $headerEncoded . '.' . $payloadEncoded . '.' . $signatureEncoded;
    }

    public static function decode(string $token, string $secret): array
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            throw new RuntimeException('Invalid token format');
        }

        [$headerEncoded, $payloadEncoded, $signatureEncoded] = $parts;

        $expectedSignature = hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, $secret, true);
        $actualSignature = self::base64UrlDecode($signatureEncoded);

        if (!hash_equals($expectedSignature, $actualSignature)) {
            throw new RuntimeException('Invalid token signature');
        }

        $payloadJson = self::base64UrlDecode($payloadEncoded);
        $payload = json_decode($payloadJson, true);

        if (!is_array($payload)) {
            throw new RuntimeException('Invalid token payload');
        }

        if (($payload['exp'] ?? 0) < time()) {
            throw new RuntimeException('Token expired');
        }

        return $payload;
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;

        if ($remainder > 0) {
            $data .= str_repeat('=', 4 - $remainder);
        }

        $decoded = base64_decode(strtr($data, '-_', '+/'), true);

        if ($decoded === false) {
            throw new RuntimeException('Invalid base64 token segment');
        }

        return $decoded;
    }
}
