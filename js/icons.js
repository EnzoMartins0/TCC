/* Ícones vetoriais originais da interface. Sem fontes, imagens ou serviços externos. */
const UI_ICONS=Object.freeze({
  flame:'<path d="M13 2c1 5-3 5-3 9 0 2 1 3 3 3-1-3 2-4 2-6 4 4 6 7 4 11-1 3-4 4-7 4-5 0-8-3-8-7 0-5 5-7 9-14Z"/><path d="M10 22c-2-3-1-5 1-7 0 2 3 3 3 5 0 1-1 2-1 2"/>',
  burger:'<path d="M3 9c0-8 18-8 18 0H3Z"/><path d="m3 13 3-2 4 2 4-2 4 2 3-2M3 16h18M3 19h18c0 4-18 4-18 0Z"/><path d="m8 5 .2.1M12 4l.2.1M16 5l.2.1"/>',
  fries:'<path d="m5 11 2 11h10l2-11H5Z"/><path d="M7 11V3h3v8M11 11V2h3v9M15 11V4h3v7M10 16h4"/>',
  drink:'<path d="M6 8h12l-1 14H7L6 8ZM5 8h14M13 8l2-6h4M8 12h8"/>',
  dessert:'<path d="M3 12h18v9H3v-9ZM3 12l13-6 5 6M3 16h18"/><path d="M13 6V3M11 3h4M7 19h.1M16 19h.1"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  'map-pin':'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  delivery:'<circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M8 18h6l3-8h3M15 5h3l1 10M5 15l3-5h5v4M7 7h5M2 11h4"/>',
  store:'<path d="m3 8 2-5h14l2 5M3 8v3a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0V8H3ZM5 14v8h14v-8M10 22v-6h4v6"/>',
  pix:'<path d="m12 2 6 6-3 3-3-3-3 3-3-3 6-6Zm0 20-6-6 3-3 3 3 3-3 3 3-6 6ZM2 12l2-2 2 2-2 2-2-2Zm20 0-2 2-2-2 2-2 2 2Z"/>',
  card:'<rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 9h20M6 15h4M6 17h2"/>',
  cash:'<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9H5v2M18 15h1v-2"/>',
  ticket:'<path d="M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4V5Z"/><path d="M15 5v2M15 10v1M15 14v1M15 18v1M7 9l4 6M10 9h.1M7 15h.1"/>',
  bag:'<path d="M4 7h16l1 15H3L4 7Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/>',
  'phone-chat':'<path d="M21 11a9 9 0 0 1-9 9 10 10 0 0 1-4-1l-5 2 1-5a9 9 0 1 1 17-5Z"/><path d="m8 7 2 2-1 2c1 2 2 3 4 4l2-1 2 2c-4 4-13-5-9-9Z"/>',
  'arrow-left':'<path d="m10 5-7 7 7 7M3 12h18"/>',
  'chevron-right':'<path d="m9 5 7 7-7 7"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  plus:'<path d="M12 4v16M4 12h16"/>',
  minus:'<path d="M4 12h16"/>',
  check:'<path d="m4 12 5 5L20 6"/>',
  trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 16h12l1-16M10 10v8M14 10v8"/>',
  receipt:'<path d="m5 2 3 2 4-2 4 2 3-2v20l-3-2-4 2-4-2-3 2V2ZM9 8h6M9 12h6M9 16h3"/>',
  copy:'<rect x="8" y="8" width="13" height="14" rx="2"/><path d="M16 8V2H3v14h5"/>',
  edit:'<path d="m15 4 5 5M3 21l5-1L21 7l-5-5L3 15v6ZM3 21h18"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7h.01"/>',
  clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
});

function iconHtml(name) {
  if(typeof name!=='string'||!Object.hasOwn(UI_ICONS,name)) return '';
  return `<svg class="ui-icon" data-svg-icon="${name}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${UI_ICONS[name]}</svg>`;
}

function renderStaticIcons() {
  document.querySelectorAll('[data-icon]').forEach(element=>{element.innerHTML=iconHtml(element.dataset.icon);});
  document.querySelectorAll('[data-leading-icon]').forEach(element=>{
    element.insertAdjacentHTML('afterbegin',iconHtml(element.dataset.leadingIcon));
  });
}
