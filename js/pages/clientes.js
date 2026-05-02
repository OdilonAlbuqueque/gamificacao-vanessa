// ============================================================
// PAGE: CLIENTES
// ============================================================

let clientsData = [];
let selectedClientId = null;

async function renderClientes() {
  const page = document.getElementById('page-clientes');
  page.innerHTML = `
  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px">
    <div class="tab-bar" style="max-width:320px">
      <button class="tab-btn active" id="tab-ranking-btn" onclick="showClientsTab('ranking')">🏆 Ranking</button>
      <button class="tab-btn" id="tab-list-btn" onclick="showClientsTab('list')">📋 Lista</button>
    </div>
    <button class="btn btn-gold" onclick="openClientModal()">✦ Novo Cliente</button>
  </div>

  <!-- SEARCH BAR PREMIUM -->
  <div style="position:relative;margin-bottom:20px">
    <div id="client-search-box" style="
      display:flex;align-items:center;gap:12px;
      background:var(--surface);border:1.5px solid var(--border);
      border-radius:14px;padding:12px 18px;
      transition:border-color 0.2s,box-shadow 0.2s;
      cursor:text
    " onclick="document.getElementById('client-search').focus()">
      <span style="color:var(--text-muted);font-size:1.1rem;flex-shrink:0">🔍</span>
      <input
        type="text" id="client-search"
        placeholder="Pesquisar por nome, telefone ou CPF..."
        autocomplete="off"
        style="flex:1;background:transparent;border:none;outline:none;color:var(--text-primary);font-family:inherit;font-size:0.95rem"
        oninput="filterClients(this.value)"
        onfocus="document.getElementById('client-search-box').style.borderColor='var(--gold)';document.getElementById('client-search-box').style.boxShadow='0 0 0 3px var(--gold-glow)'"
        onblur="document.getElementById('client-search-box').style.borderColor='';document.getElementById('client-search-box').style.boxShadow=''"
      />
      <div id="search-count" style="font-size:0.78rem;color:var(--text-muted);white-space:nowrap"></div>
      <button id="search-clear-btn" onclick="clearClientSearch()" style="
        display:none;background:none;border:none;color:var(--text-muted);
        cursor:pointer;font-size:1rem;padding:0;line-height:1;
        transition:color 0.2s
      " title="Limpar pesquisa">✕</button>
    </div>
  </div>

  <!-- RANKING TAB -->
  <div id="tab-ranking" class="tab-content">
    <div id="ranking-table-wrap">${loadingSpinner()}</div>
  </div>

  <!-- LIST TAB -->
  <div id="tab-list" class="tab-content hidden">
    <div id="client-list-wrap">${loadingSpinner()}</div>
  </div>

  <!-- CLIENT MODAL -->
  <div id="client-modal" class="modal-overlay hidden">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title" id="client-modal-title">Novo Cliente</span>
        <button class="modal-close" onclick="closeModal('client-modal')">✕</button>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Nome Completo *</label><input type="text" id="c-name" /></div>
        <div class="form-group"><label>CPF</label><input type="text" id="c-cpf" placeholder="000.000.000-00" maxlength="14" oninput="this.value=maskCPF(this.value)" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Telefone</label><input type="tel" id="c-phone" placeholder="(00) 00000-0000" oninput="this.value=maskPhone(this.value)" /></div>
        <div class="form-group"><label>E-mail</label><input type="email" id="c-email" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Data de Aniversário</label><input type="text" id="c-birth" data-date-mask /></div>
        <div class="form-group"><label>Instagram</label><input type="text" id="c-instagram" placeholder="@usuario" /></div>
      </div>
      <div class="form-group"><label>Endereço</label><input type="text" id="c-address" /></div>
      <div class="form-row">
        <div class="form-group"><label>Cidade</label><input type="text" id="c-city" /></div>
        <div class="form-group"><label>Estado</label><input type="text" id="c-state" maxlength="2" /></div>
      </div>
      <div class="form-group"><label>CEP</label><input type="text" id="c-zip" maxlength="9" /></div>
      <div class="form-group"><label>Indicado por</label>
        <select id="c-referred"><option value="">– Nenhum –</option></select>
      </div>
      <div class="form-group"><label>Observações</label><textarea id="c-notes" rows="2"></textarea></div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal('client-modal')">Cancelar</button>
        <button class="btn btn-gold" onclick="saveClient()">Salvar Cliente</button>
      </div>
    </div>
  </div>

  <!-- CLIENT DETAIL MODAL -->
  <div id="client-detail-modal" class="modal-overlay hidden">
    <div class="modal modal-wide">
      <div class="modal-header">
        <span class="modal-title" id="cd-name">Perfil do Cliente</span>
        <div style="display:flex;gap:8px">
          <button class="btn btn-sm btn-outline-gold" onclick="printCurrentClient()">🖨 Imprimir</button>
          <button class="modal-close" onclick="closeModal('client-detail-modal')">✕</button>
        </div>
      </div>
      <div id="client-detail-body"></div>
    </div>
  </div>
  `;

  await loadClientsData();
}

