/* Cardápio acessível, busca sem distinção de acentos e navegação por seção. */
let categoryTrackingInitialized = false;
let categoryUpdateQueued = false;
let categoryScrollTarget = null;
let couponBannerDismissed = false;

function normalizeSearch(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function matchesProduct(product, query) {
  return normalizeSearch([product.name, product.desc, ...(product.flavors || [])].join(' ')).includes(normalizeSearch(query));
}

function productCardHtml(product) {
  const promo = product.oldPrice ? `<span class="pold">${fmt(product.oldPrice)}</span><span class="promo-tag">OFERTA</span>` : '';
  return `<button type="button" class="product-card" data-product-id="${escapeHtml(product.id)}" aria-label="Personalizar ${escapeHtml(product.name)}, ${fmt(product.price)}">
    <span class="pic product-media" aria-hidden="true">${productImageHtml(product)}</span><span class="pinfo"><span class="pname">${escapeHtml(product.name)}</span><span class="pdesc">${escapeHtml(product.desc)}</span>
      <span class="prow"><span class="pprice">${fmt(product.price)}</span>${promo}<span class="addbtn" aria-hidden="true">${iconHtml('plus')}</span></span></span></button>`;
}

function setActiveCategory(id) {
  let newlyActive = null;
  document.querySelectorAll('.catpill').forEach(button => {
    const selected = button.id === 'pill-' + id;
    if (selected && !button.classList.contains('active')) newlyActive = button;
    button.classList.toggle('active', selected);
    if (selected) button.setAttribute('aria-current', 'location');
    else button.removeAttribute('aria-current');
  });
  if (newlyActive) revealCategory(newlyActive);
}

// Desloca somente a barra horizontal: scrollIntoView também moveria a página.
function revealCategory(button) {
  const nav = document.getElementById('catnav');
  if (nav.scrollWidth <= nav.clientWidth) return;
  const bounds = nav.getBoundingClientRect();
  const item = button.getBoundingClientRect();
  const padding = 12;
  const delta = item.left < bounds.left + padding ? item.left - bounds.left - padding
    : item.right > bounds.right - padding ? item.right - bounds.right + padding : 0;
  if (!delta) return;
  const left = Math.max(0, Math.min(nav.scrollWidth - nav.clientWidth, nav.scrollLeft + delta));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  nav.scrollTo({ left, behavior: reduced ? 'instant' : 'smooth' });
}

function buildMenu() {
  document.getElementById('catnav').innerHTML = CATEGORIES.map(category => `<button type="button" class="catpill" id="pill-${escapeHtml(category.id)}" data-category="${escapeHtml(category.id)}">${iconHtml(category.icon)} ${escapeHtml(category.name)}</button>`).join('');
  document.getElementById('sections').innerHTML = CATEGORIES.map(category => {
    const products = PRODUCTS.filter(product => product.cat === category.id);
    return `<section class="cat-section" id="cat-${escapeHtml(category.id)}" data-cat="${escapeHtml(category.id)}" aria-labelledby="heading-${escapeHtml(category.id)}">
      <h2 class="cat-title" id="heading-${escapeHtml(category.id)}"><span>${iconHtml(category.icon)} ${escapeHtml(category.name)}</span><span class="tag">${products.length} opções</span></h2>
      <div class="product-grid">${products.map(productCardHtml).join('')}</div></section>`;
  }).join('');
  setActiveCategory(CATEGORIES[0].id);
  if (!categoryTrackingInitialized) {
    window.addEventListener('scroll', scheduleCategoryUpdate, { passive: true });
    window.addEventListener('resize', () => {
      categoryScrollTarget = null;
      scheduleCategoryUpdate();
      const active = document.querySelector('.catpill.active');
      if (active) revealCategory(active);
    });
    window.addEventListener('wheel', cancelCategoryNavigation, { passive: true });
    window.addEventListener('touchstart', cancelCategoryNavigation, { passive: true });
    window.addEventListener('keydown', event => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) cancelCategoryNavigation();
    });
    window.addEventListener('load', scheduleCategoryUpdate);
    if (document.fonts) document.fonts.ready.then(scheduleCategoryUpdate);
    categoryTrackingInitialized = true;
  }
  scheduleCategoryUpdate();
}

// Recalcula a seção usando todas as posições, inclusive ao subir ou saltar a página.
function updateActiveCategoryFromScroll() {
  if (!document.getElementById('screen-menu').classList.contains('active')
    || document.getElementById('searchInput').value.trim()) return;
  const sections = [...document.querySelectorAll('.cat-section')].filter(section => !section.hidden);
  if (!sections.length) return;
  if (categoryScrollTarget) {
    const arrived = Math.abs(window.scrollY - categoryScrollTarget.top) <= 2;
    if (arrived) categoryScrollTarget.arrived = true;
    if (arrived || (!categoryScrollTarget.arrived && Date.now() - categoryScrollTarget.started < 1500)) {
      setActiveCategory(categoryScrollTarget.id);
      return;
    }
    categoryScrollTarget = null;
  }
  const line = document.getElementById('catnav').getBoundingClientRect().bottom + 20;
  let current = sections[0];
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= line + 1) current = section;
  }
  const height = document.documentElement.scrollHeight;
  if (height > window.innerHeight && height - window.scrollY - window.innerHeight <= 2) current = sections[sections.length - 1];
  setActiveCategory(current.dataset.cat);
}

function scheduleCategoryUpdate() {
  if (categoryUpdateQueued) return;
  categoryUpdateQueued = true;
  window.requestAnimationFrame(() => {
    categoryUpdateQueued = false;
    updateActiveCategoryFromScroll();
  });
}

function cancelCategoryNavigation() {
  categoryScrollTarget = null;
}

function scrollToCat(id) {
  const section = document.getElementById('cat-' + id);
  if (!section) return;
  const nav = document.getElementById('catnav');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const requested = section.getBoundingClientRect().top + window.scrollY - nav.getBoundingClientRect().height - 20;
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const top = Math.max(0, Math.min(max, requested));
  categoryScrollTarget = { id, top, started: Date.now(), arrived: false };
  setActiveCategory(id);
  window.scrollTo({ top, behavior: reduced ? 'instant' : 'smooth' });
}

function dismissCouponBanner() {
  couponBannerDismissed = true;
  document.getElementById('ribbon').classList.add('hidden');
}

function onSearch() {
  const query = document.getElementById('searchInput').value.trim();
  categoryScrollTarget = null;
  document.getElementById('ribbon').classList.toggle('hidden', !!query || couponBannerDismissed);
  document.getElementById('catnav').style.display = query ? 'none' : '';
  let count = 0;
  CATEGORIES.forEach(category => {
    const section = document.getElementById('cat-' + category.id);
    if (!section) return;
    let matches = 0;
    section.querySelectorAll('[data-product-id]').forEach(card => {
      const product = PRODUCTS.find(item => item.id === card.dataset.productId);
      const match = product && matchesProduct(product, query);
      card.hidden = !match;
      if (match) { matches += 1; count += 1; }
    });
    section.hidden = !!query && matches === 0;
  });
  document.getElementById('emptySearch').classList.toggle('hidden', !query || count > 0);
  const status = document.getElementById('searchResultCount');
  if (status) status.textContent = query ? `${count} ${count === 1 ? 'opção encontrada' : 'opções encontradas'}` : '';
  if (!query) scheduleCategoryUpdate();
}

