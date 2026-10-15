# Roteiro de validação e apresentação

## Preparação

1. Execute `npm start` na pasta que contém `package.json`.
2. Abra `http://127.0.0.1:4173` no navegador.
3. Não use pedidos reais nos testes. A mensagem só deve ser enviada no WhatsApp se você quiser realizar um teste de contato de verdade.
4. Para limpar um pedido de teste, prepare a comanda e use **Fazer novo pedido**, confirmando a exclusão. Essa ação limpa somente a sacola deste projeto, não todos os dados do navegador.

## Cenários

### Cardápio e busca

- Confirmar as cinco categorias e os 19 produtos.
- Descer e subir o cardápio: a categoria ativa deve acompanhar a seção e ficar inteiramente visível na barra horizontal, inclusive Bebidas e Sobremesas.
- Clicar em uma categoria e depois rolar manualmente: a barra deve voltar a acompanhar a posição atual.
- Procurar `agua`: Água Mineral deve aparecer, sem precisar digitar o acento.
- Procurar `guarana`: o refrigerante com esse sabor deve aparecer.
- Digitar um termo inexistente: deve aparecer um estado sem resultados.
- Fechar o banner do cupom, buscar e limpar a busca: o banner não deve reaparecer na mesma sessão.

### Personalização e diálogo

- Abrir um produto pelo mouse, por toque e pelo teclado.
- Para uma bebida com sabores, tentar adicionar sem escolher: deve aparecer um aviso.
- Selecionar adicionais e remoções, digitar observação e alterar quantidade.
- Verificar o preço atualizado e a preservação da observação ao selecionar opções.
- Fechar pelo botão, por Escape e clicando fora.
- Usar Tab e Shift+Tab: o foco não deve sair do modal enquanto aberto e deve retornar ao controle de origem quando fechado.
- No celular, verificar que é possível rolar as opções e alcançar as ações.

### Carrinho e condições comerciais

- Adicionar uma Água Mineral com sabor escolhido, abaixo do mínimo de entrega.
- Confirmar que entrega bloqueia o avanço, mas **Retirada** está disponível e desbloqueia.
- Trocar novamente para entrega no checkout: o mínimo precisa ser verificado outra vez.
- Aumentar, diminuir e remover itens; não devem aparecer quantidades negativas.
- Aplicar `BEMVINDO10`, comparar o total com a barra e remover o cupom.
- Conferir frete e mínimo com e sem desconto; os dois consideram o valor após desconto.

### Validação e revisão

- Tentar avançar sem nome; o campo deve receber foco e uma mensagem clara.
- Para entrega, deixar rua, número ou bairro vazio; o avanço deve ser impedido.
- Deixar o telefone vazio: deve ser permitido. Informar um telefone inválido: deve ser rejeitado.
- Selecionar dinheiro e testar troco com texto e valor menor que o total.
- Deixar troco vazio: o pedido deve indicar que não precisa.
- Na revisão, conferir sabor, adicionais, ingredientes removidos, observações e totais.
- Digitar `<b>teste</b>` na observação do item: isso deve aparecer literalmente, não como marcação HTML.

### Comanda e WhatsApp

- Preparar a comanda: a tela deve dizer que está **pronta para enviar**, não que foi recebida pela loja.
- Conferir identificação, endereço ou retirada, pagamento e resumo.
- Usar **Editar pedido**: os campos e a sacola devem continuar preenchidos.
- Usar **Copiar pedido**. Se o navegador negar acesso à área de transferência, deve aparecer uma orientação de cópia manual, sem falso aviso de sucesso.
- Ao testar o botão real, conferir o destino `+55 11 99109-3901` e a mensagem. **Não pressione Enviar** se não quiser mandar uma mensagem de verdade.
- Testar observações com `#`, `&`, `+`, `%`, acentos e quebras de linha.
- Abrir o WhatsApp não deve modificar o estado local para recebido, pago ou em preparo.

### Recuperação e privacidade

- Montar uma sacola e selecionar retirada/dinheiro; recarregar a página.
- Os produtos, opções, quantidades e preferências devem voltar.
- Nome, telefone, endereço e todas as observações devem permanecer fora do rascunho salvo pelo projeto.
- Na confirmação, iniciar outro pedido e cancelar: o pedido deve permanecer.
- Confirmar o início de outro pedido: limpar sacola, cupom, campos e restaurar entrega/Pix na interface.
- Testar armazenamento bloqueado: a compra de demonstração deve continuar em memória, com aviso de que a sacola não pôde ser salva.

### Responsividade

- Conferir catálogo em duas colunas no computador e uma coluna no celular.
- Testar larguras de 320 px, 390 px, 768 px e 1440 px.
- Verificar todas as telas, não apenas o cardápio: sem rolagem horizontal, campos legíveis e botões alcançáveis.
- Testar todas as telas também com observação de 300 caracteres e endereço no limite permitido, sem espaços: o texto precisa quebrar linha sem alargar a página.
- Na comanda pronta, conferir que cada linha do resumo permanece separada visualmente.
- Ativar movimento reduzido no sistema/navegador e conferir que as animações não são obrigatórias para usar o site.

## Teste de fluxo executável no navegador

`tests/browser-flow.js` contém uma expressão assíncrona que verifica os cenários principais na página já carregada. Ela intercepta `window.open`: não abre nem envia uma conversa real, e restaura a função ao terminar. Também intercepta a confirmação de exclusão durante o teste e limpa somente a sacola de demonstração desta origem.

Para executá-la manualmente, use uma aba de teste, abra as ferramentas de desenvolvedor, revise o arquivo e execute seu conteúdo no console. O resultado tem `passed`, uma lista de cenários e `realMessageSent: false`. Não execute em uma aba contendo um pedido que você queira preservar.

Os resultados de validação automatizada no navegador ficam em `docs/validacao-browser.json`. O arquivo é evidência dos cenários executados, não garantia de compatibilidade com todo navegador ou dispositivo. Foram usadas emulação de viewport e interação no navegador local; um teste em telefone físico e com leitor de tela ainda é recomendado antes de uso público.

## Sugestão de demonstração para a banca

Mostre uma busca, uma personalização, a aplicação do cupom, a escolha de retirada/entrega, a validação de troco e a comanda pronta. Explique que a arquitetura é frontend estático e que o envio final é uma ação do cliente no WhatsApp. Apresente testes e regras comerciais e separe claramente as funcionalidades implementadas das evoluções propostas no README.
