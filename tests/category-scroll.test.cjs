const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./helpers.cjs');

test('rolagem identifica a seção pela posição atual ao descer, subir e chegar ao final', () => {
  const app=createApp();
  app.element('screen-menu');
  app.context.innerHeight=844;
  app.context.scrollY=0;
  app.context.document.documentElement={scrollHeight:4000};
  const nav=app.element('catnav');nav.scrollWidth=390;nav.clientWidth=390;
  nav.getBoundingClientRect=()=>({bottom:72,height:72,left:0,right:390});
  const ids=['promo','lanches','porcoes','bebidas','sobremesas'];
  const positions=[600,1200,2000,2800,3400];
  const sections=ids.map((id,index)=>{
    const section=app.element('cat-'+id);section.dataset.cat=id;
    section.getBoundingClientRect=()=>({top:positions[index]-app.context.scrollY});return section;
  });
  const pills=ids.map(id=>app.element('pill-'+id));
  const original=app.context.document.querySelectorAll;
  app.context.document.querySelectorAll=selector=>selector==='.cat-section'?sections:selector==='.catpill'?pills:original(selector);
  for(const [position,expected] of [[2708,'bebidas'],[1908,'porcoes'],[1108,'lanches'],[0,'promo'],[3156,'sobremesas']]) {
    app.context.scrollY=position;app.run('updateActiveCategoryFromScroll()');
    assert.equal(pills.find(pill=>pill.classList.contains('active')).id,'pill-'+expected);
  }
  app.element('searchInput').value='agua';app.context.scrollY=0;app.run('updateActiveCategoryFromScroll()');
  assert.ok(pills[4].classList.contains('active'),'busca não altera categoria enquanto a barra está oculta');
});

test('clique em categoria perto do fim respeita o limite da página sem trocar o destaque', () => {
  const app=createApp();app.element('screen-menu');
  app.context.innerHeight=1000;app.context.scrollY=0;
  app.context.document.documentElement={scrollHeight:2000};
  const nav=app.element('catnav');nav.scrollWidth=660;nav.clientWidth=1440;
  nav.getBoundingClientRect=()=>({bottom:72,height:72,left:0,right:1440});
  const ids=['promo','lanches','porcoes','bebidas','sobremesas'];
  const tops=[100,400,800,1200,1600];
  const sections=ids.map((id,index)=>{const el=app.element('cat-'+id);el.dataset.cat=id;el.getBoundingClientRect=()=>({top:tops[index]-app.context.scrollY});return el;});
  const pills=ids.map(id=>app.element('pill-'+id));
  const original=app.context.document.querySelectorAll;
  app.context.document.querySelectorAll=selector=>selector==='.cat-section'?sections:selector==='.catpill'?pills:original(selector);
  app.context.scrollTo=({top})=>{app.context.scrollY=top;};
  app.run("scrollToCat('bebidas');updateActiveCategoryFromScroll()");
  assert.equal(app.context.scrollY,1000,'destino limitado à altura máxima da página');
  assert.ok(pills[3].classList.contains('active'),'clique mantém Bebidas mesmo quando o destino é o fim');
  app.context.scrollY=900;app.run('updateActiveCategoryFromScroll()');
  assert.ok(pills[2].classList.contains('active'),'ao rolar manualmente, volta a acompanhar a posição');
});

test('categoria ativa fora da barra fica visível sem mover a página verticalmente', () => {
  const app = createApp();
  const nav = app.element('catnav');
  nav.scrollLeft = 0; nav.clientWidth = 390; nav.scrollWidth = 660;
  nav.getBoundingClientRect = () => ({ left: 0, right: 390, top: 0, bottom: 72, height: 72 });
  const categories = ['promo','lanches','porcoes','bebidas','sobremesas'].map(id => app.element('pill-' + id));
  categories[0].classList.add('active');
  categories.forEach((button,index) => {
    button.getBoundingClientRect = () => ({ left: index * 132 - nav.scrollLeft, right: (index + 1) * 132 - nav.scrollLeft });
  });
  const originalQuery = app.context.document.querySelectorAll;
  app.context.document.querySelectorAll = selector => selector === '.catpill' ? categories : originalQuery(selector);
  let pageScrolls = 0; let horizontalScrolls = 0;
  app.context.scrollTo = () => { pageScrolls++; };
  nav.scrollTo = ({left}) => { horizontalScrolls++; nav.scrollLeft = left; };
  app.run("setActiveCategory('bebidas')");
  const rect = categories[3].getBoundingClientRect();
  assert.ok(rect.left >= 0 && rect.right <= 390, 'Bebidas deve estar inteira na barra');
  assert.equal(pageScrolls,0,'não usar scrollIntoView que desloca a página');
  app.run("setActiveCategory('bebidas')");
  assert.equal(horizontalScrolls,1,'categoria já selecionada não deve reiniciar a animação');
  app.run("setActiveCategory('promo')");
  assert.equal(nav.scrollLeft,0,'ao voltar ao início, a barra acompanha');
});
