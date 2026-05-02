// ============================================================
// APP.JS – Bootstrap, routing, navigation
// ============================================================

// ---- THEME ENGINE ----
const THEME_DEFAULTS = {
  gold:       '#D4AF37',
  goldLight:  '#F0D060',
  goldDark:   '#A8892A',
  black:      '#0A0A0A',
  black2:     '#111111',
  black3:     '#1A1A1A',
  surface:    '#161616',
  surface2:   '#1E1E1E',
  accent:     '#4ECDC4',
};

function applyTheme(theme = {}) {
  const t = { ...THEME_DEFAULTS, ...theme };
  const r = document.documentElement.style;
  r.setProperty('--gold',       t.gold);
  r.setProperty('--gold-light', t.goldLight);
  r.setProperty('--gold-dark',  t.goldDark);
  // auto-generate glow from primary
  const glow = hexToRgba(t.gold, 0.3);
  r.setProperty('--gold-glow',  glow);
  r.setProperty('--shadow-gold', `0 4px 20px ${hexToRgba(t.gold, 0.2)}`);
  r.setProperty('--black',      t.black);
  r.setProperty('--black-2',    t.black2);
  r.setProperty('--black-3',    t.black3);
  r.setProperty('--surface',    t.surface);
  r.setProperty('--surface-2',  t.surface2);
  r.setProperty('--teal',       t.accent);
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function loadSavedTheme() {
  try {
    const saved = JSON.parse(localStorage.getItem('va_theme') || '{}');
    applyTheme(saved);
  } catch(_) { applyTheme(); }
}

function saveTheme(theme) {
  localStorage.setItem('va_theme', JSON.stringify(theme));
  applyTheme(theme);
}

function getSavedTheme() {
  try { return { ...THEME_DEFAULTS, ...JSON.parse(localStorage.getItem('va_theme') || '{}') }; }
  catch(_) { return { ...THEME_DEFAULTS }; }
}

// ---- LOGO ENGINE ----
function applyLogo(dataUrl) {
  // Sidebar brand
  const icon = document.getElementById('sidebar-brand-icon');
  if (icon) {
    if (dataUrl) {
      icon.innerHTML = `<img src="${dataUrl}" style="width:36px;height:36px;object-fit:contain;border-radius:6px" alt="Logo" />`;
    } else {
      icon.innerHTML = '✦';
    }
  }
  // Topbar logo
  const tl = document.getElementById('topbar-logo');
  if (tl) {
    tl.innerHTML = dataUrl
      ? `<img src="${dataUrl}" style="height:32px;object-fit:contain;border-radius:6px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.4))" alt="Logo" />`
      : '';
  }
  // Splash logo
  const sl = document.getElementById('splash-logo-img');
  if (sl) {
    sl.innerHTML = dataUrl
      ? `<img src="${dataUrl}" style="height:80px;object-fit:contain;margin-bottom:12px;filter:drop-shadow(0 4px 16px rgba(212,175,55,0.4))" alt="Logo" />`
      : '';
  }
}

function loadSavedLogo() {
  const saved = localStorage.getItem('va_logo');
  if (saved) applyLogo(saved);
}

function saveLogo(dataUrl) {
  if (dataUrl) localStorage.setItem('va_logo', dataUrl);
  else localStorage.removeItem('va_logo');
  applyLogo(dataUrl);
}

function getSavedLogo() {
  return localStorage.getItem('va_logo') || null;
}

const PAGE_TITLES = {
  dashboard:     'Dashboard',
  clientes:      'Clientes',
  pontos:        'Lançar Pontos',
  colaboradores: 'Colaboradores',
  metas:         'Metas',
  calendario:    'Calendário',
  mensagens:     'Mensagens',
  configuracoes: 'Configurações',
};

const PAGE_RENDERERS = {
  dashboard:     renderDashboard,
  clientes:      renderClientes,
  pontos:        renderPontos,
  colaboradores: renderColaboradores,
  metas:         renderMetas,
  calendario:    renderCalendario,
  mensagens:     renderMensagens,
  configuracoes: renderConfiguracoes,
};

let currentPage = 'dashboard';

// ---- NAVIGATION ----
window.navigateTo = function(page) {
  if (!PAGE_RENDERERS[page]) return;

  // Bloqueia página se o perfil não tem permissão
  if (!hasPermission(page)) {
    showToast('Seu perfil não tem acesso a este módulo.', 'error', '🔒');
    return;
  }

  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Show target page
  document.getElementById('page-'+page)?.classList.add('active');
  document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');
  document.getElementById('page-title').textContent = PAGE_TITLES[page] || page;

  currentPage = page;
  sessionStorage.setItem('va_last_page', page);
  PAGE_RENDERERS[page]();

  if (window.innerWidth <= 900) {
    document.getElementById('sidebar')?.classList.remove('open');
  }
};

window.showPage = window.navigateTo;

// ---- SIDEBAR TOGGLE ----
window.toggleSidebar = function() {
  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth <= 900) {
    sidebar?.classList.toggle('open');
  } else {
    sidebar?.classList.toggle('collapsed');
  }
};

