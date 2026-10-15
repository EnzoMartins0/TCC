const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = ['base', 'menu', 'cart-checkout', 'modal'].map(n => fs.readFileSync(path.join(root, 'css', n + '.css'), 'utf8')).join('\n');
function tag(id) { return html.match(new RegExp('<[a-z][^>]*\\bid="' + id + '"[^>]*>', 'i'))?.[0] || ''; }

test('checkout identifica a pessoa e associa labels, limites e seleções acessíveis', () => {
  assert.match(tag('fNome'), /required/);
  assert.match(tag('fNome'), /autocomplete="name"/);
  assert.match(tag('fTelefone'), /type="tel"/);
  assert.doesNotMatch(tag('fTelefone'), /required/);
  const fields = { fNome:80, fTelefone:25, fRua:120, fNumero:20, fBairro:80, fComplemento:120, fReferencia:160, fTroco:20, fObsGeral:500, searchInput:120 };
  for (const [id, max] of Object.entries(fields)) {
    assert.match(tag(id), new RegExp('maxlength="' + max + '"'), id);
    assert.match(html, new RegExp('<label[^>]*for="' + id + '"'), id);
  }
  assert.match(tag('checkoutError'), /role="alert"/);
  for (const id of ['segEntrega', 'segRetirada']) {
    assert.match(tag(id), /^<button/);
    assert.match(tag(id), /role="radio"/);
    assert.match(tag(id), /aria-checked="(?:true|false)"/);
  }
  const payments = html.match(/<button[^>]*class="pay-option[^>]*>/g) || [];
  assert.equal(payments.length, 4);
  for (const pay of payments) assert.match(pay, /role="radio"/);
  assert.match(css, /\.delivery-selector/);
});

test('confirmação prepara envio sem fingir acompanhamento e explica privacidade', () => {
  assert.doesNotMatch(html, /trackConfirmed|trackPreparing|trackOnTheWay|trackDelivered|progress-track/);
  assert.match(html, /Pedido pronto para enviar/);
  assert.match(html, /não confirma (?:o )?envio ou recebimento/);
  assert.ok(tag('confirmSummary'));
  for (const [id, action] of Object.entries({ btnWhatsApp:'sendWhatsApp', btnCopyOrder:'copyOrderMessage', btnEditOrder:'editOrder', btnNewOrder:'newOrder' })) {
    assert.match(tag(id), /^<button/);
    assert.match(tag(id), new RegExp('onclick="' + action + '\\(\\)"'));
  }
  assert.match(html, /Projeto acadêmico/);
  assert.match(html, /nome, telefone, endereço e observações não são persistidos/i);
  assert.match(html, /<script src="js\/app\.js"><\/script>\s*<\/body>/);
  assert.doesNotMatch(html, /^\s*(?:buildMenu|renderCartBar)\(\);/m);
});

test('controles estáticos são botões nomeados e modal é um diálogo acessível', () => {
  assert.match(tag('cartbar'), /^<button[^>]*type="button"/);
  for (const attr of ['role="dialog"', 'aria-modal="true"', 'aria-labelledby="mName"', 'aria-hidden="true"', 'tabindex="-1"']) assert.ok(tag('modalProduct').includes(attr), attr);
  assert.match(tag('modalClose'), /^<button/);
  assert.match(tag('modalClose'), /onclick="closeProduct\(\)"/);
  assert.match(tag('modalClose'), /aria-label="Fechar detalhes do produto"/);
  assert.match(tag('modalError'), /role="alert"/);
  assert.match(tag('mObs'), /maxlength="300"/);
  assert.match(html, /<label[^>]*for="mObs"/);
  assert.doesNotMatch(html, /<div[^>]*onclick=/);
  for (const button of html.match(/<button\b[^>]*>/g)) assert.match(button, /type="button"/);
  assert.match(css, /\.opt-line[^}]*min-height:\s*44px/s);
  assert.match(css, /\.modal-overlay:not\(\.open\)[^}]*visibility:\s*hidden/s);
});

test('grade desktop aplica as colunas ao contêiner real dos produtos', () => {
  assert.match(css, /\.product-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s);
  assert.ok(tag('searchResultCount'));
});

test('catálogo usa página fluida, navegação sticky e grade desktop', () => {
  assert.doesNotMatch(html, /class="statusbar"/);
  assert.match(html, /class="skip-link"[^>]*href="#sections"/);
  assert.match(css, /max-width:\s*1100px/);
  assert.match(css, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.catnav\s*\{[^}]*position:\s*sticky/s);
  assert.doesNotMatch(css, /height:\s*750px|max-width:\s*412px/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
});
