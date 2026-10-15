/* Execute na página de teste: limpa apenas a sacola desta origem isolada.
   Não abre WhatsApp, não envia pedidos nem acessa a área de transferência. */
(async()=>{
 const results=[];const originalConfirm=window.confirm;const originalOpen=window.open;
 const check=(condition,message)=>{if(!condition)throw new Error(message);};
 const record=async(name,fn)=>{try{await fn();results.push({name,passed:true});}catch(error){results.push({name,passed:false,error:error.message});}};
 const icon=(selector,name)=>{const node=document.querySelector(selector);check(node&&node.querySelector(`svg[data-svg-icon="${name}"]`),`SVG ${name} ausente em ${selector}`);};
 const noOverflow=()=>check(document.documentElement.scrollWidth<=innerWidth,'Rolagem horizontal na página');
 const noEmoji=()=>check(!/\p{Extended_Pictographic}|\uFE0F/u.test(document.body.innerText),'Emoji na interface');
 let opened=null;window.confirm=()=>true;window.open=(...args)=>{opened=args;return null;};
 try{
  newOrder();
  await record('SVGs estáticos locais, decorativos e controles com nomes',()=>{
   check([...document.querySelectorAll('[data-icon]')].every(node=>node.querySelector('svg.ui-icon')),'Placeholder sem SVG');
   icon('.logo-badge','flame');icon('.search-box','search');icon('#ribbon','ticket');
   for(const selector of ['[data-pay="Pix"]','[data-pay="Cartão de Crédito"]','[data-pay="Dinheiro"]'])check(document.querySelector(selector+' svg.ui-icon'),'Pagamento sem ícone');
   check([...document.querySelectorAll('svg.ui-icon')].every(node=>node.namespaceURI==='http://www.w3.org/2000/svg'&&node.getAttribute('aria-hidden')==='true'&&node.getAttribute('focusable')==='false'),'SVG inacessível ou namespace incorreto');
   check([...document.querySelectorAll('button')].filter(node=>node.getClientRects().length&&getComputedStyle(node).visibility!=='hidden').every(node=>node.getAttribute('aria-label')||node.textContent.trim()),'Botão visível perdeu nome acessível');
   noEmoji();noOverflow();
  });
  await record('busca e sacola vazias usam SVG',()=>{
   const input=document.getElementById('searchInput');input.value='sem resultado 987654';onSearch();icon('#emptySearch','search');input.value='';onSearch();
   openCart();icon('.empty-cart','bag');noOverflow();showScreen('menu');
  });
  await record('modal e opções com checks vetoriais preservam interação',()=>{
   document.querySelector('[data-product-id="p1"]').click();icon('#modalClose','close');
   icon('.sheet-footer .stepper button:first-child','minus');icon('.sheet-footer .stepper button:last-child','plus');
   const option=[...document.querySelectorAll('[data-option="extras"]')].find(node=>node.dataset.value==='Bacon extra');option.click();
   check(option.getAttribute('aria-checked')==='true','Extra não selecionado');icon('[data-option="extras"].checked .ck','check');
   check(getComputedStyle(option.querySelector('svg')).opacity==='1','Check selecionado invisível');
   document.getElementById('mObs').value='<img src=x onerror=alert(1)> & #';document.getElementById('mAddBtn').click();openCart();
   check(!document.querySelector('.row-mods img'),'Observação virou HTML');
   for(const name of ['minus','plus','trash','delivery','store'])icon('#cartContent',name);
   document.querySelector('[data-cart-action="increase"]').click();check(cart[0].qty===2,'Quantidade não mudou');noEmoji();noOverflow();
  });
  await record('checkout, pagamento e revisão mantêm SVG e texto seguro',()=>{
   check(goCheckout(),'Checkout bloqueado');
   const fields={fNome:'Cliente SVG',fRua:'Rua '+ 'a'.repeat(110),fNumero:'123',fBairro:'b'.repeat(80),fComplemento:'<svg onload=alert(1)>',fObsGeral:'Teste # & + 50% e literal %0A'};
   for(const [id,value] of Object.entries(fields))document.getElementById(id).value=value;
   nextStep();check(checkoutStepN===2,'Pagamento não abriu');document.querySelector('[data-pay="Dinheiro"]').click();document.getElementById('fTroco').value='200,00';
   nextStep();check(checkoutStepN===3,'Revisão não abriu');icon('#reviewDelivery','delivery');icon('#reviewPayment','cash');icon('#btnNext','receipt');
   check(document.querySelector('#reviewDelivery').textContent.includes('<svg onload=alert(1)>'),'Endereço não preservado como texto');check(!document.querySelector('#reviewDelivery [onload]'),'Endereço virou marcação');
   const before=document.getElementById('reviewPayment').textContent;renderReview();check(document.querySelectorAll('#reviewPayment svg').length===1&&document.getElementById('reviewPayment').textContent===before,'Renderização repetida duplicou ícone/texto');
   noEmoji();noOverflow();
   setDeliveryType('retirada');setPayment('Pix');renderReview();icon('#reviewDelivery','store');icon('#reviewPayment','pix');
   for(const method of ['Cartão de Crédito','Cartão de Débito']){setPayment(method);renderReview();icon('#reviewPayment','card');}
   setDeliveryType('entrega');setPayment('Dinheiro');renderReview();
  });
  await record('comanda permanece texto sem SVG e WhatsApp preserva mensagem',()=>{
   check(finalizeOrder(),'Comanda não preparada');icon('#btnWhatsApp','phone-chat');icon('#btnCopyOrder','copy');icon('#btnEditOrder','edit');
   check(lastOrder.status==='draft'&&cart.length===1,'Estado da comanda alterado');
   const message=buildOrderMessage(lastOrder);check(!message.includes('data-svg-icon')&&!message.includes('xmlns='),'SVG vazou para a comanda');
   sendWhatsApp();check(opened&&new URL(opened[0]).searchParams.get('text')===message,'Mensagem WhatsApp alterada');
   noEmoji();noOverflow();
  });
  newOrder();
  return {passed:results.every(result=>result.passed),viewport:{width:innerWidth,height:innerHeight},results,realMessageSent:false};
 }finally{window.confirm=originalConfirm;window.open=originalOpen;}
})()