// ---- TOPBAR DATE ----
function updateTopbarDate() {
  const el = document.getElementById('topbar-date');
  if (el) {
    el.textContent = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
  }
}

// ---- STARTUP ----
document.addEventListener('DOMContentLoaded', () => {
  loadSavedTheme();
  loadSavedLogo();
  updateTopbarDate();

  // Always initialize Supabase from config (credentials hardcoded or in localStorage)
  initSupabase(VA_CONFIG.supabaseUrl, VA_CONFIG.supabaseKey);

  // Init auth session (reads sessionStorage)
  if (typeof VA_AUTH !== 'undefined') VA_AUTH.init();

  // Check if user is already authenticated
  if (typeof VA_AUTH !== 'undefined' && VA_AUTH.isLoggedIn()) {
    // Restore session — show app immediately
    const app = document.getElementById('app');
    if (app) app.style.visibility = 'visible';
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'none';

    const nameEl = document.getElementById('topbar-username');
    if (nameEl) nameEl.textContent = VA_AUTH.currentUser?.display_name || VA_AUTH.currentUser?.username || '';

    // Apply role-based nav (hide pages this role can't access)
    applyRoleUI();

    const lastPage = sessionStorage.getItem('va_last_page') || 'dashboard';
    const targetPage = hasPermission(lastPage) ? lastPage : 'dashboard';
    navigateTo(PAGE_RENDERERS[targetPage] ? targetPage : 'dashboard');
    setTimeout(() => expireOldPoints().catch(() => {}), 2000);
  } else {
    // Not authenticated — show login overlay
    if (typeof loadLoginBrand === 'function') loadLoginBrand();
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'flex';
    document.getElementById('login-username')?.focus();
  }
});

// Mantido para compatibilidade — não mais necessário internamente
function autoConnectSilent(url, key) {
  initSupabase(url, key);
  const lastPage = sessionStorage.getItem('va_last_page') || 'dashboard';
  navigateTo(PAGE_RENDERERS[lastPage] ? lastPage : 'dashboard');
  getClient().from('clients').select('id').limit(1).catch(() => {
    showToast('Falha ao conectar. Verifique Configurações → Conexão.', 'error');
  });
}

// Called from Settings tab after saving credentials
window.connectFromSettings = async function() {
  const url = document.getElementById('cfg-sb-url')?.value?.trim();
  const key = document.getElementById('cfg-sb-key')?.value?.trim();
  if (!url || !key) { showToast('Preencha a URL e a Anon Key.', 'error'); return; }

  const btn = document.getElementById('cfg-connect-btn');
  if (btn) { btn.textContent = 'Conectando...'; btn.disabled = true; }

  try {
    initSupabase(url, key);
    const sb = getClient();
    await sb.from('clients').select('id').limit(1);
    showToast('✅ Conectado com sucesso!', 'gold', '✅');
    if (btn) { btn.textContent = '✅ Conectado!'; }
    document.getElementById('no-conn-overlay')?.classList.add('hidden');
    setTimeout(() => { if (btn) { btn.textContent = 'Salvar e Conectar'; btn.disabled = false; } }, 3000);
    // Reload dashboard now that we have a connection
    setTimeout(() => navigateTo('dashboard'), 500);
    setTimeout(() => expireOldPoints().catch(() => {}), 2500);
  } catch(e) {
    showToast('Falha na conexão: ' + (e.message || 'verifique as credenciais.'), 'error');
    if (btn) { btn.textContent = 'Salvar e Conectar'; btn.disabled = false; }
  }
};

