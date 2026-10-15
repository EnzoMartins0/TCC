'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '../css/cart-checkout.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

// Read explicit component declarations, including later overrides and grouped selectors.
// These are static regression guards; actual overflow needs browser verification.
function declarationsFor(selector) {
  const declarations = {};
  for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!rule[1].split(',').map(value => value.trim()).includes(selector)) continue;
    for (const declaration of rule[2].split(';')) {
      const colon = declaration.indexOf(':');
      if (colon === -1) continue;
      declarations[declaration.slice(0, colon).trim()] = declaration.slice(colon + 1).trim();
    }
  }
  return declarations;
}

test('cart observations allow unbroken text to wrap inside the item', () => {
  assert.equal(declarationsFor('.row-info')['min-width'], '0');
  assert.equal(declarationsFor('.row-mods')['overflow-wrap'], 'anywhere');
});

test('review item observations allow unbroken text to wrap', () => {
  assert.equal(declarationsFor('.order-item-meta')['overflow-wrap'], 'anywhere');
});

test('review delivery blocks allow addresses without spaces to wrap', () => {
  assert.equal(declarationsFor('.review-block')['overflow-wrap'], 'anywhere');
});

test('confirmation summary preserves textContent newlines while allowing long lines to wrap', () => {
  const summary = declarationsFor('.confirm-summary');
  assert.equal(summary['overflow-wrap'], 'anywhere');
  assert.equal(summary['white-space'], 'pre-wrap');
});
