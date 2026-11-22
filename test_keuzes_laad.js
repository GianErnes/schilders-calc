// Laadt alle top-level declaraties (functies, const/let/var, classes) uit het inline
// script van een index.html in een eigen vm-context. Top-level opdrachten (init,
// event listeners) worden overgeslagen. Geeft { ctx, run } terug.
const fs = require('fs'), vm = require('vm'), acorn = require('acorn');
function maakDom() {
  const els = {};
  const el = id => ({
    id, innerHTML: '', value: '', textContent: '', style: {}, dataset: {}, open: false, checked: false, disabled: false, children: [],
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    contains() { return false; }, querySelector() { return null; }, querySelectorAll() { return []; },
    addEventListener() {}, removeEventListener() {}, appendChild() {}, removeChild() {}, setAttribute() {}, getAttribute() { return null; },
    focus() {}, scrollIntoView() {}, closest() { return null; }, remove() {}
  });
  const document = {
    _els: els, activeElement: null, body: el('body'), documentElement: el('html'), readyState: 'complete', hidden: false, title: '',
    getElementById(id) { return els[id] || (els[id] = el(id)); },
    querySelector() { return null; }, querySelectorAll() { return []; },
    createElement(t) { return el('nieuw_' + t); }, addEventListener() {}, removeEventListener() {},
    createTextNode() { return el('tekst'); }
  };
  return document;
}
function laad(pad) {
  const html = fs.readFileSync(pad, 'utf8');
  const re = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
  let m, src = null;
  while ((m = re.exec(html))) { if (!src || m[1].length > src.length) src = m[1]; }
  const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script' });
  const delen = [];
  let overgeslagen = 0;
  for (const n of ast.body) {
    const bron = src.slice(n.start, n.end);
    if (n.type === 'FunctionDeclaration' || n.type === 'VariableDeclaration' || n.type === 'ClassDeclaration') delen.push(bron);
    else if (n.type === 'ExpressionStatement' && /^(data\.\w+ = |Object\.defineProperty\(data, 'calc')/.test(bron)) delen.push(bron);   // data-opzet hoort erbij
    else overgeslagen++;
  }
  const document = maakDom();
  const meldingen = { toast: [], alert: [], confirm: [] };
  const sandbox = {
    console, document, performance, setTimeout, clearTimeout, setInterval() { return 0; }, clearInterval() {}, Promise, Math, Date, JSON, Intl, URL, URLSearchParams,
    navigator: { userAgent: 'node', onLine: true, serviceWorker: undefined, clipboard: {} },
    localStorage: { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } },
    sessionStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    location: { href: 'http://localhost/', search: '', hash: '', pathname: '/', origin: 'http://localhost', reload() {} },
    history: { replaceState() {}, pushState() {} },
    alert(t) { meldingen.alert.push(String(t)); }, confirm(t) { meldingen.confirm.push(String(t)); return sandbox.__confirmAntwoord !== false; }, prompt() { return null; },
    fetch() { return Promise.reject(new Error('geen netwerk in de test')); },
    BroadcastChannel: undefined, requestAnimationFrame(f) { return 0; }, getComputedStyle() { return {}; },
    print() {}, open() { return null; }, scrollTo() {},
    __meldingen: meldingen, __confirmAntwoord: true
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  sandbox.addEventListener = () => {}; sandbox.removeEventListener = () => {}; sandbox.matchMedia = () => ({ matches: false, addEventListener() {} });
  const ctx = vm.createContext(sandbox);
  const fouten = [];
  for (const d of delen) {
    try { vm.runInContext(d, ctx, { filename: pad }); }
    catch (e) { fouten.push((e && e.message) + ' @ ' + d.slice(0, 70).replace(/\n/g, ' ')); }
  }
  return { ctx, run: code => vm.runInContext(code, ctx), fouten, aantal: delen.length, overgeslagen, meldingen, document };
}
module.exports = { laad };