async function loadClientsData() {
  try {
    clientsData = await fetchClients();
    renderRankingTable(clientsData);
    renderClientList(clientsData);
    populateReferredSelect(clientsData);
  } catch (e) {
    showToast('Erro ao carregar clientes: ' + e.message, 'error');
  }
}

function renderRankingTable(data) {
  const sorted = [...data].sort((a,b) => b.total_points - a.total_points).map((c,i) => ({...c, rank: i+1}));
  const wrap = document.getElementById('ranking-table-wrap');
  if (!wrap) return;
  if (sorted.length === 0) { wrap.innerHTML = emptyState('🏆','Nenhum cliente cadastrado','Clique em "+ Novo Cliente" para começar.'); return; }
  wrap.innerHTML = `<div class="table-wrap"><table>
    <thead><tr><th>#</th><th>Cliente</th><th>Telefone</th><th>Pontos</th><th>Ações</th></tr></thead>
    <tbody>
      ${sorted.map(c => `<tr>
        <td>${rankBadge(c.rank)}</td>
        <td><div class="flex-center gap-8">${renderAvatar(c.name)}<span style="font-weight:600">${c.name}</span></div></td>
        <td style="color:var(--text-secondary)">${c.phone || '–'}</td>
        <td>${pointsBadge(c.total_points || 0)}</td>
        <td><div style="display:flex;gap:6px">
          <button class="btn btn-sm btn-outline-gold" onclick="openClientDetail('${c.id}')">Ver</button>
          <button class="btn btn-sm btn-ghost" onclick="openClientModal('${c.id}')">✏</button>
          <button class="btn btn-sm btn-gold" onclick="openAddPointsModal('${c.id}','${c.name}')">+ Pts</button>
        </div></td>
      </tr>`).join('')}
    </tbody>
  </table></div>`;
}

function renderClientList(data) {
  const wrap = document.getElementById('client-list-wrap');
  if (!wrap) return;
  if (data.length === 0) { wrap.innerHTML = emptyState('♛','Nenhum cliente encontrado'); return; }
  wrap.innerHTML = `<div class="grid-auto">
    ${data.map(c => `
    <div class="card" style="cursor:pointer" onclick="openClientDetail('${c.id}')">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        ${renderAvatar(c.name, 44)}
        <div>
          <div style="font-weight:700">${c.name}</div>
          <div style="font-size:0.78rem;color:var(--text-muted)">${c.phone || c.email || '–'}</div>
        </div>
        <div style="margin-left:auto">${pointsBadge(c.total_points || 0)}</div>
      </div>
      ${c.birth_date ? `<div style="font-size:0.78rem;color:var(--text-muted)">🎂 ${fmtDate(c.birth_date, {day:'2-digit',month:'long'})}</div>` : ''}
      ${c.instagram ? `<div style="font-size:0.78rem;color:var(--rose)">📸 ${c.instagram}</div>` : ''}
    </div>`).join('')}
  </div>`;
}

