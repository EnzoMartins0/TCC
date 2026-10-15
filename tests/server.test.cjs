const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const http = require('node:http');

test('servidor local serve o site sem expor testes, diretórios ou aceitar escrita', async () => {
  const { createStaticServer } = require('../scripts/serve.cjs');
  const server=createStaticServer(path.resolve(__dirname,'..'));
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  try {
    const page=await fetch(base);assert.equal(page.status,200);assert.match(await page.text(),/Brasa Lanches/);
    const css=await fetch(base+'/css/base.css');assert.match(css.headers.get('content-type'),/text\/css/);
    assert.equal((await fetch(base+'/tests/helpers.cjs')).status,404);
    assert.equal((await fetch(base,{method:'POST',body:'test'})).status,405);
    const status=await new Promise((resolve,reject)=>{http.get(base+'/%2e%2e%2fpackage.json',res=>{res.resume();resolve(res.statusCode);}).on('error',reject);});
    assert.equal(status,403);
  } finally { await new Promise(resolve=>server.close(resolve)); }
});
