/* ============================================================
   data/strings.js — Textos da interface centralizados
   Edite aqui para mudar qualquer texto exibido no app.
   ============================================================ */

const STRINGS = {

  /* --- Hero strip --- */
  heroStrip: (freeOver, minOrder) =>
    `Frete grátis a partir de R$ ${freeOver.toFixed(2).replace('.', ',')} · Mínimo R$ ${minOrder.toFixed(2).replace('.', ',')} para entrega · Valores após desconto`,

  /* --- Banner de cupom --- */
  couponBanner: (code, discountPct) => `
    <div class="ribbon-icon" aria-hidden="true">${iconHtml('ticket')}</div>
    <div class="ribbon-body">
      <div class="ribbon-label">Cupom de desconto</div>
      <div class="ribbon-code">${escapeHtml(code)}</div>
      <div class="ribbon-desc">${discountPct}% de desconto na sua sacola</div>
    </div>
    <button type="button" class="ribbon-close" onclick="dismissCouponBanner()" aria-label="Fechar cupom">${iconHtml('close')}</button>
  `,

  /* --- Busca --- */
  get searchEmpty() { return `${iconHtml('search')}<p>Nenhum item encontrado para essa busca.<br>Tenta outro termo!</p>`; },

  /* --- Carrinho --- */
  get cartEmpty() { return iconHtml('bag'); },
  cartEmptyMsg:      'Sua sacola está vazia.<br>Adicione algo gostoso do cardápio!',
  cartRemove:        'Remover',
  cartCouponApply:   'Aplicar',
  cartCouponApplied: 'Aplicado',
  cartCouponInvalid: (code) => `Cupom inválido. Tente ${code}.`,
  cartSubtotal:      'Subtotal',
  cartDiscount:      'Desconto',
  cartDeliveryFee:   'Taxa de entrega',
  cartFreeDelivery:  'Grátis',
  cartTotal:         'Total',
  cartMinWarning:    (min, missing) =>
    `Pedido mínimo para entrega é ${fmt(min)}. Faltam ${fmt(missing)}.`,
  cartCheckoutBtn:   'Continuar para pagamento',
  cartAddMoreBtn:    'Adicionar mais itens',

  /* --- Modificadores de item --- */
  modFlavor:  (f)    => `Sabor: ${f}`,
  modExtras:  (list) => `+ ${list}`,
  modRemoved: (list) => `sem ${list}`,
  modObs:     (obs)  => `Obs: ${obs}`,
  modSep:     ' · ',
  modRemovePrefix: 'Sem ',

  /* --- Checkout --- */
  checkoutAddrMissing: 'Preenche rua, número e bairro pra gente conseguir te entregar.',
  checkoutBtnNext:     'Continuar',
  checkoutBtnBack:     'Voltar',
  checkoutBtnFinish:   'Preparar comanda',
  get checkoutPickupNote() { return `Retirada em: ${CONFIG.pickupAddress}. Confirme o horário com a loja.`; },
  checkoutOrderPrefix: 'Pedido ',

  /* --- Revisão --- */
  reviewDelivAddr: (rua, numero, comp, bairro) =>
    `Entrega — ${rua}, ${numero}${comp ? ' (' + comp + ')' : ''} — ${bairro}`,
  get reviewPickup() { return `Retirada no local — ${CONFIG.pickupAddress}`; },
  reviewPayPrefix: '',
  reviewChangeFor: (troco) => ` — troco para ${troco}`,
  reviewNoChange:  ' — sem troco',

  /* --- WhatsApp --- */
  waHeader:     (orderNo, store) => `*Pedido ${orderNo} — ${store}*\n\n`,
  waItemLine:   (qty, name, price) => `${qty}x ${name} — ${price}\n`,
  waSubtotal:   (v)    => `\n*Subtotal:* ${v}\n`,
  waDiscount:   (v)    => `*Desconto:* − ${v}\n`,
  waDelivery:   (v)    => `*Entrega:* ${v}\n`,
  waTotal:      (v)    => `*Total:* ${v}\n\n`,
  waDelivAddr:  (rua, numero, comp, bairro) =>
    `*Entrega em:* ${rua}, ${numero}${comp ? ' (' + comp + ')' : ''} — ${bairro}\n`,
  waReference:  (ref)  => `*Referência:* ${ref}\n`,
  get waPickup() { return `*Retirada no local:* ${CONFIG.pickupAddress}\n`; },
  waPayment:    (method) => `*Pagamento:* ${method}`,
  waChangeFor:  (troco) => ` (troco para ${troco})`,
  waNoChange:   ' (sem troco)',
  waObs:        (obs)  => `*Observações:* ${obs}\n`,

  /* --- Modal de produto --- */
  modalFromPrice:   '',
  modalAddBtn:      (price) => `Adicionar • ${price}`,
  modalFlavorAlert: 'Escolha o sabor antes de adicionar.',
  modalToast:       (name)  => `${name} adicionado à sacola.`,
};