function populateReferredSelect(clients) {
  const sel = document.getElementById('c-referred');
  if (!sel) return;
  const base = '<option value="">– Nenhum –</option>';
  sel.innerHTML = base + clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function filterClients(search) {
  const q = search.toLowerCase().trim();
  const filtered = q
    ? clientsData.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.phone||'').includes(q) ||
        (c.cpf||'').replace(/\D/g,'').includes(q.replace(/\D/g,''))
      )
    : clientsData;

  renderRankingTable(filtered);
  renderClientList(filtered);

  // Update count badge
  const count = document.getElementById('search-count');
  const clear = document.getElementById('search-clear-btn');
  if (count) count.textContent = q ? `${filtered.length} encontrado${filtered.length !== 1 ? 's' : ''}` : '';
  if (clear) clear.style.display = q ? 'block' : 'none';
}

window.clearClientSearch = function() {
  const input = document.getElementById('client-search');
  if (input) { input.value = ''; input.focus(); }
  filterClients('');
};

function showClientsTab(tab) {
  document.getElementById('tab-ranking').classList.toggle('hidden', tab !== 'ranking');
  document.getElementById('tab-list').classList.toggle('hidden', tab !== 'list');
  document.getElementById('tab-ranking-btn').classList.toggle('active', tab === 'ranking');
  document.getElementById('tab-list-btn').classList.toggle('active', tab === 'list');
}

// ---- CLIENT MODAL ----
let editingClientId = null;
window.openClientModal = function(id = null) {
  editingClientId = id;
  document.getElementById('client-modal-title').textContent = id ? 'Editar Cliente' : 'Novo Cliente';
  const fields = ['name','cpf','phone','email','birth','instagram','address','city','state','zip','notes'];
  fields.forEach(f => { const el = document.getElementById('c-'+f); if(el) el.value = ''; });
  document.getElementById('c-referred').value = '';

  if (id) {
    const c = clientsData.find(x => x.id === id);
    if (c) {
      document.getElementById('c-name').value = c.name || '';
      document.getElementById('c-cpf').value = c.cpf || '';
      document.getElementById('c-phone').value = maskPhone(c.phone || '');
      document.getElementById('c-email').value = c.email || '';
      document.getElementById('c-birth').value = fmtDateToMask(c.birth_date);
      document.getElementById('c-instagram').value = c.instagram || '';
      document.getElementById('c-address').value = c.address || '';
      document.getElementById('c-city').value = c.city || '';
      document.getElementById('c-state').value = c.state || '';
      document.getElementById('c-zip').value = c.zip_code || '';
      document.getElementById('c-notes').value = c.notes || '';
      document.getElementById('c-referred').value = c.referred_by || '';
    }
  }
  populateReferredSelect(clientsData.filter(c => c.id !== id));

  // Move modal to body so it always renders above every other modal (DOM order wins z-index ties)
  const modal = document.getElementById('client-modal');
  if (modal && modal.parentElement !== document.body) {
    document.body.appendChild(modal);
  }
  if (modal) modal.style.zIndex = '1200';

  openModal('client-modal');
  applyDateMasks(document.getElementById('client-modal'));
  initDateMask(document.getElementById('c-birth'));
};

window.saveClient = async function() {
  const name = document.getElementById('c-name').value.trim();
  if (!name) { showToast('Nome é obrigatório','error'); return; }

  const referredById = document.getElementById('c-referred').value || null;

  const payload = {
    name,
    cpf:        document.getElementById('c-cpf').value || null,
    phone:      document.getElementById('c-phone').value || null,
    email:      document.getElementById('c-email').value || null,
    birth_date: parseMaskedDate(document.getElementById('c-birth').value) || null,
    instagram:  document.getElementById('c-instagram').value || null,
    address:    document.getElementById('c-address').value || null,
    city:       document.getElementById('c-city').value || null,
    state:      document.getElementById('c-state').value || null,
    zip_code:   document.getElementById('c-zip').value || null,
    notes:      document.getElementById('c-notes').value || null,
    referred_by: referredById,
  };

  try {
    if (editingClientId) {
      // ---- EDIÇÃO: apenas atualiza dados, sem mover pontos ----
      await dbUpdate('clients', editingClientId, payload);
      showToast('Cliente atualizado!');
    } else {
      // ---- NOVO CLIENTE ----
      const newClient = await dbInsert('clients', payload);
      showToast(`Cliente ${name} cadastrado!`, 'gold', '✦');

      // 🔗 Se veio indicado, creditar pontos ao cliente que indicou
      if (referredById) {
        await awardReferralPoints(referredById, name, newClient.id);
      }
    }

    closeModal('client-modal');
    await loadClientsData();
  } catch(e) { showToast('Erro: ' + e.message, 'error'); }
};

