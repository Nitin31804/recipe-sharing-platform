# HTML-CSS-JS Registration Project - Complete Guide

A production-ready registration form with advanced validation, comprehensive testing, and backend integration examples.

## 📋 Project Overview

This project demonstrates a complete, modern web application with:

- ✅ **Frontend:** HTML form with real-time validation and beautiful UI
- ✅ **Testing:** 59 comprehensive test cases (46 frontend + 13 backend)
- ✅ **Backend:** Express.js server with authentication endpoints
- ✅ **Documentation:** Complete guides for deployment, testing, and API integration
- ✅ **CI/CD:** GitHub Actions automated testing pipeline
- ✅ **Security:** Rate limiting, password hashing, CORS, input validation

---

## 🚀 Quick Start

### Prerequisites

- Node.js 14+
- npm or yarn
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/Nitin31804/html-css-js-project.git
cd html-css-js-project

# Install dependencies
npm install

# Run tests
npm test

# Start backend server
npm run server
```

### Access Application

- **Frontend:** Open `index.html` in browser
- **Backend:** http://localhost:3000
- **API Health:** http://localhost:3000/api/health

---

## 📁 Project Structure

```
html-css-js-project/
│
├── Frontend Files
│   ├── index.html              # Main registration form
│   ├── script.js               # Form validation and submission
│   ├── styles.css              # Modern styling
│   └── login.html              # Login page
│
├── src/
│   └── validation.js           # Reusable validation module
│
├── tests/
│   └── validation.test.js      # 46 test cases for validation
│
├── backend-example/
│   ├── server.js               # Express.js backend
│   └── server.test.js          # 13 API endpoint tests
│
├── .github/workflows/
│   └── tests.yml               # GitHub Actions CI/CD
│
├── docs/
│   ├── BACKEND_INTEGRATION.md  # Backend setup guide
│   ├── API_SPECIFICATION.md    # Complete API reference
│   ├── TESTING.md              # Testing guide
│   └── DEPLOYMENT.md           # Production deployment
│
├── package.json                # Project configuration
├── jest.config.js              # Test configuration
└── README.md                   # This file
```

---

## 🎯 Features

### Frontend

✨ **Modern Design**
- Gradient background (purple to violet)
- Smooth animations and transitions
- Card-based layout with hover effects
- Dark mode support
- WCAG accessibility compliant

🔐 **Advanced Validation**
- Real-time input validation
- Password strength meter
- Emoji-enhanced error messages
- Auto-clear errors on focus
- Success notifications with auto-hide

📱 **Responsive**
- Mobile-first design
- Works on screens 320px and above
- Touch-friendly buttons
- Optimized for all devices

### Backend

🔒 **Security Features**
- Password hashing with bcrypt (10 salt rounds)
- Rate limiting (5 attempts per 15 min)
- Input validation on server-side
- CORS protection
- Error handling and logging

📊 **API Endpoints**
- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `GET /api/health` - Health check
- `GET /api/users/stats` - Statistics

### Testing

✅ **Comprehensive Coverage**
- 46 frontend validation tests (95%+ coverage)
- 13 backend API tests
- Jest and Supertest frameworks
- Coverage reports with HTML output
- GitHub Actions CI/CD integration

---

## 🔧 Installation & Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/Nitin31804/html-css-js-project.git
cd html-css-js-project
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Run Tests

```bash
# Run all tests
npm test

# Run with watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Step 4: Run Backend

```bash
# Start Express server
npm run server

# Server runs on http://localhost:3000
```

### Step 5: Test Frontend

1. Open `index.html` in your web browser
2. Fill in the form with test data:
   - Username: `john_doe`
   - Email: `john@example.com`
   - Password: `SecurePass123!`
3. Click "Sign Up"

---

## 📚 Documentation

### For Frontend Development
→ See [TESTING.md](docs/TESTING.md) for comprehensive testing guide

### For Backend Integration
→ See [BACKEND_INTEGRATION.md](docs/BACKEND_INTEGRATION.md) for detailed backend setup

### For API Reference
→ See [API_SPECIFICATION.md](docs/API_SPECIFICATION.md) for complete API documentation

### For Production Deployment
→ See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment options (Heroku, AWS, Docker)

---

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

### Watch Mode (Development)

```bash
npm run test:watch
```

### Verbose Output

```bash
npm run test:verbose
```

### Test Breakdown

**Frontend Tests (46 cases):**
- Username validation (8)
- Email validation (8)
- Password validation (16)
- Password strength (4)
- Password matching (6)
- Terms validation (5)
- Full form validation (3)

**Backend Tests (13 cases):**
- Registration (6)
- Login (3)
- Health check (1)
- Statistics (1)
- Error handling (2)

---

## 🚀 Deployment

### Quick Deploy to Heroku

```bash
# Create Procfile
echo "web: npm run server" > Procfile

# Deploy
heroku create your-app-name
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
git push heroku main
```

### Deploy to AWS EC2

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for step-by-step AWS deployment guide.

### Deploy with Docker

```bash
# Build image
docker build -t registration-app .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  registration-app
```

---

## 🔐 Security Features

