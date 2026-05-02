/* ============================================================ PAGE: CONFIGURAÇÕES ============================================================ */
 async function renderConfiguracoes() {
  const page = document.getElementById('page-configuracoes');
  page.innerHTML = `   <div class="tab-bar mb-24" style="max-width:860px;flex-wrap:wrap">     <button class="tab-btn active" id="cfg-tab-rules" onclick="showCfgTab('rules')">⭐ Pontuações</button>     <button class="tab-btn" id="cfg-tab-awards" onclick="showCfgTab('awards')">🎁 Premiações</button>     <button class="tab-btn" id="cfg-tab-procs" onclick="showCfgTab('procs')">💆 Procedimentos</button>     <button class="tab-btn" id="cfg-tab-nps" onclick="showCfgTab('nps')">📊 NPS</button>     <button class="tab-btn" id="cfg-tab-users" onclick="showCfgTab('users')">👤 Usuários</button>     <button class="tab-btn" id="cfg-tab-wa" onclick="showCfgTab('wa')">📱 WhatsApp</button>     <button class="tab-btn" id="cfg-tab-aparencia" onclick="showCfgTab('aparencia')">🎨 Aparência</button>     <button class="tab-btn" id="cfg-tab-conexao" onclick="showCfgTab('conexao')">🔌 Conexão</button>   </div>    <!-- PONTUAÇÕES -->   <div id="cfg-rules" class="cfg-tab">     <div class="section-header mb-16">       <span class="section-title">Regras de Pontuação</span>       <button class="btn btn-gold btn-sm" onclick="openRuleModal()">+ Nova Regra</button>     </div>     <div id="rules-list">${loadingSpinner()}</div>   </div>    <!-- PREMIAÇÕES -->   <div id="cfg-awards" class="cfg-tab hidden">     <div class="section-header mb-16">       <span class="section-title">Premiações para Clientes</span>       <button class="btn btn-gold btn-sm" onclick="openAwardModal()">+ Nova Premiação</button>     </div>     <div id="awards-list">${loadingSpinner()}</div>   </div>    <!-- PROCEDIMENTOS -->   <div id="cfg-procs" class="cfg-tab hidden">     <div class="section-header mb-16">       <span class="section-title">Procedimentos Estéticos</span>       <button class="btn btn-gold btn-sm" onclick="openProcModal()">+ Novo Procedimento</button>     </div>     <div id="procs-list">${loadingSpinner()}</div>   </div>    <!-- USUÁRIOS -->   <div id="cfg-users" class="cfg-tab hidden">     <div class="section-header mb-16">       <span class="section-title">👤 Usuários do Sistema</span>       <button class="btn btn-gold btn-sm" onclick="openUserModal()">+ Novo Usuário</button>     </div>     <div style="background:rgba(78,205,196,0.06);border:1px solid rgba(78,205,196,0.2);border-radius:10px;padding:12px 16px;margin-bottom:20px;font-size:.82rem;color:var(--text-secondary);line-height:1.6">       🔑 Cada usuário recebe a senha padrão <strong>123456</strong> e é obrigado a criar uma senha pessoal no primeiro login.       Para resetar a senha de um usuário, clique em <strong>Reset Senha</strong>.     </div>     <div id="users-list">${loadingSpinner()}</div>      <!-- USER MODAL -->     <div id="user-modal" class="modal-overlay hidden">       <div class="modal" style="max-width:460px">         <div class="modal-header">           <span class="modal-title" id="user-modal-title">Novo Usuário</span>           <button class="modal-close" onclick="closeModal('user-modal')">✕</button>         </div>         <div class="form-row">           <div class="form-group">             <label>Nome de Exibição *</label>             <input type="text" id="usr-name" placeholder="Ex: Maria Silva" />           </div>           <div class="form-group">             <label>Usuário (login) *</label>             <input type="text" id="usr-username" placeholder="Ex: maria.silva" />           </div>         </div>         <div class="form-group">           <label>Perfil de Acesso</label>           <select id="usr-role">             <option value="admin">🔑 Admin – Acesso total</option>             <option value="manager">📌 Gerente – Acesso total</option>             <option value="operator" selected>⭐ Consultora – Tudo exceto Configurações</option>             <option value="viewer">👁 Visualizador – Apenas leitura</option>           </select>         </div>         <div class="form-group" id="usr-active-wrap" style="display:flex;align-items:center;gap:10px">           <input type="checkbox" id="usr-active" checked style="width:16px;height:16px;accent-color:var(--gold)" />           <label style="margin:0;cursor:pointer" for="usr-active">Usuário ativo</label>         </div>         <input type="hidden" id="usr-id" />         <div class="modal-footer">           <button class="btn btn-ghost" onclick="closeModal('user-modal')">Cancelar</button>           <button class="btn btn-gold" onclick="saveUser()">Salvar</button>         </div>       </div>     </div>   </div>    <!-- WHATSAPP CONFIG -->   <div id="cfg-wa" class="cfg-tab hidden">     <div class="section-header mb-16"><span class="section-title">Configuração WhatsApp API</span></div>     <div id="wa-config-wrap">${loadingSpinner()}</div>   </div>    <!-- APARÊNCIA -->   <div id="cfg-aparencia" class="cfg-tab hidden">     <div class="section-header mb-16"><span class="section-title">🎨 Aparência do Sistema</span></div>     <div id="aparencia-wrap">${renderAppearanceTab()}</div>   </div>    <!-- MODALS -->   <!-- RULE MODAL -->   <div id="rule-modal" class="modal-overlay hidden">     <div class="modal" style="max-width:460px">       <div class="modal-header">         <span class="modal-title" id="rule-modal-title">Nova Regra de Pontuação</span>         <button class="modal-close" onclick="closeModal('rule-modal')">✕</button>       </div>       <div class="form-group"><label>Nome da Regra *</label><input type="text" id="rl-name" placeholder="Ex: Cliente indicou" /></div>       <div class="form-group"><label>Descrição</label><input type="text" id="rl-desc" /></div>       <div class="form-row">         <div class="form-group"><label>Pontos *</label><input type="number" id="rl-pts" min="1" /></div>         <div class="form-group"><label>Tipo</label>           <select id="rl-type">             <option value="referral_sent">Indicação Enviada</option>             <option value="referral_converted">Indicação Convertida</option>             <option value="instagram_post">Post Instagram</option>             <option value="birthday">Aniversário</option>             <option value="procedure">Procedimento</option>             <option value="manual">Manual</option>             <option value="other">Outro</option>           </select>         </div>       </div>       <input type="hidden" id="rl-id" />       <div class="modal-footer">         <button class="btn btn-ghost" onclick="closeModal('rule-modal')">Cancelar</button>         <button class="btn btn-gold" onclick="saveRule()">Salvar</button>       </div>     </div>   </div>    <!-- AWARD MODAL -->   <div id="award-modal" class="modal-overlay hidden">     <div class="modal" style="max-width:460px">       <div class="modal-header">         <span class="modal-title" id="award-modal-title">Nova Premiação</span>         <button class="modal-close" onclick="closeModal('award-modal')">✕</button>       </div>       <div class="form-group"><label>Nome da Premiação *</label><input type="text" id="aw-name" /></div>       <div class="form-group"><label>Descrição</label><textarea id="aw-desc" rows="2"></textarea></div>       <div class="form-row">         <div class="form-group"><label>Pontos Necessários *</label><input type="number" id="aw-pts" min="1" /></div>         <div class="form-group"><label>Tipo</label>           <select id="aw-type">             <option value="product">Produto</option>             <option value="procedure">Procedimento</option>             <option value="discount">Desconto</option>             <option value="other">Outro</option>           </select>         </div>       </div>       <div class="form-group"><label>Estoque (deixe vazio para ilimitado)</label><input type="number" id="aw-stock" min="0" /></div>       <input type="hidden" id="aw-id" />       <div class="modal-footer">         <button class="btn btn-ghost" onclick="closeModal('award-modal')">Cancelar</button>         <button class="btn btn-gold" onclick="saveAward()">Salvar</button>       </div>     </div>   </div>    <!-- PROC MODAL -->   <div id="proc-modal" class="modal-overlay hidden">     <div class="modal" style="max-width:480px">       <div class="modal-header">         <span class="modal-title" id="proc-modal-title">Novo Procedimento</span>         <button class="modal-close" onclick="closeModal('proc-modal')">✕</button>       </div>       <div class="form-row">         <div class="form-group"><label>Nome *</label><input type="text" id="pr-name" /></div>         <div class="form-group"><label>Categoria</label><input type="text" id="pr-cat" placeholder="Ex: Facial, Corporal" /></div>       </div>       <div class="form-group"><label>Descrição</label><textarea id="pr-desc" rows="2"></textarea></div>       <div class="form-row">         <div class="form-group">           <label>Preço <span style="color:var(--text-muted);font-weight:400;font-size:0.8rem">(opcional)</span></label>           <input type="text" id="pr-price" data-currency />         </div>         <div class="form-group"><label>Duração (min) <span style="color:var(--text-muted);font-weight:400;font-size:0.8rem">(opcional)</span></label><input type="number" id="pr-dur" /></div>       </div>       <div class="form-group" style="display:flex;align-items:center;gap:10px;flex-direction:row">         <input type="checkbox" id="pr-redeemable" style="width:20px;height:20px;accent-color:var(--gold)" />         <label style="text-transform:none;font-size:0.9rem;color:var(--text-primary)">Disponível para resgate com pontos</label>       </div>       <div id="pr-pts-wrap" class="form-group hidden">         <label>Pontos Necessários para Resgate</label>         <input type="number" id="pr-pts" min="1" />       </div>       <input type="hidden" id="pr-id" />       <div class="modal-footer">         <button class="btn btn-ghost" onclick="closeModal('proc-modal')">Cancelar</button>         <button class="btn btn-gold" onclick="saveProc()">Salvar</button>       </div>     </div>   </div>    <!-- CONEXÃO COM BANCO DE DADOS -->   <div id="cfg-conexao" class="cfg-tab hidden">     <div class="card" style="max-width:560px">       <div class="card-header"><span class="card-title">🔌 Conexão com Supabase</span></div>       <div id="cfg-conn-status" style="margin-bottom:16px"></div>       <div class="form-group">         <label>URL do Projeto Supabase</label>         <input type="url" id="cfg-sb-url" placeholder="https://xxxx.supabase.co" />       </div>       <div class="form-group">         <label>Chave Anon Key</label>         <input type="text" id="cfg-sb-key" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." style="font-size:.75rem" />       </div>       <p style="font-size:.78rem;color:var(--text-muted);margin-bottom:16px">         🔒 As credenciais são salvas apenas no seu navegador e nunca enviadas a terceiros.       </p>       <div style="display:flex;gap:10px;flex-wrap:wrap">         <button id="cfg-connect-btn" class="btn btn-gold" onclick="connectFromSettings()">           Salvar e Conectar         </button>         <button class="btn btn-ghost" onclick="disconnectSupabase()" style="color:var(--rose)">           ⚠️ Desconectar         </button>       </div>       <hr style="border:none;border-top:1px solid var(--border);margin:20px 0" />       <div style="font-size:.82rem;font-weight:700;color:var(--gold);margin-bottom:8px">🚀 Para hospedar (clientes em outros dispositivos)</div>       <p style="font-size:.78rem;color:var(--text-muted);margin-bottom:12px;line-height:1.6">         Ao hospedar o sistema (Vercel, Netlify etc.), os clientes abrem         <strong>cliente.html</strong> em seus próprios celulares — sem acesso ao         localStorage do admin. Clique abaixo para gerar o <code>config.js</code>         com suas credenciais já preenchidas. Substitua o arquivo antes de publicar.       </p>       <button class="btn btn-ghost" onclick="gerarConfigJs()" style="font-size:.82rem">         📋 Gerar config.js pronto       </button>       <textarea id="cfg-config-output" class="form-group" readonly         style="margin-top:12px;font-size:.72rem;font-family:monospace;min-height:0;display:none;
               background:var(--black-3);color:var(--teal);resize:vertical"></textarea>     </div>   </div>    <!-- NPS QUESTIONS + RESPONSES -->   <div id="cfg-nps" class="cfg-tab hidden">     <!-- Sub-tabs -->     <div class="tab-bar mb-20" style="max-width:360px">       <button class="tab-btn active" id="nps-sub-perguntas" onclick="showNPSSubTab('perguntas')">📝 Perguntas</button>       <button class="tab-btn" id="nps-sub-respostas" onclick="showNPSSubTab('respostas')">📬 Respostas</button>     </div>      <!-- SUB: PERGUNTAS -->     <div id="nps-panel-perguntas">       <div class="section-header mb-16">         <span class="section-title">Perguntas da Pesquisa</span>         <button class="btn btn-gold btn-sm" onclick="openNPSQuestionModal()">+ Nova Pergunta</button>       </div>       <div style="background:rgba(78,205,196,0.06);border:1px solid rgba(78,205,196,0.25);border-radius:10px;padding:12px 16px;margin-bottom:20px;font-size:.82rem;color:var(--text-secondary);line-height:1.6">         📌 As perguntas são exibidas nesta ordem para os clientes no portal.         Tipos: <strong>NPS 0-10 · Estrelas · Emojis · Sim/Não · Texto livre</strong>.         Clique em Salvar após cada alteração.       </div>       <div id="nps-questions-list"></div>       <div style="margin-top:16px;display:flex;gap:10px">         <button class="btn btn-gold" onclick="saveNPSQuestions()">💾 Salvar Perguntas</button>         <button class="btn btn-ghost" onclick="resetNPSQuestions()" style="font-size:.82rem">↺ Restaurar Padrão</button>       </div>     </div>      <!-- SUB: RESPOSTAS -->     <div id="nps-panel-respostas" class="hidden">       <div class="section-header mb-16">         <span class="section-title">Respostas Recebidas</span>         <button class="btn btn-ghost btn-sm" onclick="loadNPSResponses()">↺ Atualizar</button>       </div>       <div id="nps-responses-wrap"></div>     </div>   </div>    <!-- NPS QUESTION MODAL -->   <div id="nps-q-modal" class="modal-overlay hidden">     <div class="modal">       <div class="modal-header">         <span class="modal-title" id="nps-q-modal-title">Nova Pergunta</span>         <button class="modal-close" onclick="closeModal('nps-q-modal')">✕</button>       </div>       <div class="form-group">         <label>Tipo de Pergunta</label>         <select id="nps-q-type" onchange="onNPSTypeChange()">           <option value="nps_score">🔢 Nota NPS (0 a 10)</option>           <option value="stars">⭐ Estrelas (1 a 5)</option>           <option value="emoji">😊 Emojis (múltipla escolha)</option>           <option value="yn">✅ Sim / Não</option>           <option value="text">💬 Texto livre (comentário/áudio)</option>         </select>       </div>       <div class="form-group">         <label>Texto da Pergunta</label>         <textarea id="nps-q-text" rows="3" placeholder="Ex: De 0 a 10, como avalia sua experiência?"></textarea>       </div>       <div id="nps-q-emoji-opts" class="hidden">         <div class="form-group">           <label>Opções de Emoji (separadas por vírgula)</label>           <input type="text" id="nps-q-emoji-input" placeholder="😞 Ruim, 😐 Regular, 😊 Bom, 😍 Ótimo" />         </div>       </div>       <div class="form-group" style="display:flex;align-items:center;gap:10px">         <input type="checkbox" id="nps-q-required" checked style="width:16px;height:16px;accent-color:var(--gold)" />         <label style="margin:0;cursor:pointer" for="nps-q-required">Resposta obrigatória</label>       </div>       <input type="hidden" id="nps-q-editing-idx" value="-1" />       <div class="modal-footer">         <button class="btn btn-ghost" onclick="closeModal('nps-q-modal')">Cancelar</button>         <button class="btn btn-gold" onclick="saveNPSQuestion()">Salvar Pergunta</button>       </div>     </div>   </div>   `;
   document.getElementById('pr-redeemable')?.addEventListener('change', function() {
    document.getElementById('pr-pts-wrap').classList.toggle('hidden', !this.checked);
  });
   await Promise.all([loadRulesList(), loadAwardsList(), loadProcsList(), loadUsersList(), loadWaConfig()]);
  initAppearanceTab();
  loadNPSQuestionsAdmin();
  
/* Pre-fill connection fields with saved credentials */
   const sbUrl = localStorage.getItem('sb_url') || '';
  const sbKey = localStorage.getItem('sb_key') || '';
  const urlEl = document.getElementById('cfg-sb-url');
  const keyEl = document.getElementById('cfg-sb-key');
  if (urlEl) urlEl.value = sbUrl;
  if (keyEl) keyEl.value = sbKey;
  
/* Show connection status badge */
   const statusEl = document.getElementById('cfg-conn-status');
  if (statusEl) {
    statusEl.innerHTML = sbUrl       ? `<span style="background:rgba(46,160,67,.15);color:#3dd68c;border:1px solid rgba(46,160,67,.3);border-radius:20px;padding:4px 12px;font-size:.8rem;font-weight:600">✅ Conectado: ${new URL(sbUrl).hostname}</span>`       : `<span style="background:rgba(224,112,112,.12);color:var(--rose);border:1px solid rgba(224,112,112,.3);border-radius:20px;padding:4px 12px;font-size:.8rem;font-weight:600">❌ Não conectado</span>`;
  }
}
 function showCfgTab(tab) {
  document.querySelectorAll('.cfg-tab').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('[id^="cfg-tab-"]').forEach(btn => btn.classList.remove('active'));
  document.getElementById('cfg-'+tab)?.classList.remove('hidden');
  document.getElementById('cfg-tab-'+tab)?.classList.add('active');
}
 
