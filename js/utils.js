// ============================================================
// UTILS.JS – Helpers & UI primitives
// ============================================================

// ---- TOAST ----
function showToast(msg, type = 'success', icon = null) {
  const icons = { success: '✓', error: '✕', gold: '✦' };
  const ic = icon || icons[type] || '●';
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span class="toast-icon">${ic}</span><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// ---- MODAL ----
function openModal(id)  { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

// ---- AWARD ALERT ----
function showAwardAlert(clientName, awardName, points) {
  document.getElementById('award-alert-title').textContent = `Parabéns, ${clientName}!`;
  document.getElementById('award-alert-body').innerHTML =
    `Você conquistou o prêmio: <strong style="color:var(--gold)">${awardName}</strong><br>
     por atingir <strong>${points} pontos acumulados</strong>! 🎉`;
  document.getElementById('award-alert-modal').classList.remove('hidden');
}
window.closeAwardAlert = () => document.getElementById('award-alert-modal').classList.add('hidden');

// ---- DATE FORMAT ----
function fmtDate(d, opts = {}) {
  if (!d) return '–';
  let date;
  if (typeof d === 'string') {
    // "YYYY-MM-DD" (date-only) → parse as LOCAL time to avoid UTC-3 shift
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(d);
    if (dateOnly) {
      const [y, m, day] = d.split('-').map(Number);
      date = new Date(y, m - 1, day); // local noon
    } else {
      date = new Date(d);
    }
  } else {
    date = d instanceof Date ? d : new Date(d);
  }
  if (isNaN(date)) return '–';
  return date.toLocaleDateString('pt-BR', opts);
}

function fmtDateTime(d) {
  if (!d) return '–';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date)) return '–';
  return date.toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function fmtDateInput(d) {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date)) return '';
  return date.toISOString().split('T')[0];
}

function daysBetween(d1, d2 = new Date()) {
  return Math.ceil((new Date(d1) - new Date(d2)) / 86400000);
}

// ============================================================
// MÁSCARA – TELEFONE  (DDD) NNNNN-NNNN
// ============================================================
function maskPhone(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2)  return `(${d}`;
  if (d.length <= 6)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

// ============================================================
// MÁSCARA – DATA  DD/MM/AAAA
// Digita apenas números; barras inseridas automaticamente.
// Backspace apaga na ordem inversa (remove último dígito real).
// ============================================================
function initDateMask(input) {
  if (!input || input._dateMaskDone) return;
  input._dateMaskDone = true;
  input.setAttribute('maxlength', '10');
  input.setAttribute('placeholder', 'DD/MM/AAAA');
  input.setAttribute('inputmode', 'numeric');

  // ── Wrap in flex row so the calendar button sits alongside ──
  const parent = input.parentNode;
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display:flex;align-items:center;gap:6px';
  parent.insertBefore(wrapper, input);
  wrapper.appendChild(input);
  input.style.cssText = (input.style.cssText || '') + ';flex:1;margin-bottom:0';

  // ── Hidden native <input type="date"> ──
  const picker = document.createElement('input');
  picker.type = 'date';
  picker.style.cssText = 'position:absolute;opacity:0;pointer-events:none;width:1px;height:1px;border:none;overflow:hidden';
  wrapper.appendChild(picker);

  // ── Calendar icon button ──
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.title = 'Abrir calendário';
  btn.innerHTML = '📅';
  btn.style.cssText = `
    flex-shrink:0;background:var(--black-4);border:1.5px solid var(--border);
    border-radius:8px;width:38px;height:38px;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    font-size:1rem;transition:border-color .2s,background .2s;
  `;
  btn.onmouseover = () => { btn.style.borderColor = 'var(--gold)'; btn.style.background = 'rgba(212,175,55,.1)'; };
  btn.onmouseout  = () => { btn.style.borderColor = 'var(--border)'; btn.style.background = 'var(--black-4)'; };
  wrapper.appendChild(btn);

  // Open native picker
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const iso = parseMaskedDate(input.value);
    if (iso) picker.value = iso;
    try { picker.showPicker(); } catch(_) { picker.click(); }
  });

  // When user picks a date from native calendar → fill text input
  picker.addEventListener('change', () => {
    if (picker.value) {
      input.value = fmtDateToMask(picker.value);
    }
  });

  // ── Keyboard mask ──
  input.addEventListener('keydown', function(e) {
    const allowed = ['Backspace','Delete','Tab','Escape','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'];
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (!/^\d$/.test(e.key)) { e.preventDefault(); return; }
    const digits = this.value.replace(/\D/g,'');
    if (digits.length >= 8) { e.preventDefault(); }
  });

  input.addEventListener('input', function() {
    const digits = this.value.replace(/\D/g,'').slice(0, 8);
    let result = '';
    if (digits.length > 0) result = digits.slice(0, 2);
    if (digits.length > 2) result += '/' + digits.slice(2, 4);
    if (digits.length > 4) result += '/' + digits.slice(4, 8);
    this.value = result;
    const len = result.length;
    try { this.setSelectionRange(len, len); } catch(_) {}
  });
}

