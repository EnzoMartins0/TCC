# Brasa Lanches — projeto de TCC

Cardápio digital responsivo para uma única lanchonete, com personalização de produtos, sacola e preparação de uma comanda para envio pelo WhatsApp. HTML, CSS e JavaScript puro; sem dependências de produção e sem etapa de build.

> **Projeto demonstrativo.** Loja, produtos, preços, endereço e condições comerciais são exemplos. O número de destino foi configurado pelo responsável pelo projeto. Não há processamento de pagamento, recebimento automático ou integração com a cozinha.

## Executar

Com Node.js 22 ou superior instalado, abra o terminal nesta pasta (a que contém `index.html`):

```sh
npm start
```

Abra `http://127.0.0.1:4173`. Encerre com **Ctrl+C**. Não é necessário executar `npm install`: não há pacotes externos. O servidor atende somente a interface e seus recursos, em loopback, e não aceita escrita. Ele é uma ferramenta de desenvolvimento, não um backend de pedidos nem um servidor para publicar na internet.

Também é possível abrir `index.html` diretamente no navegador. Prefira o servidor para testar armazenamento e cópia da comanda de forma consistente. O armazenamento de `file://` é separado do endereço HTTP.

## Verificações

```sh
npm test
npm run check
```

A suíte usa `node:test`, sem downloads. Os testes de lógica executam o código real em um contexto isolado com um adaptador DOM mínimo. Testes estáticos verificam a estrutura da interface. Esses testes não substituem a verificação visual e de teclado em um navegador real. O teste do servidor faz requisições somente a uma porta local temporária e a fecha ao terminar.

## O que o sistema faz

- Lista os produtos por categoria e pesquisa por nome, descrição e sabores, ignorando acentos.
- Sincroniza a categoria ativa com a rolagem e desloca somente a barra horizontal para manter o botão selecionado visível no celular.
- Permite escolher sabor, adicionais, remoções e observações por produto.
- Exige escolha explícita quando o produto possui sabores.
- Calcula valores em centavos, aplica/remove cupom e atualiza o resumo e a barra da sacola.
- Permite escolher entrega ou retirada antes da verificação de pedido mínimo.
- Valida identificação, endereço de entrega e troco, com mensagens junto ao fluxo.
- Mostra os detalhes das personalizações na revisão.
- Prepara um resumo identificado, permite voltar para edição ou copiar a comanda.
- Abre o WhatsApp com a mensagem completa e codificada para o número configurado.
- Mantém a sacola até o usuário decidir começar outro pedido; pede confirmação antes de descartá-la.
- Salva uma versão limitada da sacola neste navegador, por até sete dias de inatividade.

## Fluxo e limites do WhatsApp

**Cardápio → sacola → identificação/recebimento → pagamento → revisão → comanda pronta → abrir WhatsApp.**

O botão não envia automaticamente. O cliente ainda precisa tocar em **Enviar** no WhatsApp. Abrir a conversa não prova envio, leitura, recebimento, disponibilidade do produto ou aceite da loja. O resumo é um **rascunho local**, não um pedido registrado no servidor. A referência do pedido é local; não é um protocolo de atendimento da lanchonete.

Pix, cartões e dinheiro são preferências informadas na comanda. O site não coleta dados de cartão, gera cobrança Pix ou confirma pagamento. Prazo, área de entrega, disponibilidade e pagamento devem ser confirmados com a loja.

## Configuração

Edite `data/menu.js`:

| Campo | Finalidade |
| --- | --- |
| `CONFIG.whatsappNumber` | Número internacional, somente dígitos; atualmente `5511991093901` |
| `CONFIG.storeName`, `storeCategory` | Identidade da loja |
| `CONFIG.storeAddress`, `pickupAddress` | Endereço exibido e endereço de retirada; atualmente exemplos |
| `CONFIG.deliveryFee` | Taxa fixa para entrega |
| `CONFIG.minOrder` | Mínimo de produtos para entrega, após desconto |
| `CONFIG.freeDeliveryOver` | Valor que dá frete grátis, após desconto |
| `CONFIG.couponCode`, `couponDiscount` | Código e fração de desconto; `0.10` representa 10% |
| `PRODUCTS`, `CATEGORIES` | Catálogo e agrupamentos |

O telefone de destino fica visível no código público do site. Antes de publicar, confirme se deseja divulgar o número pessoal ou substitua por um número de atendimento.

