# Ícones SVG da interface

Todos os ícones fornecidos pela interface são SVGs originais e locais, sem fonte de ícones, emojis ou biblioteca externa. As 19 ilustrações dos produtos continuam em `assets/products/`.

## Organização

- `js/icons.js`: biblioteca com 27 modelos vetoriais, `viewBox="0 0 24 24"`, traço arredondado e cor herdada por `currentColor`.
- `iconHtml(nome)`: devolve apenas um SVG presente na biblioteca; nomes desconhecidos, inclusive propriedades herdadas, são rejeitados.
- `data-icon="nome"`: espaço reservado estático, preenchido por `renderStaticIcons()` durante o bootstrap.
- `data-leading-icon="nome"`: acrescenta um SVG antes de um rótulo configurado como texto no HTML.
- `setIconText(elemento, nome, texto)`: mantém o conteúdo textual em `textContent` e insere separadamente apenas o SVG fixo. Não use HTML de cliente como definição de ícone.
- `css/base.css`, `menu.css`, `cart-checkout.css` e `modal.css`: tamanhos e alinhamento por contexto.

A biblioteca carrega antes de `data/strings.js`. A hidratação dos ícones acontece depois da inicialização dos textos em `index.html`, por `js/app.js`.

## Cobertura

Logo, metadados da loja, busca, categorias, cupom, estados vazios, entrega/retirada, pagamento, quantidade, remoção, checks das opções, voltar/fechar, revisão, confirmação, copiar/editar e WhatsApp usam SVG. Números das etapas, preços e sinais matemáticos continuam sendo texto, não desenhos. Textos digitados por clientes podem conter os caracteres que eles escolherem; a troca não altera essas observações.

Os ícones são decorativos (`aria-hidden="true"`, `focusable="false"`); os textos visíveis e `aria-label` dos controles fornecem os nomes acessíveis. `pointer-events:none` impede os traços de atrapalhar os eventos dos botões. O botão do WhatsApp usa um desenho original de conversa/telefone, não uma imagem oficial baixada.

A comanda enviada ao WhatsApp permanece texto puro. Nenhum SVG é inserido na mensagem e nenhuma mensagem é enviada automaticamente.

## Verificação

```sh
npm test
npm run check
```

`tests/ui-icons.test.cjs` cobre biblioteca, caminhos seguros, catálogo, sacola, ausência de emojis nos fontes da interface e separação entre texto e marcação. `tests/browser-ui-icons.js` exercita os SVGs reais e a compra no navegador; ele limpa apenas o rascunho da origem de teste e intercepta `window.open`, portanto execute-o em uma sessão isolada, nunca durante um pedido real.

Os resultados específicos estão em `docs/validacao-svg.json`. A checagem móvel é emulada; não substitui uma conferência no celular físico. Os ícones não precisam de rede externa. As fontes tipográficas Google Fonts já existentes ainda podem gerar solicitações externas, com alternativas locais.