// Convert "DD/MM/AAAA" → "AAAA-MM-DD" (for database)
function parseMaskedDate(str) {
  if (!str || str.length < 10) return null;
  const [d, m, y] = str.split('/');
  if (!d || !m || !y || y.length < 4) return null;
  const date = new Date(`${y}-${m}-${d}`);
  if (isNaN(date)) return null;
  return `${y}-${m}-${d}`;
}

// Convert "AAAA-MM-DD" → "DD/MM/AAAA" (for input display)
function fmtDateToMask(str) {
  if (!str) return '';
  // Handle ISO strings like "2024-05-15T00:00:00..."
  const clean = str.split('T')[0];
  const [y, m, d] = clean.split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
}

// Apply date mask to all inputs with [data-date-mask] in a container (or document)
function applyDateMasks(container = document) {
  container.querySelectorAll('[data-date-mask]').forEach(initDateMask);
}

// ============================================================
// MÁSCARA – MOEDA  R$ X.XXX,XX  (estilo caixa eletrônico)
// O usuário digita apenas números; vírgula e pontos
// são inseridos automaticamente, da direita para a esquerda.
// ============================================================
function initCurrencyMask(input) {
  if (!input || input._currencyMaskDone) return;
  input._currencyMaskDone = true;
  input.setAttribute('inputmode', 'numeric');
  input.setAttribute('placeholder', 'R$ 0,00');

  // Formata o valor numérico (em centavos) para exibição
  function formatCents(cents) {
    const abs = Math.abs(cents);
    const str = String(abs).padStart(3, '0');
    const intPart = str.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decPart = str.slice(-2);
    return `R$ ${intPart || '0'},${decPart}`;
  }

  function getCents() {
    return parseInt(input.value.replace(/\D/g, '') || '0', 10);
  }

  // Bloqueia teclas não-numéricas (exceto controles)
  input.addEventListener('keydown', function(e) {
    const allowed = ['Backspace','Delete','Tab','Escape','Enter',
                     'ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'];
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (!/^\d$/.test(e.key)) { e.preventDefault(); return; }
    // Limita a 13 dígitos (R$ 9.999.999,99)
    const digits = input.value.replace(/\D/g,'');
    if (digits.length >= 11) e.preventDefault();
  });

  input.addEventListener('input', function() {
    const digits = this.value.replace(/\D/g, '').slice(0, 11);
    const cents  = parseInt(digits || '0', 10);
    this.value   = digits.length ? formatCents(cents) : '';
  });

  // Inicializa com valor existente
  if (input.value) {
    const existingCents = Math.round(parseFloat(input.value.replace(',','.').replace(/[^0-9.]/g,'')) * 100) || 0;
    if (existingCents > 0) input.value = formatCents(existingCents);
  }
}