// Busca a regra "referral_sent" ativa e credita ao cliente que indicou
async function awardReferralPoints(referrerClientId, newClientName, newClientId) {
  try {
    const rules = await fetchPointRules();
    const rule = rules.find(r => r.rule_type === 'referral_sent' && r.is_active !== false);

    if (!rule) {
      // Regra não configurada — avisa mas não bloqueia o cadastro
      showToast('Aviso: nenhuma regra de "Indicação" ativa encontrada em Configurações.', 'gold', '⚠️');
      return;
    }

    // Credita os pontos ao cliente que indicou
    await addPoints(
      referrerClientId,
      rule.id,
      rule.points,
      `Indicou ${newClientName}`,
      newClientId   // referência ao novo cliente
    );

    // Descobre o nome do cliente que indicou para o toast
    const referrer = clientsData.find(c => c.id === referrerClientId);
    const referrerName = referrer?.name || 'Cliente indicador';

    showToast(
      `⭐ ${referrerName} ganhou ${rule.points} pts por indicar ${newClientName}!`,
      'gold',
      '🔗'
    );

    // Verifica se o indicador desbloqueou algum prêmio
    await checkAndNotifyAward(referrerClientId);

  } catch(err) {
    // Não bloqueia o fluxo — cadastro já foi feito, só loga o erro
    console.error('Erro ao creditar pontos de indicação:', err);
    showToast('Cliente cadastrado! Não foi possível creditar pontos de indicação automaticamente.', 'gold', '⚠️');
  }
}


// ---- CLIENT DETAIL ----
let _detailSeq = 0; // sequence guard: descarta resultado de carga anterior

