document.getElementById('registrationForm').addEventListener('submit', function(event) {
  event.preventDefault();

  let username = document.getElementById('username').value.trim();
  let email = document.getElementById('email').value.trim();
  let password = document.getElementById('password').value;
  let confirmPassword = document.getElementById('confirmPassword').value;
  let terms = document.getElementById('terms').checked;

  let usernameError = document.getElementById('usernameError');
  let emailError = document.getElementById('emailError');
  let passwordError = document.getElementById('passwordError');
  let confirmPasswordError = document.getElementById('confirmPasswordError');
  let termsError = document.getElementById('termsError');
  let successMessage = document.getElementById('successMessage');

  let isValid = true;

  // Clear previous errors
  usernameError.textContent = '';
  emailError.textContent = '';
  passwordError.textContent = '';
  confirmPasswordError.textContent = '';
  termsError.textContent = '';

  // Username validation (3-20 chars, alphanumeric + underscore)
  const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernamePattern.test(username)) {
    usernameError.textContent = '❌ Username must be 3-20 characters (letters, numbers, underscore only)';
    isValid = false;
  }

  // Email validation
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailPattern.test(email)) {
    emailError.textContent = '❌ Please enter a valid email address';
    isValid = false;
  }

  // Password validation (min 8 chars, 1 uppercase, 1 number, 1 special char)
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordPattern.test(password)) {
    passwordError.textContent = '❌ Password must be 8+ chars with 1 uppercase, 1 number, 1 special char (@$!%*?&)';
    isValid = false;
  }

  // Password confirmation
  if (password !== confirmPassword) {
    confirmPasswordError.textContent = '❌ Passwords do not match';
    isValid = false;
  }

  // Terms validation
  if (!terms) {
    termsError.textContent = '❌ You must agree to the terms and conditions';
    isValid = false;
  }

  if (isValid) {
    // Log form data (for server integration)
    const formData = {
      username: username,
      email: email,
      password: password,
      timestamp: new Date().toISOString()
    };
    console.log('Registration Data:', formData);

    // Show success message
    successMessage.classList.remove('d-none');
    
    // Reset form
    document.getElementById('registrationForm').reset();

    // Hide success message after 5 seconds
    setTimeout(() => {
      successMessage.classList.add('d-none');
    }, 5000);

    // Uncomment below for server integration
    /*
    fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      // Redirect to login or dashboard
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Registration failed. Please try again.');
    });
    */
  }
});

// Clear errors on focus
document.getElementById('username').addEventListener('focus', function() {
  document.getElementById('usernameError').textContent = '';
});

document.getElementById('email').addEventListener('focus', function() {
  document.getElementById('emailError').textContent = '';
});

document.getElementById('password').addEventListener('focus', function() {
  document.getElementById('passwordError').textContent = '';
  updatePasswordStrength();
});

document.getElementById('password').addEventListener('input', function() {
  updatePasswordStrength();
});

document.getElementById('confirmPassword').addEventListener('focus', function() {
  document.getElementById('confirmPasswordError').textContent = '';
});

document.getElementById('terms').addEventListener('change', function() {
  document.getElementById('termsError').textContent = '';
});

// Password strength indicator
function updatePasswordStrength() {
  let password = document.getElementById('password').value;
  let strengthText = '';
  
  if (password.length === 0) return;
  
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[@$!%*?&]/.test(password)) strength++;
  
  switch(strength) {
    case 1:
    case 2:
      strengthText = '🔴 Weak password';
      break;
    case 3:
      strengthText = '🟡 Medium password';
      break;
    case 4:
      strengthText = '🟢 Strong password';
      break;
  }
  
  document.getElementById('passwordError').textContent = strengthText;
}
