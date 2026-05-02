// ============================================================
// SUPABASE CLIENT + DATA LAYER
// ============================================================

let supabaseClient = null;
const COMPANY_ID = '00000000-0000-0000-0000-000000000001';

function initSupabase(url, key) {
  if (!url || !key) return null;
  supabaseClient = supabase.createClient(url, key);
  localStorage.setItem('sb_url', url);
  localStorage.setItem('sb_key', key);
  return supabaseClient;
}

function getClient() {
  if (!supabaseClient) throw new Error('Supabase não conectado.');
  return supabaseClient;
}

// Auto-inicializa usando VA_CONFIG (carregado antes de supabase.js)
// Garante que getClient() funciona antes mesmo do DOMContentLoaded
;(function _autoInit() {
  try {
    if (typeof VA_CONFIG !== 'undefined' && VA_CONFIG.supabaseUrl && VA_CONFIG.supabaseKey) {
      supabaseClient = supabase.createClient(VA_CONFIG.supabaseUrl, VA_CONFIG.supabaseKey);
    }
  } catch(_) {}
})();

// ============================================================
// CACHE — stale-while-revalidate (TTL: 30s)
// Mantém dados em memória para navegação instantânea.
// Invalida automaticamente após gravações.
// ============================================================
const _cache = {};
const CACHE_TTL = 30000; // 30 segundos

function cacheGet(key) {
  const entry = _cache[key];
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { delete _cache[key]; return null; }
  return entry.data;
}

function cacheSet(key, data) {
  _cache[key] = { data, ts: Date.now() };
  return data;
}

function cacheInvalidate(...keys) {
  keys.forEach(k => { if (k) delete _cache[k]; });
}

function cacheInvalidateAll() {
  Object.keys(_cache).forEach(k => delete _cache[k]);
}

