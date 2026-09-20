// Validation utilities module
// Exported for testing

/**
 * Validates username format
 * @param {string} username - Username to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateUsername(username) {
  if (typeof username !== 'string') return false;
  const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
  return usernamePattern.test(username);
}

/**
 * Gets error message for invalid username
 * @param {string} username - Username to check
 * @returns {string} Error message or empty string
 */
function getUsernameError(username) {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 20) return 'Username must be at most 20 characters';
  if (!/^[a-zA-Z0-9_]*$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
  return '';
}

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateEmail(email) {
  if (typeof email !== 'string') return false;
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailPattern.test(email);
}

/**
 * Gets error message for invalid email
 * @param {string} email - Email to check
 * @returns {string} Error message or empty string
 */
function getEmailError(email) {
  if (!email) return 'Email is required';
  if (!email.includes('@')) return 'Email must contain @';
  if (!email.includes('.')) return 'Email must contain a domain';
  if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)) return 'Please enter a valid email address';
  return '';
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validatePassword(password) {
  if (typeof password !== 'string') return false;
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordPattern.test(password);
}

/**
 * Gets error message for invalid password
 * @param {string} password - Password to check
 * @returns {string} Error message or empty string
 */
function getPasswordError(password) {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (/\d/.test(password)) return 'Password must contain at least one number';
  if (!/[@$!%*?&]/.test(password)) return 'Password must contain at least one special character (@$!%*?&)';
  return '';
}

/**
 * Calculates password strength (1-4)
 * @param {string} password - Password to evaluate
 * @returns {object} {strength: number, label: string, color: string}
 */
function getPasswordStrength(password) {
  let strength = 0;
  let label = 'N/A';
  let color = 'gray';

  if (!password) return { strength: 0, label, color };

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[@$!%*?&]/.test(password)) strength++;

  switch(strength) {
    case 1:
    case 2:
      label = 'Weak';
      color = 'red';
      break;
    case 3:
      label = 'Medium';
      color = 'orange';
      break;
    case 4:
      label = 'Strong';
      color = 'green';
      break;
  }

  return { strength, label, color };
}

/**
 * Validates if two passwords match
 * @param {string} password - First password
 * @param {string} confirmPassword - Password confirmation
 * @returns {boolean} True if they match
 */
function validatePasswordMatch(password, confirmPassword) {
  if (typeof password !== 'string' || typeof confirmPassword !== 'string') return false;
  return password === confirmPassword && password.length > 0;
}

/**
 * Gets error message for password mismatch
 * @param {string} password - First password
 * @param {string} confirmPassword - Password confirmation
 * @returns {string} Error message or empty string
 */
function getPasswordMatchError(password, confirmPassword) {
  if (!confirmPassword) return 'Please confirm your password';
  if (!validatePasswordMatch(password, confirmPassword)) return 'Passwords do not match';
  return '';
}

/**
 * Validates terms checkbox
 * @param {boolean} isChecked - Terms checkbox state
 * @returns {boolean} True if checked
 */
function validateTerms(isChecked) {
  return isChecked === true;
}

/**
 * Gets error message for unchecked terms
 * @param {boolean} isChecked - Terms checkbox state
 * @returns {string} Error message or empty string
 */
function getTermsError(isChecked) {
  if (!isChecked) return 'You must agree to the terms and conditions';
  return '';
}

/**
 * Validates entire form
 * @param {object} formData - Form data object
 * @returns {object} {isValid: boolean, errors: {}}
 */
function validateForm(formData) {
  const errors = {};

  if (!validateUsername(formData.username)) {
    errors.username = getUsernameError(formData.username);
  }

  if (!validateEmail(formData.email)) {
    errors.email = getEmailError(formData.email);
  }

  if (!validatePassword(formData.password)) {
    errors.password = getPasswordError(formData.password);
  }

  if (!validatePasswordMatch(formData.password, formData.confirmPassword)) {
    errors.confirmPassword = getPasswordMatchError(formData.password, formData.confirmPassword);
  }

  if (!validateTerms(formData.terms)) {
    errors.terms = getTermsError(formData.terms);
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Export for Node.js/Jest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
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
  };
}
