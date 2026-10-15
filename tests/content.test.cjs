const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./helpers.cjs');

test('conteúdo identifica demonstração e não promete prazo, recebimento ou desconto exclusivo de primeira compra', () => {
  const app=createApp();
  assert.match(app.run('CONFIG.storeStatus'),/demonstrativo/i);
  assert.doesNotMatch(app.run('CONFIG.confirmSubtitle'),/recebido|cozinha/i);
  assert.doesNotMatch(app.run('STRINGS.couponBanner(CONFIG.couponCode,10)'),/primeiro pedido/i);
  assert.match(app.run('STRINGS.checkoutPickupNote'),/combinar|confirme/i);
  assert.match(app.run('STRINGS.heroStrip(60,20)'),/a partir.*após desconto/i);
});
