// test_online_edge.js — laadt de Edge Function offerte-accord (TypeScript) in Node, zonder
// netwerk en zonder Supabase. De import van supabase-js wordt vervangen door een
// nagebootste database; Deno.serve vangt de handler; fetch (Resend) wordt opgevangen.
// Nodig: Node 22.13 of nieuwer (haalt zelf de typen eraf), anders npm install typescript. Gebruikt door test_online_v4.131.0.js.
const fs = require('fs'), vm = require('vm');
function maakDb() {
  const tabellen = { offerte_accorderingen: [], calculaties: [], onderhoudsplannen: [], opleveringen: [] }, log = [];
  const haak = { naSelect: null };   // test: iets laten gebeuren tussen lezen en schrijven
  function from(tabel) {
    const st = { op: 'select', filters: [], payload: null, enkel: null, terug: false };
    const api = {
      select() { if (st.op !== 'select') st.terug = true; return api; },
      update(p) { st.op = 'update'; st.payload = p; return api; },
      insert(r) { st.op = 'insert'; st.payload = r; return api; },
      eq(k, v) { st.filters.push(r => r[k] === v); return api; },
      is(k, v) { st.filters.push(r => (r[k] == null ? null : r[k]) === v); return api; },
      maybeSingle() { st.enkel = 'maybe'; return api; },
      then(ok, mis) { return Promise.resolve().then(voer).then(ok, mis); }
    };
    async function voer() {
      const t = tabellen[tabel] || (tabellen[tabel] = []);
      const raak = r => st.filters.every(f => f(r));
      log.push({ tabel, op: st.op, payload: st.payload ? JSON.parse(JSON.stringify(st.payload)) : null });
      if (st.op === 'select') {
        let rows = JSON.parse(JSON.stringify(t.filter(raak)));
        if (tabel === 'offerte_accorderingen') rows.forEach(r => {
          r.calculaties = JSON.parse(JSON.stringify(tabellen.calculaties.find(c => c.id === r.calculatie_id) || null));
          r.onderhoudsplannen = JSON.parse(JSON.stringify(tabellen.onderhoudsplannen.find(c => c.id === r.onderhoudsplan_id) || null));
          r.opleveringen = JSON.parse(JSON.stringify(tabellen.opleveringen.find(c => c.id === r.oplevering_id) || null));
        });
        if (haak.naSelect) await haak.naSelect(tabel);
        return st.enkel ? { data: rows[0] || null, error: null } : { data: rows, error: null };
      }
      if (st.op === 'update') {
        const rows = t.filter(raak); rows.forEach(r => Object.assign(r, JSON.parse(JSON.stringify(st.payload))));
        return { data: st.terug ? rows.map(r => ({ id: r.id })) : null, error: null };
      }
      return { data: null, error: null };
    }
    return api;
  }
  return { from, tabellen, log, haak, storage: { from() { return { createSignedUrl(pad) { return Promise.resolve({ data: { signedUrl: 'https://signed.test/' + pad }, error: null }); } }; } } };
}
function laadEdge(pad) {
  let src = fs.readFileSync(pad, 'utf8');
  const imp = /^import \{ createClient \} from "https:\/\/esm\.sh\/@supabase\/supabase-js@2";$/m;
  if (!imp.test(src)) throw new Error('import van supabase-js niet gevonden in ' + pad);
  src = src.replace(imp, 'const createClient = __maakClient;');
  // Typen eraf: Node zelf (22.13 of nieuwer), anders het pakket typescript.
  let js;
  const mod = require('module');
  if (typeof mod.stripTypeScriptTypes === 'function') js = mod.stripTypeScriptTypes(src);
  else { const ts = require('typescript'); js = ts.transpileModule(src, { compilerOptions: { target: 'ES2022', module: 'None' } }).outputText; }
  const db = maakDb(), mails = [];
  let handler = null;
  const sandbox = {
    console: { warn() {}, log() {}, error() {} }, URL, Response, Request, Headers, JSON, Date, Math, Promise, Set, Map, Number, String, Array, Object, isFinite, encodeURIComponent, Intl,
    __maakClient: () => db,
    Deno: { env: { get: k => ({ SUPABASE_URL: 'http://x', SUPABASE_SERVICE_ROLE_KEY: 'k', RESEND_API_KEY: 're_test' }[k]) }, serve: h => { handler = h; } },
    fetch: async (url, opt) => { mails.push(JSON.parse(opt.body)); return new Response('{}', { status: 200 }); }
  };
  const ctx = vm.createContext(sandbox);
  vm.runInContext(js, ctx, { filename: pad });
  if (!handler) throw new Error('Deno.serve is niet aangeroepen');
  const roep = async (methode, body, query) => {
    const r = await handler(new Request('http://fn.test/offerte-accord' + (query || ''), methode === 'GET' ? { method: 'GET' } : { method: methode, headers: { 'content-type': 'application/json', 'user-agent': 'test' }, body: JSON.stringify(body || {}) }));
    return { status: r.status, body: await r.json().catch(() => null) };
  };
  return { db, mails, roep, run: code => vm.runInContext(code, ctx), bron: src };
}
module.exports = { laadEdge };
