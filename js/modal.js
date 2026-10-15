/* ============================================================
   js/modal.js — Modal de detalhes do produto (bottom sheet)
   ============================================================ */

let modalReturnFocus = null;
let modalBodyOverflow = '';

function openProduct(id) {
  currentProduct = PRODUCTS.find(p => p.id === id);
  if (!currentProduct) return false;
  modalReturnFocus = document.activeElement;
  modalBodyOverflow = document.body.style.overflow;
  modalQty    = 1;
  modalFlavor = null;
  modalExtras = new Set();
  modalRemove = new Set();
  document.getElementById('mObs').value = '';

  document.getElementById('modalError').textContent = '';
  renderModal();

  const overlay = document.getElementById('modalProduct');
  const sheet   = document.getElementById('sheet');

  // Reseta sem transição, força reflow, depois anima a entrada
  sheet.style.transition = 'none';
  sheet.style.transform  = 'translateY(100%)';
  void sheet.offsetHeight;

  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.getElementById('app').inert = true;
  document.body.style.overflow = 'hidden';
  sheet.style.transition = 'transform .32s cubic-bezier(.32,1,.23,1)';
  sheet.style.transform  = 'translateY(0)';

  initSheetDrag(sheet);
  document.getElementById('modalClose').focus();
  return true;
}

function closeProduct() {
  const overlay = document.getElementById('modalProduct');
  const sheet   = document.getElementById('sheet');

  sheet.style.transition = 'transform .26s ease-in';
  sheet.style.transform  = 'translateY(105%)';
  overlay.classList.remove('open');
  document.getElementById('app').inert = false;
  document.body.style.overflow = modalBodyOverflow;
  if (modalReturnFocus && modalReturnFocus.isConnected !== false) modalReturnFocus.focus();
  overlay.setAttribute('aria-hidden', 'true');

  if (sheet._dragAbort) {
    sheet._dragAbort.abort();
    sheet._dragAbort = null;
  }
}

/**
 * Drag-to-close ancorado no handle.
 * O handle não tem overflow nem touch-action, então recebe
 * todos os eventos de touch sem interferência do scroll nativo.
 */
function initSheetDrag(sheet) {
  if (sheet._dragAbort) sheet._dragAbort.abort();
  const ac     = new AbortController();
  sheet._dragAbort = ac;
  const signal = ac.signal;

  const handle = document.getElementById('sheetHandle');

  let startY = 0, currentY = 0, dragging = false;

  handle.addEventListener('touchstart', (e) => {
    startY   = e.touches[0].clientY;
    currentY = 0;
    dragging = true;
    sheet.style.transition = 'none';
  }, { passive: true, signal });

  handle.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    // preventDefault impede o browser de interpretar como scroll de página
    e.preventDefault();
    currentY = e.touches[0].clientY - startY;
    if (currentY < 0) currentY = 0;
    sheet.style.transform = `translateY(${currentY}px)`;
  }, { passive: false, signal });

  handle.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    if (currentY > 80) {
      closeProduct();
    } else {
      sheet.style.transition = 'transform .28s cubic-bezier(.32,1,.23,1)';
      sheet.style.transform  = 'translateY(0)';
    }
    currentY = 0;
  }, { signal });
}

/* ---- Renderização do conteúdo do modal ---- */

function renderModal() {
  const product = currentProduct;
  document.getElementById('mPic').classList.add('product-media');
  document.getElementById('mPic').classList.remove('image-unavailable');
  document.getElementById('mPic').innerHTML = productImageHtml(product, 'detail');
  document.getElementById('mName').textContent = product.name;
  document.getElementById('mDesc').textContent = product.desc;
  document.getElementById('mQty').textContent = modalQty;
  for (const [group, values] of [['flavor', product.flavors || []], ['extras', product.extras || []], ['remove', product.remove || []]]) {
    document.getElementById(group + 'Block').classList.toggle('hidden', values.length === 0);
    const list = document.getElementById(group + 'List');
    list.setAttribute('role', group === 'flavor' ? 'radiogroup' : 'group');
    list.setAttribute('aria-label', group === 'flavor' ? 'Escolha um sabor' : group === 'extras' ? 'Adicionais' : 'Ingredientes para remover');
    list.innerHTML = values.map(value => {
      const name = typeof value === 'string' ? value : value.name;
      return `<button type="button" class="opt-line" role="${group === 'flavor' ? 'radio' : 'checkbox'}" aria-checked="false" data-option="${group}" data-value="${escapeHtml(name)}">
        <span class="ck ${group === 'flavor' ? 'round' : ''}" aria-hidden="true">${iconHtml('check')}</span>
        <span class="ol-name">${group === 'remove' ? STRINGS.modRemovePrefix : ''}${escapeHtml(name)}</span>
        ${group === 'extras' ? `<span class="ol-price">+ ${fmt(value.price)}</span>` : ''}</button>`;
    }).join('');
  }
  refreshModalOptions();
}

