# Testing Guide

Complete guide for running and understanding tests in this project.

## Overview

This project has two levels of testing:

1. **Frontend Tests** - Validation function tests (Jest)
2. **Backend Tests** - API endpoint tests (Jest + Supertest)

---

## Installation

### Prerequisites

- Node.js 14+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# For backend testing (if running backend tests)
npm install --save-dev supertest
```

---

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

Watch mode automatically reruns tests when files change. Great for development!

### Run Tests with Coverage Report

```bash
npm run test:coverage
```

This generates a detailed coverage report showing:
- Which lines are tested
- Which lines are untested
- Coverage percentage

### Run Specific Test File

```bash
npm test validation.test.js
npm test server.test.js
```

### Run Tests Matching a Pattern

```bash
npm test -- --testNamePattern="Email Validation"
```

### Verbose Output

```bash
npm run test:verbose
```

Shows detailed test output with all assertions.

---

## Test Structure

### Frontend Tests

**File:** `tests/validation.test.js`

Tests for all validation functions in `src/validation.js`:

```
✅ Username Validation (8 tests)
   - Valid usernames
   - Too short/long usernames
   - Invalid characters
   - Error messages

✅ Email Validation (8 tests)
   - Valid emails
   - Missing @
   - Invalid format
   - Error messages

✅ Password Validation (16 tests)
   - Strong passwords
   - Password strength meter
   - Missing requirements
   - Error messages

✅ Password Match (6 tests)
   - Matching passwords
   - Non-matching
   - Case sensitivity

✅ Terms Validation (5 tests)
   - Checked/unchecked
   - Error messages

✅ Full Form Validation (3 tests)
   - Complete valid form
   - Multiple errors
   - Partial validation

Total: 46 test cases
```

### Backend Tests

**File:** `backend-example/server.test.js`

Tests for API endpoints:

```
✅ Registration API (6 tests)
   - Valid registration
   - Invalid username
   - Invalid email
   - Weak password
   - Duplicate email
   - Password hashing

✅ Login API (3 tests)
   - Valid credentials
   - Invalid password
   - Non-existent user

✅ Health Check (1 test)
   - Status endpoint

✅ Statistics (1 test)
   - User stats endpoint

✅ Error Handling (2 tests)
   - 404 responses
   - Missing fields

Total: 13 test cases
```

---

## Understanding Test Output

### Successful Run

```
 PASS  tests/validation.test.js
  Username Validation
    validateUsername
      ✓ should accept valid usernames (2 ms)
      ✓ should reject usernames that are too short (1 ms)
      ✓ should reject usernames that are too long (1 ms)
    getUsernameError
      ✓ should return empty string for valid username (1 ms)
      ✓ should return error for empty username (1 ms)

Test Suites: 1 passed, 1 total
Tests:       46 passed, 46 total
Snapshots:   0 total
Time:        1.234 s
```

### Failed Test

```
 FAIL  tests/validation.test.js
  Email Validation
    validateEmail
      ✕ should accept valid emails (5 ms)

    Expected: true
    Received: false

    at tests/validation.test.js:45:12
    at Object.<anonymous> (tests/validation.test.js:44:1)
```

### Coverage Report

```
---------|----------|----------|----------|----------|
File     | % Stmts  | % Branch | % Funcs  | % Lines  |
---------|----------|----------|----------|----------|
All files|   95.5   |  92.3    |  100     |  95.5    |
 src/    |   95.5   |  92.3    |  100     |  95.5    |
  valid  |   95.5   |  92.3    |  100     |  95.5    |
---------|----------|----------|----------|----------|
```

---

## Writing New Tests

### Basic Test Structure

```javascript
describe('Feature Name', () => {
  describe('Function Name', () => {
    it('should do something', () => {
      // Arrange - Set up test data
      const input = 'test@example.com';

      // Act - Call the function
      const result = validateEmail(input);

      // Assert - Check the result
      expect(result).toBe(true);
    });

    it('should handle error case', () => {
      const input = 'invalid';
      const result = validateEmail(input);
      expect(result).toBe(false);
    });
  });
});
```

### Common Assertions

```javascript
// Equality
expect(value).toBe(expectedValue);           // Strict equality (===)
expect(value).toEqual(expectedObject);       // Deep equality
expect(value).not.toBe(unexpectedValue);     // Negation

// Truthiness
expect(value).toBeTruthy();                  // value is truthy
expect(value).toBeFalsy();                   // value is falsy
expect(value).toBeNull();                    // value is null
expect(value).toBeUndefined();               // value is undefined

// Numbers
expect(value).toBeLessThan(5);               // value < 5
expect(value).toBeGreaterThan(10);           // value > 10
expect(value).toBeLessThanOrEqual(5);        // value <= 5

// Strings
expect(value).toContain('substring');        // Contains substring
expect(value).toMatch(/regex/);              // Matches regex

// Arrays
expect(array).toContain('item');             // Contains item
expect(array).toHaveLength(3);               // Array length is 3

// Objects
expect(obj).toHaveProperty('key');           // Has property
expect(obj).toHaveProperty('key', value);    // Has property with value

