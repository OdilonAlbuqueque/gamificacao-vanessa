// ============================================================
// PAGE: CALENDÁRIO
// ============================================================
let calDate = new Date();
let _calClients = [];

async function renderCalendario() {
  const page = document.getElementById('page-calendario');
  page.innerHTML = `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
    <div style="display:flex;align-items:center;gap:12px">
      <button class="btn btn-ghost btn-sm" onclick="calPrev()">‹ Anterior</button>
      <span id="cal-month-label" style="font-size:1.1rem;font-weight:700;color:var(--gold);min-width:180px;text-align:center"></span>
      <button class="btn btn-ghost btn-sm" onclick="calNext()">Próximo ›</button>
    </div>
    <button class="btn btn-outline-gold btn-sm" onclick="calToday()">Hoje</button>
  </div>
  <div class="card" style="padding:16px">
    <div class="cal-header">
      ${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d=>`<div class="cal-day-name">${d}</div>`).join('')}
    </div>
    <div class="calendar-grid" id="cal-grid">${loadingSpinner()}</div>
  </div>

  <!-- ANIVERSARIANTES DO MÊS -->
  <div class="card mt-24">
    <div class="card-header"><span class="card-title">🎂 Aniversariantes do Mês</span>
      <span style="font-size:0.78rem;color:var(--text-muted)">Clique no aniversariante para enviar mensagem</span>
    </div>
    <div id="cal-bday-list">${loadingSpinner()}</div>
  </div>

  <!-- BIRTHDAY MESSAGE MODAL -->
  <div id="bday-msg-modal" class="modal-overlay hidden">
    <div class="modal modal-wide" style="max-width:600px">
      <div class="modal-header">
        <span class="modal-title" id="bday-modal-title">🎂 Mensagem de Aniversário</span>
        <button class="modal-close" onclick="closeModal('bday-msg-modal')">✕</button>
      </div>
      <div id="bday-modal-body"></div>
    </div>
  </div>
  `;
  await drawCalendar();
}

