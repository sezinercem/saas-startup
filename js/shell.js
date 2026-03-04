/**
 * NexaFlow — Dashboard Shell
 * Handles auth guard, sidebar injection, logout, and toast notifications.
 * Include on every dashboard page AFTER supabase-client.js.
 */
(async function () {
  // ── Auth guard ──────────────────────────────────────────────────
  const session = await window.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  const user = session.user;
  window.__currentUser = user;

  // Load profile
  const { data: profile } = await window.sb.from('profiles').select('*').eq('id', user.id).single();
  window.__profile = profile;

  // ── Sidebar HTML ────────────────────────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';

  function navLink(href, iconPath, label) {
    const active = currentPage === href ? 'active' : '';
    return `
      <a href="${href}" class="sidebar-link ${active}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${iconPath}</svg>
        ${label}
      </a>`;
  }

  const logoSVG = `
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
      <path d="M16 2L28 8V16C28 22.627 22.627 28 16 28C9.373 28 4 22.627 4 16V8L16 2Z" stroke="url(#sg)" stroke-width="2" fill="none"/>
      <circle cx="16" cy="16" r="4" fill="url(#sg2)"/>
      <path d="M16 8V12M16 20V24M8 16H12M20 16H24" stroke="url(#sg)" stroke-width="1.5" stroke-linecap="round"/>
      <defs>
        <linearGradient id="sg" x1="4" y1="2" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stop-color="#00f5ff"/><stop offset="1" stop-color="#8b5cf6"/>
        </linearGradient>
        <linearGradient id="sg2" x1="12" y1="12" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stop-color="#00f5ff"/><stop offset="1" stop-color="#0080ff"/>
        </linearGradient>
      </defs>
    </svg>`;

  const initials = profile?.avatar_initials || (profile?.full_name || user.email || 'U').slice(0, 2).toUpperCase();
  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User';
  const displayRole = profile?.role || 'Admin';

  const sidebarHTML = `
    <aside class="dash-sidebar" id="dash-sidebar">
      <div class="dash-sidebar-logo">
        <div class="sidebar-logo-icon">${logoSVG}</div>
        <span class="sidebar-logo-text">NexaFlow</span>
      </div>
      <nav class="dash-sidebar-nav">
        <div class="sidebar-nav-section">
          <div class="sidebar-nav-label">Main</div>
          ${navLink('dashboard.html', '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>', 'Overview')}
          ${navLink('dashboard-workflows.html', '<path d="M8 6h8M8 12h5M8 18h3"/><rect x="3" y="3" width="18" height="18" rx="2"/>', 'Workflows')}
          ${navLink('dashboard-agents.html', '<circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M18 8l2 2-2 2"/>', 'AI Agents')}
          ${navLink('dashboard-executions.html', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>', 'Executions')}
          ${navLink('dashboard-analytics.html', '<path d="M3 20h18M5 20V12l7-7 7 7v8"/>', 'Analytics')}
        </div>
        <div class="sidebar-nav-section">
          <div class="sidebar-nav-label">Configure</div>
          ${navLink('dashboard-integrations.html', '<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>', 'Integrations')}
          ${navLink('dashboard-team.html', '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>', 'Team')}
          ${navLink('dashboard-settings.html', '<path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>', 'Settings')}
        </div>
      </nav>
      <div class="sidebar-user">
        <div class="sidebar-user-avatar" style="background:linear-gradient(135deg,#00f5ff,#0080ff)">${initials}</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${displayName}</div>
          <div class="sidebar-user-role">${displayRole}</div>
        </div>
        <button id="logout-btn" title="Sign out" style="background:none;border:none;cursor:pointer;opacity:0.4;color:var(--color-text-muted);margin-left:auto;padding:4px;transition:opacity 0.2s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>`;

  // Inject sidebar
  const layout = document.querySelector('.dash-layout');
  if (layout) {
    layout.insertAdjacentHTML('afterbegin', sidebarHTML);
  }

  // ── Logout ──────────────────────────────────────────────────────
  document.addEventListener('click', async function (e) {
    if (e.target.closest('#logout-btn')) {
      await window.sb.auth.signOut();
      window.location.href = 'login.html';
    }
  });

  // ── Toast notifications ─────────────────────────────────────────
  window.showToast = function (message, type = 'info') {
    const colors = {
      success: { bg: 'rgba(0,255,135,0.1)', border: 'rgba(0,255,135,0.25)', text: '#00ff87' },
      error:   { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', text: '#ef4444' },
      info:    { bg: 'rgba(0,245,255,0.1)', border: 'rgba(0,245,255,0.25)', text: '#00f5ff' },
      warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', text: '#f59e0b' },
    };
    const c = colors[type] || colors.info;

    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;top:1.25rem;right:1.25rem;z-index:9999;display:flex;flex-direction:column;gap:0.5rem;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `background:${c.bg};border:1px solid ${c.border};color:${c.text};padding:0.75rem 1.25rem;border-radius:10px;font-size:0.85rem;font-weight:500;backdrop-filter:blur(20px);box-shadow:0 4px 24px rgba(0,0,0,0.3);transform:translateX(120%);transition:transform 0.3s cubic-bezier(0.4,0,0.2,1);max-width:360px;font-family:var(--font-body,Inter,sans-serif)`;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  // ── Loading helpers ─────────────────────────────────────────────
  window.setLoading = function (el, loading, text) {
    if (!el) return;
    if (loading) {
      el.disabled = true;
      el._origText = el.textContent;
      el.innerHTML = `<span style="display:inline-flex;align-items:center;gap:0.4rem"><span class="btn-spinner"></span>${text || 'Loading…'}</span>`;
    } else {
      el.disabled = false;
      el.textContent = el._origText || text || 'Done';
    }
  };

  // ── Format helpers ──────────────────────────────────────────────
  window.fmtNum = function (n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return String(n);
  };

  window.fmtTime = function (iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    const days = Math.floor(hrs / 24);
    return days + 'd ago';
  };

  window.fmtDuration = function (ms) {
    if (!ms) return '—';
    if (ms < 1000) return ms + 'ms';
    return (ms / 1000).toFixed(1) + 's';
  };

  // ── Topbar search keyboard shortcut ─────────────────────────────
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const si = document.querySelector('.dash-search-input');
      if (si) si.focus();
    }
    if (e.key === 'Escape') {
      const si = document.querySelector('.dash-search-input');
      if (si) si.blur();
    }
  });

  console.log('[NexaFlow] Shell initialized for:', displayName);

  // ── Notify pages that shell is ready ────────────────────────────
  window.__shellReady = true;
  window.dispatchEvent(new CustomEvent('shellReady', { detail: { user, profile } }));
})();
