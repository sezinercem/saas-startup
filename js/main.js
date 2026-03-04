/**
 * NexaFlow — Main Landing Page JavaScript
 * Handles animations, interactions, and dynamic content
 */

(function () {
  'use strict';

  /* =============================================
     NAVBAR
  ============================================= */
  const navbar = document.getElementById('navbar');

  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* =============================================
     INTERSECTION OBSERVER — Reveal on scroll
  ============================================= */
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fadeInUp');
        entry.target.classList.remove('opacity-0');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements with reveal class
  document.querySelectorAll('.feature-card, .step, .testimonial-card, .stat-card, .pricing-card').forEach((el, i) => {
    el.style.animationDelay = `${i * 0.08}s`;
    el.classList.add('opacity-0');
    observer.observe(el);
  });

  /* =============================================
     COUNT-UP ANIMATION
  ============================================= */
  function animateCountUp(el, target, duration = 2000) {
    const start = Date.now();
    const startVal = 0;

    function formatNumber(n) {
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
      if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
      return n.toFixed(0);
    }

    function tick() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (target - startVal) * eased);
      el.textContent = formatNumber(current);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = formatNumber(target);
      }
    }

    tick();
  }

  // Trigger count-up when stats section is visible
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.count-up').forEach((el) => {
          const target = parseInt(el.dataset.target, 10);
          if (!isNaN(target)) {
            animateCountUp(el, target);
          }
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) statsObserver.observe(statsSection);

  /* =============================================
     PRICING TOGGLE
  ============================================= */
  const billingToggle = document.getElementById('billingToggle');
  const monthlyLabel = document.getElementById('monthlyLabel');
  const annualLabel = document.getElementById('annualLabel');
  const priceAmounts = document.querySelectorAll('.price-amount[data-monthly]');

  let isAnnual = false;

  if (billingToggle) {
    billingToggle.addEventListener('click', () => {
      isAnnual = !isAnnual;
      billingToggle.setAttribute('aria-checked', isAnnual.toString());

      if (monthlyLabel) monthlyLabel.classList.toggle('active', !isAnnual);
      if (annualLabel) annualLabel.classList.toggle('active', isAnnual);

      priceAmounts.forEach((el) => {
        const monthly = el.dataset.monthly;
        const annual = el.dataset.annual;
        const target = isAnnual ? parseInt(annual) : parseInt(monthly);

        // Animate price change
        el.style.transition = 'opacity 0.2s ease';
        el.style.opacity = '0';
        setTimeout(() => {
          el.textContent = target;
          el.style.opacity = '1';
        }, 200);
      });
    });
  }

  /* =============================================
     WATCH DEMO MODAL (simple)
  ============================================= */
  const watchDemoBtn = document.getElementById('watchDemoBtn');

  if (watchDemoBtn) {
    watchDemoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('🎬 Demo video coming soon! Sign up to get early access.', 'info');
    });
  }

  /* =============================================
     TOAST NOTIFICATIONS
  ============================================= */
  function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';

    const colors = {
      info:    { bg: 'rgba(0,245,255,0.1)',   border: 'rgba(0,245,255,0.3)',   color: '#00f5ff' },
      success: { bg: 'rgba(0,255,135,0.1)',   border: 'rgba(0,255,135,0.3)',   color: '#00ff87' },
      error:   { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   color: '#ef4444' },
    };

    const style = colors[type] || colors.info;
    toast.style.cssText = `
      background: ${style.bg};
      border-color: ${style.border};
      color: ${style.color};
    `;

    toast.innerHTML = `
      <span style="font-size:1rem">${message.split(' ')[0]}</span>
      <span style="color: var(--color-text-secondary); font-size: 0.875rem">${message.split(' ').slice(1).join(' ')}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /* =============================================
     CHART PERIOD BUTTONS
  ============================================= */
  document.querySelectorAll('.chart-period-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      this.closest('.dash-chart-controls').querySelectorAll('.chart-period-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  /* =============================================
     SMOOTH SCROLL for nav links
  ============================================= */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* =============================================
     MOBILE NAV TOGGLE
  ============================================= */
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navLinks.style.display === 'flex';
      navLinks.style.display = isOpen ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '70px';
      navLinks.style.left = '0';
      navLinks.style.right = '0';
      navLinks.style.background = 'rgba(2, 5, 16, 0.98)';
      navLinks.style.padding = '1rem';
      navLinks.style.borderBottom = '1px solid rgba(0,245,255,0.1)';
      mobileToggle.setAttribute('aria-expanded', (!isOpen).toString());
    });
  }

  /* =============================================
     HERO FLOATING CARDS — parallax
  ============================================= */
  const floatingCards = document.querySelectorAll('.floating-card');

  if (floatingCards.length) {
    window.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;

      floatingCards.forEach((card, i) => {
        const factor = (i + 1) * 8;
        card.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
      });
    }, { passive: true });
  }

  /* =============================================
     CURSOR GLOW EFFECT
  ============================================= */
  const cursorGlow = document.createElement('div');
  cursorGlow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,245,255,0.04) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
  `;
  document.body.appendChild(cursorGlow);

  let cursorX = 0, cursorY = 0;
  let glowX = 0, glowY = 0;

  window.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
  }, { passive: true });

  function animateCursor() {
    glowX += (cursorX - glowX) * 0.08;
    glowY += (cursorY - glowY) * 0.08;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  /* =============================================
     TYPEWRITER EFFECT — hero subtitle (optional)
  ============================================= */
  function typewriter(el, text, speed = 40) {
    el.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
  }

  /* =============================================
     EXPOSE utilities globally
  ============================================= */
  window.NexaFlow = {
    showToast,
    typewriter,
    animateCountUp,
  };

})();