// Converte "R$ 1.500,00" → 1500.00 (float) | "" / "R$ 0,00" → null
function parseCurrency(str) {
  if (!str || !str.trim()) return null;
  const num = parseFloat(
    str.replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '')
  );
  return isNaN(num) || num === 0 ? null : num;
}

// Converte float → "R$ X.XXX,XX" para exibição em inputs
function formatCurrencyValue(val) {
  if (val === null || val === undefined || val === '') return '';
  const cents = Math.round(parseFloat(val) * 100);
  const str   = String(Math.abs(cents)).padStart(3, '0');
  const int   = str.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const dec   = str.slice(-2);
  return `R$ ${int || '0'},${dec}`;
}

// Aplica máscara de moeda em todos os [data-currency] dentro de um container
function applyCurrencyMasks(container = document) {
  container.querySelectorAll('[data-currency]').forEach(initCurrencyMask);
}

// ---- AVATAR ----

const AVATAR_COLORS = ['#D4AF37','#C9748A','#4ECDC4','#9B59B6','#E67E22','#27AE60','#2980B9'];
function avatarColor(name) {
  let sum = 0;
  for (const c of name) sum += c.charCodeAt(0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}
function avatarInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}
function renderAvatar(name, size = 38) {
  const color = avatarColor(name);
  return `<div class="avatar" style="background:${color}20;color:${color};border:1.5px solid ${color}40;width:${size}px;height:${size}px;font-size:${size*0.35}px">${avatarInitials(name)}</div>`;
}

// ---- RANK BADGE ----
function rankBadge(r) {
  const cls = r === 1 ? 'rank-1' : r === 2 ? 'rank-2' : r === 3 ? 'rank-3' : 'rank-other';
  return `<span class="rank-badge ${cls}">${r}</span>`;
}

// ---- POINTS BADGE ----
function pointsBadge(pts) {
  return `<span class="badge badge-gold">⭐ ${pts.toLocaleString('pt-BR')} pts</span>`;
}

