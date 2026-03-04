/**
 * NexaFlow — Auth Page JavaScript
 * Handles login and signup form validation and interactions
 */

(function () {
  'use strict';

  /* =============================================
     PASSWORD TOGGLE
  ============================================= */
  function initPasswordToggle(toggleId, inputId) {
    const btn = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      btn.innerHTML = isPassword
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
          </svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>`;
    });
  }

  initPasswordToggle('togglePassword', 'password');
  initPasswordToggle('toggleSignupPassword', 'signupPassword');

  /* =============================================
     PASSWORD STRENGTH METER
  ============================================= */
  const signupPassword = document.getElementById('signupPassword');
  const strengthBar = document.getElementById('strengthBar');
  const strengthLabel = document.getElementById('strengthLabel');

  function getPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }

  if (signupPassword && strengthBar) {
    signupPassword.addEventListener('input', () => {
      const val = signupPassword.value;
      const score = val.length === 0 ? 0 : getPasswordStrength(val);
      const segments = strengthBar.querySelectorAll('.strength-segment');

      segments.forEach((seg, i) => {
        seg.className = 'strength-segment';
        if (i < score) {
          seg.classList.add('active');
          if (score <= 2) seg.classList.add('weak');
          else if (score <= 3) seg.classList.add('medium');
          else seg.classList.add('strong');
        }
      });

      if (strengthLabel) {
        if (val.length === 0) {
          strengthLabel.textContent = '';
          strengthLabel.style.color = '';
        } else if (score <= 2) {
          strengthLabel.textContent = 'Weak — add numbers and symbols';
          strengthLabel.style.color = '#ef4444';
        } else if (score <= 3) {
          strengthLabel.textContent = 'Medium — add uppercase letters';
          strengthLabel.style.color = '#f59e0b';
        } else {
          strengthLabel.textContent = 'Strong password!';
          strengthLabel.style.color = '#00ff87';
        }
      }
    });
  }

  /* =============================================
     LOGIN FORM VALIDATION
  ============================================= */
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailEl = document.getElementById('email');
      const passwordEl = document.getElementById('password');
      let valid = true;

      // Email
      clearError('emailError');
      if (!emailEl.value.trim()) {
        showError('emailError', 'Email is required');
        valid = false;
      } else if (!isValidEmail(emailEl.value)) {
        showError('emailError', 'Please enter a valid email address');
        valid = false;
      }

      // Password
      clearError('passwordError');
      if (!passwordEl.value) {
        showError('passwordError', 'Password is required');
        valid = false;
      }

      if (valid) {
        simulateLogin();
      }
    });
  }

  function simulateLogin() {
    const btn = document.getElementById('loginBtn');
    if (!btn) return;
    btn.classList.add('loading');
    btn.disabled = true;

    setTimeout(() => {
      btn.classList.remove('loading');
      btn.disabled = false;
      // Redirect to dashboard
      window.location.href = 'dashboard.html';
    }, 1800);
  }

  /* =============================================
     SIGNUP FORM VALIDATION
  ============================================= */
  const signupForm = document.getElementById('signupForm');

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      const firstNameEl  = document.getElementById('firstName');
      const lastNameEl   = document.getElementById('lastName');
      const emailEl      = document.getElementById('signupEmail');
      const passwordEl   = document.getElementById('signupPassword');
      const confirmEl    = document.getElementById('confirmPassword');
      const termsEl      = document.getElementById('terms');

      // Clear errors
      ['signupEmailError', 'signupPasswordError', 'confirmPasswordError', 'termsError'].forEach(clearError);

      // Email
      if (!emailEl || !emailEl.value.trim()) {
        showError('signupEmailError', 'Work email is required');
        valid = false;
      } else if (!isValidEmail(emailEl.value)) {
        showError('signupEmailError', 'Please enter a valid email address');
        valid = false;
      }

      // Password
      if (!passwordEl || !passwordEl.value) {
        showError('signupPasswordError', 'Password is required');
        valid = false;
      } else if (passwordEl.value.length < 8) {
        showError('signupPasswordError', 'Password must be at least 8 characters');
        valid = false;
      }

      // Confirm password
      if (confirmEl && passwordEl && confirmEl.value !== passwordEl.value) {
        showError('confirmPasswordError', 'Passwords do not match');
        valid = false;
      }

      // Terms
      if (termsEl && !termsEl.checked) {
        showError('termsError', 'You must agree to the Terms of Service');
        valid = false;
      }

      if (valid) {
        simulateSignup();
      }
    });
  }

  function simulateSignup() {
    const btn = document.getElementById('signupBtn');
    if (!btn) return;
    btn.classList.add('loading');
    btn.disabled = true;

    setTimeout(() => {
      btn.classList.remove('loading');
      btn.disabled = false;
      window.location.href = 'dashboard.html';
    }, 2000);
  }

  /* =============================================
     REAL-TIME INPUT VALIDATION
  ============================================= */
  // Email validation on blur
  ['email', 'signupEmail'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => {
      const errorId = id === 'email' ? 'emailError' : 'signupEmailError';
      if (el.value && !isValidEmail(el.value)) {
        showError(errorId, 'Please enter a valid email address');
      } else {
        clearError(errorId);
      }
    });
  });

  // Confirm password real-time
  const confirmPassword = document.getElementById('confirmPassword');
  const signupPasswordEl = document.getElementById('signupPassword');

  if (confirmPassword && signupPasswordEl) {
    confirmPassword.addEventListener('input', () => {
      if (confirmPassword.value && confirmPassword.value !== signupPasswordEl.value) {
        showError('confirmPasswordError', 'Passwords do not match');
      } else {
        clearError('confirmPasswordError');
      }
    });
  }

  /* =============================================
     HELPERS
  ============================================= */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(id, message) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0">
        <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      ${message}
    `;
    const input = el.previousElementSibling?.querySelector('input') ||
                  el.closest('.form-group')?.querySelector('input');
    if (input) {
      input.style.borderColor = '#ef4444';
      input.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)';
    }
  }

  function clearError(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = '';
    const input = el.previousElementSibling?.querySelector('input') ||
                  el.closest('.form-group')?.querySelector('input');
    if (input) {
      input.style.borderColor = '';
      input.style.boxShadow = '';
    }
  }

  /* =============================================
     SOCIAL AUTH BUTTONS — hover effect
  ============================================= */
  document.querySelectorAll('.social-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Ripple effect
      const ripple = document.createElement('span');
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255,255,255,0.1);
        width: ${size}px;
        height: ${size}px;
        top: ${e.clientY - rect.top - size/2}px;
        left: ${e.clientX - rect.left - size/2}px;
        transform: scale(0);
        animation: ripple 0.6s ease-out forwards;
        pointer-events: none;
      `;
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Add ripple keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to { transform: scale(2.5); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  /* =============================================
     RECENT SIGNUPS — animate cycling
  ============================================= */
  const recentNames = [
    { initials: 'A', name: 'Alex from Stripe',   time: '2 minutes ago',  colors: ['#00f5ff', '#0080ff'] },
    { initials: 'S', name: 'Sophie from Linear',  time: '5 minutes ago',  colors: ['#8b5cf6', '#ec4899'] },
    { initials: 'M', name: 'Marcus from Vercel',  time: '11 minutes ago', colors: ['#00ff87', '#00b4d8'] },
    { initials: 'R', name: 'Raj from AWS',        time: '18 minutes ago', colors: ['#f59e0b', '#ef4444'] },
    { initials: 'L', name: 'Lena from Figma',     time: '24 minutes ago', colors: ['#ec4899', '#8b5cf6'] },
    { initials: 'K', name: 'Kai from GitHub',     time: '31 minutes ago', colors: ['#00f5ff', '#8b5cf6'] },
  ];

  let signupCursor = 0;
  const signupList = document.getElementById('recentSignups');

  if (signupList) {
    setInterval(() => {
      const item = recentNames[signupCursor % recentNames.length];
      signupCursor++;

      const el = document.createElement('div');
      el.className = 'recent-signup-item';
      el.style.animation = 'fadeInUp 0.4s ease';
      el.innerHTML = `
        <div class="rs-avatar" style="background:linear-gradient(135deg,${item.colors[0]},${item.colors[1]})">${item.initials}</div>
        <div class="rs-info">
          <div class="rs-name">${item.name}</div>
          <div class="rs-time">Just now</div>
        </div>
      `;

      signupList.prepend(el);

      // Remove last if > 3
      const items = signupList.querySelectorAll('.recent-signup-item');
      if (items.length > 3) {
        items[items.length - 1].remove();
      }
    }, 8000);
  }

  /* =============================================
     INPUT FOCUS ANIMATIONS
  ============================================= */
  document.querySelectorAll('.form-input').forEach((input) => {
    input.addEventListener('focus', () => {
      const wrapper = input.closest('.input-wrapper');
      if (wrapper) {
        wrapper.style.transition = 'transform 0.2s ease';
        wrapper.style.transform = 'scale(1.01)';
      }
    });

    input.addEventListener('blur', () => {
      const wrapper = input.closest('.input-wrapper');
      if (wrapper) {
        wrapper.style.transform = '';
      }
    });
  });

})();