/* ---- RULES ---- */
 async function loadRulesList() {
  const wrap = document.getElementById('rules-list');
  if (!wrap) return;
  try {
    const rules = await fetchPointRules();
    if (rules.length === 0) {
wrap.innerHTML = emptyState('⭐','Nenhuma regra cadastrada');
return;
}
    wrap.innerHTML = `<div class="table-wrap"><table>       <thead><tr><th>Nome</th><th>Descrição</th><th>Tipo</th><th>Pontos</th><th>Ações</th></tr></thead>       <tbody>${rules.map(r => `<tr>         <td><strong>${r.name}</strong></td>         <td style="color:var(--text-secondary)">${r.description||'–'}</td>         <td><span class="badge badge-gray">${r.rule_type}</span></td>         <td>${pointsBadge(r.points)}</td>         <td><div style="display:flex;gap:6px">           <button class="btn btn-sm btn-ghost" onclick="openRuleModal('${r.id}')">✏</button>           <button class="btn btn-sm btn-danger" onclick="deleteRule('${r.id}')">🗑</button>         </div></td>       </tr>`).join('')}</tbody>     </table></div>`;
  }
catch(e) {
wrap.innerHTML = `<p style="color:var(--rose)">${e.message}</p>`;
}
}
 let editingRuleId = null;