window.openClientDetail = async function(id) {
  selectedClientId = id;
  const mySeq = ++_detailSeq; // snapshot da sequência desta chamada

  openModal('client-detail-modal');
  document.getElementById('cd-name').textContent   = 'Carregando…';
  document.getElementById('client-detail-body').innerHTML = loadingSpinner();

  try {
    const [client, transactions] = await Promise.all([fetchClientById(id), fetchClientTransactions(id)]);

    // Descarta se o usuário já abriu outro cliente enquanto carregava
    if (mySeq !== _detailSeq) return;

    document.getElementById('cd-name').textContent = client.name;
    const validPts   = transactions.filter(t => t.transaction_type === 'earned' && !t.expired_at && new Date(t.expires_at) > new Date()).reduce((s,t)=>s+t.points,0);
    const expiredPts = transactions.filter(t => t.transaction_type === 'expired').reduce((s,t)=>s+t.points,0);
    const redeemedPts= transactions.filter(t => t.transaction_type === 'redeemed').reduce((s,t)=>s+t.points,0);

    document.getElementById('client-detail-body').innerHTML = `
    <div class="grid-4 mb-16" style="grid-template-columns:repeat(4,1fr)">
      <div class="card card-gold" style="padding:14px;text-align:center">
        <div style="font-size:1.5rem;font-weight:800;color:var(--gold)">${client.total_points || 0}</div>
        <div style="font-size:0.72rem;color:var(--text-muted)">Pontos Ativos</div>
      </div>
      <div class="card" style="padding:14px;text-align:center">
        <div style="font-size:1.5rem;font-weight:800;color:var(--teal)">${validPts}</div>
        <div style="font-size:0.72rem;color:var(--text-muted)">Ganhos</div>
      </div>
      <div class="card" style="padding:14px;text-align:center">
        <div style="font-size:1.5rem;font-weight:800;color:var(--gold-dark)">${redeemedPts}</div>
        <div style="font-size:0.72rem;color:var(--text-muted)">Resgatados</div>
      </div>
      <div class="card" style="padding:14px;text-align:center">
        <div style="font-size:1.5rem;font-weight:800;color:var(--rose)">${expiredPts}</div>
        <div style="font-size:0.72rem;color:var(--text-muted)">Expirados</div>
      </div>
    </div>

    <div class="grid-2 mb-16">
      <div class="card" style="padding:16px">
        <div style="font-size:0.8rem;font-weight:700;color:var(--text-secondary);margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em">Dados do Cliente</div>
        <div style="display:flex;flex-direction:column;gap:6px;font-size:0.85rem">
          ${client.cpf ? `<div>CPF: <strong>${client.cpf}</strong></div>` : ''}
          ${client.phone ? `<div>📞 ${client.phone}</div>` : ''}
          ${client.email ? `<div>✉ ${client.email}</div>` : ''}
          ${client.birth_date ? `<div>🎂 ${fmtDate(client.birth_date, {day:'2-digit',month:'long',year:'numeric'})}</div>` : ''}
          ${client.instagram ? `<div>📸 ${client.instagram}</div>` : ''}
          ${client.address ? `<div>📍 ${client.address}, ${client.city||''} ${client.state||''}</div>` : ''}
          <div style="color:var(--text-muted);font-size:0.75rem">Cadastrado em ${fmtDate(client.created_at)}</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <button class="btn btn-gold" onclick="openAddPointsModal('${client.id}','${client.name}')">⭐ Lançar Pontos</button>
        <button class="btn btn-outline-gold" onclick="openRedeemModal('${client.id}','${client.name}',${client.total_points})">🎁 Resgatar Prêmio</button>
        <button class="btn btn-ghost" onclick="openClientModal('${client.id}')">✏ Editar Dados</button>
        ${client.cpf ? `
        <hr style="border:none;border-top:1px solid var(--border);margin:4px 0" />
        <button class="btn btn-ghost" style="color:var(--teal);border-color:rgba(78,205,196,.3)"
          onclick="sendNpsLink('${client.cpf.replace(/\D/g,'')}','${client.name}','${client.phone||''}')">
          📱 Enviar Link NPS
        </button>` : ''}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">Histórico de Pontos</span></div>
      ${transactions.length === 0 ? emptyState('⭐','Nenhum ponto registrado') : transactions.map(t => {
        const typeLabel = {earned:'Pontos Ganhos',redeemed:'Resgate',expired:'Expirado',manual_add:'Ajuste +',manual_remove:'Ajuste –'}[t.transaction_type]||t.transaction_type;
        const isPos = ['earned','manual_add'].includes(t.transaction_type);
        const icon  = {earned:'⭐',redeemed:'🎁',expired:'⏳',manual_add:'⬆',manual_remove:'⬇'}[t.transaction_type]||'●';
        const cls   = t.transaction_type === 'expired' ? 'expired' : isPos ? 'positive' : 'negative';
        const iconCls = {earned:'point-earned',redeemed:'point-redeemed',expired:'point-expired'}[t.transaction_type]||'';
        const expiryInfo = t.expires_at && t.transaction_type === 'earned' ? `<span style="font-size:0.72rem;color:var(--text-muted);margin-left:8px">Vence ${fmtDate(t.expires_at)}</span>` : '';
        return `<div class="point-entry">
          <div class="point-entry-icon ${iconCls}">${icon}</div>
          <div class="point-entry-info">
            <div class="point-entry-desc">${typeLabel}${t.description ? ` – ${t.description}` : ''}${expiryInfo}</div>
            <div class="point-entry-date">${fmtDateTime(t.created_at)}</div>
          </div>
          <div class="point-entry-value ${cls}">${isPos?'+':'–'}${t.points}</div>
        </div>`;
      }).join('')}
    </div>
    `;
  } catch(e) {
    if (mySeq !== _detailSeq) return; // descarta erro de chamada anterior
    document.getElementById('client-detail-body').innerHTML = `<p style="color:var(--rose)">Erro: ${e.message}</p>`;
  }
};

