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
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.add('hidden'), 2200);
}