window.openRuleModal = async function(id = null) {
  editingRuleId = id;
  document.getElementById('rule-modal-title').textContent = id ? 'Editar Regra' : 'Nova Regra de Pontuação';
  document.getElementById('rl-name').value = '';
  document.getElementById('rl-desc').value = '';
  document.getElementById('rl-pts').value  = '';
  document.getElementById('rl-id').value   = id || '';
  if (id) {
    try {
      const rules = await fetchPointRules();
      const r = rules.find(x => x.id === id);
      if (r) {
        document.getElementById('rl-name').value = r.name;
        document.getElementById('rl-desc').value = r.description || '';
        document.getElementById('rl-pts').value  = r.points;
        document.getElementById('rl-type').value = r.rule_type;
      }
    }
catch(_) {}
  }
  openModal('rule-modal');
};
 window.saveRule = async function() {
  const name = document.getElementById('rl-name').value.trim();
  const pts  = parseInt(document.getElementById('rl-pts').value||'0');
  if (!name) {
showToast('Nome obrigatório','error');
return;
}
  if (pts <= 0) {
showToast('Pontos inválidos','error');
return;
}
  const payload = {
name, description: document.getElementById('rl-desc').value||null, points: pts, rule_type: document.getElementById('rl-type').value };
  try {
    if (editingRuleId) await dbUpdate('point_rules', editingRuleId, payload);
    else await dbInsert('point_rules', payload);
    showToast('Regra salva!','gold');
    closeModal('rule-modal');
    await loadRulesList();
  }
catch(e) {
showToast('Erro: '+e.message,'error');
}
};
 window.deleteRule = async function(id) {
  if (!confirm('Deletar esta regra?')) return;
  try {
await dbDelete('point_rules', id);
await loadRulesList();
}
catch(e) {
showToast('Erro: '+e.message,'error');
}
};
 
/* ---- AWARDS ---- */
 async function loadAwardsList() {
  const wrap = document.getElementById('awards-list');
  if (!wrap) return;
  try {
    const awards = await fetchAwards();
    if (awards.length === 0) {
wrap.innerHTML = emptyState('🎁','Nenhuma premiação cadastrada');
return;
}
    wrap.innerHTML = `<div class="grid-auto">       ${awards.map(a => `<div class="card card-gold">         <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">           <span style="font-size:1.5rem">🎁</span>           <div style="display:flex;gap:6px">             <button class="btn btn-sm btn-ghost" onclick="openAwardModal('${a.id}')">✏</button>             <button class="btn btn-sm btn-danger" onclick="deleteAward('${a.id}')">🗑</button>           </div>         </div>         <div style="font-weight:700;margin-bottom:4px">${a.name}</div>         <div style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:10px">${a.description||''}</div>         <div>${pointsBadge(a.points_required)}</div>         ${a.stock != null ? `<div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px">Estoque: ${a.stock}</div>` : ''}
      </div>`).join('')}
    </div>`;
  }
catch(e) {
wrap.innerHTML = `<p style="color:var(--rose)">${e.message}</p>`;
}
}
 let editingAwardId = null;
window.openAwardModal = async function(id = null) {
  editingAwardId = id;
  document.getElementById('award-modal-title').textContent = id ? 'Editar Premiação' : 'Nova Premiação';
  ['name','desc','pts','stock'].forEach(f => {
const el = document.getElementById('aw-'+f);
if(el) el.value='';
});
  document.getElementById('aw-id').value = id || '';
  if (id) {
    try {
      const awards = await fetchAwards();
      const a = awards.find(x => x.id === id);
      if (a) {
        document.getElementById('aw-name').value  = a.name;
        document.getElementById('aw-desc').value  = a.description || '';
        document.getElementById('aw-pts').value   = a.points_required;
        document.getElementById('aw-type').value  = a.award_type || 'product';
        document.getElementById('aw-stock').value = a.stock ?? '';
      }
    }
catch(_) {}
  }
  openModal('award-modal');
};
 window.saveAward = async function() {
  const name = document.getElementById('aw-name').value.trim();
  const pts  = parseInt(document.getElementById('aw-pts').value||'0');
  if (!name) {
showToast('Nome obrigatório','error');
return;
}
  if (pts <= 0) {
showToast('Pontos inválidos','error');
return;
}
  const stock = document.getElementById('aw-stock').value;
  const payload = {
name, description: document.getElementById('aw-desc').value||null, points_required: pts, award_type: document.getElementById('aw-type').value, stock: stock!==''?parseInt(stock):null };
  try {
    if (editingAwardId) await dbUpdate('awards', editingAwardId, payload);
    else await dbInsert('awards', payload);
    showToast('Premiação salva!','gold');
    closeModal('award-modal');
    await loadAwardsList();
  }
catch(e) {
showToast('Erro: '+e.message,'error');
}
};
 window.deleteAward = async function(id) {
  if (!confirm('Deletar esta premiação?')) return;
  try {
await dbDelete('awards', id);
await loadAwardsList();
}
catch(e) {
showToast('Erro: '+e.message,'error');
}
};
 
