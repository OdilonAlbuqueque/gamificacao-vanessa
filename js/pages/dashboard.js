// ============================================================
// PAGE: DASHBOARD
// ============================================================

async function renderDashboard() {
  const page = document.getElementById('page-dashboard');
  page.innerHTML = loadingSpinner();

  try {
    const [ranking, recent, expiring, birthdays] = await Promise.all([
      fetchRanking(),
      fetchRecentPointEvents(5),
      fetchExpiringPoints(14),
      fetchUpcomingBirthdays(14)
    ]);

    const totalClients = ranking.length;
    const totalPoints  = ranking.reduce((s, c) => s + (c.total_points || 0), 0);
    const top3         = ranking.slice(0, 3);

    page.innerHTML = `
    <!-- KPI CARDS -->
    <div class="grid-4 mb-24">
      <div class="card card-gold">
        <div class="card-header"><span class="card-title">Clientes Ativos</span><span class="card-icon">♛</span></div>
        <div class="card-value">${totalClients}</div>
        <div class="card-sub">cadastrados no sistema</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Total de Pontos</span><span class="card-icon">⭐</span></div>
        <div class="card-value" style="color:var(--teal)">${totalPoints.toLocaleString('pt-BR')}</div>
        <div class="card-sub">pontos em circulação</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Expirando em 14d</span><span class="card-icon">⏳</span></div>
        <div class="card-value" style="color:var(--rose)">${expiring.length}</div>
        <div class="card-sub">lotes de pontos a expirar</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Aniversários (14d)</span><span class="card-icon">🎂</span></div>
        <div class="card-value" style="color:var(--purple)">${birthdays.length}</div>
        <div class="card-sub">próximos aniversariantes</div>
      </div>
    </div>

    <!-- PODIUM + RANKING FULL -->
    <div class="grid-2 mb-24" style="align-items:start">
      <!-- Ranking Clientes -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🏆 Ranking de Clientes</span>
          <div style="display:flex;gap:8px">
            <button class="btn btn-sm btn-ghost" onclick="toggleRankingVisibility()" id="rank-visibility-btn">👁 Ocultar</button>
            <button class="btn btn-sm btn-outline-gold" onclick="navigateTo('clientes')">Ver Todos</button>
          </div>
        </div>
        <div id="ranking-body">
          ${ranking.length === 0 ? emptyState('🏆','Nenhum cliente ainda') : `
          <div class="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Cliente</th><th>Pontos</th></tr></thead>
              <tbody>
                ${ranking.slice(0,10).map(c => `
                <tr>
                  <td>${rankBadge(c.rank)}</td>
                  <td><div class="flex-center gap-8">${renderAvatar(c.name)} <span>${c.name}</span></div></td>
                  <td>${pointsBadge(c.total_points)}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>`}
        </div>
      </div>

      <!-- SIDE PANELS -->
      <div style="display:flex;flex-direction:column;gap:16px">
        <!-- Últimas Pontuações -->
        <div class="card">
          <div class="card-header"><span class="card-title">⚡ Últimas Pontuações</span></div>
          ${recent.length === 0 ? emptyState('⭐','Nenhum ponto lançado') : recent.map(t => `
          <div class="point-entry">
            <div class="point-entry-icon point-earned">⭐</div>
            <div class="point-entry-info">
              <div class="point-entry-desc">${t.client?.name || '–'}</div>
              <div class="point-entry-date">${t.description || ''} • ${fmtDateTime(t.created_at)}</div>
            </div>
            <div class="point-entry-value positive">+${t.points}</div>
          </div>`).join('')}
        </div>

        <!-- Expirando -->
        <div class="card">
          <div class="card-header"><span class="card-title">⏳ Pontos Expirando</span></div>
          ${expiring.length === 0
            ? `<p style="color:var(--text-muted);font-size:0.85rem">Nenhum ponto expirando nos próximos 14 dias.</p>`
            : expiring.slice(0,5).map(t => `
          <div class="point-entry">
            <div class="point-entry-icon point-expired">⏳</div>
            <div class="point-entry-info">
              <div class="point-entry-desc">${t.client?.name || '–'}</div>
              <div class="point-entry-date">Vence em ${fmtDate(t.expires_at)}</div>
            </div>
            <div class="point-entry-value negative">-${t.points}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- BIRTHDAYS -->
    <div class="card mb-24">
      <div class="card-header">
        <span class="card-title">🎂 Próximos Aniversariantes (14 dias)</span>
        <button class="btn btn-sm btn-outline-gold" onclick="navigateTo('calendario')">Ver Calendário</button>
      </div>
      ${birthdays.length === 0
        ? `<p style="color:var(--text-muted);font-size:0.85rem">Nenhum aniversariante nos próximos 14 dias.</p>`
        : `<div style="display:flex;flex-wrap:wrap;gap:10px">
          ${birthdays.map(b => `
          <div style="display:flex;align-items:center;gap:10px;background:var(--surface-3);border:1px solid var(--border);border-radius:10px;padding:10px 14px;min-width:200px">
            ${renderAvatar(b.name, 36)}
            <div>
              <div style="font-weight:600;font-size:0.88rem">${b.name}</div>
              <div style="font-size:0.75rem;color:var(--text-muted)">
                ${fmtDate(b.birth_date, {day:'2-digit',month:'long'})}
                ${b.daysUntil === 0 ? ' 🎉 HOJE!' : ` • em ${b.daysUntil}d`}
              </div>
            </div>
          </div>`).join('')}
        </div>`}
    </div>
    `;
  } catch (e) {
    page.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Erro ao carregar dashboard</h3><p>${e.message}</p></div>`;
  }
}

let rankingHidden = false;
window.toggleRankingVisibility = function() {
  rankingHidden = !rankingHidden;
  const body = document.getElementById('ranking-body');
  const btn  = document.getElementById('rank-visibility-btn');
  if (body) body.style.filter = rankingHidden ? 'blur(8px)' : '';
  if (btn)  btn.textContent = rankingHidden ? '👁 Mostrar' : '👁 Ocultar';
};
