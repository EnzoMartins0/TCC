/* ============================================================
   js/state.js — Estado global da aplicação
   ============================================================ */

let cart           = [];
let couponApplied  = false;
let currentProduct = null;
let modalQty       = 1;
let modalFlavor    = null;
let modalExtras    = new Set();
let modalRemove    = new Set();
let checkoutStepN  = 1;
let deliveryType   = 'entrega';
let paymentMethod  = 'Pix';
let lastOrder      = null;

const DRAFT_KEY = 'brasa-lanches:draft:v1';
const DRAFT_TTL = 7 * 24 * 60 * 60 * 1000;
let draftStorageAvailable = true;

// Apenas catálogo/opções/preferências. Dados pessoais e observações nunca vão ao storage.
function persistDraft() {
  try {
    if (!cart.length) localStorage.removeItem(DRAFT_KEY);
    else localStorage.setItem(DRAFT_KEY, JSON.stringify({
      version: 1,
      savedAt: Date.now(),
      items: cart.map(line => ({ productId: line.productId, qty: line.qty, flavor: line.flavor,
        extras: line.extras.map(extra => extra.name), removed: [...line.removed] })),
      couponApplied, deliveryType, paymentMethod,
    }));
    draftStorageAvailable = true;
    return true;
  } catch {
    if (draftStorageAvailable) showToast('Não foi possível salvar a sacola neste navegador. Ela continua disponível nesta aba.');
    draftStorageAvailable = false;
    return false;
  }
}

function restoreDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return false;
    const draft = JSON.parse(raw);
    if (!draft || draft.version !== 1 || !Array.isArray(draft.items)
      || !Number.isFinite(draft.savedAt) || Date.now() - draft.savedAt > DRAFT_TTL
      || draft.savedAt > Date.now() + 60000) {
      localStorage.removeItem(DRAFT_KEY);
      return false;
    }
    // Nunca confiar em nomes, identificadores de linha ou preços vindos do navegador.
    cart = draft.items.slice(0, 50).map(restoreDraftLine).filter(Boolean);
    couponApplied = cart.length > 0 && draft.couponApplied === true;
    deliveryType = draft.deliveryType === 'retirada' ? 'retirada' : 'entrega';
    paymentMethod = ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'].includes(draft.paymentMethod) ? draft.paymentMethod : 'Pix';
    return cart.length > 0;
  } catch {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* Armazenamento indisponível: manter o estado em memória. */ }
    return false;
  }
}

function restoreDraftLine(raw) {
  if (!raw || !Number.isInteger(raw.qty) || raw.qty < 1 || raw.qty > 20) return null;
  const product = PRODUCTS.find(item => item.id === raw.productId);
  if (!product || (product.flavors && !product.flavors.includes(raw.flavor))) return null;
  const extras = (product.extras || []).filter(extra => Array.isArray(raw.extras) && raw.extras.includes(extra.name));
  const removed = (product.remove || []).filter(name => Array.isArray(raw.removed) && raw.removed.includes(name));
  return { uid: uid(), productId: product.id, name: product.name, icon: product.icon,
    qty: raw.qty, unit: unitPriceFor(product, new Set(extras.map(extra => extra.name))),
    flavor: product.flavors ? raw.flavor : null, extras: extras.map(extra => ({ ...extra })), removed, obs: '' };
}