/* ---- PROCEDURES ---- */
 async function loadProcsList() {
  const wrap = document.getElementById('procs-list');
  if (!wrap) return;
  try {
    const procs = await fetchProcedures();
    if (procs.length === 0) {
wrap.innerHTML = emptyState('💆','Nenhum procedimento cadastrado');
return;
}
    wrap.innerHTML = `<div class="table-wrap"><table>       <thead><tr><th>Nome</th><th>Categoria</th><th>Preço</th><th>Pontos p/ Resgate</th><th>Ações</th></tr></thead>       <tbody>${procs.map(p => `<tr>         <td><strong>${p.name}</strong>${p.description?`<br><small style="color:var(--text-muted)">${p.description}</small>`:''}</td>         <td><span class="badge badge-gray">${p.category||'–'}</span></td>         <td>${p.price ? `R$ ${parseFloat(p.price).toFixed(2)}` : '–'}</td>         <td>${p.redeemable_with_points ? pointsBadge(p.points_required||0) : '<span style="color:var(--text-muted)">Não disponível</span>'}</td>         <td><div style="display:flex;gap:6px">           <button class="btn btn-sm btn-ghost" onclick="openProcModal('${p.id}')">✏</button>           <button class="btn btn-sm btn-danger" onclick="deleteProc('${p.id}')">🗑</button>         </div></td>       </tr>`).join('')}</tbody>     </table></div>`;
  }
catch(e) {
wrap.innerHTML = `<p style="color:var(--rose)">${e.message}</p>`;
}
}
 let editingProcId = null;
window.openProcModal = async function(id = null) {
  editingProcId = id;
  document.getElementById('proc-modal-title').textContent = id ? 'Editar Procedimento' : 'Novo Procedimento';
  ['name','cat','desc','price','dur','pts'].forEach(f => {
const el = document.getElementById('pr-'+f);
if(el) el.value='';
});
  document.getElementById('pr-id').value = id || '';
  document.getElementById('pr-redeemable').checked = false;
  document.getElementById('pr-pts-wrap').classList.add('hidden');
  if (id) {
    try {
      const procs = await fetchProcedures();
      const p = procs.find(x => x.id === id);
      if (p) {
        document.getElementById('pr-name').value  = p.name;
        document.getElementById('pr-cat').value   = p.category || '';
        document.getElementById('pr-desc').value  = p.description || '';
        document.getElementById('pr-price').value = p.price ? formatCurrencyValue(p.price) : '';
        document.getElementById('pr-dur').value   = p.duration_minutes || '';
        document.getElementById('pr-redeemable').checked = !!p.redeemable_with_points;
        if (p.redeemable_with_points) {
          document.getElementById('pr-pts').value = p.points_required || '';
          document.getElementById('pr-pts-wrap').classList.remove('hidden');
        }
      }
    }
catch(_) {}
  }
  openModal('proc-modal');
  
/* Inicializa máscara de moeda no campo preço */
   initCurrencyMask(document.getElementById('pr-price'));
};
 window.saveProc = async function() {
  const name = document.getElementById('pr-name').value.trim();
  if (!name) {
showToast('Nome obrigatório','error');
return;
}
  const redeemable = document.getElementById('pr-redeemable').checked;
  const pts = redeemable ? parseInt(document.getElementById('pr-pts').value||'0') : null;
  if (redeemable && (!pts || pts <= 0)) {
showToast('Informe os pontos necessários para resgate','error');
return;
}
  const payload = {
    name,     category:            document.getElementById('pr-cat').value || null,     description:         document.getElementById('pr-desc').value || null,     price:               parseCurrency(document.getElementById('pr-price').value),     duration_minutes:    document.getElementById('pr-dur').value || null,     redeemable_with_points: redeemable,     points_required:     pts   };
  try {
    if (editingProcId) await dbUpdate('procedures', editingProcId, payload);
    else await dbInsert('procedures', payload);
    showToast('Procedimento salvo!','gold');
    closeModal('proc-modal');
    await loadProcsList();
  }
catch(e) {
showToast('Erro: '+e.message,'error');
}
};
 window.deleteProc = async function(id) {
  if (!confirm('Deletar este procedimento?')) return;
  try {
await dbDelete('procedures', id);
await loadProcsList();
}
catch(e) {
showToast('Erro: '+e.message,'error');
}
};
 
/* ---- WHATSAPP CONFIG ---- */
 async function loadWaConfig() {
  const wrap = document.getElementById('wa-config-wrap');
  if (!wrap) return;
  wrap.innerHTML = `   <div class="card" style="max-width:560px">     <div style="font-weight:700;margin-bottom:16px;color:var(--gold)">Configuração da API WhatsApp</div>     <div class="form-group">       <label>Provedor</label>       <select id="wa-provider">         <option value="none">Não configurado</option>         <option value="evolution_api">Evolution API</option>         <option value="browser">WhatsApp Web (via navegador)</option>         <option value="official">WhatsApp Business API (Oficial)</option>       </select>     </div>     <div class="form-group"><label>URL da API</label><input type="url" id="wa-url" placeholder="https://api.exemplo.com" /></div>     <div class="form-group"><label>Token / API Key</label><input type="text" id="wa-token" placeholder="Token de autenticação" /></div>     <div class="form-group"><label>Nome da Instância</label><input type="text" id="wa-instance" /></div>     <div class="form-group"><label>Número do WhatsApp</label><input type="tel" id="wa-phone" placeholder="5511999999999" /></div>     <button class="btn btn-gold" onclick="saveWaConfig()">Salvar Configuração</button>   </div>`;
}
 window.saveWaConfig = function() {
  showToast('Configuração WhatsApp salva localmente!','gold','📱');
};
 