// ---- PROGRESS ----
function progressBar(current, target) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
          <small style="color:var(--text-muted)">${current} / ${target} (${pct}%)</small>`;
}

// ---- EMPTY STATE ----
function emptyState(icon, title, subtitle = '') {
  return `<div class="empty-state"><div class="empty-icon">${icon}</div>
          <h3>${title}</h3>${subtitle ? `<p>${subtitle}</p>` : ''}</div>`;
}

// ---- LOADING ----
function loadingSpinner() {
  return `<div style="text-align:center;padding:40px;color:var(--text-muted)">
    <div style="font-size:2rem;animation:pulse-gold 1.5s infinite">✦</div>
    <p style="margin-top:12px;font-size:0.85rem">Carregando...</p>
  </div>`;
}

// ---- PRINT CLIENT CARD ----
function printClientCard(client, transactions) {
  const w = window.open('', '_blank');
  const expiredPts = transactions.filter(t => t.transaction_type === 'expired').reduce((s,t) => s + t.points, 0);
  const redeemedPts = transactions.filter(t => t.transaction_type === 'redeemed').reduce((s,t) => s + t.points, 0);
  const earnedPts = transactions.filter(t => t.transaction_type === 'earned').reduce((s,t) => s + t.points, 0);

  const rows = transactions.map(t => {
    const type = { earned:'+ Pontos Ganhos', redeemed:'- Resgate', expired:'Expirado', manual_add:'+ Ajuste Manual', manual_remove:'- Ajuste Manual' }[t.transaction_type] || t.transaction_type;
    const sign = t.transaction_type === 'earned' || t.transaction_type === 'manual_add' ? `+${t.points}` : `-${t.points}`;
    return `<tr><td>${fmtDateTime(t.created_at)}</td><td>${type}</td><td>${t.description || '–'}</td>
            <td style="font-weight:700;color:${t.transaction_type==='earned'?'#007700':'#990000'}">${sign}</td>
            ${t.expires_at ? `<td>${fmtDate(t.expires_at)}</td>` : '<td>–</td>'}</tr>`;
  }).join('');

  const logoDataUrl = localStorage.getItem('va_logo') || null;
  const logoTag = logoDataUrl
    ? `<img src="${logoDataUrl}" style="height:60px;object-fit:contain" alt="Logo" />`
    : `<div style="width:52px;height:52px;background:#D4AF37;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;color:#111;font-weight:800">✦</div>`;

  w.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
    <title>Ficha de Pontos – ${client.name}</title>
    <style>
      body{font-family:'Segoe UI',sans-serif;color:#111;padding:30px;max-width:800px;margin:0 auto}
      .header{display:flex;align-items:center;gap:20px;border-bottom:2px solid #D4AF37;padding-bottom:16px;margin-bottom:24px}
      .clinic-name{font-size:1.5rem;font-weight:800;color:#D4AF37}
      .clinic-sub{font-size:0.85rem;color:#666}
      .client-info{background:#fafafa;border:1px solid #e0e0e0;border-radius:8px;padding:16px;margin-bottom:20px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .info-item{font-size:0.88rem}.info-label{font-weight:600;color:#555}
      .stats{display:flex;gap:20px;margin-bottom:20px}
      .stat{flex:1;background:#fffbf0;border:1px solid #D4AF37;border-radius:8px;padding:12px;text-align:center}
      .stat-val{font-size:1.5rem;font-weight:800;color:#D4AF37}.stat-lbl{font-size:0.75rem;color:#888}
      table{width:100%;border-collapse:collapse;font-size:0.83rem}
      th{background:#D4AF37;color:#111;padding:8px 10px;text-align:left}
      td{padding:7px 10px;border-bottom:1px solid #eee}
      tr:nth-child(even){background:#fafafa}
      .footer{margin-top:20px;text-align:center;font-size:0.75rem;color:#999;border-top:1px solid #eee;padding-top:12px}
      @media print{body{padding:0}}
    </style></head><body>
    <div class="header">
      ${logoTag}
      <div><div class="clinic-name">Vanessa Amorim</div><div class="clinic-sub">Clínica de Estética Facial &amp; Corporal</div></div>
    </div>
    <h2 style="margin-bottom:12px">Extrato de Pontos – ${client.name}</h2>
    <div class="client-info">
      <div class="info-item"><span class="info-label">CPF:</span> ${client.cpf || '–'}</div>
      <div class="info-item"><span class="info-label">Telefone:</span> ${client.phone || '–'}</div>
      <div class="info-item"><span class="info-label">E-mail:</span> ${client.email || '–'}</div>
      <div class="info-item"><span class="info-label">Aniversário:</span> ${fmtDate(client.birth_date)}</div>
      <div class="info-item"><span class="info-label">Cadastro:</span> ${fmtDate(client.created_at)}</div>
      <div class="info-item"><span class="info-label">Instagram:</span> ${client.instagram || '–'}</div>
    </div>
    <div class="stats">
      <div class="stat"><div class="stat-val">${client.total_points}</div><div class="stat-lbl">Pontos Ativos</div></div>
      <div class="stat"><div class="stat-val">${earnedPts}</div><div class="stat-lbl">Total Ganho</div></div>
      <div class="stat"><div class="stat-val">${redeemedPts}</div><div class="stat-lbl">Resgatado</div></div>
      <div class="stat"><div class="stat-val">${expiredPts}</div><div class="stat-lbl">Expirado</div></div>
    </div>
    <h3 style="margin-bottom:10px">Histórico Detalhado</h3>
    <table><thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th>Pontos</th><th>Expiração</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div class="footer">Emitido em ${fmtDateTime(new Date())} • Vanessa Amorim – Controle de Gamificação</div>
    <script>window.onload=()=>{window.print();}<\/script>
  </body></html>`);
  w.document.close();
}

// ---- MASK CPF ----
function maskCPF(v) {
  return v.replace(/\D/g,'').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4');
}

// ---- DEBOUNCE ----
function debounce(fn, ms = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ---- SECTION COLLAPSE ----
function toggleSection(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = el.style.display === 'none' ? '' : 'none';
}
