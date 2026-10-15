/* Executar na página em uma aba de teste. Limpa somente a sacola demonstrativa.
   Verifica todos os arquivos locais e a integração, sem abrir o WhatsApp. */
(async () => {
  const results=[];
  const originalConfirm=window.confirm;
  const assert=(condition,message)=>{if(!condition)throw new Error(message);};
  const check=async(name,fn)=>{
    try {await fn();results.push({name,passed:true});}
    catch(error){results.push({name,passed:false,error:error.message});}
  };
  const loaded=[];
  // O teste também deve concluir em abas em segundo plano, sem aguardar lazy loading visível.
  const decodeImage=image=>{
    image.loading='eager';
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('Tempo esgotado ao carregar '+image.getAttribute('src'))),3000);
      image.decode().then(()=>{clearTimeout(timer);resolve();},error=>{clearTimeout(timer);reject(error);});
    });
  };
  try {
    window.confirm=()=>true;newOrder();
    await check('todos os 19 produtos carregam imagens locais diferentes',async()=>{
      const cards=[...document.querySelectorAll('.product-card')];
      assert(cards.length===PRODUCTS.length,'Quantidade incorreta de produtos');
      await Promise.all(cards.map(async card=>{
        const image=card.querySelector('img.product-illustration');
        assert(image,'Produto sem imagem: '+card.dataset.productId);
        await decodeImage(image);
        assert(image.naturalWidth>0&&image.naturalHeight>0,'Imagem inválida');
        assert(new URL(image.src).origin===location.origin,'Imagem depende de origem externa');
        assert(image.getAttribute('alt')==='','Miniatura decorativa não deve repetir o nome do botão');
        loaded.push({productId:card.dataset.productId,src:image.getAttribute('src'),width:image.naturalWidth,height:image.naturalHeight});
      }));
      assert(new Set(loaded.map(item=>item.src)).size===PRODUCTS.length,'Imagens compartilhadas indevidamente');
    });
    await check('imagem do detalhe corresponde ao produto e tem descrição acessível',async()=>{
      const card=document.querySelector('[data-product-id="p1"]');card.focus();card.click();
      const image=document.querySelector('#mPic img');await decodeImage(image);
      assert(image.getAttribute('src')===PRODUCTS[0].image,'Detalhe com imagem errada');
      assert(image.alt===PRODUCTS[0].imageAlt,'Descrição alternativa ausente');
      assert(image.getBoundingClientRect().width>card.querySelector('img').getBoundingClientRect().width,'Detalhe não amplia a imagem');
    });
    await check('falha de imagem não impede adicionar à sacola',async()=>{
      const image=document.querySelector('#mPic img');image.dispatchEvent(new Event('error'));
      assert(document.getElementById('mPic').classList.contains('image-unavailable'),'Fallback ausente');
      assert(getComputedStyle(document.querySelector('#mPic .product-image-fallback')).display==='flex','Fallback não está visível');
      document.getElementById('mAddBtn').click();openCart();
      const cartImage=document.querySelector('#cartContent img');await decodeImage(cartImage);
      assert(cartImage.getAttribute('src')===PRODUCTS[0].image,'Sacola com imagem errada');
      assert(cart.length===1,'Pedido não foi mantido');
    });
    await check('abrir outro produto elimina estado de imagem indisponível',async()=>{
      showScreen('menu');openProduct('p2');const image=document.querySelector('#mPic img');await decodeImage(image);
      assert(!document.getElementById('mPic').classList.contains('image-unavailable'),'Erro antigo permaneceu');
      assert(!image.hidden,'Nova imagem está escondida');closeProduct();
    });
    await check('imagens não causam rolagem horizontal',()=>{
      for(const screen of ['menu','cart','checkout']){
        if(screen==='cart')renderCart();showScreen(screen);
        assert(document.documentElement.scrollWidth<=innerWidth,'Overflow na tela '+screen);
      }
      showScreen('menu');openProduct('p1');
      assert(document.getElementById('sheet').scrollWidth<=innerWidth,'Overflow no modal');closeProduct();
    });
    newOrder();
    return {passed:results.every(result=>result.passed),viewport:{width:innerWidth,height:innerHeight},images:loaded.sort((a,b)=>Number(a.productId.slice(1))-Number(b.productId.slice(1))),results,realMessageSent:false};
  } finally {window.confirm=originalConfirm;}
})()
