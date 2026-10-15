/* Execute este arquivo na página aberta em um navegador de teste.
   Retorna resultados JSON. Intercepta window.open: nenhum WhatsApp real é aberto.
   Limpa SOMENTE a sacola demonstrativa desta origem; não use durante um pedido real. */
(async () => {
  const results = [];
  const originalOpen = window.open;
  const originalConfirm = window.confirm;
  const errors = [];
  const onError = event => errors.push(event.message);
  window.addEventListener('error', onError);
  let opened = null;
  window.open = (...args) => { opened = args; return null; };
  window.confirm = () => true;
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const record = async (name, action) => {
    try { await action(); results.push({ name, passed: true }); }
    catch (error) { results.push({ name, passed: false, error: error.message }); }
  };
  const fill = (id, value) => {
    const input = document.getElementById(id);
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const product = id => document.querySelector(`[data-product-id="${id}"]`).click();
  const option = (type, value) => [...document.querySelectorAll('[data-option]')]
    .find(button => button.dataset.option === type && button.dataset.value === value).click();
  try {
    newOrder();
    await record('catálogo e busca sem acentos/sabores', () => {
      assert(document.querySelectorAll('.product-card').length === PRODUCTS.length, 'Catálogo incompleto');
      fill('searchInput', 'agua');
      assert([...document.querySelectorAll('.product-card:not([hidden])')].some(card => card.dataset.productId === 'p15'), 'Água não encontrada');
      fill('searchInput', 'guarana');
      assert(document.querySelector('[data-product-id="p13"]').hidden === false, 'Sabor não encontrado');
      fill('searchInput', 'busca sem resultado 12345');
      assert(!document.getElementById('emptySearch').classList.contains('hidden'), 'Estado vazio ausente');
      fill('searchInput', '');
      document.querySelector('.ribbon-close').click();
      fill('searchInput', 'bacon');fill('searchInput', '');
      assert(document.getElementById('ribbon').classList.contains('hidden'), 'Banner fechado reapareceu');
    });
    await record('modal: Escape, foco, clique fora e seleção explícita', () => {
      const card = document.querySelector('[data-product-id="p13"]');card.focus();card.click();
      assert(document.activeElement.id === 'modalClose', 'Foco inicial incorreto');
      assert(document.getElementById('app').inert, 'Página atrás do modal não está inerte');
      document.getElementById('mAddBtn').click();
      assert(cart.length === 0 && document.getElementById('modalError').textContent.includes('sabor'), 'Sabor obrigatório ignorado');
      const last = document.getElementById('mAddBtn');last.focus();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
      assert(document.activeElement.id === 'modalClose', 'Foco saiu do modal');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      assert(!document.getElementById('modalProduct').classList.contains('open'), 'Escape não fechou');
      assert(document.activeElement === card, 'Foco não retornou ao produto');
      card.click();document.getElementById('modalProduct').click();
      assert(!document.getElementById('modalProduct').classList.contains('open'), 'Clique fora não fechou');
    });
    await record('retirada disponível abaixo do mínimo; troca para entrega é revalidada', () => {
      product('p15');option('flavor', 'Sem gás');document.getElementById('mAddBtn').click();
      document.getElementById('cartbar').click();
      assert(document.querySelector('#cartContent .cart-actions .cta').disabled, 'Mínimo não bloqueou entrega');
      [...document.querySelectorAll('#cartContent [role="radio"]')].find(button => button.textContent.includes('Retirada')).click();
      assert(!document.querySelector('#cartContent .cart-actions .cta').disabled, 'Retirada continuou bloqueada');
      document.querySelector('#cartContent .cart-actions .cta').click();fill('fNome', 'Cliente Teste');
      document.getElementById('segEntrega').click();document.getElementById('btnNext').click();
      assert(checkoutStepN === 1 && document.getElementById('checkoutError').textContent.includes('mínimo'), 'Troca de tipo ignorou mínimo');
    });
    newOrder();
    await record('adicionais, remoções e observações como texto; quantidade e cupom sincronizados', () => {
      product('p1');option('extras', 'Bacon extra');option('remove', 'Cheddar');
      fill('mObs', '<b data-probe="safe">Sem cebola & molho #</b>');
      document.getElementById('mAddBtn').click();document.getElementById('cartbar').click();
      assert(!document.querySelector('#cartContent [data-probe]'), 'Observação virou HTML');
      document.querySelector('[data-cart-action="increase"]').click();
      assert(cart[0].qty === 2, 'Quantidade não mudou');
      fill('couponInput', CONFIG.couponCode.toLowerCase());
      document.getElementById('couponInput').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      assert(couponApplied, 'Cupom não aplicado');
      assert(document.getElementById('cbTotal').textContent === fmt(calcTotals().total), 'Barra desatualizada');
    });
    await record('checkout completo valida troco e prepara rascunho identificado', () => {
      document.querySelector('#cartContent .cart-actions .cta').click();
      document.getElementById('btnNext').click();
      assert(checkoutStepN === 1 && document.activeElement.id === 'fNome', 'Nome inválido não recebeu foco');
      for (const [id, value] of Object.entries({ fNome: 'Cliente de teste', fTelefone: '(11) 99109-3901', fRua: 'Rua São João & Silva', fNumero: '123', fBairro: 'Centro', fComplemento: 'Apto #2', fReferencia: 'Próximo à praça' })) fill(id, value);
      document.getElementById('btnNext').click();assert(checkoutStepN === 2, 'Não avançou ao pagamento');
      document.querySelector('[data-pay="Dinheiro"]').click();fill('fTroco', 'abc');document.getElementById('btnNext').click();
      assert(checkoutStepN === 2, 'Troco inválido aceito');
      fill('fTroco', '200,00');document.getElementById('btnNext').click();
      assert(checkoutStepN === 3, 'Não avançou à revisão');
      assert(document.getElementById('reviewItems').textContent.includes('Bacon extra'), 'Adicionais ausentes na revisão');
      assert(document.getElementById('reviewItems').textContent.includes('Cheddar'), 'Remoções ausentes na revisão');
      assert(!document.querySelector('#reviewItems [data-probe]'), 'HTML executável na revisão');
      fill('fObsGeral', 'Referência # & + 50% e literal %0A');document.getElementById('btnNext').click();
      assert(document.querySelector('.screen.active').id === 'screen-confirm', 'Resumo não abriu');
      assert(cart.length === 1 && lastOrder.status === 'draft', 'Sacola apagada ou status indevido');
      assert(document.getElementById('confirmSummary').textContent.includes('Cliente de teste'), 'Identificação ausente');
    });
    await record('WhatsApp mantém texto exato e destino correto sem envio real', () => {
      document.getElementById('btnWhatsApp').click();
      const url = new URL(opened[0]);
      assert(url.pathname === '/5511991093901', 'Destinatário incorreto');
      assert(url.hash === '' && [...url.searchParams.keys()].length === 1, 'Codificação incorreta');
      assert(url.searchParams.get('text') === buildOrderMessage(lastOrder), 'Mensagem foi truncada ou alterada');
      assert(lastOrder.status === 'draft', 'Abertura foi tratada como confirmação');
    });
    await record('editar preserva dados; novo pedido permite cancelar ou limpar tudo', () => {
      document.getElementById('btnEditOrder').click();
      assert(fieldValue('fNome') === 'Cliente de teste' && cart.length === 1, 'Edição perdeu dados');
      window.confirm = () => false;newOrder();assert(cart.length === 1, 'Cancelamento ignorado');
      window.confirm = () => true;newOrder();
      assert(!cart.length && lastOrder === null && !fieldValue('fNome') && !fieldValue('fRua'), 'Reset incompleto');
      assert(document.getElementById('segEntrega').getAttribute('aria-checked') === 'true', 'Entrega não sincronizada');
      assert(document.querySelector('[data-pay="Pix"]').getAttribute('aria-checked') === 'true', 'Pix não sincronizado');
      assert(!localStorage.getItem(DRAFT_KEY), 'Rascunho antigo permaneceu');
    });
    await record('textos longos permitidos não alargam carrinho, revisão ou resumo', () => {
      newOrder();product('p1');fill('mObs', 'a'.repeat(300));document.getElementById('mAddBtn').click();openCart();
      assert(document.documentElement.scrollWidth <= innerWidth, 'Observação longa alargou carrinho');
      goCheckout();
      for (const [id, value] of Object.entries({ fNome: 'n'.repeat(80), fRua: 'r'.repeat(120), fNumero: '123', fBairro: 'b'.repeat(80), fComplemento: 'c'.repeat(120), fReferencia: 'f'.repeat(160) })) fill(id, value);
      nextStep();nextStep();
      assert(checkoutStepN === 3, 'Não chegou à revisão adversarial');
      assert(document.documentElement.scrollWidth <= innerWidth, 'Texto longo alargou revisão');
      fill('fObsGeral', 'o'.repeat(500));finalizeOrder();
      assert(document.documentElement.scrollWidth <= innerWidth, 'Texto longo alargou resumo');
      assert(getComputedStyle(document.getElementById('confirmSummary')).whiteSpace === 'pre-wrap', 'Resumo não preserva quebras de linha');
    });
    newOrder();
    await record('sem erros JavaScript e sem rolagem horizontal', () => {
      assert(errors.length === 0, errors.join('; '));
      assert(document.documentElement.scrollWidth <= innerWidth, 'Overflow horizontal');
    });
    return { passed: results.every(result => result.passed), results, realMessageSent: false };
  } finally {
    window.open = originalOpen;
    window.confirm = originalConfirm;
    window.removeEventListener('error', onError);
  }
})()
