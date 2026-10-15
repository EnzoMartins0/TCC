/* ============================================================
   js/cart.js — Lógica do carrinho: totais, renderização e cupom
   ============================================================ */

// Regras monetárias em centavos: mínimo e frete grátis consideram o subtotal após o cupom.
function calcTotals() {
  const subtotalCents = cart.reduce((sum, line) => sum + Math.round(line.unit * 100) * line.qty, 0);
  const discountCents = couponApplied ? Math.round(subtotalCents * CONFIG.couponDiscount) : 0;
  const netCents = subtotalCents - discountCents;
  const feeCents = !cart.length || deliveryType === 'retirada' || netCents >= Math.round(CONFIG.freeDeliveryOver * 100)
    ? 0 : Math.round(CONFIG.deliveryFee * 100);
  return { subtotal: subtotalCents / 100, discount: discountCents / 100, deliveryFee: feeCents / 100, total: (netCents + feeCents) / 100 };
}

function renderCartBar() {
  const bar   = document.getElementById('cartbar');
  const count = cart.reduce((s, l) => s + l.qty, 0);
  if (count === 0) { bar.classList.add('hidden'); return; }
  bar.classList.remove('hidden');
  document.getElementById('cbCount').textContent = count;
  document.getElementById('cbTotal').textContent = fmt(calcTotals().total);
}

function lineModsText(l) {
  const parts = [];
  if (l.flavor)         parts.push(STRINGS.modFlavor(l.flavor));
  if (l.extras.length)  parts.push(STRINGS.modExtras(l.extras.map(e => e.name).join(', ')));
  if (l.removed.length) parts.push(STRINGS.modRemoved(l.removed.join(', ')));
  if (l.obs)            parts.push(STRINGS.modObs(l.obs));
  return parts.join(STRINGS.modSep);
}

function openCart() {
  renderCart();
  showScreen('cart');
}

function renderCart() {
  const el = document.getElementById('cartContent');
  const errorBox = '<div id="cartError" class="inline-error hidden" role="alert"></div>';
  if (!cart.length) {
    el.innerHTML = `${errorBox}<div class="empty-cart"><div class="big" aria-hidden="true">${STRINGS.cartEmpty}</div><h3>Sua sacola está vazia</h3><p>Escolha seu lanche e monte um pedido do seu jeito.</p><button type="button" class="cta cart-empty-action" onclick="showScreen('menu')">Explorar o cardápio</button></div>`;
    return;
  }
  const totals = calcTotals();
  const minBlocked = deliveryType === 'entrega' && Math.round((totals.subtotal - totals.discount) * 100) < Math.round(CONFIG.minOrder * 100);
  const rows = cart.map(line => `<div class="ticket-row">
    <div class="row-info"><div class="row-name">${escapeHtml(line.icon)} ${escapeHtml(line.name)}</div>
      <div class="row-mods">${escapeHtml(lineModsText(line))}</div>
      <div class="stepper" aria-label="Quantidade de ${escapeHtml(line.name)}">
        <button type="button" data-cart-action="decrease" data-uid="${escapeHtml(line.uid)}" aria-label="Diminuir quantidade de ${escapeHtml(line.name)}">−</button>
        <span class="qn" aria-live="polite">${line.qty}</span>
        <button type="button" data-cart-action="increase" data-uid="${escapeHtml(line.uid)}" ${line.qty >= 20 ? 'disabled' : ''} aria-label="Aumentar quantidade de ${escapeHtml(line.name)}">+</button>
      </div>
    </div>
    <div class="row-right"><div class="row-price mono">${fmt(line.unit * line.qty)}</div><button type="button" class="row-trash" data-cart-action="remove" data-uid="${escapeHtml(line.uid)}" aria-label="Remover ${escapeHtml(line.name)}">Remover</button></div></div>`).join('');
  el.innerHTML = `${errorBox}<div class="delivery-selector"><h3>Como você quer receber?</h3>
    <div class="segmented" role="radiogroup" aria-label="Tipo de recebimento">
      <button type="button" role="radio" aria-checked="${deliveryType === 'entrega'}" class="${deliveryType === 'entrega' ? 'active' : ''}" onclick="setDeliveryType('entrega')">🛵 Entrega</button>
      <button type="button" role="radio" aria-checked="${deliveryType === 'retirada'}" class="${deliveryType === 'retirada' ? 'active' : ''}" onclick="setDeliveryType('retirada')">🏪 Retirada</button>
    </div><p class="cart-delivery-note">${deliveryType === 'retirada' ? 'Retirada sem taxa e sem pedido mínimo. Combine o horário com a loja.' : `Mínimo de ${fmt(CONFIG.minOrder)} e frete grátis a partir de ${fmt(CONFIG.freeDeliveryOver)}, após descontos.`}</p></div>
    <div class="ticket"><div class="ticket-body">${rows}
      <label for="couponInput" class="helper-text">Tem um cupom?</label>
      <div class="coupon-row"><input id="couponInput" maxlength="30" autocomplete="off" placeholder="${escapeHtml(CONFIG.couponCode)}" ${couponApplied ? 'disabled' : ''} value="${couponApplied ? escapeHtml(CONFIG.couponCode) : ''}">
        <button type="button" onclick="${couponApplied ? 'removeCoupon()' : 'applyCoupon()'}">${couponApplied ? 'Remover cupom' : STRINGS.cartCouponApply}</button></div>
      <div id="couponMsg" class="coupon-msg" role="status" aria-live="polite">${couponApplied ? 'Cupom aplicado: ' + Math.round(CONFIG.couponDiscount * 100) + '% de desconto.' : ''}</div>
      <div class="totals">${totalsHtml(totals)}</div></div></div>
    ${minBlocked ? `<div class="min-warning" role="status">${escapeHtml(STRINGS.cartMinWarning(CONFIG.minOrder, CONFIG.minOrder - (totals.subtotal - totals.discount)))} Você também pode escolher retirada.</div>` : ''}
    <div class="cart-actions"><button type="button" class="cta" ${minBlocked ? 'disabled' : ''} onclick="goCheckout()">Continuar pedido</button><button type="button" class="cta ghost" onclick="showScreen('menu')">${STRINGS.cartAddMoreBtn}</button></div>
    <p class="helper-text">Sacola salva neste navegador por até 7 dias, sem nome, telefone, endereço ou observações. O pagamento será combinado com a loja.</p>`;
}