/*  ============================================================  APARÊNCIA – TEMA DE CORES + LOGO  ============================================================ */
  const THEME_PRESETS = [   {
    label: 'Dourado & Preto',     desc: 'Padrão original da clínica',     emoji: '✦',     colors: {
gold:'#D4AF37', goldLight:'#F0D060', goldDark:'#A8892A', black:'#0A0A0A', black2:'#111111', black3:'#1A1A1A', surface:'#161616', surface2:'#1E1E1E', accent:'#4ECDC4' }
  },   {
    label: 'Rose Gold & Preto',     desc: 'Tom rosado sofisticado',     emoji: '🌹',     colors: {
gold:'#E8A0B4', goldLight:'#F5C6D5', goldDark:'#C9748A', black:'#0A0A0A', black2:'#110D0E', black3:'#1A1214', surface:'#17121A', surface2:'#1E1520', accent:'#C9748A' }
  },   {
    label: 'Prata & Azul Escuro',     desc: 'Elegância fria e moderna',     emoji: '💎',     colors: {
gold:'#B0C4DE', goldLight:'#D0E0F5', goldDark:'#8AAACF', black:'#08090F', black2:'#0E1020', black3:'#141828', surface:'#121626', surface2:'#181C30', accent:'#5B8DD9' }
  },   {
    label: 'Verde Esmeralda',     desc: 'Natureza e bem-estar',     emoji: '🌿',     colors: {
gold:'#50C878', goldLight:'#7DE098', goldDark:'#2E9E52', black:'#080F0A', black2:'#0F1A10', black3:'#152016', surface:'#121A12', surface2:'#182018', accent:'#4ECDC4' }
  },   {
    label: 'Roxo Luxo',     desc: 'Misticismo e exclusividade',     emoji: '💜',     colors: {
gold:'#9B59B6', goldLight:'#C39BD3', goldDark:'#7D3C98', black:'#0A080F', black2:'#110E18', black3:'#18141F', surface:'#16121E', surface2:'#1E1829', accent:'#E8A0B4' }
  },   {
    label: 'Bronze & Marrom',     desc: 'Calor e aconchego',     emoji: '🍂',     colors: {
gold:'#CD7F32', goldLight:'#E8A060', goldDark:'#A05A00', black:'#0F0A08', black2:'#1A1208', black3:'#221A0E', surface:'#1C1408', surface2:'#241E10', accent:'#E8A060' }
  }, ];
 function renderAppearanceTab() {
  const t = getSavedTheme();
  const logo = getSavedLogo();
   return `   <div class="grid-2" style="align-items:start;gap:24px">      <!-- LOGO UPLOAD -->     <div class="card">       <div style="font-weight:700;color:var(--gold);margin-bottom:16px;font-size:1rem">📷 Logo da Clínica</div>       <p style="font-size:0.83rem;color:var(--text-secondary);margin-bottom:16px;line-height:1.6">         A logo aparece na sidebar, no topo do sistema e nos relatórios impressos. Formatos aceitos: PNG, JPG, SVG, WEBP.       </p>        <!-- Drop Zone -->       <div id="logo-dropzone"         onclick="document.getElementById('logo-file-input').click()"         ondragover="event.preventDefault();this.style.borderColor='var(--gold)'"         ondragleave="this.style.borderColor=''"         ondrop="handleLogoDrop(event)"         style="border:2px dashed var(--border-strong);border-radius:14px;padding:28px 16px;text-align:center;cursor:pointer;transition:all 0.25s;background:var(--surface-3)">         <div id="logo-preview-area">           ${logo             ? `<img src="${logo}" style="max-height:90px;max-width:200px;object-fit:contain;border-radius:8px;margin-bottom:12px;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.5))" /><br>`             : `<div style="font-size:2.5rem;opacity:0.4;margin-bottom:8px">📷</div>`}
        </div>         <div style="font-size:0.85rem;color:var(--text-secondary)">           ${logo ? '<strong>Clique para trocar a logo</strong>' : '<strong>Clique ou arraste</strong> para fazer upload'}
        </div>         <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px">PNG, JPG, SVG, WEBP • Recomendado: fundo transparente</div>       </div>       <input type="file" id="logo-file-input" accept="image/*" style="display:none" onchange="handleLogoFile(this)" />        <div style="display:flex;gap:8px;margin-top:14px">         <button class="btn btn-outline-gold flex-1" onclick="document.getElementById('logo-file-input').click()">           📷 Selecionar Logo         </button>         ${logo ? `<button class="btn btn-danger" onclick="removeLogo()" title="Remover logo">🗑 Remover</button>` : ''}
      </div>     </div>      <!-- THEME PREVIEW -->     <div class="card" id="theme-preview-card">       <div style="font-weight:700;color:var(--gold);margin-bottom:16px;font-size:1rem">👁 Preview do Tema</div>       <div style="display:flex;flex-direction:column;gap:10px">         <div style="background:var(--surface-3);border-radius:10px;padding:14px;border:1px solid var(--border)">           <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">             <div style="width:32px;height:32px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;font-size:0.8rem;color:var(--black);font-weight:700">VA</div>             <div>               <div style="font-size:0.85rem;font-weight:700;color:var(--gold)">Vanessa Amorim</div>               <div style="font-size:0.72rem;color:var(--text-muted)">Gamificação</div>             </div>           </div>           <div style="height:6px;border-radius:3px;background:var(--black-5);overflow:hidden;margin-bottom:6px">             <div style="width:65%;height:100%;background:linear-gradient(90deg,var(--gold-dark),var(--gold))"></div>           </div>           <div style="display:flex;gap:6px;margin-top:8px">             <span style="padding:3px 10px;border-radius:20px;font-size:0.72rem;background:rgba(212,175,55,0.15);color:var(--gold);border:1px solid var(--gold)">⭐ 500 pts</span>             <span style="padding:3px 10px;border-radius:20px;font-size:0.72rem;background:rgba(78,205,196,0.12);color:var(--teal);border:1px solid rgba(78,205,196,0.25)">Ativo</span>           </div>         </div>         <div style="display:flex;gap:8px">           <div style="flex:1;height:32px;border-radius:8px;background:linear-gradient(135deg,var(--gold),var(--gold-dark))"></div>           <div style="flex:1;height:32px;border-radius:8px;background:var(--surface)"></div>           <div style="flex:1;height:32px;border-radius:8px;background:var(--teal);opacity:0.7"></div>         </div>       </div>     </div>   </div>    <!-- PRESETS -->   <div class="card mt-24">     <div style="font-weight:700;color:var(--gold);margin-bottom:16px;font-size:1rem">🎨 Paletas Prontas</div>     <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">       ${THEME_PRESETS.map((p, i) => `       <div onclick="applyPreset(${i})" style="cursor:pointer;border:2px solid var(--border);border-radius:12px;padding:14px;transition:all 0.2s;background:var(--surface-3)" class="preset-card" data-idx="${i}"         onmouseover="this.style.borderColor=this.querySelector('.pc').style.background"         onmouseout="this.style.borderColor='var(--border)'">         <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">           <span style="font-size:1.4rem">${p.emoji}</span>           <div>             <div style="font-weight:700;font-size:0.88rem">${p.label}</div>             <div style="font-size:0.75rem;color:var(--text-muted)">${p.desc}</div>           </div>         </div>         <div style="display:flex;gap:4px">           <div class="pc" style="flex:2;height:20px;border-radius:4px;background:${p.colors.gold}"></div>           <div style="flex:1;height:20px;border-radius:4px;background:${p.colors.black}"></div>           <div style="flex:1;height:20px;border-radius:4px;background:${p.colors.surface}"></div>           <div style="flex:1;height:20px;border-radius:4px;background:${p.colors.accent}"></div>         </div>       </div>`).join('')}
    </div>   </div>    <!-- CORES PERSONALIZADAS -->   <div class="card mt-24">     <div style="font-weight:700;color:var(--gold);margin-bottom:4px;font-size:1rem">🖌 Cores Personalizadas</div>     <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:20px">Ajuste individualmente cada cor do sistema. As mudanças são aplicadas em tempo real.</p>     <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px">       ${[         {
key:'gold',    label:'Cor Principal (Destaque)', hint:'Botões, badges, títulos' },         {
key:'goldDark',label:'Cor Principal Escura',      hint:'Hover, sombras' },         {
key:'black',   label:'Fundo Principal',           hint:'Cor mais escura do fundo' },         {
key:'black3',  label:'Fundo Secundário',          hint:'Fundo do conteúdo' },         {
key:'surface', label:'Superfície dos Cards',      hint:'Cor dos cartões' },         {
key:'accent',  label:'Cor de Acento',             hint:'Badges "Ativo", teal' },       ].map(c => `       <div style="display:flex;align-items:center;gap:12px;background:var(--surface-3);border:1px solid var(--border);border-radius:10px;padding:12px 14px">         <div style="position:relative;flex-shrink:0">           <input type="color" id="cp-${c.key}" value="${t[c.key] || '#D4AF37'}"             oninput="liveColorPreview('${c.key}', this.value)"             onchange="liveColorPreview('${c.key}', this.value)"             style="width:44px;height:44px;border-radius:8px;border:2px solid var(--border-strong);cursor:pointer;padding:2px;background:transparent" />         </div>         <div style="flex:1;min-width:0">           <div style="font-size:0.85rem;font-weight:600">${c.label}</div>           <div style="font-size:0.72rem;color:var(--text-muted)">${c.hint}</div>         </div>       </div>`).join('')}
    </div>     <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">       <button class="btn btn-gold" onclick="saveCustomColors()">💾 Salvar Cores</button>       <button class="btn btn-ghost" onclick="resetTheme()">↺ Restaurar Padrão</button>     </div>   </div>   `;
}
 function initAppearanceTab() {
  
/* Inputs de cor já têm valores via renderAppearanceTab, */
   
/* mas garantimos sincronismo se a aba for re-renderizada */
 }
 window.applyPreset = function(idx) {
  const preset = THEME_PRESETS[idx];
  if (!preset) return;
  saveTheme(preset.colors);
  
/* Update color pickers to reflect new preset */
   Object.entries(preset.colors).forEach(([key, val]) => {
    const el = document.getElementById('cp-' + key);
    if (el) el.value = val;
  });
  showToast(`Tema "${preset.label}" aplicado!`, 'gold', preset.emoji);
  
/* Highlight selected preset card */
   document.querySelectorAll('.preset-card').forEach((card, i) => {
    card.style.borderColor = i === idx ? 'var(--gold)' : 'var(--border)';
  });
};
 window.liveColorPreview = function(key, value) {
  
/* Apply immediately (preview), but don't save yet */
   const t = getSavedTheme();
  t[key] = value;
  applyTheme(t);
};
 window.saveCustomColors = function() {
  const keys = ['gold','goldDark','black','black3','surface','accent'];
  const t = getSavedTheme();
  keys.forEach(key => {
    const el = document.getElementById('cp-' + key);
    if (el) t[key] = el.value;
  });
  
/* Derive goldLight automatically from gold */
   t.goldLight = lightenHex(t.gold, 30);
  t.black2    = blendHex(t.black, t.black3, 0.5);
  t.surface2  = blendHex(t.surface, '#ffffff', 0.04);
  saveTheme(t);
  showToast('Cores salvas e aplicadas!', 'gold', '🎨');
};
 window.resetTheme = function() {
  if (!confirm('Restaurar as cores padrão do sistema?')) return;
  localStorage.removeItem('va_theme');
  applyTheme(THEME_DEFAULTS);
  showToast('Tema restaurado ao padrão!', 'success');
  
/* Re-render appearance tab */
   const wrap = document.getElementById('aparencia-wrap');
  if (wrap) wrap.innerHTML = renderAppearanceTab();
  initAppearanceTab();
};
 
