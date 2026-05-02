// ============================================================
// PAGE: PONTOS
// ============================================================
let _lpClients = [];
let _lpRules   = [];

async function renderPontos() {
  const page = document.getElementById('page-pontos');
  page.innerHTML = loadingSpinner();
  try {
    const [clients, rules] = await Promise.all([fetchClients(), fetchPointRules()]);
    _lpClients = clients;
    _lpRules   = rules;

    page.innerHTML = `
    <div class="grid-2" style="align-items:start;gap:24px">

      <!-- LANÇAR PONTOS -->
      <div class="card">
        <div class="card-header"><span class="card-title">⭐ Lançar Pontos</span></div>

        <div class="form-group">
          <label>Cliente *</label>
          ${acHTML('lp', 'Pesquisar cliente...')}
        </div>

        <div class="form-group">
          <label>Tipo de Pontuação *</label>
          <select id="lp-rule" onchange="onLpRuleChange()">
            <option value="">– Selecione –</option>
            ${rules.map(r => `<option value="${r.id}" data-pts="${r.points}" data-type="${r.rule_type||''}">${r.name} (+${r.points} pts)</option>`).join('')}
            <option value="manual" data-type="manual">Lançamento Manual</option>
          </select>
        </div>

        <div id="lp-pts-wrap" class="form-group hidden">
          <label>Pontos (manual)</label>
          <input type="number" id="lp-pts" min="1" value="50" />
        </div>

        <!-- "Indicado por" só aparece em regras de indicação -->
        <div id="lp-ref-wrap" class="form-group hidden">
          <label>Cliente que indicou</label>
          <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:6px">
            ℹ️ Quem indicou este cliente e deve receber os pontos de referência
          </div>
          ${acHTML('lp-ref', 'Pesquisar cliente que indicou...')}
        </div>

        <div class="form-group">
          <label>Data do Lançamento</label>
          <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:4px">
            Pré-preenchida com hoje. Altere para lançamentos retroativos.
          </div>
          <input type="text" id="lp-date" data-date-mask value="${fmtDateToMask(new Date().toISOString())}" />
        </div>

        <div class="form-group">
          <label>Descrição</label>
          <input type="text" id="lp-desc" placeholder="Detalhes do lançamento" />
        </div>

        <button class="btn btn-gold btn-lg" onclick="submitLpPoints()">⭐ Confirmar Lançamento</button>
      </div>

      <!-- RESGATAR PONTOS -->
      <div class="card">
        <div class="card-header"><span class="card-title">🎁 Registrar Resgate</span></div>

        <div class="form-group">
          <label>Cliente *</label>
          ${acHTML('rd2', 'Pesquisar cliente...')}
        </div>

        <div class="form-group">
          <label>Item Resgatado *</label>
          <select id="rd2-type" onchange="loadRedeemItems()">
            <option value="award">Premiação</option>
            <option value="procedure">Procedimento</option>
          </select>
        </div>

        <div class="form-group"><label>Item</label><select id="rd2-item"></select></div>
        <div class="form-group"><label>Observações</label><input type="text" id="rd2-notes" /></div>
        <button class="btn btn-outline-gold btn-lg" onclick="submitRd2()">🎁 Confirmar Resgate</button>

        <div style="margin-top:16px;background:rgba(212,175,55,.05);border:1px dashed var(--border);border-radius:10px;padding:12px 14px;font-size:.8rem;color:var(--text-muted)">
          🤖 <strong style="color:var(--gold)">Expiração automática:</strong>
          pontos com mais de 1 ano são descontados automaticamente ao abrir o sistema.
        </div>
      </div>
    </div>

    <!-- RECENT LOG -->
    <div class="card mt-24">
      <div class="card-header">
        <span class="card-title">📋 Lançamentos Recentes</span>
        <button class="btn btn-sm btn-ghost" onclick="refreshLpLog()">↺ Atualizar</button>
      </div>
      <div id="lp-log">${loadingSpinner()}</div>
    </div>
    `;

    // Init autocompletes
    acInit('lp',     clients, (c) => { acSetBadge('lp', c); });
    acInit('lp-ref', clients, () => {});
    acInit('rd2',    clients, (c) => { acSetBadge('rd2', c); });

    // Init date mask + calendar on launch date field
    initDateMask(document.getElementById('lp-date'));

    await loadLpLog();
    await loadRedeemItems();
  } catch(e) {
    page.innerHTML = `<p style="color:var(--rose)">Erro: ${e.message}</p>`;
  }
}

