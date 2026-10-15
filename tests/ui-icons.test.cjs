const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const {createApp}=require('./helpers.cjs');

test('biblioteca de ícones gera SVGs locais decorativos e rejeita nomes desconhecidos',()=>{
 const file=path.join(root,'js/icons.js');assert.ok(fs.existsSync(file),'Biblioteca SVG ausente');
 const app=vm.createContext({});vm.runInContext(fs.readFileSync(file,'utf8'),app);
 const names=vm.runInContext('Object.keys(UI_ICONS)',app);
 for(const name of names){
  const svg=vm.runInContext(`iconHtml(${JSON.stringify(name)})`,app);
  assert.match(svg,/^<svg/);assert.match(svg,/viewBox="0 0 24 24"/);assert.match(svg,/aria-hidden="true"/);assert.match(svg,/focusable="false"/);
  assert.doesNotMatch(svg,/<script|foreignObject|href=|\son\w+=|\p{Extended_Pictographic}/u);
 }
 for(const name of ['__proto__','toString','<img onerror=alert(1)>']) assert.equal(vm.runInContext(`iconHtml(${JSON.stringify(name)})`,app),'');
 assert.ok(names.includes('flame')&&names.includes('delivery')&&names.includes('card')&&names.includes('close'));
});

test('cardápio usa SVG nas categorias e no controle de adicionar',()=>{
 const app=createApp();app.run('buildMenu()');
 assert.match(app.element('catnav').innerHTML,/data-svg-icon="flame"/);
 assert.match(app.element('sections').innerHTML,/data-svg-icon="plus"/);
 assert.doesNotMatch(app.element('catnav').innerHTML,/\p{Extended_Pictographic}/u);
});

test('sacola mantém controles nomeados e usa SVG no recebimento, quantidade e estado vazio',()=>{
 const app=createApp();app.validOrder();app.run('renderCart()');
 for(const icon of ['minus','plus','delivery','store','trash']) assert.ok(app.element('cartContent').innerHTML.includes(`data-svg-icon="${icon}"`),`Ícone ausente: ${icon}`);
 assert.match(app.element('cartContent').innerHTML,/aria-label="Diminuir quantidade de/);
 app.run('cart=[];renderCart()');assert.match(app.element('cartContent').innerHTML,/data-svg-icon="bag"/);
});

test('textos e catálogo de produção não guardam emojis usados como ícones',()=>{
 const files=['index.html',...['data','js','css'].flatMap(dir=>fs.readdirSync(path.join(root,dir)).filter(file=>/\.(?:js|css)$/.test(file)).map(file=>dir+'/'+file))];
 for(const file of files) assert.doesNotMatch(fs.readFileSync(path.join(root,file),'utf8'),/\p{Extended_Pictographic}|\uFE0F/u,file);
});

test('rótulos vetoriais preservam texto como texto, inclusive conteúdo malicioso',()=>{
 const app=createApp();assert.equal(app.run('typeof setIconText'),'function');
 const text='<img src=x onerror=alert(1)> & nome #';
 app.run(`setIconText(document.getElementById('toast'),'info',${JSON.stringify(text)})`);
 assert.equal(app.element('toast').textContent,text);
 assert.match(app.element('toast').innerHTML,/data-svg-icon="info"/);
 assert.doesNotMatch(app.element('toast').innerHTML,/<img|onerror/);
});