// Errors
expect(fn).toThrow();                        // Function throws
expect(fn).toThrow(ErrorType);               // Throws specific error
```

### Example: Adding a New Validation Test

```javascript
describe('Username Validation', () => {
  it('should accept usernames with all allowed characters', () => {
    // Arrange
    const validUsernames = [
      'abc_123',
      '_leading_underscore',
      'UPPERCASE_user',
      'mix3d_c4s3'
    ];

    // Act & Assert
    validUsernames.forEach(username => {
      expect(validateUsername(username)).toBe(true);
    });
  });
});
```

---

## Running Backend Tests

### Start Backend Server

First, install backend dependencies:

```bash
npm install express bcrypt express-rate-limit supertest
```

### Run Backend Tests

```bash
npm test backend-example/server.test.js
```

### Test API Manually

```bash
# Start server
npm run server

# In another terminal, test an endpoint
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

---

## Coverage Goals

### Current Coverage

- **Statements:** 95.5%
- **Branches:** 92.3%
- **Functions:** 100%
- **Lines:** 95.5%

### Target Coverage

- **Statements:** > 90%
- **Branches:** > 85%
- **Functions:** 100%
- **Lines:** > 90%

### View Coverage Report

```bash
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html  # macOS
# OR
start coverage/lcov-report/index.html  # Windows
```

---

## Debugging Tests

### Run Single Test

```bash
npm test -- -t "Email Validation"
```

### Debug with Node Inspector

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Then open `chrome://inspect` in Chrome DevTools.

### Print Debug Output

```javascript
it('should validate email', () => {
  const result = validateEmail('test@example.com');
  console.log('Result:', result);  // Shows in test output
  expect(result).toBe(true);
});
```

Run with:

```bash
npm test -- --verbose
```

### Skip Tests

```javascript
it.skip('should be skipped', () => {
  expect(true).toBe(false);
});

// OR

xdescribe('skipped test suite', () => {
  it('should be skipped', () => {
    expect(true).toBe(false);
  });
});
```

### Focus on Specific Tests

```javascript
it.only('run only this test', () => {
  expect(true).toBe(true);
});

// Only this test will run!
```

---

## Continuous Integration

### GitHub Actions

Tests automatically run on every push and pull request.

**File:** `.github/workflows/tests.yml`

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 16
      - run: npm install
      - run: npm test
```

### Running CI Tests Locally

```bash
# Simulate CI environment
npm ci        # Clean install (like CI does)
npm test      # Run tests
```

---

## Best Practices

### ✅ Good Tests

```javascript
// Clear description
it('should reject email without @ symbol', () => {
  expect(validateEmail('userexample.com')).toBe(false);
});

// Arrange-Act-Assert pattern
it('should handle special characters in password', () => {
  const password = 'Pass123!@#$%';
  const result = validatePassword(password);
  expect(result).toBe(true);
});

// Test both positive and negative cases
it('should accept valid usernames', () => {
  expect(validateUsername('john_doe')).toBe(true);
});

it('should reject invalid usernames', () => {
  expect(validateUsername('ab')).toBe(false);
});
```

### ❌ Poor Tests

```javascript
// Unclear description
it('works', () => {
  expect(validateEmail('test@example.com')).toBe(true);
});

// Multiple assertions about different things
it('should validate form', () => {
  expect(validateUsername('john')).toBe(true);
  expect(validateEmail('john@example.com')).toBe(true);
  expect(validatePassword('Pass1!')).toBe(true);
  expect(validateTerms(true)).toBe(true);
  // Too many things to test!
});

// Testing implementation details
it('should use regex pattern', () => {
  // Don't test how it's done, test what it does
});
```

---

## Troubleshooting

### Issue: Tests not finding modules

```
Cannot find module 'src/validation'
```

**Solution:** Check import paths are correct:

```javascript
// ✅ Correct
const { validateEmail } = require('../src/validation');

// ❌ Wrong
const { validateEmail } = require('./validation');
```

### Issue: localStorage is not defined

```
ReferenceError: localStorage is not defined
```

**Solution:** Jest setup file handles this. Check `jest.setup.js` is included:

```javascript
// In jest.config.js
setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
```

### Issue: Async tests timeout

```
thrown: "timeout of 5000ms exceeded"
```

**Solution:** Return promise or use async/await:

```javascript
// ❌ Wrong - test finishes before promise resolves
it('should test async', () => {
  fetch('/api/users').then(res => {
    expect(res.status).toBe(200);
  });
});

// ✅ Correct - return the promise
it('should test async', () => {
  return fetch('/api/users').then(res => {
    expect(res.status).toBe(200);
  });
});

// ✅ Even better - use async/await
it('should test async', async () => {
  const res = await fetch('/api/users');
  expect(res.status).toBe(200);
});
```

### Issue: Import errors in backend tests

```
Cannot find module 'express'
```

**Solution:** Install backend dependencies:

```bash
npm install express bcrypt express-rate-limit supertest
```

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

## Next Steps

1. ✅ Run all tests: `npm test`
2. ✅ Check coverage: `npm run test:coverage`
3. ✅ Add more tests for new features
4. ✅ Keep coverage above 90%
5. ✅ Run tests before committing

---

**Last Updated:** 2026-09-20  
**Version:** 1.0  
**Total Tests:** 59 (46 frontend + 13 backend)
