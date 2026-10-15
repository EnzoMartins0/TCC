/* Regressão no navegador: rolagem vertical deve selecionar e revelar a categoria.
   Executar na página do cardápio. Não altera pedidos nem abre WhatsApp. */
(async () => {
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  if (document.fonts) await document.fonts.ready;
  showScreen('menu');
  document.getElementById('searchInput').value = '';
  onSearch();
  const nav = document.getElementById('catnav');
  nav.scrollLeft = 0;
  window.scrollTo({ top: 0, behavior: 'instant' });
  await wait(100);
  const results = [];
  const measure = (expected, action) => {
    const active = nav.querySelector('.catpill.active');
    const bounds = nav.getBoundingClientRect();
    const rect = active.getBoundingClientRect();
    const visible = rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1;
    results.push({ action, expected, active: active.dataset.category,
      passed: active.dataset.category === expected && visible,
      fullyVisible: visible, navScrollLeft: nav.scrollLeft, scrollY: window.scrollY });
  };
  measure('promo', 'início');
  for (const id of ['lanches','porcoes','bebidas','sobremesas','bebidas','porcoes','lanches','promo']) {
    const section = document.getElementById('cat-' + id);
    const top = section.getBoundingClientRect().top + window.scrollY - nav.getBoundingClientRect().height - 12;
    window.scrollTo({ top, behavior: 'instant' });
    await wait(300);
    // Em telas altas, o navegador pode limitar o destino ao fim da página.
    const expected = document.documentElement.scrollHeight - window.scrollY - innerHeight <= 2 ? 'sobremesas' : id;
    measure(expected, 'rolagem vertical');
  }
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
  await wait(300);measure('sobremesas', 'fim da página');
  window.scrollTo({ top: 0, behavior: 'instant' });
  await wait(300);measure('promo', 'retorno ao topo');
  document.querySelector('[data-category="bebidas"]').click();
  await wait(1000);measure('bebidas', 'clique na categoria');
  window.dispatchEvent(new WheelEvent('wheel', { deltaY: -300 }));
  const previous = document.getElementById('cat-porcoes');
  window.scrollTo({ top: previous.getBoundingClientRect().top + scrollY - nav.getBoundingClientRect().height - 12, behavior: 'instant' });
  await wait(300);measure('porcoes', 'rolagem manual após clique');
  return { passed: results.every(result => result.passed), width: innerWidth, results };
})()