function totalsHtml(t) {
  return `<div class="trow"><span class="lbl">${STRINGS.cartSubtotal}</span><span>${fmt(t.subtotal)}</span></div>
    ${t.discount ? `<div class="trow"><span class="lbl">${STRINGS.cartDiscount}</span><span>− ${fmt(t.discount)}</span></div>` : ''}
    <div class="trow"><span class="lbl">${STRINGS.cartDeliveryFee}</span><span>${t.deliveryFee === 0 ? STRINGS.cartFreeDelivery : fmt(t.deliveryFee)}</span></div>
    <div class="trow grand"><span class="lbl">${STRINGS.cartTotal}</span><span>${fmt(t.total)}</span></div>`;
}

function cartChanged() {
  lastOrder = null;
  if (!cart.length) couponApplied = false;
  renderCart();
  renderCartBar();
  if (typeof persistDraft === 'function') persistDraft();
}

function changeCartQty(uidVal, delta) {
  const line = cart.find(l => l.uid === uidVal);
  if (!line || ![1, -1].includes(delta) || line.qty + delta > 20) return;
  line.qty += delta;
  if (line.qty <= 0) cart = cart.filter(l => l.uid !== uidVal);
  cartChanged();
}

function removeCartItem(uidVal) {
  cart = cart.filter(l => l.uid !== uidVal);
  cartChanged();
}

function removeCoupon() {
  couponApplied = false;
  cartChanged();
  showToast('Cupom removido.');
}

function applyCoupon() {
  const v   = document.getElementById('couponInput').value.trim().toUpperCase();
  const msg = document.getElementById('couponMsg');
  if (v === CONFIG.couponCode.toUpperCase()) {
    couponApplied = true;
    cartChanged();
    showToast('Cupom aplicado. Total atualizado.');
  } else {
    msg.textContent = STRINGS.cartCouponInvalid(CONFIG.couponCode);
  }
}
