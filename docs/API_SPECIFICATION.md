# API Specification

Complete API reference for the Registration System.

## Base URL

```
Development:  http://localhost:3000
Production:   https://api.yourapp.com
```

## Authentication

This API does not require authentication for registration endpoints.

For protected endpoints, include JWT token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. User Registration

#### Endpoint

```
POST /api/register
```

#### Description

Register a new user account.

#### Request Headers

```
Content-Type: application/json
```

#### Request Body

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

#### Parameters

| Parameter | Type | Required | Description | Constraints |
|-----------|------|----------|-------------|-------------|
| username | string | Yes | User's unique username | 3-20 chars, alphanumeric + underscore |
| email | string | Yes | User's email address | Valid email format, unique |
| password | string | Yes | User's password | 8+ chars, 1 uppercase, 1 number, 1 special char |
| confirmPassword | string | Yes | Password confirmation | Must match password |

#### Response - Success (201 Created)

```json
{
  "success": true,
  "message": "User registered successfully. Check your email for verification link.",
  "userId": "user_1726853454321"
}
```

#### Response - Error (400 Bad Request)

```json
{
  "success": false,
  "error": "Email already registered"
}
```

#### Response - Error (429 Too Many Requests)

```json
{
  "success": false,
  "error": "Too many registration attempts, please try again later"
}
```

#### Example Request

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'
```

#### Example Response

```json
{
  "success": true,
  "message": "User registered successfully. Check your email for verification link.",
  "userId": "user_1726853454321"
}
```

#### Error Cases

| Status | Error Message | Reason |
|--------|---------------|--------|
| 400 | Username is required | Missing username field |
| 400 | Username must be 3-20 characters... | Invalid username format |
| 400 | Email is required | Missing email field |
| 400 | Please enter a valid email address | Invalid email format |
| 400 | Email already registered | Email exists in database |
| 400 | Username already taken | Username exists in database |
| 400 | Password is required | Missing password field |
| 400 | Password must be 8+ characters... | Password doesn't meet requirements |
| 429 | Too many registration attempts | Rate limit exceeded (5 per 15 min) |
| 500 | Internal server error | Server error occurred |

---

### 2. User Login

#### Endpoint

```
POST /api/login
```

#### Description

Authenticate user and return JWT token (if configured).

#### Request Headers

```
Content-Type: application/json
```

#### Request Body

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | User's registered email |
| password | string | Yes | User's password |

#### Response - Success (200 OK)

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_1726853454321",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### Response - Error (401 Unauthorized)

```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

#### Example Request

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

#### Error Cases

| Status | Error Message | Reason |
|--------|---------------|--------|
| 400 | Email and password are required | Missing fields |
| 401 | Invalid email or password | Wrong credentials |
| 429 | Too many login attempts | Rate limit exceeded |

---

### 3. Health Check

#### Endpoint

```
GET /api/health
```

#### Description

Check if the API is running and get status information.

#### Response (200 OK)

```json
{
  "status": "ok",
  "timestamp": "2026-09-20T22:53:00.123Z",
  "uptime": 3600.5,
  "registeredUsers": 42
}
```

#### Example Request

```bash
curl http://localhost:3000/api/health
```

---

### 4. User Statistics

#### Endpoint

```
GET /api/users/stats
```

#### Description

Get user registration statistics (admin only).

#### Response (200 OK)

```json
{
  "totalUsers": 42,
  "verifiedUsers": 38,
  "unverifiedUsers": 4,
  "registeredToday": 5
}
```

#### Example Request

```bash
curl http://localhost:3000/api/users/stats
```

---

## Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET, login successful |
| 201 | Created | User successfully registered |
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Wrong credentials, token invalid |
| 404 | Not Found | Endpoint doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error occurred |

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common Errors

#### Missing Required Fields

```json
{
  "success": false,
  "error": "Username is required"
}
```

#### Validation Failed

