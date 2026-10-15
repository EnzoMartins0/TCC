/* ============================================================
   js/checkout.js — Fluxo de checkout em 3 passos e envio via WhatsApp
   ============================================================ */

function fieldValue(id) {
  return document.getElementById(id).value.trim();
}

function parseMoney(value) {
  const text = String(value).trim();
  if (!text) return null;
  const valid = /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(text)
    || /^\d+\.\d{1,2}$/.test(text);
  if (!valid) return null;
  const hasThousands = /^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(text);
  const normalized = text.includes(',') || hasThousands ? text.replace(/\./g, '').replace(',', '.') : text;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount >= 0 && amount <= 999999.99 ? amount : null;
}

function validateCart() {
  if (!cart.length) return { message: 'Sua sacola está vazia. Adicione um item para continuar.' };
  const totals = calcTotals();
  if (deliveryType === 'entrega' && Math.round((totals.subtotal - totals.discount) * 100) < Math.round(CONFIG.minOrder * 100)) {
    return { message: STRINGS.cartMinWarning(CONFIG.minOrder, CONFIG.minOrder - (totals.subtotal - totals.discount)) };
  }
  return null;
}

function validateOrder(stage = 'all') {
  const cartError = validateCart();
  if (cartError) return cartError;
  if (stage !== 'payment') {
    if (fieldValue('fNome').length < 2 || fieldValue('fNome').length > 80) {
      return { field: 'fNome', message: 'Informe seu nome, com 2 a 80 caracteres.' };
    }
    const phone = fieldValue('fTelefone');
    const digits = phone.replace(/\D/g, '');
    if (phone && (!/^[+\d\s().-]+$/.test(phone) || !/^(?:55)?\d{10,11}$/.test(digits))) {
      return { field: 'fTelefone', message: 'Informe um telefone válido com DDD ou deixe o campo vazio.' };
    }
    if (deliveryType === 'entrega') {
      for (const [id, label, max] of [['fRua', 'rua', 120], ['fNumero', 'número', 20], ['fBairro', 'bairro', 80]]) {
        if (!fieldValue(id) || fieldValue(id).length > max) return { field: id, message: `Preencha ${label} corretamente (até ${max} caracteres).` };
      }
    }
  }
  if (stage !== 'delivery') {
    if (!['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'].includes(paymentMethod)) {
      return { message: 'Escolha uma forma de pagamento válida.' };
    }
    const rawChange = fieldValue('fTroco');
    if (paymentMethod === 'Dinheiro' && rawChange) {
      const change = parseMoney(rawChange);
      if (change === null || Math.round(change * 100) < Math.round(calcTotals().total * 100)) {
        return { field: 'fTroco', message: 'O valor para troco deve ser um número igual ou maior que o total do pedido.' };
      }
    }
  }
  for (const [id, max] of [['fComplemento',120], ['fReferencia',160], ['fObsGeral',500]]) {
    if (fieldValue(id).length > max) return { field: id, message: `Este campo aceita no máximo ${max} caracteres.` };
  }
  return null;
}

function clearCheckoutError() {
  const box = document.getElementById('checkoutError');
  box.textContent = '';
  box.classList.add('hidden');
  document.querySelectorAll('[aria-invalid="true"]').forEach(el => {
    el.removeAttribute('aria-invalid');
    el.removeAttribute('aria-describedby');
  });
}

function showCheckoutError(error) {
  clearCheckoutError();
  const box = document.getElementById('checkoutError');
  box.textContent = error.message;
  box.classList.remove('hidden');
  if (error.field) {
    const field = document.getElementById(error.field);
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', 'checkoutError');
    field.focus();
  } else {
    box.setAttribute('tabindex', '-1');
    box.focus();
  }
  return false;
}

function goCheckout() {
  const error = validateCart();
  if (error) {
    const box = document.getElementById('cartError');
    box.textContent = error.message;
    box.classList.remove('hidden');
    return false;
  }
  clearCheckoutError();
  showCheckoutStep(1);
  showScreen('checkout');
  return true;
}

function backFromCheckout() {
  checkoutStepN === 1 ? openCart() : prevStep();
}

function setDeliveryType(type) {
  if (!['entrega', 'retirada'].includes(type)) return;
  deliveryType = type;
  for (const [id, value] of [['segEntrega', 'entrega'], ['segRetirada', 'retirada']]) {
    const el = document.getElementById(id);
    el.classList.toggle('active', type === value);
    el.setAttribute('aria-checked', String(type === value));
  }
  document.getElementById('addressFields').style.display = type === 'entrega' ? 'block' : 'none';
  document.getElementById('pickupNote').style.display = type === 'retirada' ? 'block' : 'none';
  clearCheckoutError();
  renderCartBar();
  if (document.getElementById('screen-cart').classList.contains('active')) renderCart();
  if (typeof persistDraft === 'function') persistDraft();
}

