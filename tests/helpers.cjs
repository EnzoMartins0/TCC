const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

// Pequeno adaptador DOM para testar lógica sem baixar bibliotecas.
// Interações, foco e layout são verificados também no navegador real.
function createApp(stored = {}) {
  const elements = new Map();
  const storage = new Map(Object.entries(stored));
  const element = id => {
    if (!elements.has(id)) {
      const classes = new Set(id === 'screen-menu' ? ['screen', 'active'] : []);
      const attributes = {};
      const node = { id, value: '', textContent: '', innerHTML: '', style: {}, dataset: {},
        disabled: false, hidden: false, scrollTop: 0, offsetHeight: 100,
        classList: { add: (...xs) => xs.forEach(x => classes.add(x)),
          remove: (...xs) => xs.forEach(x => classes.delete(x)), contains: x => classes.has(x),
          toggle: (x, force) => { const on = force === undefined ? !classes.has(x) : force; on ? classes.add(x) : classes.delete(x); return on; } },
        setAttribute: (k, v) => { attributes[k] = String(v); },
        getAttribute: k => attributes[k] ?? null, removeAttribute: k => { delete attributes[k]; },
        focus: () => { document.activeElement = node; }, addEventListener() {},
        querySelectorAll: () => [], querySelector: () => null,
        scrollIntoView() {}, scrollTo() {}, appendChild() {}, remove() {},
        getBoundingClientRect: () => ({ top: 0, height: 100 }),
      };
      elements.set(id, node);
    }
    return elements.get(id);
  };
  const document = {
    getElementById: element, body: { style: {}, classList: { add() {}, remove() {} } },
    activeElement: null, addEventListener() {}, createElement: tag => element('created-' + tag),
    querySelector: selector => selector === '.screen.active'
      ? [...elements.values()].find(e => e.classList.contains('active') && e.id.startsWith('screen-')) || null
      : null,
    querySelectorAll: selector => selector === '.screen'
      ? ['menu','cart','checkout','confirm'].map(n => element('screen-' + n))
      : selector === '.pay-option' ? ['Pix','Cartão de Crédito','Cartão de Débito','Dinheiro'].map(pay => {
          const el = element('pay-' + pay); el.dataset.pay = pay; return el;
        }) : [],
  };
  const context = vm.createContext({ document, console, URL, URLSearchParams, Set, Map,
    Date, Math, JSON, AbortController, structuredClone, crypto: require('node:crypto').webcrypto,
    setTimeout: () => 0, clearTimeout() {}, requestAnimationFrame: fn => fn(),
    navigator: { clipboard: { writeText: async () => {} } },
    localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k,v) => storage.set(k,String(v)), removeItem: k => storage.delete(k) },
    alert: () => {}, confirm: () => true, matchMedia: () => ({matches:false}),
    scrollTo() {}, addEventListener() {}, location: { protocol: 'http:' },
  });
  context.window = context;
  context.open = (...args) => { context.opened = args; return {}; };
  const files = ['data/menu.js','data/strings.js','js/state.js','js/utils.js','js/screens.js','js/menu.js','js/modal.js','js/cart.js','js/checkout.js'];
  for (const file of files) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  const run = source => vm.runInContext(source, context);
  function validOrder(productId = 'p1') {
    run(`cart = [{uid:'test-line',productId:${JSON.stringify(productId)},name:PRODUCTS.find(p=>p.id===${JSON.stringify(productId)}).name,icon:'🍔',qty:1,unit:PRODUCTS.find(p=>p.id===${JSON.stringify(productId)}).price,flavor:null,extras:[],removed:[],obs:''}];`);
    for (const [id,value] of Object.entries({fNome:'Ana Silva',fTelefone:'11991093901',fRua:'Rua Teste',fNumero:'10',fBairro:'Centro'})) element(id).value=value;
  }
  return { run, context, element, storage, validOrder };
}
module.exports = { createApp, root };