async function drawCalendar() {
  const grid  = document.getElementById('cal-grid');
  const label = document.getElementById('cal-month-label');
  if (!grid || !label) return;

  const year  = calDate.getFullYear();
  const month = calDate.getMonth();
  label.textContent = calDate.toLocaleDateString('pt-BR', { month:'long', year:'numeric' });
  grid.innerHTML = loadingSpinner();

  try {
    _calClients = await fetchClients();

    // birthday map: day → [client]
    const bdayMap = {};
    for (const c of _calClients) {
      if (!c.birth_date) continue;
      const bd = new Date(c.birth_date + 'T12:00:00');
      if (bd.getMonth() === month) {
        const d = bd.getDate();
        bdayMap[d] = bdayMap[d] || [];
        bdayMap[d].push(c);
      }
    }

    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays    = new Date(year, month, 0).getDate();
    const today       = new Date();

    let cells = '';
    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      cells += `<div class="cal-cell other-month"><span class="cal-date text-muted">${prevDays - i}</span></div>`;
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
      const clients = bdayMap[d] || [];
      cells += `<div class="cal-cell ${isToday ? 'today' : ''}">
        <span class="cal-date">${d}</span>
        ${clients.map(c => `
          <div class="cal-birthday" title="${c.name}"
            onclick="openBdayModal('${c.id}', ${isToday})"
            style="cursor:pointer">
            🎂 ${c.name.split(' ')[0]}
          </div>`).join('')}
      </div>`;
    }
    // Next month padding
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    for (let d = 1; d <= totalCells - firstDay - daysInMonth; d++) {
      cells += `<div class="cal-cell other-month"><span class="cal-date text-muted">${d}</span></div>`;
    }

    grid.innerHTML = cells;

    // ---- LIST ----
    const bdayList = document.getElementById('cal-bday-list');
    if (bdayList) {
      const monthBdays = _calClients.filter(c => {
        if (!c.birth_date) return false;
        return new Date(c.birth_date + 'T12:00:00').getMonth() === month;
      }).sort((a,b) => new Date(a.birth_date).getDate() - new Date(b.birth_date).getDate());

      if (monthBdays.length === 0) {
        bdayList.innerHTML = `<p style="color:var(--text-muted);font-size:0.85rem">Nenhum aniversariante neste mês.</p>`;
      } else {
        bdayList.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:10px">
          ${monthBdays.map(c => {
            const bd = new Date(c.birth_date + 'T12:00:00');
            const day = bd.getDate();
            const isToday2 = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const daysUntil = daysUntilBirthday(bd);
            return `<div
              onclick="openBdayModal('${c.id}', ${isToday2})"
              style="display:flex;align-items:center;gap:10px;background:var(--surface-3);
                     border:1px solid ${isToday2 ? 'var(--gold)' : 'var(--border)'};
                     border-radius:10px;padding:10px 14px;min-width:220px;cursor:pointer;
                     transition:all 0.2s"
              onmouseover="this.style.borderColor='var(--gold)';this.style.background='rgba(212,175,55,0.06)'"
              onmouseout="this.style.borderColor='${isToday2 ? 'var(--gold)' : 'var(--border)'}';this.style.background='var(--surface-3)'">
              ${renderAvatar(c.name, 38)}
              <div style="flex:1;min-width:0">
                <div style="font-weight:600;font-size:0.88rem">${c.name} ${isToday2 ? '🎉' : ''}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">
                  Dia ${day}
                  ${daysUntil === 0 ? '<span style="color:var(--gold);font-weight:700"> · Hoje! 🎂</span>'
                    : daysUntil > 0 ? `<span style="color:var(--teal)"> · em ${daysUntil} dia${daysUntil>1?'s':''}</span>`
                    : ''}
                </div>
              </div>
              <span style="font-size:1.2rem;color:var(--gold)">✉</span>
            </div>`;
          }).join('')}
        </div>`;
      }
    }
  } catch(e) {
    grid.innerHTML = `<p style="color:var(--rose)">Erro: ${e.message}</p>`;
  }
}

function daysUntilBirthday(bdDate) {
  const today = new Date();
  const next  = new Date(today.getFullYear(), bdDate.getMonth(), bdDate.getDate());
  if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    next.setFullYear(today.getFullYear() + 1);
  }
  return Math.round((next - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000);
}

// ============================================================
// BIRTHDAY MESSAGE MODAL
// ============================================================

// Template storage keys
const TPL_ANT_KEY = 'va_bday_tpl_ant';
const TPL_DIA_KEY = 'va_bday_tpl_dia';

function loadBdayTemplate(type, firstName, daysLeft, dayMonth) {
  const key = type === 'ant' ? TPL_ANT_KEY : TPL_DIA_KEY;
  const saved = localStorage.getItem(key);
  if (saved) {
    // Replace placeholders with current client name
    return saved
      .replace(/\[NOME\]/g, firstName)
      .replace(/\b(Olá )\w+/,   `$1${firstName}`)
      .replace(/\bParabéns, \w+/i, `Parabéns, ${firstName}`);
  }
  return type === 'ant'
    ? buildMsgAntecipada(firstName, daysLeft, dayMonth)
    : buildMsgDoDia(firstName);
}

window.saveBdayTemplate = function(type) {
  const id  = type === 'ant' ? 'bday-msg-ant' : 'bday-msg-dia';
  const key = type === 'ant' ? TPL_ANT_KEY    : TPL_DIA_KEY;
  const el  = document.getElementById(id);
  if (!el) return;
  // Store with [NOME] placeholder so we can replace on next open
  const text = el.value;
  localStorage.setItem(key, text);
  showToast('Modelo salvo! Será usado como padrão nas próximas mensagens.', 'gold', '💾');
  // Visual feedback
  const btn = document.getElementById(`save-tpl-btn-${type}`);
  if (btn) { btn.textContent = '✓ Salvo!'; setTimeout(() => btn.textContent = '💾 Salvar como modelo', 2000); }
};

window.resetBdayTemplate = function(type, firstName, daysLeft, dayMonth) {
  const key = type === 'ant' ? TPL_ANT_KEY : TPL_DIA_KEY;
  localStorage.removeItem(key);
  const id = type === 'ant' ? 'bday-msg-ant' : 'bday-msg-dia';
  const el = document.getElementById(id);
  if (el) el.value = type === 'ant'
    ? buildMsgAntecipada(firstName, daysLeft, dayMonth)
    : buildMsgDoDia(firstName);
  showToast('Modelo restaurado ao original.', 'success', '↺');
};

window.openBdayModal = function(clientId, isToday) {
  const client = _calClients.find(c => c.id === clientId);
  if (!client) return;

  const firstName   = client.name.split(' ')[0];
  const bd          = new Date(client.birth_date + 'T12:00:00');
  const dayMonth    = bd.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  const daysLeft    = daysUntilBirthday(bd);
  const hasPhone    = !!client.phone;
  const waNumber    = hasPhone ? '55' + client.phone.replace(/\D/g,'') : null;

  // Load saved template or default
  const msgAntecipada = loadBdayTemplate('ant', firstName, daysLeft, dayMonth);
  const msgDoDia      = loadBdayTemplate('dia', firstName, daysLeft, dayMonth);

  const msgType = isToday ? 'dia' : 'antecipada';

  document.getElementById('bday-modal-title').innerHTML =
    `🎂 ${client.name} &nbsp;<span style="font-size:0.8rem;color:var(--text-muted);font-weight:400">${dayMonth}</span>`;

  document.getElementById('bday-modal-body').innerHTML = `
    <div style="margin-bottom:16px">
      ${renderAvatar(client.name, 48)}
      <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:8px;align-items:center">
        ${hasPhone ? `<span style="font-size:0.83rem;color:var(--text-secondary)">📱 ${client.phone}</span>` : '<span style="font-size:0.8rem;color:var(--text-muted)">⚠️ Sem número cadastrado</span>'}
        ${daysLeft === 0
          ? `<span style="background:rgba(212,175,55,0.15);color:var(--gold);border:1px solid var(--gold);border-radius:20px;padding:2px 10px;font-size:0.78rem;font-weight:700">🎉 Aniversário Hoje!</span>`
          : `<span style="background:rgba(78,205,196,0.12);color:var(--teal);border:1px solid rgba(78,205,196,0.3);border-radius:20px;padding:2px 10px;font-size:0.78rem">em ${daysLeft} dia${daysLeft>1?'s':''}</span>`}
      </div>
    </div>

    <!-- TAB DE TIPO DE MENSAGEM -->
    <div class="tab-bar mb-16" style="max-width:400px">
      <button class="tab-btn ${msgType==='antecipada'?'active':''}" id="bday-tab-ant" onclick="switchBdayTab('antecipada')">
        📅 Mensagem Antecipada
      </button>
      <button class="tab-btn ${msgType==='dia'?'active':''}" id="bday-tab-dia" onclick="switchBdayTab('dia')">
        🎂 Mensagem do Dia
      </button>
    </div>

    <!-- MENSAGEM ANTECIPADA -->
    <div id="bday-panel-antecipada" class="${msgType!=='antecipada'?'hidden':''}">
      <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:10px">
        💡 Enviada <strong>dias antes</strong> do aniversário — propõe um momento de autocuidado com desconto especial.
        Você pode editar livremente o texto abaixo.
      </p>
      <textarea id="bday-msg-ant" rows="8" style="
        width:100%;resize:vertical;background:var(--black-4);border:1.5px solid var(--border);
        border-radius:10px;padding:14px;color:var(--text-primary);font-family:inherit;
        font-size:0.88rem;line-height:1.7;outline:none
      " onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='var(--border)'">${msgAntecipada}</textarea>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
        <button class="btn btn-gold" onclick="copyBdayMsg('ant')">📋 Copiar Mensagem</button>
        ${hasPhone ? `
          <a href="https://wa.me/${waNumber}?text=${encodeURIComponent(msgAntecipada)}"
            id="wa-link-ant" target="_blank" class="btn btn-outline-gold"
            onclick="updateWaLink('ant','${waNumber}')">
            📱 WhatsApp Web
          </a>` : `<span class="btn btn-ghost" style="opacity:.4;cursor:not-allowed">📱 WhatsApp indisponível</span>`}
        <button id="save-tpl-btn-ant" class="btn btn-ghost" onclick="saveBdayTemplate('ant')">💾 Salvar como modelo</button>
        <button class="btn btn-ghost" style="color:var(--text-muted);font-size:.8rem" onclick="resetBdayTemplate('ant','${firstName}',${daysLeft},'${dayMonth}')">↺ Restaurar original</button>
      </div>
    </div>

    <!-- MENSAGEM DO DIA -->
    <div id="bday-panel-dia" class="${msgType!=='dia'?'hidden':''}">
      <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:10px">
        🎉 Enviada <strong>no dia do aniversário</strong> — mensagem calorosa da equipe Vanessa Amorim.
        Você pode editar livremente o texto abaixo.
      </p>
      <textarea id="bday-msg-dia" rows="8" style="
        width:100%;resize:vertical;background:var(--black-4);border:1.5px solid var(--border);
        border-radius:10px;padding:14px;color:var(--text-primary);font-family:inherit;
        font-size:0.88rem;line-height:1.7;outline:none
      " onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='var(--border)'">${msgDoDia}</textarea>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
        <button class="btn btn-gold" onclick="copyBdayMsg('dia')">📋 Copiar Mensagem</button>
        ${hasPhone ? `
          <a href="https://wa.me/${waNumber}?text=${encodeURIComponent(msgDoDia)}"
            id="wa-link-dia" target="_blank" class="btn btn-outline-gold"
            onclick="updateWaLink('dia','${waNumber}')">
            📱 WhatsApp Web
          </a>` : `<span class="btn btn-ghost" style="opacity:.4;cursor:not-allowed">📱 WhatsApp indisponível</span>`}
        <button id="save-tpl-btn-dia" class="btn btn-ghost" onclick="saveBdayTemplate('dia')">💾 Salvar como modelo</button>
        <button class="btn btn-ghost" style="color:var(--text-muted);font-size:.8rem" onclick="resetBdayTemplate('dia','${firstName}',${daysLeft},'${dayMonth}')">↺ Restaurar original</button>
      </div>
    </div>

    <!-- NOTA SOBRE AUTOMAÇÃO FUTURA -->
    <div style="margin-top:20px;background:rgba(212,175,55,0.05);border:1px dashed var(--gold-dark);border-radius:10px;padding:12px 16px">
      <div style="font-size:0.78rem;color:var(--text-muted);display:flex;gap:8px;align-items:flex-start">
        <span style="color:var(--gold);flex-shrink:0">🤖</span>
        <span><strong style="color:var(--gold)">Automação futura:</strong> quando a integração com WhatsApp API for ativada (Evolution API ou WhatsApp Oficial), estas mensagens poderão ser enviadas automaticamente no dia configurado, sem intervenção manual.</span>
      </div>
    </div>
  `;

  openModal('bday-msg-modal');
};

// Alterna entre as abas de mensagem
window.switchBdayTab = function(tab) {
  document.getElementById('bday-panel-antecipada').classList.toggle('hidden', tab !== 'antecipada');
  document.getElementById('bday-panel-dia').classList.toggle('hidden', tab !== 'dia');
  document.getElementById('bday-tab-ant').classList.toggle('active', tab === 'antecipada');
  document.getElementById('bday-tab-dia').classList.toggle('active', tab === 'dia');
};

// Copia o texto atual do textarea (editável) para o clipboard
window.copyBdayMsg = function(which) {
  const id = which === 'ant' ? 'bday-msg-ant' : 'bday-msg-dia';
  const el = document.getElementById(id);
  if (!el) return;
  navigator.clipboard.writeText(el.value).then(() => {
    showToast('Mensagem copiada! Cole no WhatsApp.', 'gold', '📋');
  }).catch(() => {
    // Fallback para browsers sem clipboard API
    el.select();
    document.execCommand('copy');
    showToast('Mensagem copiada!', 'gold', '📋');
  });
};

// Atualiza o link do WhatsApp com o texto atual do textarea (antes de abrir)
window.updateWaLink = function(which, waNumber) {
  const textareaId = which === 'ant' ? 'bday-msg-ant' : 'bday-msg-dia';
  const linkId     = `wa-link-${which}`;
  const textarea   = document.getElementById(textareaId);
  const link       = document.getElementById(linkId);
  if (textarea && link) {
    link.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(textarea.value)}`;
  }
  return true; // allow navigation
};

// ============================================================
// MENSAGENS PADRÃO
// ============================================================
function buildMsgAntecipada(firstName, daysLeft, dayMonth) {
  const daysText = daysLeft === 1 ? 'amanhã' : `em ${daysLeft} dias (dia ${dayMonth})`;
  return `Olá ${firstName}! 💛

Aqui é a equipe Vanessa Amorim, sua clínica de estética facial e corporal. 🌸

Passamos para te lembrar que seu aniversário está chegando — ${daysText} — e queremos celebrar essa data especial com você!

🎁 Como presente, preparamos uma condição exclusiva:
✨ [DESCONTO DE X%] em [NOME DO PROCEDIMENTO/PRODUTO]
Válido para agendamentos realizados no mês do seu aniversário.

Que tal se presentear com um momento de autocuidado e se sentir ainda mais incrível no seu dia? 🥰

Para agendar ou saber mais, é só responder essa mensagem ou nos ligar!

Com carinho,
Equipe Vanessa Amorim 💛`;
}

function buildMsgDoDia(firstName) {
  return `Feliz Aniversário, ${firstName}! 🎂🎉

Hoje é o seu dia e a equipe inteira da Vanessa Amorim está aqui para celebrar com você!

Que este novo ano seja repleto de saúde, alegria, realizações e muito autocuidado — porque você merece se sentir linda e incrível todos os dias! ✨

🎁 Você ganhou um presente especial da nossa parte:
✨ [DESCONTO DE X%] em [NOME DO PROCEDIMENTO/PRODUTO]
Válido até o final do mês — aproveite!

Que a sua beleza interior e exterior brilhe cada vez mais. 💛

Com muito carinho,
Equipe Vanessa Amorim 🌸`;
}

// ============================================================
// NAVEGAÇÃO
// ============================================================
window.calPrev  = async function() { calDate.setMonth(calDate.getMonth() - 1); await drawCalendar(); };
window.calNext  = async function() { calDate.setMonth(calDate.getMonth() + 1); await drawCalendar(); };
window.calToday = async function() { calDate = new Date(); await drawCalendar(); };
