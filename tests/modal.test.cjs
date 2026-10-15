const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./helpers.cjs');

test('quantidade do produto é limitada a 20 unidades e observação a 300 caracteres', () => {
  const app=createApp();app.run("openProduct('p1');modalQtyDelta(99)");
  assert.equal(app.run('modalQty'),20);
  app.element('mObs').value='x'.repeat(301);app.run('addToCart()');
  assert.equal(app.run('cart.length'),0);
  assert.match(app.element('modalError').textContent,/300/);
});


test('modal fecha com Escape, restaura foco e oferece opções de teclado sem perder observações', () => {
  const app=createApp();const origin=app.element('origin');origin.focus();
  app.run("openProduct('p1')");
  assert.equal(app.element('app').inert,true);
  assert.match(app.element('extrasList').innerHTML,/<button[^>]+role="checkbox"/);
  app.element('mObs').value='Bem passado';app.run("toggleExtra('Bacon extra')");
  assert.equal(app.element('mObs').value,'Bem passado');
  app.run("handleModalKeydown({key:'Escape',preventDefault(){}})");
  assert.equal(app.element('modalProduct').getAttribute('aria-hidden'),'true');
  assert.equal(app.element('app').inert,false);
  assert.equal(app.context.document.activeElement,origin);
});


test('produto com sabores exige escolha explícita e salva a opção selecionada', () => {
  const app=createApp();app.run("openProduct('p13');addToCart()");
  assert.equal(app.run('cart.length'),0);
  assert.match(app.element('modalError').textContent,/sabor/i);
  app.run("setFlavor('Guaraná');addToCart()");
  assert.equal(app.run('cart[0].flavor'),'Guaraná');
  assert.ok(app.storage.size);
  assert.equal(app.element('modalProduct').getAttribute('aria-hidden'),'true');
});
