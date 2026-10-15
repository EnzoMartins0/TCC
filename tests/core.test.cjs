const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./helpers.cjs');

test('troco interpreta separador brasileiro de milhar sem confundir com casas decimais', () => {
 const app=createApp();
 for(const [text,value] of [['1.234',1234],['1.234,56',1234.56],['1.000',1000],['1.000,00',1000],['1000.00',1000],['200,50',200.5],['200.50',200.5],['50',50]]) {
   assert.equal(app.run(`parseMoney(${JSON.stringify(text)})`),value,text);
 }
 for(const text of ['abc','-1','1e4','25,123','1.2.3','Infinity']) assert.equal(app.run(`parseMoney(${JSON.stringify(text)})`),null,text);
});


test('novo pedido limpa estado, dados privados e seleções visuais sem apagar ao cancelar', () => {
  const app=createApp();app.validOrder();
  app.run("setDeliveryType('retirada');setPayment('Dinheiro');document.getElementById('fObsGeral').value='dado privado';finalizeOrder()");
  app.context.confirm=()=>false;app.run('newOrder()');assert.equal(app.run('cart.length'),1);
  app.context.confirm=()=>true;app.run('newOrder()');
  assert.equal(app.run('cart.length'),0);assert.equal(app.run('lastOrder'),null);
  for(const id of ['fNome','fTelefone','fRua','fNumero','fBairro','fTroco','fObsGeral']) assert.equal(app.element(id).value,'',id);
  assert.equal(app.element('segEntrega').getAttribute('aria-checked'),'true');
  assert.equal(app.element('pay-Pix').getAttribute('aria-checked'),'true');
  assert.equal(app.storage.size,0);
});


test('finalização rejeita carrinho vazio sem criar pedido', () => {
  const app=createApp();
  app.run('finalizeOrder()');
  assert.equal(app.run('lastOrder'),null);
  assert.match(app.element('checkoutError').textContent,/sacola|item/i);
});

test('trocar retirada por entrega não permite finalizar abaixo do mínimo', () => {
  const app=createApp(); app.validOrder('p15');
  app.run("setDeliveryType('retirada'); goCheckout(); setDeliveryType('entrega'); finalizeOrder()");
  assert.equal(app.run('lastOrder'),null);
  assert.match(app.element('checkoutError').textContent,/mínimo/i);
});

test('checkout valida identificação, endereço e troco antes de montar a comanda', () => {
  const cases = [
    ['nome ausente', "document.getElementById('fNome').value=''", /nome/i],
    ['endereço ausente', "document.getElementById('fRua').value=''", /rua/i],
    ['telefone inválido', "document.getElementById('fTelefone').value='abc'", /telefone/i],
    ['troco texto', "setPayment('Dinheiro');document.getElementById('fTroco').value='abc'", /troco|valor/i],
    ['troco insuficiente', "setPayment('Dinheiro');document.getElementById('fTroco').value='10,00'", /troco|total/i],
  ];
  for (const [label,setup,expected] of cases) {
    const app=createApp();app.validOrder();app.run(setup);app.run('finalizeOrder()');
    assert.equal(app.run('lastOrder'),null,label);
    assert.match(app.element('checkoutError').textContent,expected,label);
  }
});

test('preparar comanda mantém a sacola e identifica o cliente sem confirmar recebimento', () => {
  const app=createApp();app.validOrder();
  app.run('finalizeOrder()');
  assert.equal(app.run('cart.length'),1);
  assert.equal(app.run('lastOrder.status'),'draft');
  assert.equal(app.run('lastOrder.customer.name'),'Ana Silva');
  assert.match(app.element('confirmSummary').textContent,/Ana Silva/);
  assert.match(app.element('confirmSubtitle').textContent,/WhatsApp/);
  assert.doesNotMatch(app.element('confirmSubtitle').textContent,/recebido|cozinha/i);
});

test('etapa de pagamento não avança com troco inválido', () => {
  const app=createApp();app.validOrder();app.run("goCheckout();nextStep();setPayment('Dinheiro');document.getElementById('fTroco').value='abc';nextStep()");
  assert.equal(app.run('checkoutStepN'),2);
  assert.match(app.element('checkoutError').textContent,/troco/i);
});
