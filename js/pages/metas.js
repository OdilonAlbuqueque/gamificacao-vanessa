// ============================================================
// PAGE: METAS
// ============================================================
async function renderMetas() {
  const page = document.getElementById('page-metas');
  page.innerHTML = loadingSpinner();
  try {
    const [goals, employees] = await Promise.all([fetchGoals(), fetchEmployees()]);
    const collective = goals.filter(g => g.goal_type === 'collective');
    const individual = goals.filter(g => g.goal_type === 'individual');

    page.innerHTML = `
    <div class="section-header mb-16">
      <div class="tab-bar" style="max-width:300px">
        <button class="tab-btn active" id="tab-col-btn" onclick="showGoalsTab('collective')">🤝 Coletivas</button>
        <button class="tab-btn" id="tab-ind-btn" onclick="showGoalsTab('individual')">👤 Individuais</button>
      </div>
      <button class="btn btn-gold" onclick="openGoalModal()">+ Nova Meta</button>
    </div>

    <div id="tab-collective" class="tab-content">
      ${renderGoalsList(collective)}
    </div>
    <div id="tab-individual" class="tab-content hidden">
      ${renderGoalsList(individual, employees)}
    </div>

    <!-- GOAL MODAL -->
    <div id="goal-modal" class="modal-overlay hidden">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title" id="goal-modal-title">Nova Meta</span>
          <button class="modal-close" onclick="closeModal('goal-modal')">✕</button>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Título *</label><input type="text" id="g-title" /></div>
          <div class="form-group"><label>Tipo</label>
            <select id="g-type" onchange="toggleEmpSelect()">
              <option value="collective">Coletiva</option>
              <option value="individual">Individual</option>
            </select>
          </div>
        </div>
        <div class="form-group" id="g-emp-wrap" style="display:none">
          <label>Colaborador</label>
          <select id="g-employee">
            <option value="">– Selecione –</option>
            ${employees.map(e => `<option value="${e.id}">${e.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Descrição</label><textarea id="g-desc" rows="2"></textarea></div>
        <div class="form-row">
          <div class="form-group"><label>Meta (valor alvo) *</label><input type="number" id="g-target" min="1" /></div>
          <div class="form-group"><label>Unidade</label><input type="text" id="g-unit" value="pontos" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Início</label><input type="text" id="g-start" data-date-mask /></div>
          <div class="form-group"><label>Fim</label><input type="text" id="g-end" data-date-mask /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Prêmio / Recompensa</label><input type="text" id="g-reward" /></div>
          <div class="form-group"><label>Valor do Prêmio <span style="color:var(--text-muted);font-weight:400;font-size:0.8rem">(opcional)</span></label><input type="text" id="g-reward-val" data-currency /></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="closeModal('goal-modal')">Cancelar</button>
          <button class="btn btn-gold" onclick="saveGoal()">Salvar Meta</button>
        </div>
      </div>
    </div>

    <!-- UPDATE PROGRESS MODAL -->
    <div id="progress-modal" class="modal-overlay hidden">
      <div class="modal" style="max-width:400px">
        <div class="modal-header">
          <span class="modal-title">Atualizar Progresso</span>
          <button class="modal-close" onclick="closeModal('progress-modal')">✕</button>
        </div>
        <div class="form-group"><label>Progresso Atual</label><input type="number" id="pm-value" min="0" /></div>
        <input type="hidden" id="pm-goal-id" />
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="closeModal('progress-modal')">Cancelar</button>
          <button class="btn btn-gold" onclick="saveProgress()">Atualizar</button>
        </div>
      </div>
    </div>
    `;
  } catch(e) {
    page.innerHTML = `<p style="color:var(--rose)">Erro: ${e.message}</p>`;
  }
}

function renderGoalsList(goals, employees = []) {
  if (goals.length === 0) return emptyState('◎','Nenhuma meta cadastrada','Crie metas para sua equipe!');
  return `<div style="display:flex;flex-direction:column;gap:16px">
    ${goals.map(g => {
      const pct = Math.min(100, Math.round(((g.current_value||0) / g.target_value) * 100));
      const emp = employees.find(e => e.id === g.employee_id);
      const statusCls = { active:'badge-green', completed:'badge-gold', cancelled:'badge-red', expired:'badge-gray' }[g.status]||'badge-gray';
      const statusLabel = { active:'Ativa', completed:'Concluída', cancelled:'Cancelada', expired:'Expirada' }[g.status]||g.status;
      return `<div class="card">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px">
              <span style="font-size:1rem;font-weight:700">${g.title}</span>
              <span class="badge ${statusCls}">${statusLabel}</span>
              ${emp ? `<span class="badge badge-purple">👤 ${emp.name}</span>` : ''}
            </div>
            ${g.description ? `<p style="font-size:0.83rem;color:var(--text-secondary);margin-bottom:8px">${g.description}</p>` : ''}
            <div style="margin-bottom:8px">${progressBar(g.current_value||0, g.target_value)} <small style="color:var(--text-muted)">${g.unit||'pontos'}</small></div>
            ${g.reward ? `<div style="font-size:0.82rem;color:var(--gold)">🎁 ${g.reward}${g.reward_value ? ` – R$ ${parseFloat(g.reward_value).toFixed(2)}` : ''}</div>` : ''}
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px">
              ${fmtDate(g.start_date)} → ${fmtDate(g.end_date)}
            </div>
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0">
            <button class="btn btn-sm btn-outline-gold" onclick="openProgressModal('${g.id}',${g.current_value||0})">↑ Atualizar</button>
            <button class="btn btn-sm btn-ghost" onclick="toggleGoalStatus('${g.id}','${g.status}')">
              ${g.status === 'active' ? '✓ Concluir' : '↺ Reativar'}
            </button>
          </div>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function showGoalsTab(tab) {
  document.getElementById('tab-collective').classList.toggle('hidden', tab !== 'collective');
  document.getElementById('tab-individual').classList.toggle('hidden', tab !== 'individual');
  document.getElementById('tab-col-btn').classList.toggle('active', tab === 'collective');
  document.getElementById('tab-ind-btn').classList.toggle('active', tab === 'individual');
}

let editingGoalId = null;
window.openGoalModal = function(id = null) {
  editingGoalId = id;
  document.getElementById('goal-modal-title').textContent = id ? 'Editar Meta' : 'Nova Meta';
  ['title','desc','unit','reward'].forEach(f => { const el = document.getElementById('g-'+f); if(el) el.value = f==='unit'?'pontos':''; });
  ['target','reward-val'].forEach(f => { const el = document.getElementById('g-'+f); if(el) el.value = ''; });
  document.getElementById('g-start').value = fmtDateToMask(new Date().toISOString());
  document.getElementById('g-end').value = '';
  document.getElementById('g-type').value = 'collective';
  document.getElementById('g-emp-wrap').style.display = 'none';
  openModal('goal-modal');
  // Init date masks
  initDateMask(document.getElementById('g-start'));
  initDateMask(document.getElementById('g-end'));
  // Init currency mask
  initCurrencyMask(document.getElementById('g-reward-val'));
};

window.toggleEmpSelect = function() {
  const t = document.getElementById('g-type').value;
  document.getElementById('g-emp-wrap').style.display = t === 'individual' ? '' : 'none';
};

window.saveGoal = async function() {
  const title = document.getElementById('g-title').value.trim();
  if (!title) { showToast('Título obrigatório','error'); return; }
  const payload = {
    title,
    description:  document.getElementById('g-desc').value || null,
    goal_type:    document.getElementById('g-type').value,
    target_value: parseFloat(document.getElementById('g-target').value||'0'),
    unit:         document.getElementById('g-unit').value || 'pontos',
    start_date:   parseMaskedDate(document.getElementById('g-start').value),
    end_date:     parseMaskedDate(document.getElementById('g-end').value),
    reward:       document.getElementById('g-reward').value || null,
    reward_value: parseCurrency(document.getElementById('g-reward-val').value),
    status: 'active'
  };
  if (!payload.start_date) { showToast('Data de início inválida (DD/MM/AAAA)','error'); return; }
  if (!payload.end_date)   { showToast('Data de fim inválida (DD/MM/AAAA)','error'); return; }
  if (payload.target_value <= 0) { showToast('Informe um valor alvo válido','error'); return; }
  try {
    if (editingGoalId) await dbUpdate('goals', editingGoalId, payload);
    else await dbInsert('goals', payload);
    showToast('Meta salva!','gold','◎');
    closeModal('goal-modal');
    await renderMetas();
  } catch(e) { showToast('Erro: '+e.message,'error'); }
};

window.openProgressModal = function(goalId, current) {
  document.getElementById('pm-goal-id').value = goalId;
  document.getElementById('pm-value').value = current;
  openModal('progress-modal');
};

window.saveProgress = async function() {
  const goalId = document.getElementById('pm-goal-id').value;
  const val    = parseFloat(document.getElementById('pm-value').value||'0');
  try {
    await dbUpdate('goals', goalId, { current_value: val });
    showToast('Progresso atualizado!');
    closeModal('progress-modal');
    await renderMetas();
  } catch(e) { showToast('Erro: '+e.message,'error'); }
};

window.toggleGoalStatus = async function(goalId, currentStatus) {
  const newStatus = currentStatus === 'active' ? 'completed' : 'active';
  try {
    await dbUpdate('goals', goalId, { status: newStatus });
    showToast(`Meta ${newStatus === 'completed' ? 'concluída' : 'reativada'}!`,'gold');
    await renderMetas();
  } catch(e) { showToast('Erro: '+e.message,'error'); }
};