// ============================================================
// AUTOCOMPLETE — HTML + INIT (data-attrs, sem inline onclick)
// ============================================================
function acHTML(prefix, placeholder) {
  return `
  <div class="ac-wrap" data-ac="${prefix}" style="position:relative">
    <div class="ac-box" style="
      display:flex;align-items:center;gap:10px;
      background:var(--black-4);border:1.5px solid var(--border);
      border-radius:10px;padding:10px 14px;cursor:text;
      transition:border-color .2s,box-shadow .2s
    ">
      <span style="color:var(--text-muted);font-size:1rem;flex-shrink:0">🔍</span>
      <div id="${prefix}-ac-av" style="flex-shrink:0;display:none"></div>
      <input id="${prefix}-ac-q" type="text" placeholder="${placeholder}" autocomplete="off"
        style="flex:1;background:transparent;border:none;outline:none;
               color:var(--text-primary);font-family:inherit;font-size:.9rem" />
      <button id="${prefix}-ac-x" onclick="acClear('${prefix}')"
        style="display:none;background:none;border:none;color:var(--text-muted);
               cursor:pointer;font-size:1rem;padding:0;line-height:1">✕</button>
    </div>
    <input type="hidden" id="${prefix}-ac-val" />
    <div id="${prefix}-ac-dd" style="
      display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:600;
      background:var(--surface);border:1.5px solid var(--border-strong);border-radius:10px;
      max-height:220px;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.5)">
    </div>
    <div id="${prefix}-ac-badge" style="margin-top:6px;min-height:20px"></div>
  </div>`;
}

function acInit(prefix, clients, onSelect) {
  const input = document.getElementById(`${prefix}-ac-q`);
  const dd    = document.getElementById(`${prefix}-ac-dd`);
  const box   = document.querySelector(`[data-ac="${prefix}"] .ac-box`);
  if (!input || !dd) return;

  function renderOpts(list) {
    dd.innerHTML = list.length === 0
      ? `<div style="padding:14px;text-align:center;color:var(--text-muted);font-size:.85rem">Nenhum cliente encontrado</div>`
      : list.slice(0, 40).map(c => `
          <div class="ac-opt" data-id="${c.id}" data-pts="${c.total_points||0}"
            style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;transition:background .15s">
            ${renderAvatar(c.name, 30)}
            <div style="flex:1;min-width:0">
              <div style="font-size:.88rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.name}</div>
              <div style="font-size:.72rem;color:var(--text-muted)">${c.phone||c.email||'sem contato'}</div>
            </div>
            <span style="font-size:.78rem;color:var(--gold);font-weight:700;flex-shrink:0">${c.total_points||0} pts</span>
          </div>`).join('');
  }

  function openDd() {
    renderOpts(_lpClients);
    dd.style.display = 'block';
    if (box) { box.style.borderColor = 'var(--gold)'; box.style.boxShadow = '0 0 0 3px var(--gold-glow)'; }
  }

  function closeDd() {
    dd.style.display = 'none';
    if (box) { box.style.borderColor = ''; box.style.boxShadow = ''; }
  }

  dd.addEventListener('mousedown', e => e.preventDefault());

  dd.addEventListener('click', function(e) {
    const opt = e.target.closest('.ac-opt');
    if (!opt) return;
    const id   = opt.dataset.id;
    const pts  = parseInt(opt.dataset.pts || '0');
    const name = opt.querySelector('div > div:first-child')?.textContent?.trim() || '';
    acSelect(prefix, id, name, pts, onSelect);
    closeDd();
  });

  dd.addEventListener('mouseover', e => { const o = e.target.closest('.ac-opt'); if(o) o.style.background='rgba(212,175,55,.08)'; });
  dd.addEventListener('mouseout',  e => { const o = e.target.closest('.ac-opt'); if(o) o.style.background=''; });

  input.addEventListener('input', function() {
    const q = this.value.toLowerCase().trim();
    const filtered = q
      ? _lpClients.filter(c =>
          c.name.toLowerCase().includes(q) ||
          (c.phone||'').replace(/\D/g,'').includes(q.replace(/\D/g,''))
        )
      : _lpClients;
    renderOpts(filtered);
    dd.style.display = 'block';
  });

  input.addEventListener('focus', openDd);
  input.addEventListener('blur',  () => setTimeout(() => closeDd(), 150));
}

