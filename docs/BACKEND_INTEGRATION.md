# Backend Integration Guide

This document explains how to integrate the registration form with a production backend server.

## ⚠️ Security: Client-Side Validation is NOT Enough

**Important:** The validation in `script.js` is for user experience only. You MUST implement server-side validation for security.

### Why Server-Side Validation is Critical

1. **Bypass Risk** - Users can disable JavaScript or modify form validation
2. **Data Integrity** - Ensure consistent validation rules across all clients
3. **Security** - Prevent injection attacks and malicious input
4. **Business Rules** - Enforce constraints like unique emails/usernames

---

## Server Architecture

### Recommended Stack

```
Frontend (HTML/CSS/JS)
        ↓
   [HTTP/HTTPS]
        ↓
Backend (Node.js/Express)
        ↓
Database (PostgreSQL/MySQL)
```

### API Design

The form submits to a REST API endpoint:

```
POST /api/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

---

## Implementation Steps

### Step 1: Uncomment Form Submission Code

**File:** `script.js` (lines 87-104)

Currently commented out. Uncomment this to send data to your server:

```javascript
fetch('/api/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(formData)
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Success:', data);
    // Redirect to login or show success message
  } else {
    console.error('Error:', data.error);
    // Show error message to user
  }
})
.catch(error => {
  console.error('Error:', error);
  alert('Registration failed. Please try again.');
});
```

### Step 2: Server-Side Email Validation

**Language:** Node.js with Express

```javascript
const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

if (!emailPattern.test(email)) {
  return res.status(400).json({
    success: false,
    error: 'Invalid email format'
  });
}
```

### Step 3: Server-Side Password Hashing

**NEVER** store plaintext passwords!

```javascript
const bcrypt = require('bcrypt');

// Hash password with salt rounds (10-12 is standard)
const hashedPassword = await bcrypt.hash(password, 10);

// Store hashedPassword in database
await db.users.create({
  username,
  email,
  password: hashedPassword
});
```

### Step 4: Check for Duplicate Email

```javascript
const existingUser = await db.users.findOne({ email });

if (existingUser) {
  return res.status(400).json({
    success: false,
    error: 'Email already registered'
  });
}
```

### Step 5: Check for Duplicate Username

```javascript
const existingUsername = await db.users.findOne({ username });

if (existingUsername) {
  return res.status(400).json({
    success: false,
    error: 'Username already taken'
  });
}
```

### Step 6: Implement Rate Limiting

Prevent brute force attacks:

```javascript
const rateLimit = require('express-rate-limit');

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  message: 'Too many registration attempts, please try again later'
});

app.post('/api/register', registrationLimiter, async (req, res) => {
  // ... registration logic
});
```

### Step 7: Use HTTPS (SSL/TLS)

Always use HTTPS for production:

```javascript
// Redirect HTTP to HTTPS
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  verification_token_expires DATETIME
);

CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_username ON users(username);
```

### Password Reset Table (Optional)

```sql
CREATE TABLE password_resets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Validation Checklist

### Client-Side (UX Only)
- [x] Username format validation
- [x] Email format validation
- [x] Password strength requirements
- [x] Password confirmation match
- [x] Terms checkbox validation
- [x] Real-time error messages

### Server-Side (Security - REQUIRED)
- [ ] Validate username format
- [ ] Validate email format
- [ ] Validate password strength
- [ ] Check email uniqueness in database
- [ ] Check username uniqueness in database
- [ ] Hash password with bcrypt
- [ ] Rate limit registration attempts
- [ ] Use HTTPS only
- [ ] Validate Content-Type header
- [ ] Sanitize input to prevent injection

---

## Email Verification Flow

### Recommended Process

```
1. User submits registration form
   ↓
2. Server validates input
   ↓
3. Server generates unique verification token
   ↓
4. Server saves user (marked as unverified)
   ↓
5. Server sends verification email with link:
   https://yourapp.com/verify?token=xxxxx
   ↓
6. User clicks link
   ↓
7. Server validates token and marks user as verified
   ↓
8. User can now login
```

### Implementation (Node.js)

