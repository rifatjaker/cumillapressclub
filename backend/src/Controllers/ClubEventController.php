<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Core\Request;
use PDO;

final class ClubEventController
{
    public function publicIndex(Request $request): array
    {
        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $stmt = $pdo->query(
            'SELECT id, title, date_label, time_label, venue, starts_at, sort_order
             FROM club_events
             WHERE is_active = 1
             ORDER BY
               CASE WHEN starts_at IS NULL THEN 1 ELSE 0 END ASC,
               starts_at ASC,
               sort_order ASC,
               id ASC'
        );

        $items = array_map(fn(array $item): array => $this->mapPublicItem($item), $stmt->fetchAll(PDO::FETCH_ASSOC));

        return [
            'data' => [
                'success' => true,
                'data' => $items,
            ],
            'status' => 200,
        ];
    }

    public function adminIndex(Request $request): array
    {
        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $stmt = $pdo->query(
            'SELECT id, title, date_label, time_label, venue, starts_at, sort_order, is_active, created_at, updated_at
             FROM club_events
             ORDER BY sort_order ASC, id DESC'
        );

        $items = array_map(fn(array $item): array => [
            'id' => (int) $item['id'],
            'title' => (string) $item['title'],
            'date_label' => (string) ($item['date_label'] ?? ''),
            'time_label' => (string) ($item['time_label'] ?? ''),
            'venue' => (string) ($item['venue'] ?? ''),
            'starts_at' => $item['starts_at'] !== null ? (string) $item['starts_at'] : null,
            'sort_order' => (int) $item['sort_order'],
            'is_active' => (int) $item['is_active'],
            'created_at' => (string) $item['created_at'],
            'updated_at' => (string) $item['updated_at'],
        ], $stmt->fetchAll(PDO::FETCH_ASSOC));

        return [
            'data' => [
                'success' => true,
                'data' => $items,
            ],
            'status' => 200,
        ];
    }

    public function store(Request $request): array
    {
        $payload = $this->readFormPayload();
        $validation = $this->validatePayload($payload);
        if ($validation !== null) {
            return $validation;
        }

        $adminId = (int) (($request->user()['id'] ?? 0));
        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $stmt = $pdo->prepare(
            'INSERT INTO club_events
             (title, date_label, time_label, venue, starts_at, sort_order, is_active, created_by, updated_by)
             VALUES
             (:title, :date_label, :time_label, :venue, :starts_at, :sort_order, :is_active, :created_by, :updated_by)'
        );
        $stmt->execute([
            'title' => $payload['title'],
            'date_label' => $payload['date_label'],
            'time_label' => $payload['time_label'],
            'venue' => $payload['venue'],
            'starts_at' => $payload['starts_at'],
            'sort_order' => $payload['sort_order'],
            'is_active' => $payload['is_active'],
            'created_by' => $adminId > 0 ? $adminId : null,
            'updated_by' => $adminId > 0 ? $adminId : null,
        ]);

        return [
            'data' => [
                'success' => true,
                'message' => 'Event created',
                'data' => ['id' => (int) $pdo->lastInsertId()],
            ],
            'status' => 201,
        ];
    }

    public function update(Request $request, array $params): array
    {
        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            return [
                'data' => ['success' => false, 'message' => 'Invalid event id'],
                'status' => 422,
            ];
        }

