'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const products = vm.runInNewContext(fs.readFileSync(path.join(root, 'data/menu.js'), 'utf8') + '\nPRODUCTS');

test('all 19 menu products have individual, safe, accessible SVG artwork', () => {
  assert.equal(products.length, 19);
  const hashes = new Set();
  const geometry = new Set();
  for (const product of products) {
    const file = path.join(root, 'assets/products', `${product.id}.svg`);
    assert.ok(fs.existsSync(file), `Missing artwork: ${product.id}`);
    const svg = fs.readFileSync(file, 'utf8');
    assert.ok(Buffer.byteLength(svg) < 30000, `${product.id}: asset should stay below 30 KB`);
    assert.match(svg, /viewBox="0 0 320 320"/);
    assert.match(svg, /<svg[^>]+xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    assert.match(svg, /xml:lang="pt-BR"/);
    assert.match(svg, /<title id="title">[^<]+<\/title>/);
    assert.match(svg, /<desc id="desc">[^<]+<\/desc>/);
    assert.ok(svg.includes(product.name), `${product.id}: accessible product title`);
    assert.match(svg, /aria-labelledby="title desc"/);
    assert.doesNotMatch(svg, /<\s*(script|foreignObject|image|text|use|iframe)\b|\son\w+\s*=|(?:xlink:)?href\s*=|<!DOCTYPE|<!ENTITY/i);
    assert.doesNotMatch(svg, /url\(\s*["']?(?!#)/i);
    assert.doesNotMatch(svg, /[\p{Extended_Pictographic}]/u);
    assert.match(svg, /<path\s/);
    hashes.add(crypto.createHash('sha256').update(svg).digest('hex'));
    geometry.add(Array.from(svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/g), m => m[1]).join('|'));
  }
  assert.equal(hashes.size, 19, 'Every SVG must be unique');
  assert.equal(geometry.size, 19, 'Recipes must differ in geometry, not only color/title');
  // A decodificação completa dos SVGs é verificada no navegador por browser-product-images.js.
  // A suíte Node permanece independente de Python ou executáveis externos.
});
