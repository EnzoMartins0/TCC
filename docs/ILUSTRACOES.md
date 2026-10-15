# Ilustrações dos produtos

O cardápio utiliza uma ilustração SVG local e individual para cada produto. São representações ilustradas, não fotografias nem comprovação da aparência de uma refeição real. As opções escolhidas no pedido não modificam os ingredientes desenhados: a arte representa a versão-base do produto.

A identidade usa cores quentes, volumes e sombras para destacar alimentos, mantendo a paleta do Brasa Lanches. As artes não dependem de links de bancos de imagens ou de serviços externos para carregar.

## Arquivos

| Produto | Ilustração |
| --- | --- |
| Combo X-Brasa Duplo | `assets/products/p1.svg` |
| X-Tudo da Casa | `assets/products/p2.svg` |
| Combo Smash Cheddar Bacon | `assets/products/p3.svg` |
| X-Salada | `assets/products/p4.svg` |
| X-Bacon | `assets/products/p5.svg` |
| X-Egg | `assets/products/p6.svg` |
| Veggie Smash | `assets/products/p7.svg` |
| Cheddar Duplo Bacon | `assets/products/p8.svg` |
| Batata Frita Grande | `assets/products/p9.svg` |
| Onion Rings | `assets/products/p10.svg` |
| Frango a Passarinho | `assets/products/p11.svg` |
| Polenta Frita | `assets/products/p12.svg` |
| Refrigerante Lata 350ml | `assets/products/p13.svg` |
| Suco Natural 500ml | `assets/products/p14.svg` |
| Água Mineral 500ml | `assets/products/p15.svg` |
| Cerveja Long Neck | `assets/products/p16.svg` |
| Brownie com Sorvete | `assets/products/p17.svg` |
| Milkshake 400ml | `assets/products/p18.svg` |
| Petit Gâteau | `assets/products/p19.svg` |

## Onde configurar

Cada produto em `data/menu.js` tem os campos `image` (caminho local) e `imageAlt` (descrição em português). A mesma referência é utilizada no cardápio, nos detalhes e na sacola. A imagem da sacola é resolvida a partir do catálogo atual, inclusive para rascunhos antigos; não é necessário apagar uma sacola salva para carregar as artes.

Os emojis dos dados legados permanecem disponíveis como metadados de compatibilidade, mas não são usados como miniaturas de produto. Os pequenos símbolos das categorias permanecem como marcadores de navegação.

## Layout e acessibilidade

- Arquivos quadrados com dimensões intrínsecas reservadas para evitar deslocamento do texto durante o carregamento.
- Enquadramento `object-fit: contain`, sem cortar ingredientes ou esticar a ilustração.
- Miniaturas decorativas com `alt` vazio quando o nome já é informado pelo botão ou pela linha da sacola.
- Descrição alternativa no detalhe do produto.
- Carregamento sob demanda nas miniaturas e prioritário no detalhe aberto.
- Se o arquivo falhar, aparece uma alternativa discreta; personalização e pedido continuam funcionando.

## Substituir no futuro

É possível substituir uma arte por outro arquivo local em `assets/products/` e atualizar `image` e `imageAlt`. A aplicação aceita SVG, PNG, WebP e JPEG nessa pasta; não aceita URLs externas ou caminhos arbitrários no renderizador de miniaturas. Para imagens SVG de outras origens, revise o conteúdo antes de incorporá-lo ao projeto.

Ao copiar ou publicar o site, inclua também a pasta `assets/`. Apenas copiar HTML, CSS e JavaScript deixa as imagens ausentes.

## Recriar as artes

O gerador opcional `scripts/generate-product-art.py` usa apenas a biblioteca padrão do Python 3. Na pasta do projeto, execute:

```sh
python scripts/generate-product-art.py
```

**Atenção:** ele sobrescreve os 19 SVGs com as receitas desenhadas no script. Não execute depois de editar manualmente os arquivos sem preservar suas alterações. Python só é necessário para recriar os desenhos; abrir o site e executar a suíte `npm test` não dependem dele.

## Verificação

Os testes de dados e renderização estão em `tests/product-images.test.cjs`; a integridade dos desenhos está em `tests/product-art-assets.test.cjs`. `tests/browser-product-images.js` verifica o carregamento dos 19 arquivos, consistência entre telas, descrição alternativa, recuperação após erro e layout em uma aba de teste, sem envio de mensagem real.
