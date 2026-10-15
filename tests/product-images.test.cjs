const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./helpers.cjs');
const fs=require('node:fs');
const path=require('node:path');

test('estilos preservam a proporção das imagens e escondem o fallback até ocorrer falha', () => {
 const css=fs.readFileSync(path.join(__dirname,'../css/base.css'),'utf8');
 assert.ok(/\.product-illustration\s*\{[^}]*object-fit:\s*contain/s.test(css),'imagem não pode ficar esticada');
 assert.ok(/\.product-image-fallback\s*\{[^}]*display:\s*none/s.test(css),'alternativa não deve aparecer junto da imagem');
 assert.ok(/\.image-unavailable[^}]*display:\s*flex/s.test(css),'alternativa deve aparecer em caso de erro');
});


test('imagem indisponível mostra alternativa discreta sem travar o pedido', () => {
  const app=createApp();const image=app.element('test-image'),media=app.element('mPic');
  image.classList.add('product-illustration');media.classList.add('product-media');image.parentElement=media;
  app.context.testImage=image;
  app.run('handleProductImageError({target:testImage})');
  assert.equal(image.hidden,true);
  assert.ok(media.classList.contains('image-unavailable'));
  app.run("openProduct('p1')");
  assert.equal(media.classList.contains('image-unavailable'),false,'próximo produto deve tentar a imagem normalmente');
  app.run('addToCart()');assert.equal(app.run('cart.length'),1);
});

test('imagem da sacola vem do catálogo e não aceita URL externa ou atributos injetados', () => {
  const app=createApp();app.validOrder();app.run(`cart[0].image='https://example.invalid/pixel';renderCart()`);
  assert.doesNotMatch(app.element('cartContent').innerHTML,/example\.invalid/);
  assert.match(app.element('cartContent').innerHTML,/assets\/products\/p1\.svg/);
  app.run(`PRODUCTS[0].imageAlt='Ilustração "teste" <b>texto</b>'`);
  assert.match(app.run("productImageHtml(PRODUCTS[0],'detail')"),/&quot;teste&quot; &lt;b&gt;/);
  app.run(`PRODUCTS[0].image='javascript:alert(1)'`);
  assert.equal(app.run('productImageHtml(PRODUCTS[0])'),'');
});


test('a mesma ilustração aparece no cardápio, detalhe e sacola', () => {
  const app=createApp();
  const card=app.run('productCardHtml(PRODUCTS[0])');
  assert.match(card,/<img[^>]*src="assets\/products\/p1\.svg"/);
  app.run("openProduct('p1')");
  assert.match(app.element('mPic').innerHTML,/<img[^>]*src="assets\/products\/p1\.svg"/);
  assert.match(app.element('mPic').innerHTML,/alt="Ilustração /);
  app.run('addToCart();openCart()');
  assert.match(app.element('cartContent').innerHTML,/<img[^>]*src="assets\/products\/p1\.svg"/);
  assert.doesNotMatch(card,/🍔/);
});


test('os 19 produtos têm uma ilustração local própria e descrição em português', () => {
  const app=createApp();
  const products=JSON.parse(app.run('JSON.stringify(PRODUCTS)'));
  assert.equal(products.length,19);
  for (const product of products) {
    assert.equal(product.image,`assets/products/${product.id}.svg`,product.name);
    assert.match(product.imageAlt,/^Ilustração /,product.name);
  }
  assert.equal(new Set(products.map(product=>product.image)).size,products.length);
});
