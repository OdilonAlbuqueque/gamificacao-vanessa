// ============================================================
// PAGE: MENSAGENS (WhatsApp - pré-estrutura)
// ============================================================
async function renderMensagens() {
  const page = document.getElementById('page-mensagens');
  page.innerHTML = loadingSpinner();
  try {
    const [templates, clients] = await Promise.all([fetchWATemplates(), fetchClients()]);
    const categories = {
      birthday:      { label: '🎂 Aniversário', color: 'var(--purple)' },
      points_earned: { label: '⭐ Pontos Ganhos', color: 'var(--gold)' },
      award_reached: { label: '🏆 Prêmio Conquistado', color: 'var(--gold)' },
      points_expiring:{ label: '⏳ Pontos Expirando', color: 'var(--rose)' },
      procedure_done:{ label: '💆 Procedimento', color: 'var(--teal)' },
      general:       { label: '💬 Geral', color: 'var(--text-secondary)' },
    };
    const tags = ['{{nome_cliente}}','{{pontos}}','{{pontos_totais}}','{{motivo}}','{{nome_premio}}','{{data_expiracao}}','{{pontos_expirando}}','{{nome_procedimento}}'];

    page.innerHTML = `
    <!-- TAB BAR -->
    <div class="tab-bar mb-24" style="max-width:680px">
      <button class="tab-btn active" id="msg-tab-templates" onclick="showMsgTab('templates')">📝 Templates</button>
      <button class="tab-btn" id="msg-tab-nps" onclick="showMsgTab('nps')">📊 Envio de NPS</button>
    </div>

    <!-- ===== TAB: TEMPLATES ===== -->
    <div id="msg-panel-templates">
      <!-- STATUS BANNER -->
      <div style="background:rgba(212,175,55,0.07);border:1px dashed var(--gold);border-radius:12px;padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;gap:12px">
        <span style="font-size:1.5rem">📱</span>
        <div>
          <div style="font-weight:700;color:var(--gold)">Módulo WhatsApp – Pré-configurado</div>
          <div style="font-size:0.83rem;color:var(--text-secondary)">Os templates estão prontos. Configure a API nas <strong>Configurações &gt; WhatsApp</strong> para ativar o envio automático.</div>
        </div>
      </div>

      <div class="grid-2" style="align-items:start;gap:20px">
        <!-- TEMPLATES LIST -->
        <div>
          <div class="section-header mb-16">
            <span class="section-title">📝 Templates de Mensagem</span>
            <button class="btn btn-gold btn-sm" onclick="openTemplateModal()">+ Novo Template</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px">
            ${templates.map(t => {
              const cat = categories[t.category] || categories.general;
              return `<div class="wa-template-card">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                  <div>
                    <span style="font-weight:700">${t.name}</span>
                    <span class="badge" style="background:transparent;border-color:${cat.color};color:${cat.color};margin-left:8px">${cat.label}</span>
                  </div>
                  <div style="display:flex;gap:6px">
                    <button class="btn btn-sm btn-ghost" onclick="editTemplate('${t.id}')">✏</button>
                    <button class="btn btn-sm btn-outline-gold" onclick="openSendModal('${t.id}')">📤 Enviar</button>
                  </div>
                </div>
                <div class="template-preview">${t.message}</div>
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- SEND PANEL + TAGS -->
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card">
            <div class="card-header"><span class="card-title">🏷 Tags Disponíveis</span></div>
            <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:10px">Clique para copiar a tag</p>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              ${tags.map(tag => `<span class="badge badge-gold" style="cursor:pointer" onclick="copyTag('${tag}',this)">${tag}</span>`).join('')}
            </div>
          </div>

          <div class="card">
            <div class="card-header"><span class="card-title">📤 Envio Rápido</span></div>
            <div class="form-group">
              <label>Cliente</label>
              <select id="msg-client">
                <option value="">– Selecione –</option>
                ${clients.map(c => `<option value="${c.id}" data-phone="${c.phone||''}" data-name="${c.name}" data-pts="${c.total_points||0}">${c.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Template</label>
              <select id="msg-template" onchange="previewMessage()">
                <option value="">– Selecione –</option>
                ${templates.map(t => `<option value="${t.id}" data-msg="${encodeURIComponent(t.message)}">${t.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Mensagem (editável)</label>
              <textarea id="msg-preview" rows="5" style="font-family:monospace;font-size:0.82rem"></textarea>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-ghost flex-1" onclick="sendViaWebWhatsApp()">🌐 WhatsApp Web</button>
              <button class="btn btn-gold flex-1" onclick="sendViaAPI()">📡 Enviar via API</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== TAB: NPS ===== -->
    <div id="msg-panel-nps" class="hidden">
      <div class="card" style="margin-bottom:20px;background:rgba(78,205,196,0.05);border-color:rgba(78,205,196,0.3)">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:1.5rem">📊</span>
          <div>
            <div style="font-weight:700;color:var(--teal)">Envio de Pesquisa NPS</div>
            <div style="font-size:0.83rem;color:var(--text-secondary)">
              Selecione os clientes que receberão o link da pesquisa de satisfação. O link abre o portal do cliente com o NPS destacado.
            </div>
          </div>
        </div>
      </div>

      <div class="grid-2" style="align-items:start;gap:20px">
        <!-- CLIENT SELECTOR -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">👥 Selecionar Clientes</span>
            <div style="display:flex;gap:8px;align-items:center">
              <button class="btn btn-sm btn-ghost" onclick="npsSelectAll()">Todos</button>
              <button class="btn btn-sm btn-ghost" onclick="npsSelectNone()">Limpar</button>
            </div>
          </div>
          <!-- Search -->
          <div style="position:relative;margin-bottom:12px">
            <input type="text" id="nps-client-search" placeholder="Buscar cliente..." oninput="filterNPSClients(this.value)"
              style="width:100%;background:var(--black-4);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);padding:9px 12px 9px 34px;font-family:inherit;font-size:0.88rem;outline:none" />
            <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-muted)">🔍</span>
          </div>
          <div id="nps-client-list" style="max-height:340px;overflow-y:auto;display:flex;flex-direction:column;gap:4px">
            ${clients.map(c => `
            <label id="nps-row-${c.id}" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;cursor:pointer;transition:background .15s;border:1px solid transparent"
              onmouseover="this.style.background='rgba(212,175,55,0.06)'" onmouseout="this.style.background=''">
              <input type="checkbox" class="nps-chk" value="${c.id}"
                data-name="${c.name}" data-phone="${c.phone||''}" data-cpf="${(c.cpf||'').replace(/\D/g,'')}"
                onchange="updateNPSSelection()"
                style="width:16px;height:16px;accent-color:var(--gold);cursor:pointer" />
              <div style="flex:1;min-width:0">
                <div style="font-size:.88rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.name}</div>
                <div style="font-size:.73rem;color:var(--text-muted)">${c.phone || '– sem telefone'}</div>
              </div>
              <span style="font-size:.75rem;color:var(--gold);white-space:nowrap">${c.total_points||0} pts</span>
            </label>`).join('')}
          </div>
        </div>

        <!-- NPS SEND PANEL -->
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="card">
            <div class="card-header"><span class="card-title">📨 Selecionados</span></div>
            <div id="nps-selected-count" style="font-size:1.6rem;font-weight:800;color:var(--teal);margin-bottom:4px">0</div>
            <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:16px">clientes selecionados</div>
            <div class="form-group">
              <label>Mensagem personalizada (opcional)</label>
              <textarea id="nps-custom-msg" rows="4" placeholder="Deixe em branco para usar a mensagem padrão..."
                style="font-family:inherit;font-size:.85rem"></textarea>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px">
              <button class="btn btn-gold" onclick="sendNPSBatch()" style="width:100%">
                📱 Enviar via WhatsApp (um a um)
              </button>
              <button class="btn btn-ghost" onclick="copyNPSLinksAll()" style="font-size:.82rem">
                📋 Copiar todos os links
              </button>
            </div>
          </div>

          <div class="card" style="font-size:.8rem;color:var(--text-muted);line-height:1.7">
            <div style="font-weight:700;color:var(--text-secondary);margin-bottom:6px">ℹ️ Como funciona</div>
            <ol style="margin-left:16px">
              <li>Selecione os clientes na lista</li>
              <li>Clique em "Enviar via WhatsApp"</li>
              <li>O WhatsApp Web abre para cada cliente com a mensagem e link já prontos</li>
              <li>Clique em "Enviar" no WhatsApp para cada um</li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!-- TEMPLATE MODAL -->
    <div id="template-modal" class="modal-overlay hidden">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title" id="tmpl-modal-title">Novo Template</span>
          <button class="modal-close" onclick="closeModal('template-modal')">✕</button>
        </div>
        <div class="form-group"><label>Nome</label><input type="text" id="tmpl-name" /></div>
        <div class="form-group">
          <label>Categoria</label>
          <select id="tmpl-cat">
            ${Object.entries(categories).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Mensagem</label>
          <textarea id="tmpl-msg" rows="5" placeholder="Use as tags como {{nome_cliente}}..."></textarea>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
          ${tags.map(tag => `<span class="badge badge-gold" style="cursor:pointer;font-size:0.72rem" onclick="insertTag('${tag}')">${tag}</span>`).join('')}
        </div>
        <input type="hidden" id="tmpl-id" />
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="closeModal('template-modal')">Cancelar</button>
          <button class="btn btn-gold" onclick="saveTemplate()">Salvar</button>
        </div>
      </div>
    </div>
    `;
  } catch(e) {
    page.innerHTML = `<p style="color:var(--rose)">Erro: ${e.message}</p>`;
  }
}

// ---- TAB SWITCH ----
window.showMsgTab = function(tab) {
  ['templates','nps'].forEach(t => {
    document.getElementById('msg-tab-'+t)?.classList.toggle('active', t === tab);
    document.getElementById('msg-panel-'+t)?.classList.toggle('hidden', t !== tab);
  });
};

// ---- NPS BATCH ----
let _npsBatchQueue = [];
let _npsBatchIdx   = 0;

window.updateNPSSelection = function() {
  const chks = document.querySelectorAll('.nps-chk:checked');
  document.getElementById('nps-selected-count').textContent = chks.length;
};

window.npsSelectAll = function() {
  document.querySelectorAll('.nps-chk').forEach(c => { c.checked = true; });
  updateNPSSelection();
};

window.npsSelectNone = function() {
  document.querySelectorAll('.nps-chk').forEach(c => { c.checked = false; });
  updateNPSSelection();
};

window.filterNPSClients = function(q) {
  const term = q.toLowerCase().trim();
  document.querySelectorAll('[id^="nps-row-"]').forEach(row => {
    const label = row.querySelector('div div')?.textContent?.toLowerCase() || '';
    const phone = row.querySelector('div div:last-child')?.textContent?.toLowerCase() || '';
    row.style.display = (!term || label.includes(term) || phone.includes(term)) ? '' : 'none';
  });
};

window.sendNPSBatch = function() {
  const chks = [...document.querySelectorAll('.nps-chk:checked')];
  if (!chks.length) { showToast('Selecione ao menos um cliente.', 'error'); return; }

  const base = window.location.origin + window.location.pathname.replace('index.html','');
  const customMsg = document.getElementById('nps-custom-msg')?.value?.trim();
  _npsBatchQueue = chks.map(c => ({
    name:  c.dataset.name,
    phone: c.dataset.phone,
    cpf:   c.dataset.cpf,
    link:  base + 'cliente.html?cpf=' + c.dataset.cpf,
  }));
  _npsBatchIdx = 0;
  sendNextNPS(customMsg);
};

function sendNextNPS(customMsg) {
  if (_npsBatchIdx >= _npsBatchQueue.length) {
    showToast('Todos os links foram enviados!', 'gold', '✅');
    return;
  }
  const c = _npsBatchQueue[_npsBatchIdx];
  const firstName = c.name.split(' ')[0];
  const defaultMsg = 'Olá, ' + firstName + '! 😊\n\nObrigada pela sua visita à Clínica Vanessa Amorim! ✨\n\n'
    + 'Acesse seu perfil e responda nossa pesquisa de satisfação:\n\n'
    + c.link + '\n\nLogin: seu CPF\nSenha: clinicava\n\nSua opinião é muito importante! ⭐';
  const msg = customMsg
    ? customMsg.replace('{{link}}', c.link).replace('{{nome}}', firstName) + '\n\n' + c.link
    : defaultMsg;

  if (c.phone) {
    const w = '55' + c.phone.replace(/\D/g,'');
    window.open('https://wa.me/' + w + '?text=' + encodeURIComponent(msg), '_blank');
  } else {
    navigator.clipboard?.writeText(msg)
      .then(() => showToast('Link de ' + c.name + ' copiado (sem telefone).', 'gold', '📋'));
  }

  _npsBatchIdx++;
  if (_npsBatchIdx < _npsBatchQueue.length) {
    showToast(
      (_npsBatchIdx) + '/' + _npsBatchQueue.length + ' enviados. Clique novamente para o próximo.',
      'gold', '📤'
    );
    // Auto-advance after 2.5s
    setTimeout(() => sendNextNPS(customMsg), 2500);
  } else {
    setTimeout(() => showToast('Todos os links enviados!', 'gold', '✅'), 2500);
  }
}

window.copyNPSLinksAll = function() {
  const chks = [...document.querySelectorAll('.nps-chk:checked')];
  if (!chks.length) { showToast('Selecione ao menos um cliente.', 'error'); return; }
  const base = window.location.origin + window.location.pathname.replace('index.html','');
  const lines = chks.map(c =>
    c.dataset.name + ': ' + base + 'cliente.html?cpf=' + c.dataset.cpf
  );
  const text = lines.join('\n');
  navigator.clipboard?.writeText(text)
    .then(() => showToast(chks.length + ' links copiados!', 'gold', '📋'))
    .catch(() => prompt('Copie os links abaixo:', text));
};

// ---- TEMPLATES ----
window.copyTag = function(tag, el) {
  navigator.clipboard.writeText(tag).then(() => {
    const orig = el.textContent;
    el.textContent = '✓ Copiada!';
    setTimeout(() => el.textContent = orig, 1500);
  });
};

window.insertTag = function(tag) {
  const ta = document.getElementById('tmpl-msg');
  if (!ta) return;
  const pos = ta.selectionStart;
  ta.value = ta.value.slice(0, pos) + tag + ta.value.slice(ta.selectionEnd);
};

window.previewMessage = function() {
  const tmplSel = document.getElementById('msg-template');
  const clientSel = document.getElementById('msg-client');
  const preview = document.getElementById('msg-preview');
  if (!tmplSel || !preview) return;
  const opt = tmplSel.options[tmplSel.selectedIndex];
  if (!opt?.value) return;
  let msg = decodeURIComponent(opt.dataset.msg || '');
  const cOpt = clientSel?.options[clientSel.selectedIndex];
  if (cOpt?.value) {
    msg = msg
      .replace(/{{nome_cliente}}/g, cOpt.dataset.name || '')
      .replace(/{{pontos_totais}}/g, cOpt.dataset.pts || '0')
      .replace(/{{pontos}}/g, cOpt.dataset.pts || '0');
  }
  preview.value = msg;
};

window.sendViaWebWhatsApp = function() {
  const clientSel = document.getElementById('msg-client');
  const msg = document.getElementById('msg-preview')?.value || '';
  const phone = clientSel?.options[clientSel.selectedIndex]?.dataset.phone || '';
  if (!phone) { showToast('Selecione um cliente com telefone cadastrado','error'); return; }
  const phoneClean = phone.replace(/\D/g,'');
  window.open('https://wa.me/55' + phoneClean + '?text=' + encodeURIComponent(msg), '_blank');
};

window.sendViaAPI = function() {
  showToast('Configure a API do WhatsApp em Configurações para usar este recurso.','gold','📡');
};

let editingTemplateId = null;
window.openTemplateModal = function(id = null) {
  editingTemplateId = id;
  document.getElementById('tmpl-modal-title').textContent = id ? 'Editar Template' : 'Novo Template';
  document.getElementById('tmpl-name').value = '';
  document.getElementById('tmpl-msg').value = '';
  document.getElementById('tmpl-id').value = id || '';
  openModal('template-modal');
};

window.editTemplate = async function(id) {
  try {
    const templates = await fetchWATemplates();
    const t = templates.find(x => x.id === id);
    if (!t) return;
    editingTemplateId = id;
    document.getElementById('tmpl-modal-title').textContent = 'Editar Template';
    document.getElementById('tmpl-name').value = t.name;
    document.getElementById('tmpl-cat').value  = t.category || 'general';
    document.getElementById('tmpl-msg').value  = t.message;
    document.getElementById('tmpl-id').value   = id;
    openModal('template-modal');
  } catch(e) { showToast('Erro: '+e.message,'error'); }
};

window.saveTemplate = async function() {
  const name = document.getElementById('tmpl-name').value.trim();
  const msg  = document.getElementById('tmpl-msg').value.trim();
  if (!name || !msg) { showToast('Nome e mensagem são obrigatórios','error'); return; }
  const payload = { name, message: msg, category: document.getElementById('tmpl-cat').value };
  try {
    if (editingTemplateId) await dbUpdate('whatsapp_templates', editingTemplateId, payload);
    else await dbInsert('whatsapp_templates', payload);
    showToast('Template salvo!','gold');
    closeModal('template-modal');
    await renderMensagens();
  } catch(e) { showToast('Erro: '+e.message,'error'); }
};

window.openSendModal = function(templateId) {
  const sel = document.getElementById('msg-template');
  if (sel) { sel.value = templateId; previewMessage(); }
  showToast('Selecione um cliente e clique em Enviar','gold','📤');
};
