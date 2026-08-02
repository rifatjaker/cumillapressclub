# Cumilla Press Club API (Raw PHP 8)

Lightweight REST API using raw PHP 8.3 + MySQL 8 + JWT auth.

## Features

- JWT access token login
- Refresh token rotation
- Auth middleware (Bearer token)
- Role middleware (admin-only route example)
- Member search and verification endpoint
- News public list + admin create endpoint

## Quick Start

1. Copy environment file:

   cp .env.example .env

2. Create MySQL database and import schema:

   mysql -u root -p cumillapressclub < database/schema.sql

3. Serve the app from backend/public:

   php -S localhost:8080 -t public

4. Test health endpoint:

   GET http://localhost:8080/api/v1/health

## Auth Flow

1. POST /api/v1/auth/login with email and password
2. Receive access_token + refresh_token
3. Use access token in Authorization header as Bearer token
4. On 401, call POST /api/v1/auth/refresh with refresh_token
5. Use new access_token and refresh_token

## Request Samples

### Login

POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@cumillapressclub.local",
  "password": "admin1234"
}

### Authenticated Request

GET /api/v1/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN

### Admin Route Example

POST /api/v1/admin/news
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "title": "Press Club Event",
  "category": "local",
  "summary": "New seminar announced"
}

## Frontend Interceptor Hint (React + Axios)

- Add access token in request interceptor
- In response interceptor, if 401:
  - call /auth/refresh
  - retry original request with new access token
  - if refresh fails, force logout
