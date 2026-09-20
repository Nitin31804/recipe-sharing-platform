// Express.js Backend Example for Registration
const express = require('express');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// In-memory user database (replace with real database in production)
const users = [];

// Rate limiter: 5 registration attempts per 15 minutes
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many registration attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter: General API limiter (100 requests per 15 min)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
});

// Validation functions
function validateUsername(username) {
  if (typeof username !== 'string') return false;
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

function validateEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
}

function validatePassword(password) {
  if (typeof password !== 'string') return false;
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
}

// Routes
/**
 * POST /api/register
 * Register a new user
 * 
 * Request body:
 * {
 *   "username": "string",
 *   "email": "string",
 *   "password": "string"
 * }
 * 
 * Response:
 * Success (201):
 * {
 *   "success": true,
 *   "message": "User registered successfully",
 *   "userId": "string"
 * }
 * 
 * Error (400):
 * {
 *   "success": false,
 *   "error": "string"
 * }
 */
app.post('/api/register', registrationLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate inputs
    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Username is required'
      });
    }

    if (!validateUsername(username)) {
      return res.status(400).json({
        success: false,
        error: 'Username must be 3-20 characters (letters, numbers, underscores only)'
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be 8+ characters with 1 uppercase, 1 number, 1 special character (@$!%*?&)'
      });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const newUser = {
      id: `user_${Date.now()}`,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      verified: false
    };

    // Save to database (in-memory for demo)
    users.push(newUser);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Check your email for verification link.',
      userId: newUser.id
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/login
 * Authenticate a user
 * 
 * Request body:
 * {
 *   "email": "string",
 *   "password": "string"
 * }
 */
app.post('/api/login', apiLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // In production, generate JWT token here
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    registeredUsers: users.length
  });
});

/**
 * GET /api/users/stats
 * Get user statistics (admin only)
 */
app.get('/api/users/stats', (req, res) => {
  res.json({
    totalUsers: users.length,
    verifiedUsers: users.filter(u => u.verified).length,
    unverifiedUsers: users.filter(u => !u.verified).length,
    registeredToday: users.filter(u => {
      const today = new Date().toDateString();
      return new Date(u.createdAt).toDateString() === today;
    }).length
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔═════════════════════════════════════════════════╗
║  Registration API Server Running                ║
║  Port: ${PORT}                                      ║
║  Endpoints:                                     ║
║    POST   /api/register                         ║
║    POST   /api/login                            ║
║    GET    /api/health                           ║
║    GET    /api/users/stats                      ║
╚═════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
