/* Bootstrap e eventos delegados. Mantém os templates livres de texto de usuário em JavaScript. */
renderStaticIcons();
restoreDraft();
buildMenu();
setDeliveryType(deliveryType);
setPayment(paymentMethod);
showCheckoutStep(checkoutStepN);
renderCartBar();

// Falhas de imagens não interrompem a escolha ou o pedido.
document.addEventListener('error', handleProductImageError, true);

// Produtos e categorias gerados dinamicamente.
document.getElementById('sections').addEventListener('click', event => {
  const card = event.target.closest('[data-product-id]');
  if (card) openProduct(card.dataset.productId);
});
document.getElementById('catnav').addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (button) scrollToCat(button.dataset.category);
});

document.getElementById('cartContent').addEventListener('click', event => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;
  const { cartAction, uid: id } = button.dataset;
  if (cartAction === 'remove') removeCartItem(id);
  else changeCartQty(id, cartAction === 'increase' ? 1 : -1);
  const next = [...document.querySelectorAll('[data-cart-action]')]
    .find(element => element.dataset.uid === id && element.dataset.cartAction === cartAction && !element.disabled);
  if (next) next.focus();
  else {
    const title = document.getElementById('cartTitle');
    title.setAttribute('tabindex', '-1');
    title.focus();
  }
});
document.getElementById('cartContent').addEventListener('keydown', event => {
  if (event.target.id === 'couponInput' && event.key === 'Enter') {
    event.preventDefault();
    applyCoupon();
  }
});

document.getElementById('sheet').addEventListener('click', event => {
  const button = event.target.closest('[data-option]');
  if (!button) return;
  const { option, value } = button.dataset;
  if (option === 'flavor') setFlavor(value);
  else if (option === 'extras') toggleExtra(value);
  else if (option === 'remove') toggleRemove(value);
});
document.getElementById('modalProduct').addEventListener('click', event => {
  if (event.target === event.currentTarget) closeProduct();
});
document.addEventListener('keydown', handleModalKeydown);

// As opções continuam clicáveis por Enter/Espaço; setas percorrem os grupos de rádio.
document.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
  const radio = event.target.closest('[role="radio"]');
  if (!radio) return;
  const group = radio.closest('[role="radiogroup"]');
  if (!group) return;
  const options = [...group.querySelectorAll('[role="radio"]')].filter(option => !option.disabled);
  if (!options.length) return;
  const index = options.indexOf(radio);
  const delta = ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1;
  const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + delta + options.length) % options.length;
  event.preventDefault();
  const selected = options[nextIndex];
  selected.click();
  // O carrinho é reconstruído ao trocar o recebimento; recuperar o novo elemento.
  if (selected.isConnected) selected.focus();
  else {
    const active = document.querySelector('#cartContent [role="radio"][aria-checked="true"]');
    if (active) active.focus();
  }
});

document.getElementById('screen-checkout').addEventListener('input', () => {
  clearCheckoutError();
  lastOrder = null;
});
window.addEventListener('pagehide', persistDraft);
