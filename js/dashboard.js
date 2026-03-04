/**
 * NexaFlow — Dashboard JavaScript
 * Handles real-time updates, charts, and interactivity
 */

(function () {
  'use strict';

  /* =============================================
     CHART PERIOD BUTTONS
  ============================================= */
  document.querySelectorAll('.chart-period-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      this.closest('.dash-chart-controls').querySelectorAll('.chart-period-btn')
          .forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  /* =============================================
     SIDEBAR LINK ACTIVE STATE
  ============================================= */
  document.querySelectorAll('.sidebar-link').forEach((link) => {
    link.addEventListener('click', function () {
      document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });

  /* =============================================
     KPI COUNTER ANIMATION
  ============================================= */
  function animateValue(el, from, to, duration = 1500) {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;

      // Format
      if (to >= 1000000) {
        el.textContent = (current / 1000000).toFixed(1) + 'M';
      } else if (to >= 1000) {
        el.textContent = Math.round(current / 1000) + 'K';
      } else {
        el.textContent = Math.round(current).toLocaleString();
      }

      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // Animate KPI values on load
  setTimeout(() => {
    const kpis = [
      { selector: '.kpi-value', values: ['2,418,332', '24', '12', '4.2ms'] },
    ];

    document.querySelectorAll('.kpi-card').forEach((card, i) => {
      const valueEl = card.querySelector('.kpi-value');
      if (!valueEl) return;
      const originalText = valueEl.textContent;
      valueEl.style.opacity = '0';
      valueEl.style.transition = 'opacity 0.3s ease';

      setTimeout(() => {
        valueEl.style.opacity = '1';
      }, i * 150);
    });
  }, 300);

  /* =============================================
     LIVE METRICS UPDATE SIMULATION
  ============================================= */
  function randomBetween(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  // Simulate live counter ticking up
  const executionKpi = document.querySelector('.kpi-card:first-child .kpi-value');
  if (executionKpi) {
    let base = 2418332;
    setInterval(() => {
      base += randomBetween(1, 50);
      executionKpi.textContent = base.toLocaleString();
    }, 3000);
  }

  /* =============================================
     TABLE ROW INTERACTION
  ============================================= */
  document.querySelectorAll('.dash-table tbody tr').forEach((row) => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
      // Highlight selected row
      document.querySelectorAll('.dash-table tbody tr').forEach(r => {
        r.style.background = '';
      });
      row.style.background = 'rgba(0,245,255,0.04)';
    });
  });

  /* =============================================
     QUICK ACTION BUTTONS
  ============================================= */
  document.querySelectorAll('.quick-action-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      // Pulse animation
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  });

  /* =============================================
     SEARCH SHORTCUT
  ============================================= */
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.querySelector('.dash-search-input');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
  });

  /* =============================================
     USAGE BAR ANIMATION
  ============================================= */
  setTimeout(() => {
    document.querySelectorAll('.usage-bar-fill').forEach((bar) => {
      const targetWidth = bar.style.width;
      bar.style.width = '0%';
      bar.style.transition = 'width 1.2s cubic-bezier(0.4,0,0.2,1)';
      setTimeout(() => {
        bar.style.width = targetWidth;
      }, 100);
    });
  }, 500);

  /* =============================================
     NOTIFICATION BUTTON
  ============================================= */
  const notifBtn = document.querySelector('.dash-icon-btn');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      const dot = notifBtn.querySelector('.notif-dot');
      if (dot) dot.style.display = 'none';
    });
  }

  /* =============================================
     AGENT STATUS LIVE UPDATES
  ============================================= */
  const agentDots = document.querySelectorAll('.agent-status-dot.active');
  agentDots.forEach((dot, i) => {
    setInterval(() => {
      // Occasional blink to simulate live activity
      dot.style.opacity = '0.4';
      setTimeout(() => {
        dot.style.opacity = '1';
      }, 200);
    }, 3000 + i * 1000);
  });

})();