function acSelect(prefix, id, name, pts, onSelect) {
  const input  = document.getElementById(`${prefix}-ac-q`);
  const hidden = document.getElementById(`${prefix}-ac-val`);
  const avEl   = document.getElementById(`${prefix}-ac-av`);
  const xBtn   = document.getElementById(`${prefix}-ac-x`);
  const box    = document.querySelector(`[data-ac="${prefix}"] .ac-box`);

  if (input)  { input.value = name; input.style.fontWeight = '600'; }
  if (hidden) hidden.value = id;
  if (avEl)   { avEl.innerHTML = renderAvatar(name, 26); avEl.style.display = 'block'; }
  if (xBtn)   xBtn.style.display = 'block';
  if (box)    { box.style.borderColor = 'var(--gold)'; box.style.boxShadow = 'none'; }

  const client = _lpClients.find(c => c.id === id);
  if (onSelect && client) onSelect(client);
}

function acSetBadge(prefix, client) {
  const badge = document.getElementById(`${prefix}-ac-badge`);
  if (badge) badge.innerHTML = `<span style="font-size:.8rem;color:var(--text-muted)">Saldo atual: </span>${pointsBadge(client.total_points||0)}`;
}

window.acClear = function(prefix) {
  const input  = document.getElementById(`${prefix}-ac-q`);
  const hidden = document.getElementById(`${prefix}-ac-val`);
  const avEl   = document.getElementById(`${prefix}-ac-av`);
  const xBtn   = document.getElementById(`${prefix}-ac-x`);
  const badge  = document.getElementById(`${prefix}-ac-badge`);
  const box    = document.querySelector(`[data-ac="${prefix}"] .ac-box`);
  if (input)  { input.value = ''; input.style.fontWeight = ''; input.focus(); }
  if (hidden) hidden.value = '';
  if (avEl)   { avEl.innerHTML = ''; avEl.style.display = 'none'; }
  if (xBtn)   xBtn.style.display = 'none';
  if (badge)  badge.innerHTML = '';
  if (box)    box.style.borderColor = '';
};

// ---- RULE CHANGE — mostra/oculta campos condicionalmente ----
window.onLpRuleChange = function() {
  const sel  = document.getElementById('lp-rule');
  const opt  = sel.options[sel.selectedIndex];
  const type = opt?.dataset?.type || '';

  // Manual points input
  document.getElementById('lp-pts-wrap').classList.toggle('hidden', sel.value !== 'manual');

  // "Indicado por" só aparece para regras de indicação (referral_sent / referral_received)
  const isReferral = type.includes('referral');
  document.getElementById('lp-ref-wrap').classList.toggle('hidden', !isReferral);
};

// ---- REDEEM ITEMS ----
window.loadRedeemItems = async function() {
  const type = document.getElementById('rd2-type')?.value || 'award';
  const sel  = document.getElementById('rd2-item');
  if (!sel) return;
  try {
    if (type === 'award') {
      const awards = await fetchAwards();
      sel.innerHTML = awards.map(a => `<option value="${a.id}" data-pts="${a.points_required}">${a.name} (${a.points_required} pts)</option>`).join('') || '<option>Nenhuma cadastrada</option>';
    } else {
      const procs = await fetchProcedures();
      const r = procs.filter(p => p.redeemable_with_points);
      sel.innerHTML = r.map(p => `<option value="${p.id}" data-pts="${p.points_required}">${p.name} (${p.points_required} pts)</option>`).join('') || '<option>Nenhum disponível</option>';
    }
  } catch(_) {}
};