/* Color math helpers */
 function lightenHex(hex, amount) {
  const r = Math.min(255, parseInt(hex.slice(1,3),16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3,5),16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5,7),16) + amount);
  return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
}
function blendHex(hex1, hex2, t) {
  const r1=parseInt(hex1.slice(1,3),16), g1=parseInt(hex1.slice(3,5),16), b1=parseInt(hex1.slice(5,7),16);
  const r2=parseInt(hex2.slice(1,3),16), g2=parseInt(hex2.slice(3,5),16), b2=parseInt(hex2.slice(5,7),16);
  const r=Math.round(r1+(r2-r1)*t), g=Math.round(g1+(g2-g1)*t), b=Math.round(b1+(b2-b1)*t);
  return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
}
 
/* ---- LOGO HANDLERS ---- */
 window.handleLogoFile = function(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
showToast('Arquivo muito grande. Máximo 2MB.', 'error');
return;
}
  const reader = new FileReader();
  reader.onload = (e) => {
    saveLogo(e.target.result);
    updateLogoPreview(e.target.result);
    showToast('Logo salva e aplicada!', 'gold', '📷');
  };
  reader.readAsDataURL(file);
};
 window.handleLogoDrop = function(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (!file || !file.type.startsWith('image/')) {
showToast('Arquivo deve ser uma imagem', 'error');
return;
}
  const input = document.getElementById('logo-file-input');
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  handleLogoFile(input);
};
 window.removeLogo = function() {
  if (!confirm('Remover a logo do sistema?')) return;
  saveLogo(null);
  showToast('Logo removida!', 'success');
  
/* Re-render */
   const wrap = document.getElementById('aparencia-wrap');
  if (wrap) wrap.innerHTML = renderAppearanceTab();
};
 function updateLogoPreview(dataUrl) {
  const area = document.getElementById('logo-preview-area');
  if (area) {
    area.innerHTML = dataUrl       ? `<img src="${dataUrl}" style="max-height:90px;max-width:200px;object-fit:contain;border-radius:8px;margin-bottom:12px;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.5))" /><br>`       : `<div style="font-size:2.5rem;opacity:0.4;margin-bottom:8px">📷</div>`;
  }
}
 
/* ============================================================ NPS QUESTIONS ADMIN ============================================================ */
 const NPS_DEFAULT_QUESTIONS = [   {
id:'nps_1', order:1, type:'nps_score', text:'De 0 a 10, como você avalia sua experiência na Clínica Vanessa Amorim?', required:true },   {
id:'nps_2', order:2, type:'stars',     text:'Como você avalia o atendimento da nossa equipe?', required:true },   {
id:'nps_3', order:3, type:'emoji',     text:'O ambiente da clínica atendeu suas expectativas?', required:true, options:[{e:'😞',l:'Não'},{e:'😐',l:'Regular'},{e:'😊',l:'Bom'},{e:'😍',l:'Ótimo'}] },   {
id:'nps_4', order:4, type:'yn',        text:'Você indicaria nossa clínica para amigos ou familiares?', required:true },   {
id:'nps_5', order:5, type:'text',      text:'Deixe um comentário ou sugestão (opcional — você também pode enviar um áudio)', required:false }, ];
 let _npsQuestions = [];
 function loadNPSQuestionsAdmin() {
  try {
    const saved = JSON.parse(localStorage.getItem('va_nps_questions'));
    _npsQuestions = (saved && saved.length) ? saved : JSON.parse(JSON.stringify(NPS_DEFAULT_QUESTIONS));
  }
catch(_) {
    _npsQuestions = JSON.parse(JSON.stringify(NPS_DEFAULT_QUESTIONS));
  }
  renderNPSQuestionsAdmin();
}
 const NPS_TYPE_LABELS = {
  nps_score:'🔢 Nota NPS',stars:'⭐ Estrelas',emoji:'😊 Emojis',yn:'✅ Sim/Não',text:'💬 Texto livre' };
 function renderNPSQuestionsAdmin() {
  const wrap = document.getElementById('nps-questions-list');
  if (!wrap) return;
  if (!_npsQuestions.length) {
    wrap.innerHTML = '<div style="color:var(--text-muted);padding:20px 0">Nenhuma pergunta cadastrada. Clique em + Nova Pergunta.</div>';
    return;
  }
  wrap.innerHTML = _npsQuestions.map((q, i) => `     <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;
      background:var(--surface);border:1px solid var(--border);border-radius:10px;margin-bottom:8px">       <div style="display:flex;flex-direction:column;gap:4px">         <button class="btn-icon-sm" onclick="moveNPSQuestion(${i},-1)" ${i===0?'disabled':''}
style="font-size:.8rem">▲</button>         <button class="btn-icon-sm" onclick="moveNPSQuestion(${i},1)" ${i===_npsQuestions.length-1?'disabled':''}
style="font-size:.8rem">▼</button>       </div>       <span style="font-size:1.3rem;min-width:28px;text-align:center">${i+1}</span>       <div style="flex:1;min-width:0">         <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">           <span class="badge badge-green" style="font-size:.72rem">${NPS_TYPE_LABELS[q.type]||q.type}</span>           ${!q.required ? '<span class="badge badge-gray" style="font-size:.7rem">Opcional</span>' : ''}
        </div>         <div style="font-size:.88rem;color:var(--text-primary)">${q.text}</div>         ${q.options ? `<div style="font-size:.75rem;color:var(--text-muted);margin-top:2px">${q.options.map(o=>o.e+' '+o.l).join(' · ')}</div>` : ''}
      </div>       <div style="display:flex;gap:6px;flex-shrink:0">         <button class="btn btn-sm btn-ghost" onclick="editNPSQuestion(${i})">✏</button>         <button class="btn btn-sm btn-danger" onclick="deleteNPSQuestion(${i})">🗑</button>       </div>     </div>   `).join('');
}
 window.openNPSQuestionModal = function(idx = -1) {
  document.getElementById('nps-q-editing-idx').value = idx;
  document.getElementById('nps-q-modal-title').textContent = idx >= 0 ? 'Editar Pergunta' : 'Nova Pergunta';
  document.getElementById('nps-q-type').value = 'nps_score';
  document.getElementById('nps-q-text').value = '';
  document.getElementById('nps-q-emoji-input').value = '';
  document.getElementById('nps-q-required').checked = true;
  document.getElementById('nps-q-emoji-opts').classList.add('hidden');
  if (idx >= 0) {
    const q = _npsQuestions[idx];
    document.getElementById('nps-q-type').value = q.type;
    document.getElementById('nps-q-text').value = q.text;
    document.getElementById('nps-q-required').checked = q.required !== false;
    if (q.type === 'emoji' && q.options) {
      document.getElementById('nps-q-emoji-input').value = q.options.map(o => o.e + ' ' + o.l).join(', ');
      document.getElementById('nps-q-emoji-opts').classList.remove('hidden');
    }
  }
  
/* Move modal to body for correct z-index */
   const modal = document.getElementById('nps-q-modal');
  if (modal && modal.parentElement !== document.body) document.body.appendChild(modal);
  if (modal) modal.style.zIndex = '1200';
  openModal('nps-q-modal');
};
 window.editNPSQuestion = function(idx) {
openNPSQuestionModal(idx);
};
 window.onNPSTypeChange = function() {
  const type = document.getElementById('nps-q-type')?.value;
  document.getElementById('nps-q-emoji-opts').classList.toggle('hidden', type !== 'emoji');
};
 window.saveNPSQuestion = function() {
  const type = document.getElementById('nps-q-type').value;
  const text = document.getElementById('nps-q-text').value.trim();
  const required = document.getElementById('nps-q-required').checked;
  if (!text) {
showToast('Preencha o texto da pergunta.', 'error');
return;
}
   let options;
  if (type === 'emoji') {
    const raw = document.getElementById('nps-q-emoji-input').value.trim();
    if (!raw) {
showToast('Informe as opções de emoji.', 'error');
return;
}
    options = raw.split(',').map(s => {
      const parts = s.trim().split(' ');
      return {
e: parts[0] || '😊', l: parts.slice(1).join(' ') || 'Opção' };
    });
  }
   const idx = parseInt(document.getElementById('nps-q-editing-idx').value);
  const q = {
id: 'nps_' + Date.now(), order: _npsQuestions.length + 1, type, text, required };
  if (options) q.options = options;
   if (idx >= 0) {
    _npsQuestions[idx] = {
..._npsQuestions[idx], ...q, id: _npsQuestions[idx].id };
  }
else {
    _npsQuestions.push(q);
  }
   closeModal('nps-q-modal');
  renderNPSQuestionsAdmin();
  showToast('Pergunta ' + (idx >= 0 ? 'atualizada' : 'adicionada') + '. Clique em Salvar!', 'gold');
};
 window.deleteNPSQuestion = function(idx) {
  if (!confirm('Remover esta pergunta?')) return;
  _npsQuestions.splice(idx, 1);
  _npsQuestions.forEach((q, i) => {
q.order = i + 1;
});
  renderNPSQuestionsAdmin();
  showToast('Pergunta removida. Clique em Salvar!', 'gold');
};
 window.moveNPSQuestion = function(idx, dir) {
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= _npsQuestions.length) return;
  [_npsQuestions[idx], _npsQuestions[newIdx]] = [_npsQuestions[newIdx], _npsQuestions[idx]];
  _npsQuestions.forEach((q, i) => {
q.order = i + 1;
});
  renderNPSQuestionsAdmin();
};
 window.saveNPSQuestions = function() {
  localStorage.setItem('va_nps_questions', JSON.stringify(_npsQuestions));
  showToast('Perguntas salvas com sucesso! Os clientes já verão as novas perguntas.', 'gold', '💾');
};
 window.resetNPSQuestions = function() {
  if (!confirm('Restaurar as perguntas padrão? Alterações atuais serão perdidas.')) return;
  _npsQuestions = JSON.parse(JSON.stringify(NPS_DEFAULT_QUESTIONS));
  localStorage.setItem('va_nps_questions', JSON.stringify(_npsQuestions));
  renderNPSQuestionsAdmin();
  showToast('Perguntas restauradas para o padrão.', 'gold');
};
 
