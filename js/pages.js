/**
 * NexaFlow — Pages JavaScript
 * Shared logic for all inner pages
 */

(function () {
  'use strict';

  /* =============================================
     TAB SWITCHING (features, blog, integrations)
  ============================================= */
  function initTabs(tabsContainerId, contentPrefix) {
    const container = document.getElementById(tabsContainerId);
    if (!container) return;

    container.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        // Update active button
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const tab = this.dataset.tab || this.textContent.trim().toLowerCase().replace(/\s+/g, '-');

        // Hide all tab content
        document.querySelectorAll('.feature-tab-content').forEach(el => el.classList.add('hidden'));

        // Show selected
        const target = document.getElementById(`tab-${tab}`);
        if (target) {
          target.classList.remove('hidden');
          target.style.animation = 'fadeIn 0.3s ease';
        }
      });
    });
  }

  initTabs('featureTabs', 'tab');

  /* =============================================
     INTEGRATION CATEGORY FILTER
  ============================================= */
  const integrationTabs = document.getElementById('integrationTabs');
  if (integrationTabs) {
    integrationTabs.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        integrationTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const category = this.dataset.category;
        const cards = document.querySelectorAll('.integration-card');

        cards.forEach((card) => {
          if (category === 'all' || card.dataset.category === category) {
            card.style.display = '';
            card.style.animation = 'fadeInUp 0.3s ease forwards';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* =============================================
     INTEGRATION SEARCH
  ============================================= */
  const searchInput = document.getElementById('integrationSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const query = this.value.toLowerCase().trim();
      document.querySelectorAll('.integration-card').forEach((card) => {
        const name = card.querySelector('.integration-name')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.integration-desc')?.textContent.toLowerCase() || '';
        const cat  = card.querySelector('.integration-category')?.textContent.toLowerCase() || '';
        const match = name.includes(query) || desc.includes(query) || cat.includes(query);
        card.style.display = match ? '' : 'none';
      });
    });
  }

  /* =============================================
     FAQ ACCORDION
  ============================================= */
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', function () {
      const item = this.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

      // Toggle current
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  /* =============================================
     DOCS SIDEBAR ACTIVE LINK (scroll-based)
  ============================================= */
  const docsSidebarLinks = document.querySelectorAll('.docs-sidebar-link');
  if (docsSidebarLinks.length) {
    const headings = document.querySelectorAll('.docs-content h1, .docs-content h2, .docs-content h3');

    const docObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          docsSidebarLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    headings.forEach(h => docObserver.observe(h));
  }

  /* =============================================
     CODE BLOCK COPY
  ============================================= */
  window.copyCode = function (btn) {
    const pre = btn.closest('.code-block').querySelector('pre');
    if (!pre) return;
    const text = pre.textContent;
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = 'Copied!';
      btn.style.color = 'var(--color-neon-green)';
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.style.color = '';
      }, 2000);
    });
  };

  /* =============================================
     PRICING TOGGLE
  ============================================= */
  const billingToggle = document.getElementById('billingToggle');
  const monthlyLabel  = document.getElementById('monthlyLabel');
  const annualLabel   = document.getElementById('annualLabel');
  let isAnnual = false;

  if (billingToggle) {
    billingToggle.addEventListener('click', () => {
      isAnnual = !isAnnual;
      billingToggle.setAttribute('aria-checked', isAnnual.toString());

      if (monthlyLabel) monthlyLabel.classList.toggle('active', !isAnnual);
      if (annualLabel) annualLabel.classList.toggle('active', isAnnual);

      document.querySelectorAll('.price-amount[data-monthly]').forEach((el) => {
        const val = isAnnual ? parseInt(el.dataset.annual) : parseInt(el.dataset.monthly);
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.2s';
        setTimeout(() => {
          el.textContent = val;
          el.style.opacity = '1';
        }, 200);
      });
    });
  }

  /* =============================================
     SCROLL REVEAL for inner pages
  ============================================= */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll(
    '.feature-detail-card, .team-card, .value-card, .compliance-badge, .tcc-item, .blog-card, .integration-card, .faq-item, .timeline-card, .about-stat'
  ).forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`;
    revealObserver.observe(el);
  });

  /* =============================================
     NAVBAR SCROLL STATE
  ============================================= */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* =============================================
     ANALYTICS BAR ANIMATION (features page)
  ============================================= */
  setTimeout(() => {
    document.querySelectorAll('.am-fill').forEach((bar) => {
      const w = bar.style.width;
      bar.style.width = '0';
      bar.style.transition = 'width 1.2s cubic-bezier(0.4,0,0.2,1)';
      setTimeout(() => { bar.style.width = w; }, 200);
    });
  }, 600);

  /* =============================================
     BLOG TABS
  ============================================= */
  document.querySelectorAll('.tab-nav:not(#featureTabs):not(#integrationTabs) .tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      this.closest('.tab-nav').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  /* =============================================
     AUDIT LOG — live animation (features security tab)
  ============================================= */
  const auditLog = document.querySelector('.audit-log');
  if (auditLog) {
    const entries = [
      { time: '', action: 'EXECUTE', cls: 'success', detail: 'workflow:lead-enrichment completed' },
      { time: '', action: 'READ',    cls: 'info',    detail: 'integration:github token refreshed' },
      { time: '', action: 'LOGIN',   cls: 'success', detail: 'SSO login — user: dev@company.com' },
    ];
    let idx = 0;

    setInterval(() => {
      const now = new Date();
      const t = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
      const e = entries[idx % entries.length];
      idx++;

      const el = document.createElement('div');
      el.className = 'audit-entry';
      el.style.animation = 'fadeInUp 0.3s ease';
      el.innerHTML = `
        <span class="audit-time">${t}</span>
        <span class="audit-action ${e.cls}">${e.action}</span>
        <span class="audit-detail">${e.detail}</span>
      `;
      auditLog.prepend(el);

      const all = auditLog.querySelectorAll('.audit-entry');
      if (all.length > 8) all[all.length - 1].remove();
    }, 4000);
  }

})();