Os textos ficam em `data/strings.js` e os estilos em `css/`. Parte dos rótulos estruturais fica em `index.html`.

### Regras comerciais adotadas

1. O mínimo de entrega considera **subtotal menos desconto**, sem contar a taxa de entrega.
2. Frete grátis também considera o valor **após desconto**, inclusive quando igual ao limite.
3. Retirada não cobra taxa e não exige o mínimo de entrega.
4. O cupom é demonstrativo e reutilizável; não se anuncia exclusividade para primeira compra, pois não há cadastro ou controle por cliente.
5. Troco em branco significa que não é necessário. Quando preenchido para dinheiro, o valor precisa ser válido e pelo menos igual ao total.
6. Até 20 unidades por linha, até 50 linhas e até 300 caracteres de observação por item. Observações gerais: até 500 caracteres.
7. Preços e opções restaurados vêm do catálogo atual, nunca de um preço salvo no navegador.

## Armazenamento e privacidade

Chave local: `brasa-lanches:draft:v1`. O navegador salva somente IDs de produtos, quantidades, sabores, nomes de adicionais/remoções e preferências de recebimento, pagamento e cupom. O rascunho expira após sete dias sem atualização.

**Não são persistidos** nome, telefone, endereço, observações dos itens ou observações gerais. Ao recarregar, esses campos precisam ser preenchidos novamente. Não é salvo histórico de pedidos. Esses dados permanecem temporariamente na memória da aba e entram na mensagem que o usuário escolhe abrir no WhatsApp.

Se o armazenamento estiver bloqueado ou cheio, o site continua funcionando em memória e avisa que não conseguiu salvar. Rascunhos inválidos ou expirados são ignorados. Começar outro pedido limpa a sacola salva e os campos da tela.

Não há analytics ou cookies de rastreamento implementados pelo projeto. As fontes usam Google Fonts, com alternativas locais; o carregamento de fontes gera solicitações externas. O WhatsApp só é aberto pela ação do usuário. A cópia depende da permissão e do suporte do navegador; se falhar, o resumo continua selecionável para cópia manual.

## Estrutura

```text
index.html          Estrutura, rótulos e inicialização dos textos
css/                Identidade visual, catálogo, checkout e modal
data/menu.js       Configurações e catálogo
data/strings.js    Textos e modelos de mensagem
js/state.js         Estado e rascunho local validado
js/utils.js         Formatação, identificação, escape de HTML e notificações
js/screens.js       Navegação das telas
js/menu.js          Catálogo, categorias e busca
js/modal.js         Personalização e foco do diálogo
js/cart.js          Sacola, totais e cupom
js/checkout.js      Validação, revisão e comanda para WhatsApp
js/app.js           Bootstrap e eventos delegados
scripts/            Servidor local e verificação de sintaxe
tests/             Testes automatizados
 docs/              Roteiro de validação manual
```

## Segurança e acessibilidade

Textos digitados são escapados antes de entrar em templates HTML; o resumo e mensagens de erro usam `textContent`. Opções dinâmicas usam atributos de dados e eventos delegados, em vez de inserir textos de usuário em código JavaScript. Links do WhatsApp codificam a mensagem inteira apenas uma vez e abrem sem acesso a `window.opener`.

Controles utilizam botões, rótulos associados, estados ARIA e foco visível. O diálogo contém o foco, fecha por Escape, botão ou clique fora e devolve o foco ao controle que o abriu. As animações respeitam preferência de movimento reduzido. O projeto ainda deve ser avaliado com leitores de tela e dispositivos reais antes de uso público; não há alegação de certificação de acessibilidade.

Qualquer validação no frontend pode ser contornada por quem controla o navegador. Se for criado um backend, ele deverá recalcular preços e validar pedidos independentemente do cliente.

## Fora do escopo e evolução

Não existem login, banco de dados, painel administrativo, API do WhatsApp, confirmação de recebimento, estoque, mapa, geolocalização, histórico ou pagamento online. Não há atualização real de preparo/entrega. O servidor local não adiciona essas funções.

Para uma evolução operacional, o próximo passo seria definir requisitos com a lanchonete e implementar um backend de pedidos com autenticação do administrador, validação no servidor e persistência. Isso é uma etapa separada: não deve ser apresentado na defesa do TCC como já implementado.
