// ============================================================
// PORTAL DO CLIENTE — cliente.js
// ============================================================
let _sb = null;
let _client = null;
let _transactions = [];
let _npsAnswers  = {};
let _npsStep     = 0;
let _mediaRec    = null;
let _audioChunks = [];
let _audioBase64 = null;

// ============================================================
// VÍDEO DE BOAS-VINDAS
// ============================================================
function _videoSkipKey(cpf) {
  return 'va_skip_video_' + (cpf || '').replace(/\D/g, '');
}

function abrirVideoModal(cpfRaw) {
  const videoId = VA_CONFIG.welcomeVideoId;
  if (!videoId) return; // vídeo ainda não configurado — pula silenciosamente

  const skipKey = _videoSkipKey(cpfRaw);
  if (localStorage.getItem(skipKey) === '1') return; // usuário marcou "não mostrar"

  // Carrega o iframe com autoplay + sem vídeos relacionados + sem barra do YouTube
  const iframe = document.getElementById('video-iframe');
  if (iframe) {
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white`;
  }

  // Reseta o checkbox
  const chk = document.getElementById('vmod-nao-mostrar');
  if (chk) chk.checked = false;

  const overlay = document.getElementById('video-modal-overlay');
  overlay.dataset.cpf = cpfRaw;
  requestAnimationFrame(() => overlay.classList.add('visible'));
}

window.fecharVideoModal = function() {
  const overlay = document.getElementById('video-modal-overlay');
  const chk = document.getElementById('vmod-nao-mostrar');
  const cpfRaw = overlay.dataset.cpf || '';

  // Salva preferência se checkbox marcado
  if (chk && chk.checked && cpfRaw) {
    localStorage.setItem(_videoSkipKey(cpfRaw), '1');
  }

  // Para o vídeo limpando o src (evita áudio continuando em background)
  const iframe = document.getElementById('video-iframe');
  if (iframe) iframe.src = '';

  overlay.classList.remove('visible');
};

const _NPS_STEPS_DEFAULT = [
  { id: 'score',       type: 'nps_score', required: true,  q: 'De 0 a 10, como você avalia sua experiência na Clínica Vanessa Amorim?' },
  { id: 'team',        type: 'stars',     required: true,  q: 'Como você avalia o atendimento da nossa equipe?' },
  { id: 'environment', type: 'emoji',     required: true,  q: 'O ambiente da clínica atendeu suas expectativas?',
    options: [{ e:'😞', l:'Não' }, { e:'😐', l:'Regular' }, { e:'😊', l:'Bom' }, { e:'😍', l:'Ótimo' }] },
  { id: 'recommend',   type: 'yn',        required: true,  q: 'Você indicaria nossa clínica para amigos ou familiares?' },
  { id: 'comment',     type: 'text',      required: false, q: 'Deixe um comentário ou sugestão (opcional)' },
];

function getNPSSteps() {
  try {
    const saved = JSON.parse(localStorage.getItem('va_nps_questions'));
    if (saved && saved.length > 0) return saved.sort((a,b) => (a.order||0) - (b.order||0));
  } catch(_) {}
  return _NPS_STEPS_DEFAULT;
}

const COMPANY_ID = '00000000-0000-0000-0000-000000000001';

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  const url = VA_CONFIG.supabaseUrl;
  const key = VA_CONFIG.supabaseKey;

  // CPF pré-preenchido via query string ?cpf=...
  const params = new URLSearchParams(location.search);
  const preCpf = params.get('cpf');
  if (preCpf) {
    document.getElementById('cl-cpf-input').value = maskCPF(preCpf);
    document.getElementById('cl-pwd-input').focus();
  }

  // Mask CPF on input
  document.getElementById('cl-cpf-input').addEventListener('input', function() {
    this.value = maskCPF(this.value);
  });

  document.getElementById('cl-pwd-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') clLogin();
  });

  if (!url || !key) {
    hide('cl-loading'); show('cl-login');
    showErr('Sistema não configurado. Entre em contato com a clínica.');
    return;
  }

  try {
    _sb = supabase.createClient(url, key);
    hide('cl-loading');
    show('cl-login');
  } catch(_) {
    hide('cl-loading'); show('cl-login');
    showErr('Erro de conexão. Tente novamente mais tarde.');
  }
});

// ============================================================
// UTILS
// ============================================================
function show(id) { document.getElementById(id)?.classList.remove('hidden'); }
function hide(id) { document.getElementById(id)?.classList.add('hidden'); }
function showErr(msg) {
  const el = document.getElementById('cl-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function hideErr() {
  const el = document.getElementById('cl-error');
  if (el) el.style.display = 'none';
}
function maskCPF(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}
function fmtDate(str) {
  if (!str) return '–';
  return new Date(str).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' });
}
function fmtDateTime(str) {
  if (!str) return '–';
  return new Date(str).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
function ordinal(n) {
  return n + (n === 1 ? 'º' : 'º');
}

// ============================================================
// LOGIN
// ============================================================
window.clLogin = async function() {
  hideErr();
  const cpfRaw = document.getElementById('cl-cpf-input').value.replace(/\D/g, '');
  const pwd    = document.getElementById('cl-pwd-input').value.trim();

  if (cpfRaw.length < 11) { showErr('Informe um CPF válido (11 dígitos).'); return; }
  if (!pwd) { showErr('Informe sua senha.'); return; }
  if (pwd !== VA_CONFIG.clientPassword) { showErr('Senha incorreta.'); return; }

  const btn = document.getElementById('cl-login-btn');
  btn.textContent = 'Entrando...'; btn.disabled = true;

  try {
    const { data, error } = await _sb.from('clients')
      .select('*')
      .eq('company_id', COMPANY_ID)
      .eq('is_active', true)
      .ilike('cpf', `%${cpfRaw.slice(0,3)}%`)
      .limit(50);

    if (error) throw error;

    // Find by raw digits match
    const found = (data || []).find(c =>
      (c.cpf || '').replace(/\D/g, '') === cpfRaw
    );

    if (!found) {
      showErr('CPF não encontrado. Verifique com a clínica.');
      btn.textContent = 'Entrar'; btn.disabled = false;
      return;
    }

    _client = found;
    hide('cl-login');
    show('cl-app');
    await loadDashboard();
    // Exibe vídeo de apresentação (se não foi dispensado antes)
    abrirVideoModal(cpfRaw);
  } catch(e) {
    showErr('Erro ao acessar. Tente novamente.');
    btn.textContent = 'Entrar'; btn.disabled = false;
  }
};

window.clLogout = function() {
  _client = null; _transactions = []; _npsAnswers = {};
  hide('cl-app');
  document.getElementById('cl-cpf-input').value = '';
  document.getElementById('cl-pwd-input').value = '';
  document.getElementById('cl-login-btn').textContent = 'Entrar';
  document.getElementById('cl-login-btn').disabled = false;
  show('cl-login');
};

// ============================================================
// DASHBOARD LOAD
// ============================================================
async function loadDashboard() {
  document.getElementById('cl-app-name').textContent = _client.name;
  document.getElementById('cl-app-clinic').textContent = VA_CONFIG.clinicName;
  document.getElementById('cl-clinic-name').textContent = VA_CONFIG.clinicName;

  // Fetch transactions
  const { data: txs } = await _sb.from('point_transactions')
    .select('*')
    .eq('client_id', _client.id)
    .order('created_at', { ascending: false });
  _transactions = txs || [];

  // KPIs
  const earned   = _transactions.filter(t => t.transaction_type === 'earned').reduce((s,t) => s+t.points,0);
  const redeemed = _transactions.filter(t => t.transaction_type === 'redeemed').reduce((s,t) => s+t.points,0);
  const expired  = _transactions.filter(t => t.transaction_type === 'expired').reduce((s,t) => s+t.points,0);
  const active   = _client.total_points || 0;

  document.getElementById('kpi-active').textContent   = active.toLocaleString('pt-BR');
  document.getElementById('kpi-earned').textContent   = earned.toLocaleString('pt-BR');
  document.getElementById('kpi-redeemed').textContent = redeemed.toLocaleString('pt-BR');
  document.getElementById('kpi-expired').textContent  = expired.toLocaleString('pt-BR');

  clTab('extrato');
}

// ============================================================
// TAB SWITCH
// ============================================================
window.clTab = function(tab) {
  ['extrato','ranking','nps'].forEach(t => {
    document.getElementById('tab-btn-'+t)?.classList.toggle('active', t === tab);
    document.getElementById('tab-'+t)?.classList.toggle('active', t === tab);
  });
  if (tab === 'extrato')  renderExtrato();
  if (tab === 'ranking')  renderRanking();
  if (tab === 'nps')      renderNPS();
};

// ============================================================
// EXTRATO
// ============================================================
function renderExtrato() {
  const el = document.getElementById('tab-extrato');
  if (!_transactions.length) {
    el.innerHTML = '<p class="empty-msg">Nenhum lançamento encontrado.</p>'; return;
  }
  el.innerHTML = _transactions.map(t => {
    const earned   = t.transaction_type === 'earned';
    const redeemed = t.transaction_type === 'redeemed';
    const icon = earned ? '⭐' : redeemed ? '🎁' : '⏳';
    const cls  = earned ? 'tx-earned' : redeemed ? 'tx-redeemed' : 'tx-expired';
    const ptsCls = earned ? 'pos' : redeemed ? 'neg' : 'exp';
    const pts  = earned ? `+${t.points}` : `-${t.points}`;
    const sub  = earned && t.expires_at
      ? `Vence ${fmtDate(t.expires_at)}`
      : fmtDateTime(t.created_at);
    return `<div class="tx-item">
      <div class="tx-icon ${cls}">${icon}</div>
      <div class="tx-info">
        <div class="tx-desc">${t.description || (earned ? 'Pontos Ganhos' : redeemed ? 'Resgate' : 'Expirado')}</div>
        <div class="tx-date">${sub}</div>
      </div>
      <div class="tx-pts ${ptsCls}">${pts}</div>
    </div>`;
  }).join('');
}

// ============================================================
// RANKING
// ============================================================
async function renderRanking() {
  const el = document.getElementById('tab-ranking');
  el.innerHTML = '<p class="empty-msg">Carregando ranking...</p>';

  try {
    const { data } = await _sb.from('clients')
      .select('id, total_points')
      .eq('company_id', COMPANY_ID)
      .eq('is_active', true)
      .order('total_points', { ascending: false })
      .limit(50);

    const list = data || [];
    const myRank = list.findIndex(c => c.id === _client.id) + 1;
    const medal = (r) => r===1?'🥇':r===2?'🥈':r===3?'🥉':null;

    el.innerHTML = `
      <div class="rank-me">
        <div class="rank-me-pos">${ordinal(myRank || list.length)}</div>
        <div class="rank-me-label">sua posição entre ${list.length} clientes</div>
        <div style="margin-top:8px"><span class="badge-pts">${(_client.total_points||0).toLocaleString('pt-BR')} pts</span></div>
      </div>
      <div class="section-title">Top ${Math.min(list.length, 20)}</div>
      ${list.slice(0, 20).map((c, i) => {
        const rank = i + 1;
        const isMe = c.id === _client.id;
        const m = medal(rank);
        const numCls = rank===1?'gold-text':rank===2?'silver':rank===3?'bronze':'';
        return `<div class="rank-item">
          <div class="rank-num ${numCls}">${m || rank}</div>
          <div class="rank-anon ${isMe?'is-me':''}">${isMe ? `✦ Você` : `Cliente #${rank}`}</div>
          <div class="rank-pts" style="color:${isMe?'var(--gold)':'var(--text-secondary)'}">${(c.total_points||0).toLocaleString('pt-BR')} pts</div>
        </div>`;
      }).join('')}`;
  } catch(e) {
    el.innerHTML = `<p class="empty-msg">Erro ao carregar ranking.</p>`;
  }
}

// ============================================================
// NPS
// ============================================================
async function renderNPS() {
  const el = document.getElementById('tab-nps');
  el.innerHTML = '<p class="empty-msg">Verificando...</p>';

  // Check cooldown
  try {
    const cooldownDays = VA_CONFIG.npsCooldownDays || 7;
    const since = new Date(Date.now() - cooldownDays * 86400000).toISOString();
    const { data: recent } = await _sb.from('nps_responses')
      .select('created_at')
      .eq('client_id', _client.id)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(1);

    if (recent && recent.length > 0) {
      const last = new Date(recent[0].created_at);
      const next = new Date(last.getTime() + cooldownDays * 86400000);
      const daysLeft = Math.ceil((next - new Date()) / 86400000);
      el.innerHTML = `<div class="nps-cooldown">
        <div class="nps-cooldown-icon">⏳</div>
        <h3>Pesquisa já respondida!</h3>
        <p>Você já respondeu nossa pesquisa recentemente.<br>
        Próxima disponível em <strong>${daysLeft} dia${daysLeft>1?'s':''}</strong>.</p>
      </div>`;
      return;
    }
  } catch(_) {}

  // Reset state
  _npsAnswers = {}; _npsStep = 0; _audioBase64 = null;
  renderNPSStep();
}

function renderNPSStep() {
  const el = document.getElementById('tab-nps');
  const NPS_STEPS = getNPSSteps();
  const step = NPS_STEPS[_npsStep];
  const total = NPS_STEPS.length;
  const stepId = step.id || ('q' + _npsStep);
  const stepType = step.type === 'comment' ? 'text' : step.type; // normalize

  const progress = NPS_STEPS.map((_, i) =>
    `<div class="nps-progress-dot${i <= _npsStep ? ' done' : ''}"></div>`
  ).join('');

  let answerHTML = '';
  const cur = _npsAnswers[stepId];

  if (stepType === 'nps_score') {
    const btns = Array.from({length:11},(_,i) =>
      `<button class="nps-score-btn${cur===i?' sel':''}" onclick="npsAnswer('${stepId}',${i})">${i}</button>`
    ).join('');
    answerHTML = `<div class="nps-score-grid">${btns}</div>
      <div class="nps-score-labels"><span>😞 Péssimo</span><span>😍 Excelente</span></div>`;
  } else if (stepType === 'stars') {
    const stars = [1,2,3,4,5].map(n =>
      `<span class="nps-star${cur && n<=cur?' lit':' dim'}" onclick="npsAnswer('${stepId}',${n})">⭐</span>`
    ).join('');
    answerHTML = `<div class="nps-stars">${stars}</div>`;
  } else if (stepType === 'emoji') {
    answerHTML = `<div class="nps-emoji-row">${(step.options||[]).map((o,i) =>
      `<button class="nps-emoji-btn${cur===i?' sel':''}" onclick="npsAnswer('${stepId}',${i})">
        ${o.e}<span class="nps-emoji-label">${o.l}</span>
      </button>`
    ).join('')}</div>`;
  } else if (stepType === 'yn') {
    answerHTML = `<div class="nps-yn-row">
      <button class="nps-yn-btn yes${cur===true?' sel':''}" onclick="npsAnswer('${stepId}',true)">👍 Sim</button>
      <button class="nps-yn-btn no${cur===false?' sel':''}" onclick="npsAnswer('${stepId}',false)">👎 Não</button>
    </div>`;
  } else { // text / comment
    answerHTML = `
      <textarea class="nps-textarea" id="nps-comment-txt" placeholder="Escreva aqui seu comentário..." rows="4"
        oninput="_npsAnswers['${stepId}'] = this.value">${cur||''}</textarea>
      <div class="audio-section">
        <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:8px">🎤 Ou grave uma mensagem de voz:</div>
        <button class="btn-record" id="btn-record" onclick="toggleRecording()">
          <span id="rec-icon">🎤</span> <span id="rec-label">Gravar áudio</span>
        </button>
        <audio id="audio-playback" class="audio-playback" controls style="display:none;margin-top:8px"></audio>
      </div>`;
  }

  const isLast = _npsStep === NPS_STEPS.length - 1;
  const backBtn = _npsStep > 0
    ? `<button class="btn-nps-back" onclick="npsBack()">← Voltar</button>` : '';
  const nextLabel = isLast ? '🎉 Enviar Pesquisa' : 'Próximo →';

  el.innerHTML = `<div class="nps-card">
    <div class="nps-progress">${progress}</div>
    <div style="font-size:.75rem;color:var(--text-muted);margin-bottom:12px">Pergunta ${_npsStep+1} de ${total}</div>
    <div class="nps-question">${step.q || step.text}</div>
    ${answerHTML}
    <div class="nps-nav">
      ${backBtn}
      <button class="btn-nps-next" id="btn-nps-next" onclick="npsNext()">${nextLabel}</button>
    </div>
  </div>`;
}

window.npsAnswer = function(key, val) {
  _npsAnswers[key] = val;
  renderNPSStep();
};

window.npsBack = function() {
  if (_npsStep > 0) { _npsStep--; renderNPSStep(); }
};

window.npsNext = async function() {
  const NPS_STEPS = getNPSSteps();
  const step = NPS_STEPS[_npsStep];
  const stepId = step.id || ('q' + _npsStep);
  if (step.required && _npsAnswers[stepId] === undefined) {
    alert('Por favor, selecione uma opção antes de continuar.'); return;
  }
  if (_npsStep < NPS_STEPS.length - 1) {
    _npsStep++; renderNPSStep();
  } else {
    await submitNPS();
  }
};


async function submitNPS() {
  const btn = document.getElementById('btn-nps-next');
  if (btn) { btn.textContent = 'Enviando...'; btn.disabled = true; }

  try {
    // ---- Identifica campos especiais nas perguntas dinâmicas ----
    const steps = getNPSSteps();
    const scoreStep = steps.find(s => s.type === 'nps_score');
    const textStep  = steps.find(s => s.type === 'text' || s.type === 'comment');

    const npsScore = scoreStep ? (_npsAnswers[scoreStep.id] ?? null) : null;
    const comment  = textStep  ? (_npsAnswers[textStep.id]  || null) : null;

    // ---- Busca regra de pontos NPS ----
    const { data: rules } = await _sb.from('point_rules')
      .select('*')
      .eq('company_id', COMPANY_ID)
      .eq('is_active', true)
      .eq('rule_type', 'nps_response')
      .limit(1);
    const rule = rules?.[0] || null;

    // ---- Monta payload com todas as respostas em JSONB ----
    const payload = {
      company_id:     COMPANY_ID,
      client_id:      _client.id,
      answers:        _npsAnswers,       // objeto completo { questionId: answer, ... }
      nps_score:      npsScore,          // nota 0-10 extraída
      comment:        comment || null,
      audio_data:     _audioBase64 || null,
      points_awarded: rule?.points || 0,
    };

    const { error } = await _sb.from('nps_responses').insert(payload);
    if (error) throw error;

    // ---- Credita pontos se houver regra ----
    if (rule && rule.points > 0) {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      await _sb.from('point_transactions').insert({
        company_id:       COMPANY_ID,
        client_id:        _client.id,
        rule_id:          rule.id,
        points:           rule.points,
        transaction_type: 'earned',
        description:      'Pesquisa de Satisfação NPS',
        expires_at:       expiresAt.toISOString(),
      });
      await _sb.from('clients')
        .update({ total_points: (_client.total_points || 0) + rule.points })
        .eq('id', _client.id);
      _client.total_points = (_client.total_points || 0) + rule.points;
    }

    // ---- Tela de sucesso ----
    document.getElementById('tab-nps').innerHTML = `<div class="nps-success">
      <div class="nps-success-icon">🎉</div>
      <h2>Obrigada pela sua opinião!</h2>
      <p>Sua resposta foi registrada com sucesso.${rule && rule.points > 0
        ? `<br><br>✨ Você ganhou <strong>${rule.points} pontos</strong> pela participação!`
        : ''}</p>
      ${rule && rule.points > 0 ? `<div style="margin-top:16px"><span class="badge-pts">+${rule.points} pts</span></div>` : ''}
    </div>`;

    // Atualiza KPIs no extrato
    await loadDashboard();
    clTab('extrato');
    setTimeout(() => clTab('nps'), 200);

  } catch(e) {
    if (btn) { btn.textContent = '🎉 Enviar Pesquisa'; btn.disabled = false; }
    alert('Erro ao enviar pesquisa: ' + e.message);
  }
}


// ============================================================
// AUDIO RECORDING
// ============================================================
window.toggleRecording = async function() {
  const btn   = document.getElementById('btn-record');
  const icon  = document.getElementById('rec-icon');
  const label = document.getElementById('rec-label');

  if (_mediaRec && _mediaRec.state === 'recording') {
    // Stop recording
    _mediaRec.stop();
    _mediaRec.stream.getTracks().forEach(t => t.stop());
    btn.className = 'btn-record done';
    icon.textContent = '✅';
    label.textContent = 'Áudio gravado!';
    return;
  }

  if (_audioBase64) {
    // Already recorded — reset
    _audioBase64 = null; _audioChunks = [];
    const audio = document.getElementById('audio-playback');
    if (audio) audio.style.display = 'none';
    btn.className = 'btn-record';
    icon.textContent = '🎤';
    label.textContent = 'Gravar áudio';
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    _audioChunks = [];
    _mediaRec = new MediaRecorder(stream);

    _mediaRec.ondataavailable = e => { if (e.data.size > 0) _audioChunks.push(e.data); };

    _mediaRec.onstop = () => {
      const blob = new Blob(_audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        _audioBase64 = reader.result;
        const audio = document.getElementById('audio-playback');
        if (audio) { audio.src = _audioBase64; audio.style.display = 'block'; }
      };
      reader.readAsDataURL(blob);
    };

    _mediaRec.start();
    btn.className = 'btn-record recording';
    icon.textContent = '⏹';
    label.textContent = 'Parar gravação';
  } catch(e) {
    alert('Não foi possível acessar o microfone: ' + e.message);
  }
};
