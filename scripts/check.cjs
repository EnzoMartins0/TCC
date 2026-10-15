const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const vm = require('node:vm');
const root=path.resolve(__dirname,'..');
let failures=0;
for(const folder of ['js','data','scripts','tests']) {
  for(const name of fs.readdirSync(path.join(root,folder))) {
    if(!/\.(?:js|cjs)$/.test(name)) continue;
    const file=path.join(root,folder,name);
    const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
    if(result.status!==0) { failures++;console.error(result.stderr || result.error || `Falha: ${file}`); }
  }
}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const [index,match] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries()) {
  if(/\bsrc=/.test(match[1])) continue;
  try { new vm.Script(match[2],{filename:`index.html:inline-${index}`}); }
  catch(error) { failures++;console.error(error.message); }
}
for(const match of html.matchAll(/(?:src|href)="((?:js|data|css)\/[^"?#]+)"/g)) {
  if(!fs.existsSync(path.join(root,match[1]))) { failures++;console.error(`Referência ausente: ${match[1]}`); }
}
console.log(failures ? `${failures} falha(s) de sintaxe ou referências.` : 'Sintaxe JavaScript e referências locais: OK.');
process.exitCode=failures?1:0;