function setPayment(method) {
  if (!['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'].includes(method)) return;
  paymentMethod = method;
  document.querySelectorAll('.pay-option').forEach(el => {
    const selected = el.dataset.pay === method;
    el.classList.toggle('active', selected);
    el.setAttribute('aria-checked', String(selected));
  });
  document.getElementById('trocoField').style.display = method === 'Dinheiro' ? 'block' : 'none';
  clearCheckoutError();
  if (typeof persistDraft === 'function') persistDraft();
}

function renderCheckoutStepper() {
  [1, 2, 3].forEach(n => {
    const el = document.getElementById('stamp' + n);
    el.classList.toggle('done', n < checkoutStepN);
    el.classList.toggle('now', n === checkoutStepN);
    if (n === checkoutStepN) el.setAttribute('aria-current', 'step');
    else el.removeAttribute('aria-current');
  });
}

function showCheckoutStep(step) {
  checkoutStepN = step;
  [1, 2, 3].forEach(n => { document.getElementById('step' + n).style.display = n === step ? 'block' : 'none'; });
  document.getElementById('btnBack').style.display = step > 1 ? 'block' : 'none';
  setIconText(document.getElementById('btnNext'), step === 3 ? 'receipt' : 'chevron-right', step === 3 ? STRINGS.checkoutBtnFinish : STRINGS.checkoutBtnNext);
  renderCheckoutStepper();
}

function nextStep() {
  if (checkoutStepN === 3) return finalizeOrder();
  const error = validateOrder(checkoutStepN === 1 ? 'delivery' : 'payment');
  if (error) return showCheckoutError(error);
  clearCheckoutError();
  showCheckoutStep(checkoutStepN + 1);
  if (checkoutStepN === 3) renderReview();
  const panel = document.getElementById('step' + checkoutStepN);
  panel.setAttribute('tabindex', '-1');
  panel.focus();
  return true;
}

function prevStep() {
  if (checkoutStepN > 1) {
    clearCheckoutError();
    showCheckoutStep(checkoutStepN - 1);
  }
}

function renderReview() {
  document.getElementById('reviewItems').innerHTML = cart.map(l =>
    `<div class="order-item"><div class="review-item"><span>${l.qty}x ${escapeHtml(l.name)}</span><span>${fmt(l.unit * l.qty)}</span></div><p class="order-item-meta">${escapeHtml(lineModsText(l))}</p></div>`
  ).join('');

  let addr;
  if (deliveryType === 'entrega') {
    const rua    = document.getElementById('fRua').value.trim();
    const numero = document.getElementById('fNumero').value.trim();
    const bairro = document.getElementById('fBairro').value.trim();
    const comp   = document.getElementById('fComplemento').value.trim();
    addr = STRINGS.reviewDelivAddr(rua, numero, comp, bairro);
  } else {
    addr = STRINGS.reviewPickup;
  }
  setIconText(document.getElementById('reviewDelivery'), deliveryType === 'entrega' ? 'delivery' : 'store', addr);

  let pay = STRINGS.reviewPayPrefix + paymentMethod;
  if (paymentMethod === 'Dinheiro') {
    const troco = document.getElementById('fTroco').value.trim();
    pay += troco ? STRINGS.reviewChangeFor(troco) : STRINGS.reviewNoChange;
  }
  setIconText(document.getElementById('reviewPayment'), paymentMethod === 'Dinheiro' ? 'cash' : paymentMethod === 'Pix' ? 'pix' : 'card', pay);

  const t = calcTotals();
  document.getElementById('reviewTotals').innerHTML = `
    <div class="trow"><span class="lbl">${STRINGS.cartSubtotal}</span><span>${fmt(t.subtotal)}</span></div>
    ${couponApplied ? `<div class="trow"><span class="lbl">${STRINGS.cartDiscount}</span><span>− ${fmt(t.discount)}</span></div>` : ''}
    <div class="trow"><span class="lbl">${STRINGS.cartDeliveryFee}</span><span>${t.deliveryFee === 0 ? STRINGS.cartFreeDelivery : fmt(t.deliveryFee)}</span></div>
    <div class="trow grand"><span class="lbl">${STRINGS.cartTotal}</span><span>${fmt(t.total)}</span></div>
  `;
}