window.printCurrentClient = async function() {
  if (!selectedClientId) return;
  try {
    const [client, transactions] = await Promise.all([fetchClientById(selectedClientId), fetchClientTransactions(selectedClientId)]);
    printClientCard(client, transactions);
  } catch(e) { showToast('Erro ao imprimir: '+e.message,'error'); }
};

window.openAddPointsModal = async function(clientId, clientName) {
  selectedClientId = clientId;
  const rules = await fetchPointRules();
  // Remove any existing modal
  document.getElementById('add-points-modal')?.remove();
  const html = `
  <div id="add-points-modal" class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">⭐ Lançar Pontos – ${clientName}</span>
        <button class="modal-close" onclick="document.getElementById('add-points-modal').remove()">✕</button>
      </div>
      <div class="form-group">
        <label>Tipo de Pontuação</label>
        <select id="ap-rule" onchange="onRuleChange(this)">
          <option value="">– Selecione –</option>
          ${rules.map(r => `<option value="${r.id}" data-pts="${r.points}">${r.name} (+${r.points} pts)</option>`).join('')}
          <option value="manual">Lançamento Manual</option>
        </select>
      </div>
      <div class="form-group" id="ap-pts-wrap" style="display:none">
        <label>Pontos (manual)</label>
        <input type="number" id="ap-pts" min="1" value="0" />
      </div>
      <div class="form-group">
        <label>Descrição</label>
        <input type="text" id="ap-desc" placeholder="Descrição do lançamento" />
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="document.getElementById('add-points-modal').remove()">Cancelar</button>
        <button class="btn btn-gold" onclick="submitAddPoints('${clientId}')">Confirmar Pontos</button>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
};

window.onRuleChange = function(sel) {
  const isManual = sel.value === 'manual';
  document.getElementById('ap-pts-wrap').style.display = isManual ? '' : 'none';
  document.getElementById('ap-ref-wrap').style.display = (sel.options[sel.selectedIndex]?.dataset.pts && sel.value.includes('-')) ? '' : 'none';
};

window.submitAddPoints = async function(clientId) {
  const ruleSel = document.getElementById('ap-rule');
  const ruleId  = ruleSel.value === 'manual' ? null : ruleSel.value;
  const pts     = ruleId
    ? parseInt(ruleSel.options[ruleSel.selectedIndex].dataset.pts || '0')
    : parseInt(document.getElementById('ap-pts').value || '0');
  const desc = document.getElementById('ap-desc').value || '';
  const refId = document.getElementById('ap-ref')?.value || null;

  if (!ruleSel.value) { showToast('Selecione o tipo de pontuação','error'); return; }
  if (pts <= 0) { showToast('Pontos devem ser maiores que 0','error'); return; }

  try {
    await addPoints(clientId, ruleId, pts, desc, refId);
    showToast(`+${pts} pontos lançados com sucesso!`,'gold','⭐');
    document.getElementById('add-points-modal')?.remove();
    await checkAndNotifyAward(clientId);
    await loadClientsData();
    if (document.getElementById('client-detail-modal') && !document.getElementById('client-detail-modal').classList.contains('hidden')) {
      openClientDetail(clientId);
    }
  } catch(e) { showToast('Erro: '+e.message,'error'); }
};

async function checkAndNotifyAward(clientId) {
  try {
    const result = await checkAwardUnlock(clientId);
    if (result) showAwardAlert(result.client.name, result.award.name, result.award.points_required);
  } catch(_) {}
}

// ---- REDEEM MODAL ----
window.openRedeemModal = async function(clientId, clientName, currentPts) {
  const [awards, procedures] = await Promise.all([fetchAwards(), fetchProcedures()]);
  const redeemableProcs = procedures.filter(p => p.redeemable_with_points && p.points_required);
  const html = `
  <div id="redeem-modal" class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">🎁 Resgatar – ${clientName}</span>
        <button class="modal-close" onclick="closeModal('redeem-modal')">✕</button>
      </div>
      <p style="color:var(--text-secondary);margin-bottom:16px">Pontos disponíveis: <strong style="color:var(--gold)">${currentPts}</strong></p>
      <div class="form-group">
        <label>Tipo de Resgate</label>
        <select id="rd-type" onchange="onRedeemTypeChange()">
          <option value="award">Premiação</option>
          <option value="procedure">Procedimento</option>
        </select>
      </div>
      <div id="rd-award-wrap" class="form-group">
        <label>Premiação</label>
        <select id="rd-award">
          ${awards.length === 0 ? '<option>Nenhuma premiação cadastrada</option>' : awards.map(a => `<option value="${a.id}" data-pts="${a.points_required}">${a.name} (${a.points_required} pts)</option>`).join('')}
        </select>
      </div>
      <div id="rd-proc-wrap" class="form-group hidden">
        <label>Procedimento</label>
        <select id="rd-proc">
          ${redeemableProcs.length === 0 ? '<option>Nenhum procedimento disponível</option>' : redeemableProcs.map(p => `<option value="${p.id}" data-pts="${p.points_required}">${p.name} (${p.points_required} pts)</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label>Observações</label><input type="text" id="rd-notes" /></div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="document.getElementById('redeem-modal').remove()">Cancelar</button>
        <button class="btn btn-gold" onclick="submitRedeem('${clientId}',${currentPts})">Confirmar Resgate</button>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
};

window.onRedeemTypeChange = function() {
  const t = document.getElementById('rd-type').value;
  document.getElementById('rd-award-wrap').classList.toggle('hidden', t !== 'award');
  document.getElementById('rd-proc-wrap').classList.toggle('hidden', t !== 'procedure');
};

window.submitRedeem = async function(clientId, currentPts) {
  const type = document.getElementById('rd-type').value;
  let awardId = null, procId = null, pts = 0, desc = '';
  if (type === 'award') {
    const sel = document.getElementById('rd-award');
    awardId = sel.value;
    pts = parseInt(sel.options[sel.selectedIndex]?.dataset.pts || '0');
    desc = `Resgate: ${sel.options[sel.selectedIndex]?.text || ''}`;
  } else {
    const sel = document.getElementById('rd-proc');
    procId = sel.value;
    pts = parseInt(sel.options[sel.selectedIndex]?.dataset.pts || '0');
    desc = `Procedimento: ${sel.options[sel.selectedIndex]?.text || ''}`;
  }
  const notes = document.getElementById('rd-notes').value;
  if (pts <= 0) { showToast('Selecione um item válido','error'); return; }
  if (pts > currentPts) { showToast('Pontos insuficientes!','error'); return; }
};

// ---- NPS LINK ----
window.sendNpsLink = function(cpf, name, phone) {
  var base = window.location.origin + window.location.pathname.replace('index.html','');
  var portalUrl = base + 'cliente.html?cpf=' + cpf;
  var firstName = name.split(' ')[0];
  var msg = 'Ola, ' + firstName + '!\n\nObrigada pela visita a Clinica Vanessa Amorim!\n\n'
    + portalUrl + '\n\nLogin: seu CPF\nSenha: clinicava\n\nSua opiniao importa! =)';
  if (phone) {
    var w = '55' + phone.replace(/\D/g,'');
    window.open('https://wa.me/' + w + '?text=' + encodeURIComponent(msg), '_blank');
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(msg)
      .then(function() { showToast('Link copiado! Cole no WhatsApp.','gold','ok'); })
      .catch(function() { prompt('Copie e envie pelo WhatsApp:', msg); });
  } else {
    prompt('Copie e envie pelo WhatsApp:', msg);
  }
};
