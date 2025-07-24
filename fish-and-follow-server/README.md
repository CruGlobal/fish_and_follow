# API Routes Documentation

This document provides comprehensive information about all available API routes in the application.

## Base URL
```
http://localhost:3000
```

## Authentication

This API uses Okta OpenID Connect (OIDC) for authentication. Most routes require authentication except for public auth-related endpoints.

### Authentication Flow
1. User accesses `/signin` to initiate login
2. User is redirected to Okta for authentication
3. After successful login, user is redirected back via `/authorization-code/callback`
4. User session is maintained for subsequent API calls

---

## Public Routes

These routes do not require authentication.

### Health Check
```http
GET /
```
**Description:** Basic health check endpoint

### Authentication Status
```http
GET /auth/status
```
**Description:** Check current authentication status
**Response:**
```json
{
  "authenticated": boolean,
  "user": object | null
}
```

### Sign In
```http
GET /signin
```
**Description:** Initiate Okta OIDC authentication flow
**Response:** Redirects to Okta login page

### Authentication Callback
```http
GET /authorization-code/callback
```
**Description:** Okta callback endpoint after successful authentication
**Response:** Redirects to `http://localhost:5173/contacts`

### Sign Out
```http
POST /signout
GET /signout
```
**Description:** Log out current user and destroy session
**POST Response:**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "redirectUrl": "http://localhost:5173/"
}
```
**GET Response:** Redirects to `http://localhost:5173/`

---

## Protected Routes

All routes under `/api` require authentication. Include session cookies in requests.

### Contacts Routes
```http
/api/contacts/*
```
**Description:** Manage contact information
**Authentication:** Required
**Router:** `contactsRouter`

Common endpoints likely include:
- `GET /api/contacts` - List all contacts
- `GET /api/contacts/:id` - Get specific contact
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Users Routes
```http
/api/users/*
```
**Description:** Manage user accounts and profiles
**Authentication:** Required
**Router:** `usersRouter`

Common endpoints likely include:
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get specific user
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Follow-up Status Routes
```http
/api/follow-up-status/*
```
**Description:** Manage follow-up status information
**Authentication:** Required
**Router:** `followUpStatusRouter`

Common endpoints likely include:
- `GET /api/follow-up-status` - List all follow-up statuses
- `GET /api/follow-up-status/:id` - Get specific status
- `POST /api/follow-up-status` - Create new status
- `PUT /api/follow-up-status/:id` - Update status
- `DELETE /api/follow-up-status/:id` - Delete status

### Roles Routes
```http
/api/roles/*
```
**Description:** Manage user roles and permissions
**Authentication:** Required
**Router:** `rolesRouter`

Common endpoints likely include:
- `GET /api/roles` - List all roles
- `GET /api/roles/:id` - Get specific role
- `POST /api/roles` - Create new role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

---

## Request/Response Format

### Request Headers
```http
Content-Type: application/json
```

### Authentication
- Sessions are maintained via HTTP-only cookies
- Include credentials in requests: `credentials: 'include'`

### Error Responses
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## CORS Configuration

The API accepts requests from:
- `http://localhost:5173` (Frontend development server)
- `http://localhost:3000` (API server)

Allowed methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

---

## Environment Variables

Required environment variables:
```env
OKTA_CLIENT_ID=your_okta_client_id
OKTA_CLIENT_SECRET=your_okta_client_secret
OKTA_DOMAIN_URL=your_okta_domain
PORT=3000
```

---

## Security Notes

1. **Sessions:** Sessions are configured with HTTP-only cookies for security
2. **HTTPS:** Set `cookie.secure: true` in production with HTTPS
3. **CORS:** Limited to specific origins for security
4. **Authentication:** All API routes require valid session
5. **Session Timeout:** Sessions expire after 24 hours

---

## Development

### Starting the Server
```bash
pnpm run dev
```

### Testing Routes
Use tools like Postman, curl, or browser dev tools to test endpoints. Remember to include credentials for protected routes.

### Adding New Routes
1. Create router in `/routes` directory
2. Import router in main server file
3. Add to `protectedRouter` for authenticated routes
4. Update this documentation