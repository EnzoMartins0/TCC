const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./helpers.cjs');

test('dados adulterados não restauram preços, nomes, quantidades ou ingredientes arbitrários', () => {
  const app=createApp();
  const seed={version:1,savedAt:Date.now(),items:[{productId:'p1',qty:2,unit:0,name:'<img>',extras:['Bacon extra','Item inexistente'],removed:['Cebola','Inexistente']},{productId:'p1',qty:-1},{productId:'nao-existe',qty:1}],deliveryType:'hacker',paymentMethod:'hacker'};
  app.storage.set('brasa-lanches:draft:v1',JSON.stringify(seed));app.run('restoreDraft()');
  assert.equal(app.run('cart.length'),1);assert.equal(app.run('cart[0].unit'),39.9);
  assert.equal(app.run('cart[0].name'),'Combo X-Brasa Duplo');
  assert.equal(app.run('cart[0].extras.length'),1);
  assert.equal(app.run('paymentMethod'),'Pix');assert.equal(app.run('deliveryType'),'entrega');
});

test('rascunho corrompido, expirado ou storage indisponível não interrompe o site', () => {
  for(const raw of ['{',JSON.stringify({version:1,savedAt:0,items:[]})]) {
    const app=createApp({'brasa-lanches:draft:v1':raw});
    assert.doesNotThrow(()=>app.run('restoreDraft()'));assert.equal(app.run('cart.length'),0);
  }
  const app=createApp();app.validOrder();app.context.localStorage.setItem=()=>{throw new Error('Quota');};
  assert.equal(app.run('persistDraft()'),false);assert.equal(app.run('cart.length'),1);
});


test('sacola sobrevive a recarga sem persistir identidade, endereço, preço ou observações', () => {
  const app=createApp();app.validOrder();
  app.run("cart[0].extras=[{name:'Bacon extra',price:5}];cart[0].unit=39.9;cart[0].obs='informação privada';persistDraft()");
  const serialized=[...app.storage.values()].join('');
  assert.ok(serialized);
  for (const forbidden of ['Ana Silva','11991093901','Rua Teste','informação privada','39.9']) assert.equal(serialized.includes(forbidden),false,forbidden);
  const restored=createApp(Object.fromEntries(app.storage));restored.run('restoreDraft()');
  assert.equal(restored.run('cart.length'),1);
  assert.equal(restored.run('cart[0].unit'),39.9);
  assert.equal(restored.run('cart[0].obs'),'');
});