// ---- SUBMIT POINTS ----
window.submitLpPoints = async function() {
  const clientId = document.getElementById('lp-ac-val')?.value;
  const ruleSel  = document.getElementById('lp-rule');
  const ruleVal  = ruleSel?.value;
  const dateStr  = document.getElementById('lp-date')?.value;
  const isoDate  = parseMaskedDate(dateStr);

  if (!clientId) { showToast('Selecione um cliente','error'); return; }
  if (!ruleVal)  { showToast('Selecione o tipo de pontuação','error'); return; }
  if (!isoDate)  { showToast('Informe uma data válida (DD/MM/AAAA)','error'); return; }

  const pts = ruleVal === 'manual'
    ? parseInt(document.getElementById('lp-pts').value||'0')
    : parseInt(ruleSel.options[ruleSel.selectedIndex].dataset.pts||'0');
  if (pts <= 0) { showToast('Pontos inválidos','error'); return; }

  const desc  = document.getElementById('lp-desc').value;
  const refId = document.getElementById('lp-ref-ac-val')?.value || null;

  // Build ISO datetime: use selected date + current time
  const now = new Date();
  const customDate = `${isoDate}T${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:00`;

  try {
    await addPoints(clientId, ruleVal === 'manual' ? null : ruleVal, pts, desc, refId, customDate);
    showToast(`+${pts} pontos lançados!`, 'gold', '⭐');
    await checkAndNotifyAward(clientId);
    // Reset fields
    acClear('lp'); acClear('lp-ref');
    document.getElementById('lp-desc').value = '';
    document.getElementById('lp-rule').value = '';
    document.getElementById('lp-date').value = fmtDateToMask(new Date().toISOString());
    document.getElementById('lp-pts-wrap').classList.add('hidden');
    document.getElementById('lp-ref-wrap').classList.add('hidden');
    _lpClients = await fetchClients();
    await loadLpLog();
  } catch(e) { showToast('Erro: '+e.message,'error'); }
};

// ---- SUBMIT REDEEM ----
window.submitRd2 = async function() {
  const clientId  = document.getElementById('rd2-ac-val')?.value;
  const itemSel   = document.getElementById('rd2-item');
  const type      = document.getElementById('rd2-type').value;
  const client    = _lpClients.find(c => c.id === clientId);
  const currentPts= client?.total_points || 0;
  const pts       = parseInt(itemSel?.options[itemSel.selectedIndex]?.dataset.pts||'0');
  const notes     = document.getElementById('rd2-notes')?.value || '';
  if (!clientId) { showToast('Selecione um cliente','error'); return; }
  if (pts <= 0)  { showToast('Selecione um item válido','error'); return; }
  if (pts > currentPts) { showToast(`Pontos insuficientes! Cliente tem ${currentPts} pts.`,'error'); return; }
  const awardId = type === 'award' ? itemSel.value : null;
  const procId  = type === 'procedure' ? itemSel.value : null;
  const desc    = itemSel?.options[itemSel.selectedIndex]?.text || '';
  try {
    await redeemPoints(clientId, pts, notes||desc, awardId, procId);
    showToast(`Resgate de ${pts} pts confirmado!`, 'gold', '🎁');
    acClear('rd2');
    document.getElementById('rd2-notes').value = '';
    _lpClients = await fetchClients();
    await loadLpLog();
  } catch(e) { showToast('Erro: '+e.message,'error'); }
};

async function loadLpLog() {
  const wrap = document.getElementById('lp-log');
  if (!wrap) return;
  try {
    const events = await fetchRecentPointEvents(20);
    if (events.length === 0) { wrap.innerHTML = emptyState('📋','Nenhum lançamento ainda'); return; }
    wrap.innerHTML = `<div class="table-wrap"><table>
      <thead><tr><th>Data</th><th>Cliente</th><th>Pontos</th><th>Descrição</th><th>Vence em</th></tr></thead>
      <tbody>${events.map(t => `<tr>
        <td style="color:var(--text-muted);font-size:.8rem">${fmtDateTime(t.created_at)}</td>
        <td><strong>${t.client?.name||'–'}</strong></td>
        <td><span class="badge badge-green">+${t.points}</span></td>
        <td style="color:var(--text-secondary)">${t.description||'–'}</td>
        <td style="color:var(--text-muted);font-size:.8rem">${fmtDate(t.expires_at)}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
  } catch(e) { wrap.innerHTML = `<p style="color:var(--rose)">Erro ao carregar log</p>`; }
}

window.refreshLpLog = loadLpLog;
