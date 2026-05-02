// ============================================================
// VA AUTH — Sistema de Autenticação Admin
// ============================================================
const DEFAULT_PW_HASH = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'; // sha256('123456')

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

window.VA_AUTH = {
  currentUser: null,

  init() {
    try {
      const saved = sessionStorage.getItem('va_user');
      if (saved) this.currentUser = JSON.parse(saved);
    } catch(_) {}
  },

  async login(username, password) {
    const hash = await sha256(password);
    const { data, error } = await getClient()
      .from('admin_users')
      .select('*')
      .eq('company_id', COMPANY_ID)
      .eq('username', username.toLowerCase().trim())
      .eq('is_active', true)
      .limit(1);

    if (error) throw new Error('Erro ao verificar usuário. Tente novamente.');
    const user = (data || [])[0];
    if (!user) throw new Error('Usuário não encontrado ou inativo.');
    if (user.password_hash !== hash) throw new Error('Senha incorreta.');

    this.currentUser = user;
    sessionStorage.setItem('va_user', JSON.stringify(user));
    return user;
  },

  async changePassword(userId, newPassword) {
    const hash = await sha256(newPassword);
    await dbUpdate('admin_users', userId, {
      password_hash: hash,
      must_change_password: false,
      updated_at: new Date().toISOString(),
    });
    if (this.currentUser?.id === userId) {
      this.currentUser.password_hash = hash;
      this.currentUser.must_change_password = false;
      sessionStorage.setItem('va_user', JSON.stringify(this.currentUser));
    }
  },

  async resetUserPassword(userId) {
    await dbUpdate('admin_users', userId, {
      password_hash: DEFAULT_PW_HASH,
      must_change_password: true,
      updated_at: new Date().toISOString(),
    });
  },

  isLoggedIn() { return !!this.currentUser; },

  logout() {
    this.currentUser = null;
    sessionStorage.removeItem('va_user');
    _showLoginOverlay();
  },
};

// ============================================================
// LOGIN SCREEN LOGIC
// ============================================================
function _showLoginOverlay() {
  loadLoginBrand();
  const overlay = document.getElementById('login-overlay');
  if (overlay) overlay.style.display = 'flex';
  const app = document.getElementById('app');
  if (app) app.style.visibility = 'hidden';
  document.getElementById('login-password').value = '';
  document.getElementById('login-username').focus?.();
}

function _onLoginSuccess() {
  const overlay = document.getElementById('login-overlay');
  if (overlay) overlay.style.display = 'none';
  const app = document.getElementById('app');
  if (app) app.style.visibility = 'visible';

  // Update topbar username
  const nameEl = document.getElementById('topbar-username');
  if (nameEl) nameEl.textContent = VA_AUTH.currentUser?.display_name || VA_AUTH.currentUser?.username || '';

  // Apply role-based nav permissions (hide forbidden pages)
  if (typeof applyRoleUI === 'function') applyRoleUI();

  // Navigate to last page (use dashboard as fallback for blocked pages)
  const lastPage = sessionStorage.getItem('va_last_page') || 'dashboard';
  const targetPage = (typeof hasPermission === 'function' && hasPermission(lastPage)) ? lastPage : 'dashboard';
  if (typeof navigateTo === 'function') {
    navigateTo(typeof PAGE_RENDERERS !== 'undefined' && PAGE_RENDERERS[targetPage] ? targetPage : 'dashboard');
  }
  setTimeout(() => { if (typeof expireOldPoints === 'function') expireOldPoints().catch(() => {}); }, 2000);
}

window.doLogin = async function() {
  const username = document.getElementById('login-username')?.value?.trim();
  const password = document.getElementById('login-password')?.value;
  const errEl   = document.getElementById('login-error');
  const btn     = document.getElementById('login-btn');

  if (!username || !password) {
    errEl.textContent = 'Preencha usuário e senha.'; return;
  }
  errEl.textContent = '';
  btn.textContent = 'Entrando…'; btn.disabled = true;

  try {
    const user = await VA_AUTH.login(username, password);
    if (user.must_change_password) {
      document.getElementById('change-pw-modal').style.display = 'flex';
      document.getElementById('new-pw-1')?.focus();
    } else {
      _onLoginSuccess();
    }
  } catch(e) {
    errEl.textContent = e.message;
  } finally {
    btn.textContent = 'Entrar'; btn.disabled = false;
  }
};

window.doChangePassword = async function() {
  const pw1   = document.getElementById('new-pw-1')?.value;
  const pw2   = document.getElementById('new-pw-2')?.value;
  const errEl = document.getElementById('new-pw-error');
  const btn   = document.getElementById('new-pw-btn');

  errEl.textContent = '';
  if (!pw1 || pw1.length < 6) { errEl.textContent = 'Senha mínima de 6 caracteres.'; return; }
  if (pw1 === '123456')       { errEl.textContent = 'Não é permitido usar a senha padrão.'; return; }
  if (pw1 !== pw2)            { errEl.textContent = 'As senhas não coincidem.'; return; }

  btn.textContent = 'Salvando…'; btn.disabled = true;
  try {
    await VA_AUTH.changePassword(VA_AUTH.currentUser.id, pw1);
    document.getElementById('change-pw-modal').style.display = 'none';
    _onLoginSuccess();
  } catch(e) {
    errEl.textContent = 'Erro: ' + e.message;
    btn.textContent = 'Salvar Nova Senha'; btn.disabled = false;
  }
};

window.doLogout = function() {
  VA_AUTH.logout();
};

// ---- ENTER KEY ON LOGIN ----
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });
  document.getElementById('login-username')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('login-password')?.focus();
  });
  document.getElementById('new-pw-2')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') doChangePassword();
  });
});

// ---- BRAND ON LOGIN SCREEN ----
function loadLoginBrand() {
  const logoData   = localStorage.getItem('va_logo');
  // Prioridade: nome salvo nas configs > VA_CONFIG.clinicName > fallback genérico
  const clinicName = localStorage.getItem('va_clinic_name')
    || (typeof VA_CONFIG !== 'undefined' ? VA_CONFIG.clinicName : '')
    || 'Vanessa Amorim';

  const nameEl = document.getElementById('login-clinic-name');
  if (nameEl) nameEl.textContent = clinicName;

  const logoArea = document.getElementById('login-logo-area');
  if (!logoArea) return;
  if (logoData) {
    logoArea.innerHTML = `<img src="${logoData}"
      style="max-height:96px;max-width:240px;object-fit:contain;
             filter:drop-shadow(0 4px 24px rgba(212,175,55,0.35))" />`;
  } else {
    logoArea.innerHTML = `<div style="font-size:3.5rem;color:var(--gold);
      text-shadow:0 0 40px rgba(212,175,55,0.5);animation:pulse-gold 2s ease-in-out infinite">💎</div>`;
  }
}
