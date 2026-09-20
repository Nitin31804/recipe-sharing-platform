// Tests for validation functions
const {
  validateUsername,
  getUsernameError,
  validateEmail,
  getEmailError,
  validatePassword,
  getPasswordError,
  getPasswordStrength,
  validatePasswordMatch,
  getPasswordMatchError,
  validateTerms,
  getTermsError,
  validateForm
} = require('../src/validation');

describe('Username Validation', () => {
  describe('validateUsername', () => {
    it('should accept valid usernames', () => {
      expect(validateUsername('john_doe')).toBe(true);
      expect(validateUsername('user123')).toBe(true);
      expect(validateUsername('alice_wonderland')).toBe(true);
      expect(validateUsername('abc')).toBe(true); // minimum 3 chars
    });

    it('should reject usernames that are too short', () => {
      expect(validateUsername('ab')).toBe(false);
      expect(validateUsername('a')).toBe(false);
      expect(validateUsername('')).toBe(false);
    });

    it('should reject usernames that are too long', () => {
      expect(validateUsername('abcdefghijklmnopqrstuv')).toBe(false); // 22 chars
    });

    it('should reject usernames with invalid characters', () => {
      expect(validateUsername('john-doe')).toBe(false);
      expect(validateUsername('john.doe')).toBe(false);
      expect(validateUsername('john doe')).toBe(false);
      expect(validateUsername('john@doe')).toBe(false);
      expect(validateUsername('john#doe')).toBe(false);
    });

    it('should reject non-string inputs', () => {
      expect(validateUsername(123)).toBe(false);
      expect(validateUsername(null)).toBe(false);
      expect(validateUsername(undefined)).toBe(false);
      expect(validateUsername({})).toBe(false);
    });

    it('should accept exactly 3 and 20 characters', () => {
      expect(validateUsername('abc')).toBe(true);
      expect(validateUsername('a'.repeat(20))).toBe(true);
    });
  });

  describe('getUsernameError', () => {
    it('should return empty string for valid username', () => {
      expect(getUsernameError('john_doe')).toBe('');
    });

    it('should return error for empty username', () => {
      expect(getUsernameError('')).toBe('Username is required');
    });

    it('should return error for username too short', () => {
      expect(getUsernameError('ab')).toBe('Username must be at least 3 characters');
    });

    it('should return error for username too long', () => {
      expect(getUsernameError('a'.repeat(21))).toBe('Username must be at most 20 characters');
    });

    it('should return error for invalid characters', () => {
      expect(getUsernameError('john-doe')).toBe('Username can only contain letters, numbers, and underscores');
    });
  });
});

describe('Email Validation', () => {
  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('john.doe@company.co.uk')).toBe(true);
      expect(validateEmail('alice-smith@domain.org')).toBe(true);
      expect(validateEmail('test+tag@mail.example.com')).toBe(true);
    });

    it('should reject emails without @', () => {
      expect(validateEmail('userexample.com')).toBe(false);
    });

    it('should reject emails without domain', () => {
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });

    it('should reject emails with invalid format', () => {
      expect(validateEmail('user@domain')).toBe(false);
      expect(validateEmail('user name@example.com')).toBe(false);
      expect(validateEmail('user..doe@example.com')).toBe(false);
    });

    it('should reject non-string inputs', () => {
      expect(validateEmail(123)).toBe(false);
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
    });

    it('should accept emails with multiple dots', () => {
      expect(validateEmail('first.last@sub.domain.co.uk')).toBe(true);
    });
  });

  describe('getEmailError', () => {
    it('should return empty string for valid email', () => {
      expect(getEmailError('user@example.com')).toBe('');
    });

    it('should return error for empty email', () => {
      expect(getEmailError('')).toBe('Email is required');
    });

    it('should return error for email without @', () => {
      expect(getEmailError('userexample.com')).toBe('Email must contain @');
    });

    it('should return error for email without domain', () => {
      expect(getEmailError('user@')).toBe('Email must contain a domain');
    });

    it('should return error for invalid email format', () => {
      expect(getEmailError('user@domain')).toBe('Please enter a valid email address');
    });
  });
});

describe('Password Validation', () => {
  describe('validatePassword', () => {
    it('should accept strong passwords', () => {
      expect(validatePassword('SecurePass123!')).toBe(true);
      expect(validatePassword('MyPassword1@')).toBe(true);
      expect(validatePassword('Test@1234')).toBe(true);
    });

    it('should reject passwords that are too short', () => {
      expect(validatePassword('Short1!')).toBe(false); // 7 chars
      expect(validatePassword('Pass1!')).toBe(false); // 6 chars
    });

    it('should reject passwords without uppercase letter', () => {
      expect(validatePassword('password123!')).toBe(false);
    });

    it('should reject passwords without number', () => {
      expect(validatePassword('Password!')).toBe(false);
    });

    it('should reject passwords without special character', () => {
      expect(validatePassword('Password1')).toBe(false);
    });

    it('should reject non-string inputs', () => {
      expect(validatePassword(123)).toBe(false);
      expect(validatePassword(null)).toBe(false);
      expect(validatePassword(undefined)).toBe(false);
    });

    it('should accept exactly 8 characters with all requirements', () => {
      expect(validatePassword('Pass1@ab')).toBe(true); // exactly 8 chars
    });

    it('should accept special characters @$!%*?&', () => {
      expect(validatePassword('Password1@')).toBe(true);
      expect(validatePassword('Password1$')).toBe(true);
      expect(validatePassword('Password1!')).toBe(true);
      expect(validatePassword('Password1%')).toBe(true);
      expect(validatePassword('Password1*')).toBe(true);
      expect(validatePassword('Password1?')).toBe(true);
      expect(validatePassword('Password1&')).toBe(true);
    });
  });

  describe('getPasswordError', () => {
    it('should return empty string for valid password', () => {
      expect(getPasswordError('SecurePass123!')).toBe('');
    });

    it('should return error for empty password', () => {
      expect(getPasswordError('')).toBe('Password is required');
    });

    it('should return error for password too short', () => {
      expect(getPasswordError('Short1!')).toBe('Password must be at least 8 characters');
    });

    it('should return error for missing uppercase', () => {
      expect(getPasswordError('password123!')).toBe('Password must contain at least one uppercase letter');
    });

    it('should return error for missing number', () => {
      expect(getPasswordError('Password!')).toBe('Password must contain at least one number');
    });

    it('should return error for missing special character', () => {
      expect(getPasswordError('Password1')).toBe('Password must contain at least one special character (@$!%*?&)');
    });
  });
});