/* ============================================================ USERS (ADMIN) CRUD ============================================================ */
 const ROLE_LABELS = {
  admin:    {
label:'🔑 Admin',           cls:'badge-gold' },   manager:  {
label:'📋 Gerente',         cls:'badge-green' },   operator: {
label:'⭐ Consultora',       cls:'badge-purple' },   viewer:   {
label:'👁 Visualizador',  cls:'badge-gray' }, };
 async function loadUsersList() {
  const wrap = document.getElementById('users-list');
  if (!wrap) return;
  wrap.innerHTML = loadingSpinner();
  try {
    const {
data, error }
= await getClient()       .from('admin_users')       .select('id, username, display_name, role, is_active, must_change_password, created_at')       .eq('company_id', COMPANY_ID)       .order('created_at', {
ascending: true });
    if (error) throw error;
    const users = data || [];
     if (!users.length) {
      wrap.innerHTML = `<div class="empty-state"><div class="empty-icon">👤</div>         <h3>Nenhum usuário cadastrado</h3>         <p>Clique em "+ Novo Usuário" para criar o primeiro acesso.</p></div>`;
      return;
    }
     wrap.innerHTML = `<div class="table-wrap">       <table>         <thead><tr>           <th>Usuário</th><th>Login</th><th>Perfil</th><th>Status</th><th>Ações</th>         </tr></thead>         <tbody>           ${users.map(u => {
            const role = ROLE_LABELS[u.role] || {
label: u.role, cls:'badge-gray' };
            const isMe = u.id === VA_AUTH?.currentUser?.id;
            return `<tr>               <td>                 <div style="font-weight:600">${u.display_name || '–'}</div>                 ${u.must_change_password ? '<div style="font-size:.72rem;color:var(--rose)">⚠ Deve trocar senha</div>' : ''}
              </td>               <td style="font-family:monospace;font-size:.85rem;color:var(--text-secondary)">${u.username}</td>               <td><span class="badge ${role.cls}">${role.label}</span></td>               <td>                 <span class="badge ${u.is_active ? 'badge-green' : 'badge-red'}">                   ${u.is_active ? '✓ Ativo' : '✗ Inativo'}
                </span>               </td>               <td>                 <div style="display:flex;gap:6px;flex-wrap:wrap">                   <button class="btn btn-sm btn-ghost" onclick="openUserModal('${u.id}')">✏ Editar</button>                   <button class="btn btn-sm btn-danger" onclick="resetUserPwd('${u.id}', '${u.display_name || u.username}')"                     ${isMe ? 'disabled title="Não pode resetar sua própria senha aqui"' : ''}>                     🔑 Reset Senha                   </button>                 </div>               </td>             </tr>`;
          }).join('')}
        </tbody>       </table>     </div>`;
  }
catch(e) {
    wrap.innerHTML = `<p style="color:var(--rose)">Erro ao carregar usuários: ${e.message}</p>`;
  }
}
 let _editingUserId = null;
