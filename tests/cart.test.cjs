const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./helpers.cjs');

test('carrinho oferece retirada antes do mínimo e mantém barra atualizada com cupom removível', () => {
  const app=createApp();app.validOrder('p15');app.run('openCart()');
  assert.match(app.element('cartContent').innerHTML,/setDeliveryType\('retirada'\)/);
  app.run("setDeliveryType('retirada')");
  assert.equal(app.run('goCheckout()'),true);
  app.validOrder();app.element('couponInput').value='bemvindo10';app.run('applyCoupon()');
  assert.equal(app.element('cbTotal').textContent,app.run('fmt(calcTotals().total)'));
  app.run('removeCoupon()');assert.equal(app.run('couponApplied'),false);
});


test('valores são arredondados em centavos e sacola vazia não cobra frete', () => {
  const app=createApp();
  assert.equal(app.run('calcTotals().total'),0);
  app.validOrder();app.run('cart[0].qty=3;couponApplied=true');
  const t=JSON.parse(app.run('JSON.stringify(calcTotals())'));
  assert.equal(t.subtotal,104.7);assert.equal(t.discount,10.47);assert.equal(t.total,94.23);
  app.run("cart[0].unit=60;cart[0].qty=1");
  assert.equal(app.run('calcTotals().deliveryFee'),6.9,'frete grátis é calculado após desconto');
});

test('observações e modificações são exibidas como texto no carrinho e revisão', () => {
  const app=createApp();app.validOrder();
  app.run(`cart[0].obs='<img src=x onerror=alert(1)>';cart[0].extras=[{name:'Bacon extra',price:5}];cart[0].removed=['Cebola'];renderCart();renderReview()`);
  for (const id of ['cartContent','reviewItems']) {
    assert.doesNotMatch(app.element(id).innerHTML,/<img/i,id);
    assert.match(app.element(id).innerHTML,/&lt;img/,id);
    assert.match(app.element(id).innerHTML,/Bacon extra/,id);
    assert.match(app.element(id).innerHTML,/Cebola/,id);
  }
});

