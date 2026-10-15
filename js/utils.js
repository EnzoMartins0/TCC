/* ============================================================
   js/utils.js — Funções utilitárias
   ============================================================ */

/**
 * Formata um número para o padrão monetário brasileiro.
 * @param {number} n
 * @returns {string} ex.: "R$ 12,90"
 */
// Use para todo texto interpolado em templates HTML; não usar em código JavaScript.
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
}

// A origem da imagem sempre vem do catálogo, inclusive para sacolas antigas restauradas.
function productImageHtml(subject, context = 'menu') {
  const id = subject && (subject.productId || subject.id);
  const product = PRODUCTS.find(item => item.id === id);
  if (!product || !/^assets\/products\/[a-zA-Z0-9_-]+\.(?:svg|png|webp|jpe?g)$/.test(product.image || '')) return '';
  const detail = context === 'detail';
  const alt = detail ? product.imageAlt : '';
  return `<img class="product-illustration" src="${escapeHtml(product.image)}" alt="${escapeHtml(alt)}" width="320" height="320" loading="${detail ? 'eager' : 'lazy'}" decoding="async"><span class="product-image-fallback" aria-hidden="true">Imagem<br>indisponível</span>`;
}

function handleProductImageError(event) {
  const image = event.target;
  if (!image || !image.classList || !image.classList.contains('product-illustration')) return;
  const media = image.parentElement;
  if (!media || !media.classList.contains('product-media')) return;
  image.hidden = true;
  media.classList.add('image-unavailable');
}

// Texto de usuário continua em textContent; somente o SVG fixo é inserido como HTML.
function setIconText(element, name, text) {
  element.textContent = text;
  element.insertAdjacentHTML('afterbegin', iconHtml(name));
  element.classList.add('icon-text');
}

function fmt(n) {
  return 'R$ ' + n.toFixed(2).replace('.', ',');
}

/**
 * Gera um ID aleatório curto para itens do carrinho.
 * @returns {string}
 */
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

/**
 * Exibe um toast de notificação temporário.
 * @param {string} msg
 */
function showToast(msg) {
  const t = document.getElementById('toast');
  setIconText(t, 'info', msg);
  t.classList.remove('hidden');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.add('hidden'), 2200);
}
