// ============================================================
// PAGE: COLABORADORES
// ============================================================
async function renderColaboradores() {
  const page = document.getElementById('page-colaboradores');
  page.innerHTML = loadingSpinner();
  try {
    const employees = await fetchEmployees();
    page.innerHTML = `
    <div class="section-header mb-16">
      <div></div>
      <button class="btn btn-gold" onclick="openEmployeeModal()">+ Novo Colaborador</button>
    </div>

    <div id="emp-list">
      ${employees.length === 0
        ? emptyState('◆','Nenhum colaborador cadastrado','Vá em Configurações > Colaboradores para adicionar.')
        : `<div class="grid-auto">${employees.map(e => `
          <div class="card">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
              ${renderAvatar(e.name, 48)}
              <div>
                <div style="font-weight:700">${e.name}</div>
                <div style="font-size:0.78rem;color:var(--text-muted)">${e.role||e.department||'–'}</div>
              </div>
              <div style="margin-left:auto;display:flex;gap:6px">
                <button class="btn btn-sm btn-ghost" onclick="openEmployeeModal('${e.id}')">✏</button>
              </div>
            </div>
            ${e.email ? `<div style="font-size:0.82rem;color:var(--text-secondary)">✉ ${e.email}</div>` : ''}
            ${e.phone ? `<div style="font-size:0.82rem;color:var(--text-secondary)">📞 ${e.phone}</div>` : ''}
            ${e.hire_date ? `<div style="font-size:0.78rem;color:var(--text-muted)">Desde ${fmtDate(e.hire_date)}</div>` : ''}
          </div>`).join('')}</div>`}
    </div>

    <!-- MODAL -->
    <div id="emp-modal" class="modal-overlay hidden">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title" id="emp-modal-title">Novo Colaborador</span>
          <button class="modal-close" onclick="closeModal('emp-modal')">✕</button>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Nome *</label><input type="text" id="em-name" /></div>
          <div class="form-group"><label>Cargo</label><input type="text" id="em-role" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Departamento</label><input type="text" id="em-dept" /></div>
          <div class="form-group"><label>Data de Contratação</label><input type="text" id="em-hire" data-date-mask /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>E-mail</label><input type="email" id="em-email" /></div>
          <div class="form-group"><label>Telefone</label><input type="tel" id="em-phone" placeholder="(00) 00000-0000" oninput="this.value=maskPhone(this.value)" /></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="closeModal('emp-modal')">Cancelar</button>
          <button class="btn btn-gold" onclick="saveEmployee()">Salvar</button>
        </div>
      </div>
    </div>
    `;
  } catch(e) {
    page.innerHTML = `<p style="color:var(--rose)">Erro: ${e.message}</p>`;
  }
}

let editingEmpId = null;
window.openEmployeeModal = async function(id = null) {
  editingEmpId = id;
  document.getElementById('emp-modal-title').textContent = id ? 'Editar Colaborador' : 'Novo Colaborador';
  ['name','role','dept','email','phone'].forEach(f => { const el = document.getElementById('em-'+f); if(el) el.value = ''; });
  document.getElementById('em-hire').value = '';
  if (id) {
    try {
      const employees = await fetchEmployees();
      const e = employees.find(x => x.id === id);
      if (e) {
        document.getElementById('em-name').value  = e.name || '';
        document.getElementById('em-role').value  = e.role || '';
        document.getElementById('em-dept').value  = e.department || '';
        document.getElementById('em-email').value = e.email || '';
        document.getElementById('em-phone').value = maskPhone(e.phone || '');
        document.getElementById('em-hire').value  = fmtDateToMask(e.hire_date);
      }
    } catch(_) {}
  }
  openModal('emp-modal');
  initDateMask(document.getElementById('em-hire'));
};

window.saveEmployee = async function() {
  const name = document.getElementById('em-name').value.trim();
  if (!name) { showToast('Nome obrigatório','error'); return; }
  const payload = {
    name,
    role:       document.getElementById('em-role').value || null,
    department: document.getElementById('em-dept').value || null,
    email:      document.getElementById('em-email').value || null,
    phone:      document.getElementById('em-phone').value || null,
    hire_date:  parseMaskedDate(document.getElementById('em-hire').value) || null,
  };
  try {
    if (editingEmpId) { await dbUpdate('employees', editingEmpId, payload); showToast('Colaborador atualizado!'); }
    else { await dbInsert('employees', payload); showToast('Colaborador cadastrado!','gold','✦'); }
    closeModal('emp-modal');
    await renderColaboradores();
  } catch(e) { showToast('Erro: '+e.message,'error'); }
};
