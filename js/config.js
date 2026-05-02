// ============================================================
// VA_CONFIG — Configurações do Sistema Vanessa Amorim
// ============================================================
const VA_CONFIG = {
  supabaseUrl: 'https://yyeacgooxkxpkkwrxkqu.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZWFjZ29veGt4cGtrd3J4a3F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NTQ4OTEsImV4cCI6MjA5MzIzMDg5MX0.zDf_N_eei6gVEFdOuvzeVO6Jalm3ihBryvKnrmsYKkk',

  // Senha de acesso dos clientes ao portal
  clientPassword: 'clinicava',

  // Dias mínimos entre envios do NPS (evita gaming de pontos)
  npsCooldownDays: 7,

  // Nome da clínica
  clinicName: 'Vanessa Amorim',
};

// Permite sobrescrever localmente via Configurações → Conexão (desenvolvimento)
try {
  const lsUrl = localStorage.getItem('sb_url');
  const lsKey = localStorage.getItem('sb_key');
  if (lsUrl) VA_CONFIG.supabaseUrl = lsUrl;
  if (lsKey) VA_CONFIG.supabaseKey = lsKey;
} catch(_) {}

// ============================================================
// PERMISSÕES POR PERFIL
// Definido aqui para estar disponível antes de auth.js e app.js
// ============================================================
const ROLE_PERMISSIONS = {
  admin:    '*',                   // acesso total
  manager:  '*',                   // Gerente: acesso total
  operator: ['dashboard','clientes','pontos','colaboradores','metas','calendario','mensagens'], // Consultora
  viewer:   ['dashboard','clientes','calendario'],  // apenas leitura
};

function hasPermission(page) {
  const role = (typeof VA_AUTH !== 'undefined' && VA_AUTH?.currentUser?.role) || 'viewer';
  const perms = ROLE_PERMISSIONS[role] || [];
  if (perms === '*') return true;
  return perms.includes(page);
}

window.applyRoleUI = function() {
  document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
    btn.style.display = hasPermission(btn.dataset.page) ? '' : 'none';
  });
};