window.openUserModal = async function(id = null) {
  _editingUserId = id;
  document.getElementById('user-modal-title').textContent = id ? 'Editar Usuário' : 'Novo Usuário';
  document.getElementById('usr-name').value     = '';
  document.getElementById('usr-username').value = '';
  document.getElementById('usr-role').value     = 'operator';
  document.getElementById('usr-active').checked = true;
  document.getElementById('usr-id').value       = id || '';
   if (id) {
    try {
      const {
data }
= await getClient().from('admin_users').select('*').eq('id', id).single();
      if (data) {
        document.getElementById('usr-name').value     = data.display_name || '';
        document.getElementById('usr-username').value = data.username;
        document.getElementById('usr-role').value     = data.role || 'operator';
        document.getElementById('usr-active').checked = data.is_active !== false;
      }
    }
catch(_) {}
  }
   
/* Block editing own username */
   document.getElementById('usr-username').disabled = !!id;
   
/* Move modal to body for correct z-index */
   const modal = document.getElementById('user-modal');
  if (modal && modal.parentElement !== document.body) document.body.appendChild(modal);
  if (modal) modal.style.zIndex = '1200';
  openModal('user-modal');
};
 window.saveUser = async function() {
  const name     = document.getElementById('usr-name').value.trim();
  const username = document.getElementById('usr-username').value.trim().toLowerCase();
  const role     = document.getElementById('usr-role').value;
  const active   = document.getElementById('usr-active').checked;
  const id       = document.getElementById('usr-id').value;
   if (!name) {
showToast('Informe o nome de exibição.', 'error');
return;
}
  if (!id && !username) {
showToast('Informe o nome de usuário (login).', 'error');
return;
}
   const payload = {
    display_name: name,     role,     is_active: active,     updated_at: new Date().toISOString(),   };
   try {
    if (id) {
      await dbUpdate('admin_users', id, payload);
      showToast('Usuário atualizado!', 'gold');
    }
else {
      await dbInsert('admin_users', {
        ...payload,         username,         company_id: COMPANY_ID,         password_hash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', /* sha256('123456') */
         must_change_password: true,       });
      showToast('Usuário criado! Senha padrão: 123456', 'gold', '🔑');
    }
    closeModal('user-modal');
    await loadUsersList();
  }
catch(e) {
    showToast('Erro: ' + (e.message || 'verifique se o usuário já existe.'), 'error');
  }
};
 window.resetUserPwd = async function(userId, name) {
  if (!confirm(`Resetar senha de "${name}" para 123456? Ele precisará criar uma nova senha no próximo login.`)) return;
  try {
    await VA_AUTH.resetUserPassword(userId);
    showToast(`Senha de ${name}
foi resetada para 123456.`, 'gold', '🔑');
    await loadUsersList();
  }
catch(e) {
    showToast('Erro ao resetar: ' + e.message, 'error');
  }
};
 
/* ============================================================ NPS SUB-TABS + RESPONSES VIEWER ============================================================ */
 window.showNPSSubTab = function(tab) {
  ['perguntas','respostas'].forEach(t => {
    document.getElementById('nps-sub-' + t)?.classList.toggle('active', t === tab);
    document.getElementById('nps-panel-' + t)?.classList.toggle('hidden', t !== tab);
  });
  if (tab === 'respostas') loadNPSResponses();
};
 const NPS_SCORE_COLOR = (s) => s >= 9 ? 'var(--teal)' : s >= 7 ? 'var(--gold)' : 'var(--rose)';
const NPS_SCORE_LABEL = (s) => s >= 9 ? 'Promotor' : s >= 7 ? 'Neutro' : 'Detrator';
 window.loadNPSResponses = async function() {
  const wrap = document.getElementById('nps-responses-wrap');
  if (!wrap) return;
  wrap.innerHTML = loadingSpinner();
   try {
    const {
data, error }
= await getClient()       .from('nps_responses')       .select('*, clients(name)')       .eq('company_id', COMPANY_ID)       .order('created_at', {
ascending: false })       .limit(100);
    if (error) throw error;
     const rows = data || [];
    const steps = (() => {
      try {
const s = JSON.parse(localStorage.getItem('va_nps_questions'));
return s?.length ? s : null;
}
      catch(_) {
return null;
}
    })();
     if (!rows.length) {
      wrap.innerHTML = `<div class="empty-state"><div class="empty-icon">📬</div>         <h3>Nenhuma resposta ainda</h3><p>As respostas dos clientes aparecerão aqui.</p></div>`;
      return;
    }
     const withScore  = rows.filter(r => r.nps_score !== null && r.nps_score !== undefined);
    const avgScore   = withScore.length ? (withScore.reduce((s,r) => s + r.nps_score, 0) / withScore.length).toFixed(1) : '–';
    const promoters  = withScore.filter(r => r.nps_score >= 9).length;
    const detractors = withScore.filter(r => r.nps_score <= 6).length;
    const npsIndex   = withScore.length ? Math.round(((promoters - detractors) / withScore.length) * 100) : null;
     wrap.innerHTML = `       <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px">         <div class="card" style="flex:1;min-width:100px;padding:14px;text-align:center">           <div style="font-size:1.6rem;font-weight:800;color:var(--gold)">${rows.length}</div>           <div style="font-size:.72rem;color:var(--text-muted)">Respostas</div>         </div>         <div class="card" style="flex:1;min-width:100px;padding:14px;text-align:center">           <div style="font-size:1.6rem;font-weight:800;color:var(--teal)">${avgScore}</div>           <div style="font-size:.72rem;color:var(--text-muted)">Nota Média</div>         </div>         <div class="card" style="flex:1;min-width:100px;padding:14px;text-align:center">           <div style="font-size:1.6rem;font-weight:800;color:${npsIndex !== null && npsIndex >= 0 ? 'var(--teal)' : 'var(--rose)'}">             ${npsIndex !== null ? (npsIndex >= 0 ? '+':'') + npsIndex : '–'}
          </div>           <div style="font-size:.72rem;color:var(--text-muted)">NPS Score</div>         </div>         <div class="card" style="flex:1;min-width:100px;padding:14px;text-align:center">           <div style="font-size:1.6rem;font-weight:800;color:var(--teal)">${promoters}</div>           <div style="font-size:.72rem;color:var(--text-muted)">Promotores</div>         </div>         <div class="card" style="flex:1;min-width:100px;padding:14px;text-align:center">           <div style="font-size:1.6rem;font-weight:800;color:var(--rose)">${detractors}</div>           <div style="font-size:.72rem;color:var(--text-muted)">Detratores</div>         </div>       </div>        <div style="display:flex;flex-direction:column;gap:12px">         ${rows.map(r => {
          const clientName = r.clients?.name || '(cliente removido)';
          const dateStr = r.created_at             ? new Date(r.created_at).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})             : '–';
          const score    = r.nps_score;
          const hasScore = score !== null && score !== undefined;
          const answers  = r.answers || {};
           let answersHtml = '';
          if (steps && Object.keys(answers).length) {
            answersHtml = steps.map(step => {
              const val = answers[step.id];
              if (val === undefined) return '';
              let display = '';
              if      (step.type === 'nps_score') display = `Nota: <strong style="color:${NPS_SCORE_COLOR(val)}">${val}/10</strong>`;
              else if (step.type === 'stars')     display = '⭐'.repeat(val) + ` (${val}/5)`;
              else if (step.type === 'yn')        display = val ? '👍 Sim' : '👎 Não';
              else if (step.type === 'emoji' && step.options) {
const o = step.options[val];
display = o ? o.e+' '+o.l : val;
}
              else if (step.type === 'text' || step.type === 'comment') display = val ? `"${val}"` : '(sem comentário)';
              return `<div style="font-size:.8rem;margin-top:4px"><span style="color:var(--text-muted)">${step.q || step.text}:</span> ${display}</div>`;
            }).join('');
          }
           const audioHtml = r.audio_data             ? `<div style="margin-top:8px"><audio controls src="${r.audio_data}" style="width:100%;height:32px;border-radius:8px"></audio></div>`             : '';
           return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px">             <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px">               <div>                 <span style="font-weight:700">${clientName}</span>                 <span style="font-size:.75rem;color:var(--text-muted);margin-left:8px">${dateStr}</span>               </div>               ${hasScore ? `<span class="badge" style="background:transparent;border-color:${NPS_SCORE_COLOR(score)};color:${NPS_SCORE_COLOR(score)}">${score}/10 · ${NPS_SCORE_LABEL(score)}</span>` : ''}
            </div>             ${answersHtml || (r.comment ? `<div style="font-size:.83rem;color:var(--text-secondary)">"${r.comment}"</div>` : '')}
            ${audioHtml}
            ${r.points_awarded > 0 ? `<div style="font-size:.72rem;color:var(--gold);margin-top:8px">⭐ +${r.points_awarded}
pts concedidos</div>` : ''}
          </div>`;
        }).join('')}
      </div>`;
  }
catch(e) {
    wrap.innerHTML = `<p style="color:var(--rose)">Erro ao carregar respostas: ${e.message}</p>`;
  }
};