        $payload = $this->readFormPayload();
        $validation = $this->validatePayload($payload);
        if ($validation !== null) {
            return $validation;
        }

        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $findStmt = $pdo->prepare('SELECT id FROM club_events WHERE id = :id LIMIT 1');
        $findStmt->execute(['id' => $id]);
        $existing = $findStmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            return [
                'data' => ['success' => false, 'message' => 'Event not found'],
                'status' => 404,
            ];
        }

        $adminId = (int) (($request->user()['id'] ?? 0));

        $stmt = $pdo->prepare(
            'UPDATE club_events
             SET title = :title,
                 date_label = :date_label,
                 time_label = :time_label,
                 venue = :venue,
                 starts_at = :starts_at,
                 sort_order = :sort_order,
                 is_active = :is_active,
                 updated_by = :updated_by
             WHERE id = :id'
        );
        $stmt->execute([
            'id' => $id,
            'title' => $payload['title'],
            'date_label' => $payload['date_label'],
            'time_label' => $payload['time_label'],
            'venue' => $payload['venue'],
            'starts_at' => $payload['starts_at'],
            'sort_order' => $payload['sort_order'],
            'is_active' => $payload['is_active'],
            'updated_by' => $adminId > 0 ? $adminId : null,
        ]);

        return [
            'data' => [
                'success' => true,
                'message' => 'Event updated',
            ],
            'status' => 200,
        ];
    }

    public function destroy(Request $request, array $params): array
    {
        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            return [
                'data' => ['success' => false, 'message' => 'Invalid event id'],
                'status' => 422,
            ];
        }

        $pdo = Database::connection();
        $this->ensureSchema($pdo);

        $findStmt = $pdo->prepare('SELECT id FROM club_events WHERE id = :id LIMIT 1');
        $findStmt->execute(['id' => $id]);
        $existing = $findStmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            return [
                'data' => ['success' => false, 'message' => 'Event not found'],
                'status' => 404,
            ];
        }

        $deleteStmt = $pdo->prepare('DELETE FROM club_events WHERE id = :id');
        $deleteStmt->execute(['id' => $id]);

        return [
            'data' => [
                'success' => true,
                'message' => 'Event deleted',
            ],
            'status' => 200,
        ];
    }

    private function mapPublicItem(array $item): array
    {
        $startsAt = $item['starts_at'] !== null ? (string) $item['starts_at'] : null;

        return [
            'id' => (int) $item['id'],
            'title' => (string) $item['title'],
            'date' => (string) ($item['date_label'] ?? ''),
            'time' => (string) ($item['time_label'] ?? ''),
            'venue' => (string) ($item['venue'] ?? ''),
            'startsAt' => $startsAt ? str_replace(' ', 'T', $startsAt) : null,
            'sort_order' => (int) $item['sort_order'],
        ];
    }

    /** @return array{title: string, date_label: string, time_label: string, venue: string, starts_at: ?string, sort_order: int, is_active: int} */
    private function readFormPayload(): array
    {
        $startsAtRaw = trim((string) ($_POST['starts_at'] ?? ''));
        $startsAt = null;

        if ($startsAtRaw !== '') {
            $normalized = str_replace('T', ' ', $startsAtRaw);
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $normalized) === 1) {
                $normalized .= ' 00:00:00';
            }
            if (preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/', $normalized) === 1) {
                $normalized .= ':00';
            }
            if (preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $normalized) === 1) {
                $startsAt = $normalized;
            }
        }

        return [
            'title' => trim((string) ($_POST['title'] ?? '')),
            'date_label' => trim((string) ($_POST['date_label'] ?? '')),
            'time_label' => trim((string) ($_POST['time_label'] ?? '')),
            'venue' => trim((string) ($_POST['venue'] ?? '')),
            'starts_at' => $startsAt,
            'sort_order' => (int) ($_POST['sort_order'] ?? 0),
            'is_active' => in_array(strtolower((string) ($_POST['is_active'] ?? '1')), ['1', 'true', 'on', 'yes'], true) ? 1 : 0,
        ];
    }

    private function validatePayload(array $payload): ?array
    {
        if ($payload['title'] === '') {
            return [
                'data' => ['success' => false, 'message' => 'title is required'],
                'status' => 422,
            ];
        }

        if (
            strlen($payload['title']) > 255
            || strlen($payload['date_label']) > 120
            || strlen($payload['time_label']) > 120
            || strlen($payload['venue']) > 255
        ) {
            return [
                'data' => ['success' => false, 'message' => 'Input too long'],
                'status' => 422,
            ];
        }

        $startsAtRaw = trim((string) ($_POST['starts_at'] ?? ''));
        if ($startsAtRaw !== '' && $payload['starts_at'] === null) {
            return [
                'data' => ['success' => false, 'message' => 'starts_at must be YYYY-MM-DD or YYYY-MM-DD HH:MM'],
                'status' => 422,
            ];
        }

        return null;
    }

    private function ensureSchema(PDO $pdo): void
    {
        $pdo->exec(
            'CREATE TABLE IF NOT EXISTS club_events (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                date_label VARCHAR(120) NULL,
                time_label VARCHAR(120) NULL,
                venue VARCHAR(255) NULL,
                starts_at DATETIME NULL,
                sort_order INT NOT NULL DEFAULT 0,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_by BIGINT UNSIGNED NULL,
                updated_by BIGINT UNSIGNED NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_events_active_sort (is_active, sort_order),
                INDEX idx_events_starts_at (starts_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
        );
    }
}