```json
{
  "success": false,
  "error": "Password must be 8+ characters with 1 uppercase, 1 number, 1 special character (@$!%*?&)"
}
```

#### Resource Conflict

```json
{
  "success": false,
  "error": "Email already registered"
}
```

#### Rate Limited

```json
{
  "success": false,
  "error": "Too many registration attempts, please try again later"
}
```

---

## Rate Limiting

### Registration Endpoint

- **Limit:** 5 requests per IP per 15 minutes
- **Response:** 429 Too Many Requests

### Login Endpoint

- **Limit:** 10 requests per IP per 15 minutes
- **Response:** 429 Too Many Requests

### General API

- **Limit:** 100 requests per IP per 15 minutes
- **Response:** 429 Too Many Requests

### Headers

When rate limited, the response includes:

```
Retry-After: 900 (seconds until retry)
RateLimit-Limit: 5
RateLimit-Remaining: 0
RateLimit-Reset: 1726854354
```

---

## Validation Rules

### Username

- **Length:** 3-20 characters
- **Characters:** Letters, numbers, underscores only
- **Uniqueness:** Must be unique in database
- **Examples:**
  - ✅ john_doe
  - ✅ user123
  - ❌ ab (too short)
  - ❌ john-doe (invalid character)

### Email

- **Format:** Valid email format (RFC 5322 subset)
- **Uniqueness:** Must be unique in database
- **Examples:**
  - ✅ john@example.com
  - ✅ user+tag@domain.co.uk
  - ❌ invalid.email (no @)
  - ❌ user@domain (no TLD)

### Password

- **Length:** Minimum 8 characters
- **Uppercase:** At least 1 (A-Z)
- **Number:** At least 1 (0-9)
- **Special Char:** At least 1 (@$!%*?&)
- **Examples:**
  - ✅ SecurePass123!
  - ✅ MyPassword1@
  - ❌ password123 (no uppercase)
  - ❌ Pass1 (too short)

---

## Security

### HTTPS Required

In production, only HTTPS connections are allowed. HTTP requests are redirected to HTTPS.

### Password Security

- Passwords are hashed using bcrypt with 10 salt rounds
- Plaintext passwords are never stored or logged
- Password reset tokens expire after 1 hour

### Token Expiration

- JWT tokens expire after 24 hours
- Refresh tokens can extend session

### CORS Policy

Cross-Origin requests are allowed only from:

```
https://yourapp.com
https://www.yourapp.com
```

Other origins receive CORS error.

---

## Examples

### Complete Registration Flow

```bash
# 1. Register new user
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "user@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'

# Response:
# {
#   "success": true,
#   "message": "User registered successfully...",
#   "userId": "user_1726853454321"
# }

# 2. Wait for email verification (or skip in dev)

# 3. Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'

# Response:
# {
#   "success": true,
#   "message": "Login successful",
#   "user": {
#     "id": "user_1726853454321",
#     "username": "newuser",
#     "email": "user@example.com"
#   }
# }
```

### Frontend Integration

```javascript
// In script.js
const registrationData = {
  username: 'newuser',
  email: 'user@example.com',
  password: 'SecurePass123!',
  confirmPassword: 'SecurePass123!'
};

fetch('/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(registrationData)
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    alert('Registration successful! Check your email.');
    window.location.href = '/login.html';
  } else {
    alert('Error: ' + data.error);
  }
});
```

---

## Testing

See `backend-example/server.test.js` for comprehensive test examples.

Run tests:

```bash
npm test
```

---

## Changelog

### v1.0 (2026-09-20)
- Initial API release
- Registration endpoint
- Login endpoint
- Health check endpoint
- User statistics endpoint

---

## Support

For issues or questions:
- Open an issue on GitHub
- Check documentation at /docs
- Review examples in backend-example/

---

**Last Updated:** 2026-09-20  
**Version:** 1.0.0  
**Base URL:** http://localhost:3000
