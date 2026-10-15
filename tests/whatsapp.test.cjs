const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./helpers.cjs');

test('bloqueio da área de transferência informa falha sem apagar a comanda', async () => {
 const app=createApp();app.validOrder();app.run('finalizeOrder()');
 app.context.navigator.clipboard.writeText=async()=>{throw new Error('Permissão negada');};
 assert.equal(await app.run('copyOrderMessage()'),false);
 assert.match(app.element('toast').textContent,/Não foi possível copiar/);
 assert.equal(app.run('cart.length'),1);assert.ok(app.run('lastOrder'));
});


test('WhatsApp preserva a comanda inteira, caracteres especiais e número do destinatário', () => {
  const app=createApp();app.validOrder();
  app.element('fObsGeral').value='Sem cebola & molho # separado + 50% e %0A';
  app.run('finalizeOrder();sendWhatsApp()');
  const [address,target,features]=app.context.opened;const url=new URL(address);
  assert.equal(url.pathname,'/5511991093901');assert.equal(url.hash,'');
  assert.equal(url.searchParams.get('text'),app.run('buildOrderMessage(lastOrder)'));
  assert.match(url.searchParams.get('text'),/Sem cebola & molho # separado \+ 50% e %0A/);
  assert.equal(target,'_blank');assert.equal(features,'noopener,noreferrer');
  assert.equal(app.run('lastOrder.status'),'draft');
});

test('copiar comanda e voltar para edição preservam o pedido sem enviar mensagem', async () => {
  const app=createApp();app.validOrder();app.run('finalizeOrder()');
  let copied='';app.context.navigator.clipboard.writeText=async value=>{copied=value;};
  assert.equal(await app.run('copyOrderMessage()'),true);
  assert.match(copied,/Ana Silva/);assert.equal(app.context.opened,undefined);
  app.run('editOrder()');
  assert.equal(app.run('cart.length'),1);
  assert.equal(app.element('fNome').value,'Ana Silva');
  assert.equal(app.run('checkoutStepN'),1);
});