window.disconnectSupabase = function() {
  if (!confirm('Desconectar e limpar as credenciais salvas?')) return;
  localStorage.removeItem('sb_url');
  localStorage.removeItem('sb_key');
  showToast('Desconectado. Recarregue a página para reconectar.', 'gold');
};

window.gerarConfigJs = function() {
  const url = localStorage.getItem('sb_url') || '';
  const key = localStorage.getItem('sb_key') || '';
  if (!url || !key) {
    showToast('Conecte ao Supabase primeiro para gerar o config.js.', 'error');
    return;
  }
  const content =
`// ============================================================
// VA_CONFIG — Gerado automaticamente em ${new Date().toLocaleDateString('pt-BR')}
// Substitua o arquivo js/config.js pelo conteúdo abaixo antes de hospedar.
// ============================================================
const VA_CONFIG = {
  supabaseUrl: '${url}',
  supabaseKey: '${key}',
  clientPassword: 'clinicava',
  npsCooldownDays: 7,
  clinicName: 'Vanessa Amorim',
};
// Permite sobrescrever localmente em desenvolvimento
try {
  const lsUrl = localStorage.getItem('sb_url');
  const lsKey = localStorage.getItem('sb_key');
  if (lsUrl) VA_CONFIG.supabaseUrl = lsUrl;
  if (lsKey) VA_CONFIG.supabaseKey = lsKey;
} catch(_) {}`;

  const ta = document.getElementById('cfg-config-output');
  if (ta) {
    ta.value = content;
    ta.style.display = 'block';
    ta.style.height = '220px';
    ta.select();
  }
  navigator.clipboard?.writeText(content)
    .then(() => showToast('config.js copiado para a área de transferência!', 'gold', '📋'))
    .catch(() => showToast('Conteúdo gerado na caixa abaixo. Copie manualmente.', 'gold'));
};

// ---- UNIVERSAL MODAL CLOSE: Click outside + ESC ----
const DYNAMIC_MODALS = ['add-points-modal','redeem-modal'];
const STATIC_MODALS  = ['client-modal','client-detail-modal','emp-modal','goal-modal','progress-modal','rule-modal','award-modal','proc-modal','template-modal','bday-msg-modal'];

document.addEventListener('click', (e) => {
  if (!e.target.classList.contains('modal-overlay')) return;
  const id = e.target.id;
  if (id === 'award-alert-modal') { closeAwardAlert(); return; }
  if (DYNAMIC_MODALS.includes(id)) { e.target.remove(); return; }
  if (STATIC_MODALS.includes(id)) { closeModal(id); return; }
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  // Close award alert first
  const awardAlert = document.getElementById('award-alert-modal');
  if (awardAlert && !awardAlert.classList.contains('hidden')) { closeAwardAlert(); return; }
  // Close dynamic modals
  for (const id of DYNAMIC_MODALS) {
    const el = document.getElementById(id);
    if (el) { el.remove(); return; }
  }
  // Close static modals
  for (const id of STATIC_MODALS) {
    const el = document.getElementById(id);
    if (el && !el.classList.contains('hidden')) { closeModal(id); return; }
  }
});

// ---- MOBILE SIDEBAR OVERLAY ----
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 900) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar?.classList.contains('open') && !sidebar.contains(e.target) && !e.target.closest('.sidebar-toggle')) {
      sidebar.classList.remove('open');
    }
  }
});