function finalizeOrder() {
  const error = validateOrder();
  if (error) return showCheckoutError(error);
  clearCheckoutError();
  const t = calcTotals();
  const orderNumber = '#' + Math.floor(1000 + Math.random() * 9000);

  lastOrder = {
    status: 'draft',
    customer: { name: fieldValue('fNome'), phone: fieldValue('fTelefone') },
    items: cart.map(l => ({ ...l, extras: l.extras.map(e => ({ ...e })), removed: [...l.removed] })),
    deliveryType,
    paymentMethod,
    address: deliveryType === 'entrega' ? {
      rua:         document.getElementById('fRua').value.trim(),
      numero:      document.getElementById('fNumero').value.trim(),
      bairro:      document.getElementById('fBairro').value.trim(),
      complemento: document.getElementById('fComplemento').value.trim(),
      referencia:  document.getElementById('fReferencia').value.trim(),
    } : null,
    troco:    document.getElementById('fTroco').value.trim(),
    obsGeral: document.getElementById('fObsGeral').value.trim(),
    totals:   t,
    orderNumber,
  };

  document.getElementById('orderNo').textContent = STRINGS.checkoutOrderPrefix + orderNumber;
  document.getElementById('confirmTitle').textContent = 'Seu pedido está pronto para enviar';
  document.getElementById('confirmSubtitle').textContent = 'Abra o WhatsApp e toque em Enviar. Confirme disponibilidade, prazo e pagamento com a loja.';
  document.getElementById('confirmSummary').textContent = buildOrderMessage(lastOrder);
  renderCartBar();
  showScreen('confirm');
  return true;
}

function buildOrderMessage(o) {
  let text = STRINGS.waHeader(o.orderNumber, CONFIG.storeName);
  text += `*Cliente:* ${o.customer.name}\n`;
  if (o.customer.phone) text += `*Contato:* ${o.customer.phone}\n`;
  text += '\n';

  o.items.forEach(l => {
    text += STRINGS.waItemLine(l.qty, l.name, fmt(l.unit * l.qty));
    const mods = lineModsText(l);
    if (mods) text += `   _${mods}_\n`;
  });

  text += STRINGS.waSubtotal(fmt(o.totals.subtotal));
  if (o.totals.discount > 0) text += STRINGS.waDiscount(fmt(o.totals.discount));
  text += STRINGS.waDelivery(o.totals.deliveryFee === 0 ? STRINGS.cartFreeDelivery : fmt(o.totals.deliveryFee));
  text += STRINGS.waTotal(fmt(o.totals.total));

  if (o.deliveryType === 'entrega') {
    text += STRINGS.waDelivAddr(o.address.rua, o.address.numero, o.address.complemento, o.address.bairro);
    if (o.address.referencia) text += STRINGS.waReference(o.address.referencia);
  } else {
    text += STRINGS.waPickup;
  }

  text += STRINGS.waPayment(o.paymentMethod);
  if (o.paymentMethod === 'Dinheiro') {
    text += o.troco ? STRINGS.waChangeFor(o.troco) : STRINGS.waNoChange;
  }
  text += '\n';
  if (o.obsGeral) text += STRINGS.waObs(o.obsGeral);
  return text;
}

function sendWhatsApp() {
  if (!lastOrder) return false;
  const text = buildOrderMessage(lastOrder);
  window.open(
    `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`,
    '_blank',
    'noopener,noreferrer'
  );
}

async function copyOrderMessage() {
  if (!lastOrder) return false;
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard indisponível');
    await navigator.clipboard.writeText(buildOrderMessage(lastOrder));
    showToast('Comanda copiada. Envie para a loja pelo WhatsApp.');
    return true;
  } catch {
    showToast('Não foi possível copiar automaticamente. Selecione e copie o resumo do pedido.');
    return false;
  }
}

function editOrder() {
  lastOrder = null;
  return goCheckout();
}

function newOrder() {
  if ((cart.length || lastOrder) && !window.confirm('Começar um novo pedido? A sacola atual e os dados preenchidos serão apagados.')) return false;
  cart = [];
  lastOrder = null;
  couponApplied = false;
  currentProduct = null;
  modalQty = 1;
  modalFlavor = null;
  modalExtras = new Set();
  modalRemove = new Set();
  for (const id of ['fNome', 'fTelefone', 'fRua', 'fNumero', 'fBairro', 'fComplemento', 'fReferencia', 'fTroco', 'fObsGeral', 'mObs', 'searchInput']) {
    document.getElementById(id).value = '';
  }
  closeProduct();
  setDeliveryType('entrega');
  setPayment('Pix');
  showCheckoutStep(1);
  clearCheckoutError();
  document.getElementById('confirmSummary').textContent = '';
  document.getElementById('orderNo').textContent = '';
  persistDraft();
  renderCartBar();
  onSearch();
  showScreen('menu');
  return true;
}