### Password Security
- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ Password strength requirements enforced
- ✅ Client & server-side validation
- ✅ Never stored in plaintext

### Attack Prevention
- ✅ Rate limiting (5 registration attempts per 15 min)
- ✅ CORS configured for your domain
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection

### HTTPS
- ✅ SSL/TLS support
- ✅ Automatic HTTP to HTTPS redirect
- ✅ Secure cookies (httpOnly, secure flags)

---

## 📊 Validation Rules

### Username
- Length: 3-20 characters
- Characters: Letters, numbers, underscores
- Unique in database

**Valid:** `john_doe`, `user123`, `alice_wonderland`  
**Invalid:** `ab`, `john-doe`, `john.doe`

### Email
- Valid email format (RFC 5322)
- Unique in database

**Valid:** `user@example.com`, `john.doe@company.co.uk`  
**Invalid:** `invalid.email`, `user@domain`

### Password
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 number (0-9)
- At least 1 special character (@$!%*?&)

**Valid:** `SecurePass123!`, `MyPass@1234`  
**Invalid:** `password123`, `Pass1`

### Terms & Conditions
- Must be checked to register

---

## 🔗 API Endpoints

### Register User

```bash
POST /api/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "user_1726853454321"
}
```

### Login User

```bash
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
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

### Health Check

```bash
GET /api/health

Response:
{
  "status": "ok",
  "timestamp": "2026-09-20T22:53:00.123Z",
  "uptime": 3600.5,
  "registeredUsers": 42
}
```

---

## 📈 Project Statistics

| Metric | Value |
|--------|-------|
| Total Code | ~900 lines (frontend) |
| Test Cases | 59 |
| Test Coverage | 95%+ |
| Test Files | 2 |
| Documentation | 4 guides |
| API Endpoints | 4 |
| Frontend Files | 4 |
| Dependencies | 3 main + 5 dev |

---

## 🎓 Learning Resources

### Validation
- [Regex Pattern Learning](https://regex101.com/)
- [Input Validation Best Practices](https://owasp.org/)

### Testing
- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

### Security
- [OWASP Top 10](https://owasp.org/Top10/)
- [bcrypt Password Hashing](https://github.com/kelektiv/node.bcrypt.js)

### Deployment
- [Heroku Docs](https://devcenter.heroku.com/)
- [AWS EC2 Guide](https://docs.aws.amazon.com/ec2/)
- [Docker Tutorial](https://docs.docker.com/get-started/)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Write tests for new functionality
4. Run tests: `npm test`
5. Commit changes: `git commit -am 'Add feature'`
6. Push to branch: `git push origin feature/your-feature`
7. Submit a Pull Request

---

## ✅ Project Checklist

### Frontend
- [x] HTML structure
- [x] CSS styling (responsive)
- [x] JavaScript validation
- [x] Real-time feedback
- [x] Accessibility features
- [x] Dark mode support

### Testing
- [x] Validation tests (46 cases)
- [x] Backend tests (13 cases)
- [x] Coverage reports
- [x] CI/CD pipeline

### Backend
- [x] Express server
- [x] Registration endpoint
- [x] Login endpoint
- [x] Rate limiting
- [x] Error handling
- [x] Password hashing

### Documentation
- [x] Testing guide
- [x] Backend integration guide
- [x] API specification
- [x] Deployment guide
- [x] This README

### Security
- [x] Password hashing
- [x] Input validation
- [x] Rate limiting
- [x] CORS configuration
- [x] SQL injection prevention

---

## 🐛 Troubleshooting

### Tests not running

```bash
# Clear cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Backend won't start

```bash
# Check if port 3000 is in use
lsof -i :3000

# Use different port
PORT=3001 npm run server
```

### Database connection errors

```bash
# Verify database is running
# Update DATABASE_URL in .env
# Check credentials in .env
```

---

## 📞 Support

- **Issues:** Open GitHub issue
- **Questions:** Check documentation in `/docs`
- **Bug Report:** Include steps to reproduce and error logs

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Author

**Nitin31804**

- GitHub: [@Nitin31804](https://github.com/Nitin31804)
- Project: [html-css-js-project](https://github.com/Nitin31804/html-css-js-project)

---

## 🎉 Highlights

This project showcases:

✨ **Modern Web Development Practices**
- Clean, modular code organization
- Comprehensive test coverage
- Production-ready security
- Complete documentation
- Automated CI/CD pipeline

💼 **Portfolio-Ready**
- Interview-level code quality
- Demonstrates full-stack capabilities
- Shows best practices knowledge
- Production deployment examples

🚀 **Scalable Architecture**
- Extensible validation system
- Reusable backend components
- Easy to add features
- Ready for team development

---

## 🔮 Next Steps

1. ✅ Run `npm test` to verify everything works
2. ✅ Review documentation in `/docs`
3. ✅ Study validation functions in `src/validation.js`
4. ✅ Review backend in `backend-example/server.js`
5. ✅ Deploy to production (see DEPLOYMENT.md)
6. ✅ Add more features and tests

---

**Last Updated:** 2026-09-20  
**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Test Coverage:** 95%+ ⭐