```javascript
const crypto = require('crypto');
const nodemailer = require('nodemailer');

app.post('/api/register', async (req, res) => {
  // ... validation ...

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Save user
  const user = await db.users.create({
    username,
    email,
    password: hashedPassword,
    verification_token: tokenHash,
    verification_token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
  });

  // Send verification email
  const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;

  await nodemailer.createTransport({...}).sendMail({
    to: email,
    subject: 'Verify Your Email',
    html: `<a href="${verificationUrl}">Verify Email</a>`
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Check your email for verification link.'
  });
});

app.get('/api/verify', async (req, res) => {
  const { token } = req.query;

  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await db.users.findOne({
    verification_token: tokenHash,
    verification_token_expires: { $gt: new Date() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired verification token'
    });
  }

  // Mark as verified
  await db.users.updateOne(
    { id: user.id },
    {
      verified: true,
      verification_token: null,
      verification_token_expires: null
    }
  );

  res.json({
    success: true,
    message: 'Email verified successfully. You can now login.'
  });
});
```

---

## Password Reset Flow

### Implementation

```javascript
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  const user = await db.users.findOne({ email });
  if (!user) {
    // Don't reveal if email exists (security best practice)
    return res.json({
      success: true,
      message: 'If email exists, reset link has been sent'
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Save reset token
  await db.passwordResets.create({
    user_id: user.id,
    token: tokenHash,
    expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour
  });

  // Send reset email
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  // ... send email ...

  res.json({
    success: true,
    message: 'Password reset link sent to email'
  });
});

app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const resetRecord = await db.passwordResets.findOne({
    token: tokenHash,
    expires_at: { $gt: new Date() }
  });

  if (!resetRecord) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired reset token'
    });
  }

  // Update password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.users.updateOne(
    { id: resetRecord.user_id },
    { password: hashedPassword }
  );

  // Delete reset token
  await db.passwordResets.deleteOne({ id: resetRecord.id });

  res.json({
    success: true,
    message: 'Password reset successfully. Please login with new password.'
  });
});
```

---

## Security Best Practices

### 1. CORS Configuration

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://yourapp.com',
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
```

### 2. CSRF Protection

```javascript
const csrf = require('csurf');

const csrfProtection = csrf({ cookie: false });

app.post('/api/register', csrfProtection, async (req, res) => {
  // ... registration logic
});
```

### 3. Helmet.js for Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet());
// Sets headers like:
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: DENY
// - Strict-Transport-Security: max-age=...
```

### 4. SQL Injection Prevention

Always use parameterized queries:

```javascript
// ❌ WRONG - SQL Injection Risk
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ CORRECT - Parameterized Query
const query = 'SELECT * FROM users WHERE email = ?';
db.query(query, [email]);
```

### 5. Input Sanitization

```javascript
const sanitize = require('sanitize-html');

const sanitizedUsername = sanitize(username, {
  allowedTags: [],
  allowedAttributes: {}
});
```

---

## Testing Your API

### Using cURL

```bash
# Register a user
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Check health
curl http://localhost:3000/api/health
```

### Using Postman

1. Open Postman
2. Create a new POST request to `http://localhost:3000/api/register`
3. Set Body > raw > JSON
4. Paste:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```
5. Click Send

---

## Deployment

### Environment Variables

Create `.env` file:

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@localhost/registration_db
FRONTEND_URL=https://yourapp.com
JWT_SECRET=your-super-secret-key-change-this
MAIL_SERVICE=gmail
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### Production Checklist

- [ ] Use environment variables for secrets
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS only
- [ ] Enable CORS for your domain only
- [ ] Set up database backups
- [ ] Monitor error logs
- [ ] Use load balancer for multiple instances
- [ ] Implement proper logging
- [ ] Set up alerting for errors
- [ ] Regular security audits

---

## Common Issues

### Issue: CORS Error

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading
the remote resource at http://localhost:3000/api/register
```

**Solution:** Configure CORS in your backend:

```javascript
app.use(cors({
  origin: '*' // or your frontend URL
}));
```

### Issue: Password Not Hashing

**Problem:** Password stored in plaintext

```javascript
// ❌ WRONG
const user = { email, password }; // plaintext!

// ✅ CORRECT
const hashedPassword = await bcrypt.hash(password, 10);
const user = { email, password: hashedPassword };
```

### Issue: Duplicate Email Allowed

**Solution:** Add UNIQUE constraint:

```sql
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);
ALTER TABLE users ADD CONSTRAINT unique_username UNIQUE (username);
```

---

## Next Steps

1. ✅ Review the example backend (`backend-example/server.js`)
2. ✅ Run tests: `npm test`
3. ✅ Start server: `npm run server`
4. ✅ Test API endpoints
5. ✅ Integrate with frontend
6. ✅ Deploy to production

---

## Resources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Authentication](https://jwt.io/)
- [Password Reset Best Practices](https://www.owasp.org/index.php/Forgot_Password_Cheat_Sheet)

---

**Last Updated:** 2026-09-20  
**Version:** 1.0  
**Author:** Nitin31804
