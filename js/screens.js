/* ============================================================
   js/screens.js — Gerenciamento de navegação entre telas
   ============================================================ */

/**
 * Ativa a tela solicitada e esconde as demais.
 * @param {'menu'|'cart'|'checkout'|'confirm'} name
 */
let menuScrollPosition = 0;

function showScreen(name) {
  const target = document.getElementById('screen-' + name);
  if (!target) return false;
  const current = document.querySelector('.screen.active');
  if (current && current.id === 'screen-menu' && name !== 'menu') menuScrollPosition = window.scrollY || 0;
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
  target.classList.add('active');
  document.getElementById('cartbar').style.display = name === 'menu' ? '' : 'none';
  if (name === 'menu') renderCartBar();
  window.scrollTo(0, name === 'menu' ? menuScrollPosition : 0);
  const heading = target.querySelector('h1, h2');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
  return true;
}