describe('Password Strength Meter', () => {
  describe('getPasswordStrength', () => {
    it('should return 0 strength for empty password', () => {
      const result = getPasswordStrength('');
      expect(result.strength).toBe(0);
      expect(result.label).toBe('N/A');
    });

    it('should return weak strength (1-2)', () => {
      const weak1 = getPasswordStrength('password');
      expect(weak1.strength).toBeLessThanOrEqual(2);
      expect(weak1.label).toBe('Weak');

      const weak2 = getPasswordStrength('Pass');
      expect(weak2.label).toBe('Weak');
    });

    it('should return medium strength (3)', () => {
      const medium = getPasswordStrength('Pass1234');
      expect(medium.strength).toBe(3);
      expect(medium.label).toBe('Medium');
    });

    it('should return strong strength (4)', () => {
      const strong = getPasswordStrength('Pass1234!');
      expect(strong.strength).toBe(4);
      expect(strong.label).toBe('Strong');
    });

    it('should have correct color codes', () => {
      expect(getPasswordStrength('pass').color).toBe('red');
      expect(getPasswordStrength('Pass1234').color).toBe('orange');
      expect(getPasswordStrength('Pass1234!').color).toBe('green');
    });
  });
});

describe('Password Match Validation', () => {
  describe('validatePasswordMatch', () => {
    it('should accept matching passwords', () => {
      expect(validatePasswordMatch('SecurePass123!', 'SecurePass123!')).toBe(true);
    });

    it('should reject non-matching passwords', () => {
      expect(validatePasswordMatch('Password1!', 'Password2!')).toBe(false);
    });

    it('should reject empty passwords', () => {
      expect(validatePasswordMatch('', '')).toBe(false);
      expect(validatePasswordMatch('Password1!', '')).toBe(false);
    });

    it('should reject non-string inputs', () => {
      expect(validatePasswordMatch(123, 123)).toBe(false);
      expect(validatePasswordMatch(null, null)).toBe(false);
      expect(validatePasswordMatch(undefined, undefined)).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(validatePasswordMatch('Password1!', 'password1!')).toBe(false);
    });
  });

  describe('getPasswordMatchError', () => {
    it('should return empty string for matching passwords', () => {
      expect(getPasswordMatchError('SecurePass123!', 'SecurePass123!')).toBe('');
    });

    it('should return error for empty confirmation', () => {
      expect(getPasswordMatchError('SecurePass123!', '')).toBe('Please confirm your password');
    });

    it('should return error for non-matching passwords', () => {
      expect(getPasswordMatchError('Password1!', 'Password2!')).toBe('Passwords do not match');
    });
  });
});

describe('Terms Validation', () => {
  describe('validateTerms', () => {
    it('should accept checked terms', () => {
      expect(validateTerms(true)).toBe(true);
    });

    it('should reject unchecked terms', () => {
      expect(validateTerms(false)).toBe(false);
    });

    it('should reject non-boolean inputs', () => {
      expect(validateTerms(1)).toBe(false);
      expect(validateTerms('true')).toBe(false);
      expect(validateTerms(null)).toBe(false);
      expect(validateTerms(undefined)).toBe(false);
    });
  });

  describe('getTermsError', () => {
    it('should return empty string for checked terms', () => {
      expect(getTermsError(true)).toBe('');
    });

    it('should return error for unchecked terms', () => {
      expect(getTermsError(false)).toBe('You must agree to the terms and conditions');
    });
  });
});

describe('Full Form Validation', () => {
  it('should validate a complete valid form', () => {
    const validForm = {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      terms: true
    };

    const result = validateForm(validForm);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('should detect multiple errors', () => {
    const invalidForm = {
      username: 'ab',
      email: 'not-an-email',
      password: 'weak',
      confirmPassword: 'weak2',
      terms: false
    };

    const result = validateForm(invalidForm);
    expect(result.isValid).toBe(false);
    expect(result.errors.username).toBeDefined();
    expect(result.errors.email).toBeDefined();
    expect(result.errors.password).toBeDefined();
    expect(result.errors.confirmPassword).toBeDefined();
    expect(result.errors.terms).toBeDefined();
  });

  it('should handle partial validation', () => {
    const partialForm = {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'DifferentPass123!',
      terms: true
    };

    const result = validateForm(partialForm);
    expect(result.isValid).toBe(false);
    expect(result.errors.confirmPassword).toBeDefined();
    expect(result.errors.username).toBeUndefined();
  });
});