// ---- GENERIC CRUD ----
async function dbFetch(table, query = {}) {
  const sb = getClient();
  let q = sb.from(table).select(query.select || '*');
  if (query.eq)    for (const [k,v] of Object.entries(query.eq))    q = q.eq(k, v);
  if (query.neq)   for (const [k,v] of Object.entries(query.neq))   q = q.neq(k, v);
  if (query.order) q = q.order(query.order.col, { ascending: query.order.asc ?? true });
  if (query.limit) q = q.limit(query.limit);
  if (query.gte)   for (const [k,v] of Object.entries(query.gte))   q = q.gte(k, v);
  if (query.lte)   for (const [k,v] of Object.entries(query.lte))   q = q.lte(k, v);
  if (query.ilike) for (const [k,v] of Object.entries(query.ilike)) q = q.ilike(k, v);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

async function dbInsert(table, payload) {
  cacheInvalidateAll(); // writes always invalidate cache
  const sb = getClient();
  const { data, error } = await sb.from(table).insert({ ...payload, company_id: COMPANY_ID }).select().single();
  if (error) throw error;
  return data;
}

async function dbUpdate(table, id, payload) {
  cacheInvalidateAll();
  const sb = getClient();
  const { data, error } = await sb.from(table).update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

async function dbDelete(table, id) {
  cacheInvalidateAll();
  const sb = getClient();
  const { error } = await sb.from(table).delete().eq('id', id);
  if (error) throw error;
}

// ---- CLIENTS ----
async function fetchClients(search = '') {
  const key = 'clients_' + search;
  const hit = cacheGet(key);
  if (hit) {
    fetchClientsRemote(search).then(d => cacheSet(key, d)).catch(() => {});
    return hit;
  }
  return fetchClientsRemote(search).then(d => cacheSet(key, d));
}

async function fetchClientsRemote(search = '') {
  const sb = getClient();
  let q = sb.from('clients').select('*').eq('company_id', COMPANY_ID).eq('is_active', true).order('name');
  if (search) q = q.ilike('name', `%${search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

async function fetchClientById(id) {
  const sb = getClient();
  const { data, error } = await sb.from('clients').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

async function fetchClientTransactions(clientId) {
  const sb = getClient();

  // Fetch raw transactions — only join clients (with explicit FK) and point_rules
  const { data, error } = await sb.from('point_transactions')
    .select(`
      id, points, transaction_type, description, created_at, expires_at,
      expired_at, redeemed_at, rule_id, award_id, procedure_id, reference_client_id,
      rule:point_rules(name),
      ref_client:clients!point_transactions_reference_client_id_fkey(name)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  if (!data || data.length === 0) return [];

  // Enrich with award / procedure names client-side to avoid FK ambiguity errors
  const awardIds = [...new Set(data.map(t => t.award_id).filter(Boolean))];
  const procIds  = [...new Set(data.map(t => t.procedure_id).filter(Boolean))];

  const awardsMap = {};
  const procsMap  = {};

  if (awardIds.length > 0) {
    const { data: aw } = await sb.from('awards').select('id, name').in('id', awardIds);
    (aw || []).forEach(a => { awardsMap[a.id] = a.name; });
  }
  if (procIds.length > 0) {
    const { data: pr } = await sb.from('procedures').select('id, name').in('id', procIds);
    (pr || []).forEach(p => { procsMap[p.id] = p.name; });
  }

  return data.map(t => ({
    ...t,
    award:  t.award_id     ? { name: awardsMap[t.award_id]    || '–' } : null,
    proc:   t.procedure_id ? { name: procsMap[t.procedure_id] || '–' } : null,
  }));
}

// ---- POINTS ----
async function addPoints(clientId, ruleId, points, description, refClientId = null, customDate = null) {
  const sb = getClient();
  const launchDate = customDate ? new Date(customDate) : new Date();
  const expiresAt = new Date(launchDate);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const { data: tx, error } = await sb.from('point_transactions').insert({
    company_id: COMPANY_ID,
    client_id: clientId,
    rule_id: ruleId || null,
    points,
    transaction_type: 'earned',
    description,
    reference_client_id: refClientId || null,
    expires_at: expiresAt.toISOString(),
    created_at: launchDate.toISOString()
  }).select().single();
  if (error) throw error;

  // Update client total
  const client = await fetchClientById(clientId);
  await sb.from('clients').update({ total_points: (client.total_points || 0) + points }).eq('id', clientId);

  return tx;
}

async function redeemPoints(clientId, points, description, awardId = null, procedureId = null) {
  const sb = getClient();
  const client = await fetchClientById(clientId);
  if (client.total_points < points) throw new Error('Pontos insuficientes.');

  const { data: tx, error } = await sb.from('point_transactions').insert({
    company_id: COMPANY_ID,
    client_id: clientId,
    points,
    transaction_type: 'redeemed',
    description,
    award_id: awardId || null,
    procedure_id: procedureId || null,
    redeemed_at: new Date().toISOString()
  }).select().single();
  if (error) throw error;

  await sb.from('clients').update({ total_points: client.total_points - points }).eq('id', clientId);
  return tx;
}

async function expireOldPoints() {
  const sb = getClient();
  const now = new Date().toISOString();
  const { data: expiring } = await sb.from('point_transactions')
    .select('*')
    .eq('transaction_type', 'earned')
    .lt('expires_at', now)
    .is('expired_at', null)
    .is('redeemed_at', null);

  if (!expiring || expiring.length === 0) return;

  // Group by client
  const byClient = {};
  for (const tx of expiring) {
    byClient[tx.client_id] = (byClient[tx.client_id] || 0) + tx.points;
  }

  // Mark as expired
  const ids = expiring.map(t => t.id);
  await sb.from('point_transactions').update({ transaction_type: 'expired', expired_at: now }).in('id', ids);

  // Subtract from client totals
  for (const [clientId, pts] of Object.entries(byClient)) {
    const client = await fetchClientById(clientId);
    const newTotal = Math.max(0, (client.total_points || 0) - pts);
    await sb.from('clients').update({ total_points: newTotal }).eq('id', clientId);
  }
}

// ---- AWARDS CHECK ----
async function checkAwardUnlock(clientId) {
  const sb = getClient();
  const client = await fetchClientById(clientId);
  const { data: awards } = await sb.from('awards')
    .select('*').eq('is_active', true).eq('company_id', COMPANY_ID)
    .order('points_required');

  if (!awards) return null;

  for (const award of awards) {
    if (client.total_points >= award.points_required) {
      // Check if already notified (simple: check if already redeemed this award)
      return { award, client };
    }
  }
  return null;
}

// ---- RANKING ----
async function fetchRanking() {
  const hit = cacheGet('ranking');
  if (hit) { fetchRankingRemote().then(d => cacheSet('ranking', d)).catch(()=>{}); return hit; }
  return fetchRankingRemote().then(d => cacheSet('ranking', d));
}
async function fetchRankingRemote() {
  const sb = getClient();
  const { data, error } = await sb.from('clients')
    .select('id, name, total_points, phone, email, birth_date')
    .eq('company_id', COMPANY_ID).eq('is_active', true)
    .order('total_points', { ascending: false }).limit(50);
  if (error) throw error;
  return (data || []).map((c, i) => ({ ...c, rank: i + 1 }));
}

// ---- EMPLOYEES ----
async function fetchEmployees() {
  const hit = cacheGet('employees');
  if (hit) { dbFetch('employees',{eq:{company_id:COMPANY_ID,is_active:true},order:{col:'name',asc:true}}).then(d=>cacheSet('employees',d)).catch(()=>{}); return hit; }
  return dbFetch('employees',{eq:{company_id:COMPANY_ID,is_active:true},order:{col:'name',asc:true}}).then(d=>cacheSet('employees',d));
}

// ---- GOALS ----
async function fetchGoals() {
  return dbFetch('goals', { eq: { company_id: COMPANY_ID }, order: { col: 'created_at', asc: false } });
}

// ---- POINT RULES ----
async function fetchPointRules() {
  const hit = cacheGet('point_rules');
  if (hit) { dbFetch('point_rules',{eq:{company_id:COMPANY_ID,is_active:true}}).then(d=>cacheSet('point_rules',d)).catch(()=>{}); return hit; }
  return dbFetch('point_rules',{eq:{company_id:COMPANY_ID,is_active:true}}).then(d=>cacheSet('point_rules',d));
}

// ---- AWARDS ----
async function fetchAwards() {
  const hit = cacheGet('awards');
  if (hit) { dbFetch('awards',{eq:{company_id:COMPANY_ID,is_active:true},order:{col:'points_required',asc:true}}).then(d=>cacheSet('awards',d)).catch(()=>{}); return hit; }
  return dbFetch('awards',{eq:{company_id:COMPANY_ID,is_active:true},order:{col:'points_required',asc:true}}).then(d=>cacheSet('awards',d));
}

// ---- PROCEDURES ----
async function fetchProcedures() {
  const hit = cacheGet('procedures');
  if (hit) { dbFetch('procedures',{eq:{company_id:COMPANY_ID,is_active:true}}).then(d=>cacheSet('procedures',d)).catch(()=>{}); return hit; }
  return dbFetch('procedures',{eq:{company_id:COMPANY_ID,is_active:true}}).then(d=>cacheSet('procedures',d));
}

// ---- BIRTHDAYS ----
async function fetchUpcomingBirthdays(days = 30) {
  const sb = getClient();
  const { data, error } = await sb.from('clients')
    .select('id, name, birth_date, phone')
    .eq('company_id', COMPANY_ID)
    .eq('is_active', true)
    .not('birth_date', 'is', null);
  if (error) throw error;

  const today = new Date();
  const results = [];
  for (const c of (data || [])) {
    const bd = new Date(c.birth_date);
    const next = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
    if (next < today) next.setFullYear(today.getFullYear() + 1);
    const diff = Math.ceil((next - today) / 86400000);
    if (diff <= days) results.push({ ...c, daysUntil: diff, nextBirthday: next });
  }
  return results.sort((a, b) => a.daysUntil - b.daysUntil);
}

// ---- EXPIRING POINTS ----
async function fetchExpiringPoints(days = 14) {
  const sb = getClient();
  const from = new Date().toISOString();
  const to = new Date(Date.now() + days * 86400000).toISOString();

  const { data, error } = await sb.from('point_transactions')
    .select('*, client:clients!point_transactions_client_id_fkey(name, phone)')
    .eq('transaction_type', 'earned')
    .is('expired_at', null)
    .is('redeemed_at', null)
    .gte('expires_at', from)
    .lte('expires_at', to)
    .order('expires_at');
  if (error) throw error;
  return data || [];
}

// ---- RECENT POINT EVENTS ----
async function fetchRecentPointEvents(limit = 5) {
  const sb = getClient();
  const { data, error } = await sb.from('point_transactions')
    .select('*, client:clients!point_transactions_client_id_fkey(name)')
    .eq('company_id', COMPANY_ID)
    .eq('transaction_type', 'earned')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// ---- WHATSAPP TEMPLATES ----
async function fetchWATemplates() {
  return dbFetch('whatsapp_templates', { eq: { company_id: COMPANY_ID } });
}
