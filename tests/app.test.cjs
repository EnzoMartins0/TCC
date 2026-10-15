const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createApp, root } = require('./helpers.cjs');

test('navegação abre checkout no topo e recupera posição do cardápio ao voltar', () => {
  const app=createApp();app.element('screen-menu');app.context.scrollY=450;
  let position;app.context.scrollTo=(x,y)=>{position=y;};
  app.run("showScreen('cart')");assert.equal(position,0);
  app.run("showScreen('menu')");assert.equal(position,450);
  assert.equal(app.element('cartbar').style.display,'');
});


test('inicialização recupera sacola e sincroniza escolhas e barra', () => {
  const original=createApp();original.validOrder();original.run("setDeliveryType('retirada');setPayment('Dinheiro');persistDraft()");
  const app=createApp(Object.fromEntries(original.storage));
  app.run(fs.readFileSync(path.join(root,'js/app.js'),'utf8'));
  assert.equal(app.run('cart.length'),1);
  assert.equal(app.element('cbCount').textContent,1);
  assert.equal(app.element('segRetirada').getAttribute('aria-checked'),'true');
  assert.equal(app.element('pay-Dinheiro').getAttribute('aria-checked'),'true');
});