function refreshModalOptions() {
  document.getElementById('modalProduct').querySelectorAll('[data-option]').forEach(button => {
    const { option, value } = button.dataset;
    const checked = option === 'flavor' ? modalFlavor === value : option === 'extras' ? modalExtras.has(value) : modalRemove.has(value);
    button.classList.toggle('checked', checked);
    button.setAttribute('aria-checked', String(checked));
  });
  updateModalPrice();
}

function setFlavor(flavor) {
  if (!currentProduct || !(currentProduct.flavors || []).includes(flavor)) return;
  modalFlavor = flavor;
  document.getElementById('modalError').textContent = '';
  refreshModalOptions();
}

function toggleExtra(name) {
  if (!currentProduct || !(currentProduct.extras || []).some(extra => extra.name === name)) return;
  modalExtras.has(name) ? modalExtras.delete(name) : modalExtras.add(name);
  refreshModalOptions();
}

function toggleRemove(name) {
  if (!currentProduct || !(currentProduct.remove || []).includes(name)) return;
  modalRemove.has(name) ? modalRemove.delete(name) : modalRemove.add(name);
  refreshModalOptions();
}

function handleModalKeydown(event) {
  const overlay = document.getElementById('modalProduct');
  if (!overlay.classList.contains('open')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeProduct();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = [...overlay.querySelectorAll('button:not(:disabled), textarea, input, [tabindex="0"]')]
    .filter(element => element.getClientRects().length > 0);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!first) { event.preventDefault(); overlay.focus(); return; }
  if (event.shiftKey && (document.activeElement === first || !overlay.contains(document.activeElement))) {
    event.preventDefault(); last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !overlay.contains(document.activeElement))) {
    event.preventDefault(); first.focus();
  }
}

function modalQtyDelta(d) {
  if (!Number.isFinite(d)) return;
  modalQty = Math.min(20, Math.max(1, modalQty + Math.trunc(d)));
  document.getElementById('mQty').textContent = modalQty;
  updateModalPrice();
}

function unitPriceFor(p, extrasSet) {
  let extra = 0;
  if (p.extras) p.extras.forEach(ex => { if (extrasSet.has(ex.name)) extra += ex.price; });
  return p.price + extra;
}

function updateModalPrice() {
  const unit       = unitPriceFor(currentProduct, modalExtras);
  const hasOptions = (currentProduct.extras && currentProduct.extras.length)
                  || (currentProduct.flavors && currentProduct.flavors.length);
  document.getElementById('mPrice').textContent  = fmt(unit) + (hasOptions ? STRINGS.modalFromPrice : '');
  document.getElementById('mAddBtn').textContent = STRINGS.modalAddBtn(fmt(unit * modalQty));
}

function addToCart() {
  const p = currentProduct;
  if (!p) return false;
  if (document.getElementById('mObs').value.trim().length > 300) {
    document.getElementById('modalError').textContent = 'A observação aceita no máximo 300 caracteres.';
    return false;
  }
  if (cart.length >= 50) {
    document.getElementById('modalError').textContent = 'A sacola aceita até 50 itens diferentes.';
    return false;
  }
  if (p.flavors && p.flavors.length && !modalFlavor) {
    document.getElementById('modalError').textContent = STRINGS.modalFlavorAlert;
    return;
  }

  const unit = unitPriceFor(p, modalExtras);
  cart.push({
    uid:       uid(),
    productId: p.id,
    name:      p.name,
    qty:       modalQty,
    unit,
    flavor:    modalFlavor,
    extras:    p.extras ? p.extras.filter(e => modalExtras.has(e.name)) : [],
    removed:   Array.from(modalRemove),
    obs:       document.getElementById('mObs').value.trim(),
  });

  lastOrder = null;
  persistDraft();
  closeProduct();
  renderCartBar();
  showToast(STRINGS.modalToast(p.name));
}
