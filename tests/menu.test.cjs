const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./helpers.cjs');

test('remoções são específicas da receita e não oferecem ingredientes ausentes', () => {
 const app=createApp();
 assert.equal(app.run("PRODUCTS.find(p=>p.id==='p5').remove.includes('Tomate')"),false);
 assert.equal(app.run("PRODUCTS.find(p=>p.id==='p1').remove.includes('Cheddar')"),true);
 assert.equal(app.run("PRODUCTS.find(p=>p.id==='p7').remove.includes('Rúcula')"),true);
});


test('busca encontra produtos por acentos e sabores e cartões são botões sem botões aninhados', () => {
  const app=createApp();
  assert.match(app.run('productCardHtml(PRODUCTS[0])'),/^\s*<button/);
  assert.equal((app.run('productCardHtml(PRODUCTS[0])').match(/<button/g)||[]).length,1);
  assert.equal(app.run("matchesProduct(PRODUCTS.find(p=>p.id==='p15'),'agua')"),true);
  assert.equal(app.run("matchesProduct(PRODUCTS.find(p=>p.id==='p13'),'guarana')"),true);
  assert.equal(app.run("matchesProduct(PRODUCTS[0],'inexistente')"),false);
});
