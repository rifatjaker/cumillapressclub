<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;

final class ComplaintController
{
    public function submit(Request $request): array
    {
        $name = trim((string) ($request->body['name'] ?? ''));
        $phone = trim((string) ($request->body['phone'] ?? ''));
        $address = trim((string) ($request->body['address'] ?? ''));
        $complaint = trim((string) ($request->body['complaint'] ?? ''));

        if ($name === '' || $phone === '' || $address === '' || $complaint === '') {
            return [
                'data' => [
                    'success' => false,
                    'message' => 'Name, phone, address and complaint are required',
                ],
                'status' => 422,
            ];
        }

        if (strlen($name) > 120 || strlen($phone) > 40 || strlen($address) > 300 || strlen($complaint) > 4000) {
            return [
                'data' => [
                    'success' => false,
                    'message' => 'Complaint তথ্য অনেক বড়। অনুগ্রহ করে ছোট করে লিখুন।',
                ],
                'status' => 422,
            ];
        }

        $to = getenv('COMPLAINT_MAIL_TO') ?: 'cumillapressclub1964@gmail.com';
        $subjectText = 'কুমিল্লা প্রেসক্লাব অভিযোগ';
        $subject = '=?UTF-8?B?' . base64_encode($subjectText) . '?=';

        $fromEmail = $this->sanitizeEmail((string) (getenv('MAIL_FROM') ?: 'no-reply@localhost'));
        $fromName = 'কুমিল্লা প্রেসক্লাব ওয়েবসাইট';
        $fromHeader = sprintf('From: %s <%s>', $this->encodeHeaderText($fromName), $fromEmail);

        $bodyLines = [
            'কুমিল্লা প্রেসক্লাব বরাবর নতুন অভিযোগ জমা হয়েছে।',
            '',
            'নাম: ' . $this->sanitizeLine($name),
            'মোবাইল: ' . $this->sanitizeLine($phone),
            'ঠিকানা: ' . $this->sanitizeLine($address),
            '',
            'অভিযোগের বিস্তারিত:',
            $this->sanitizeMultiline($complaint),
            '',
            '---',
            'সময়: ' . date('Y-m-d H:i:s'),
            'IP: ' . (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'),
            'User-Agent: ' . $this->sanitizeLine((string) ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown')),
        ];

        $headers = [
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            $fromHeader,
        ];

        $sent = mail($to, $subject, implode("\n", $bodyLines), implode("\r\n", $headers));

        if (!$sent) {
            return [
                'data' => [
                    'success' => false,
                    'message' => 'Email পাঠানো সম্ভব হয়নি। পরে আবার চেষ্টা করুন।',
                ],
                'status' => 500,
            ];
        }

        return [
            'data' => [
                'success' => true,
                'message' => 'অভিযোগ সফলভাবে পাঠানো হয়েছে।',
            ],
            'status' => 200,
        ];
    }

    private function sanitizeLine(string $value): string
    {
        return str_replace(["\r", "\n"], ' ', trim($value));
    }

    private function sanitizeMultiline(string $value): string
    {
        $normalized = str_replace(["\r\n", "\r"], "\n", trim($value));
        return preg_replace('/\n{3,}/', "\n\n", $normalized) ?? $normalized;
    }

    private function sanitizeEmail(string $value): string
    {
        $clean = filter_var(trim($value), FILTER_SANITIZE_EMAIL);
        if (!$clean || !filter_var($clean, FILTER_VALIDATE_EMAIL)) {
            return 'no-reply@localhost';
        }

        return $clean;
    }

    private function encodeHeaderText(string $value): string
    {
        return '=?UTF-8?B?' . base64_encode($this->sanitizeLine($value)) . '?=';
    }
}