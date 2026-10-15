/* ============================================================
   data/menu.js — Dados do cardápio e configurações globais
   ============================================================ */

const CONFIG = {
  // Integração
  whatsappNumber:    '5511991093901', // Destino dos pedidos: +55 11 99109-3901

  // Cupom
  couponCode:        'BEMVINDO10',
  couponDiscount:    0.10,            // 10%

  // Taxas e limites
  deliveryFee:       6.90,
  freeDeliveryOver:  60.00,
  minOrder:          20.00,

  // Dados da loja (hero)
  storeName:         'Brasa Lanches',
  storeCategory:     'Hamburgueria • Grelhados',
  storeStatus:       'Cardápio demonstrativo',
  storeRating:       'Pedidos pelo WhatsApp',
  storeDeliveryTime: 'Prazo a combinar com a loja',
  storeAddress:      'Rua das Brasas, 220 — endereço de exemplo',
  pickupAddress:     'Rua das Brasas, 220 — endereço de exemplo',

  // Busca
  searchPlaceholder: 'Buscar no cardápio (ex: bacon, suco...)',

  // Carrinho
  cartTitle:         'Sua sacola',
  cartBarLabel:      'Ver sacola',

  // Checkout
  checkoutTitle:          'Finalizar pedido',
  checkoutDeliveryTitle:  'Como você quer receber?',
  delivOptionDeliv:       'Entrega',
  delivOptionPickup:      'Retirar no local',
  checkoutPayTitle:       'Forma de pagamento',
  checkoutReviewTitle:    'Revise seu pedido',
  fieldStreet:            'Rua',
  fieldNumber:            'Número',
  fieldHood:              'Bairro',
  fieldComplement:        'Complemento (opcional)',
  fieldReference:         'Ponto de referência (opcional)',
  fieldChangeFor:         'Precisa de troco para quanto?',
  fieldObsGeral:          'Observações gerais (opcional)',

  // Revisão — labels das seções
  reviewLabelItems:    'Itens',
  reviewLabelDelivery: 'Entrega',
  reviewLabelPayment:  'Pagamento',

  // Confirmação
  confirmStamp:    'Pronto para enviar',
  confirmTitle:    'Seu pedido está pronto para enviar',
  confirmSubtitle: 'Abra o WhatsApp, envie a comanda e aguarde a confirmação da loja.',
  trackConfirmed:  'Confirmado',
  trackPreparing:  'Em preparo',
  trackOnTheWay:   'A caminho',
  trackDelivered:  'Entregue',
  btnWhatsApp:     'Enviar comanda pelo WhatsApp',
  btnNewOrder:     'Fazer novo pedido',

  // Modal de produto
  modalFlavorTitle:   'Escolha o sabor',
  modalFlavorSub:     'Obrigatório · escolha 1',
  modalExtrasTitle:   'Quer adicionar algo?',
  modalExtrasSub:     'Opcional',
  modalRemoveTitle:   'Remover algum ingrediente?',
  modalRemoveSub:     'Opcional',
  modalObsTitle:      'Observações',
  modalObsSub:        'Ex: ponto da carne, sem cebola, etc.',
  modalObsPlaceholder:'Alguma observação para a cozinha?',
};

const CATEGORIES = [
  { id: 'promo',      name: 'Mais pedidos', icon: 'flame' },
  { id: 'lanches',    name: 'Lanches',      icon: 'burger' },
  { id: 'porcoes',    name: 'Porções',      icon: 'fries' },
  { id: 'bebidas',    name: 'Bebidas',      icon: 'drink' },
  { id: 'sobremesas', name: 'Sobremesas',   icon: 'dessert' },
];

const EXTRAS_LANCHE = [
  { name: 'Bacon extra',           price: 5 },
  { name: 'Queijo cheddar extra',  price: 4 },
  { name: 'Ovo',                   price: 3 },
  { name: 'Catupiry',              price: 6 },
  { name: 'Cebola caramelizada',   price: 3 },
];

const PRODUCTS = [
  // — Mais pedidos (promo) —
  { id: 'p1',  image: 'assets/products/p1.svg', imageAlt: 'Ilustração de hambúrguer duplo com cheddar, bacon, batatas fritas e refrigerante.', cat: 'promo',      name: 'Combo X-Brasa Duplo',       desc: 'Pão brioche, 2x smash 90g, cheddar, bacon crocante, molho da casa + batata + refri lata', price: 34.90, oldPrice: 41.80, extras: EXTRAS_LANCHE, remove: ['Cheddar', 'Bacon', 'Molho da casa'] },
  { id: 'p2',  image: 'assets/products/p2.svg', imageAlt: 'Ilustração de X-Tudo com ovo, queijo, bacon e salada.', cat: 'promo',      name: 'X-Tudo da Casa',            desc: 'Pão, hambúrguer 150g, presunto, queijo, ovo, bacon, alface, tomate, milho e batata palha',  price: 26.90, extras: EXTRAS_LANCHE, remove: ['Presunto', 'Queijo', 'Ovo', 'Bacon', 'Alface', 'Tomate', 'Milho', 'Batata palha'] },
  { id: 'p3',  image: 'assets/products/p3.svg', imageAlt: 'Ilustração de combo de smash duplo com cheddar, bacon e refrigerante.', cat: 'promo',      name: 'Combo Smash Cheddar Bacon', desc: 'Smash duplo, cheddar cremoso, bacon + bebida lata gelada',                                  price: 29.90, oldPrice: 35.90, extras: EXTRAS_LANCHE, remove: ['Cheddar', 'Bacon'] },

  // — Lanches —
  { id: 'p4',  image: 'assets/products/p4.svg', imageAlt: 'Ilustração de hambúrguer com queijo, alface e tomate.', cat: 'lanches',    name: 'X-Salada',          desc: 'Pão, hambúrguer 120g, queijo, alface, tomate e maionese da casa',          price: 18.90, extras: EXTRAS_LANCHE, remove: ['Queijo', 'Alface', 'Tomate', 'Maionese da casa'] },
  { id: 'p5',  image: 'assets/products/p5.svg', imageAlt: 'Ilustração de hambúrguer com queijo e tiras de bacon.', cat: 'lanches',    name: 'X-Bacon',           desc: 'Pão, hambúrguer 120g, queijo, bacon crocante e maionese da casa',           price: 22.90, extras: EXTRAS_LANCHE, remove: ['Queijo', 'Bacon', 'Maionese da casa'] },
  { id: 'p6',  image: 'assets/products/p6.svg', imageAlt: 'Ilustração de hambúrguer com ovo, queijo e salada.', cat: 'lanches',    name: 'X-Egg',             desc: 'Pão, hambúrguer 120g, queijo, ovo, alface e tomate',                        price: 20.90, extras: EXTRAS_LANCHE, remove: ['Queijo', 'Ovo', 'Alface', 'Tomate'] },
  { id: 'p7',  image: 'assets/products/p7.svg', imageAlt: 'Ilustração de hambúrguer vegetariano com folhas e tomate seco.', cat: 'lanches',    name: 'Veggie Smash',      desc: 'Hambúrguer de grão-de-bico, queijo, rúcula e tomate seco',                  price: 24.90, extras: EXTRAS_LANCHE, remove: ['Queijo', 'Rúcula', 'Tomate seco'] },
  { id: 'p8',  image: 'assets/products/p8.svg', imageAlt: 'Ilustração de hambúrguer duplo com cheddar e bacon.', cat: 'lanches',    name: 'Cheddar Duplo Bacon', desc: 'Dois hambúrgueres 100g, cheddar em dobro e bacon crocante',              price: 28.90, extras: EXTRAS_LANCHE, remove: ['Cheddar', 'Bacon'] },

  // — Porções —
  { id: 'p9',  image: 'assets/products/p9.svg', imageAlt: 'Ilustração de porção de batatas fritas douradas.', cat: 'porcoes',    name: 'Batata Frita Grande',   desc: '250g de batata crocante, serve até 2 pessoas',                    price: 19.90 },
  { id: 'p10', image: 'assets/products/p10.svg', imageAlt: 'Ilustração de porção de anéis de cebola empanados.', cat: 'porcoes',    name: 'Onion Rings',           desc: 'Anéis de cebola empanados, crocantes por fora',                   price: 17.90 },
  { id: 'p11', image: 'assets/products/p11.svg', imageAlt: 'Ilustração de frango a passarinho com limão.', cat: 'porcoes',    name: 'Frango a Passarinho',   desc: '400g de frango temperado e frito na hora, com limão',             price: 32.90 },
  { id: 'p12', image: 'assets/products/p12.svg', imageAlt: 'Ilustração de polenta frita com molho.', cat: 'porcoes',    name: 'Polenta Frita',         desc: 'Porção de polenta frita crocante com molho da casa',              price: 16.90 },

  // — Bebidas —
  { id: 'p13', image: 'assets/products/p13.svg', imageAlt: 'Ilustração de lata gelada de refrigerante.', cat: 'bebidas',    name: 'Refrigerante Lata 350ml', desc: 'Gelada, do jeito que tem que ser',            price:  6.00, flavors: ['Coca-Cola', 'Guaraná', 'Coca-Cola Zero', 'Fanta Laranja'] },
  { id: 'p14', image: 'assets/products/p14.svg', imageAlt: 'Ilustração de suco natural com frutas.', cat: 'bebidas',    name: 'Suco Natural 500ml',      desc: 'Feito na hora, sem adição de açúcar',         price:  9.90, flavors: ['Laranja', 'Limão', 'Maracujá'] },
  { id: 'p15', image: 'assets/products/p15.svg', imageAlt: 'Ilustração de garrafa de água mineral.', cat: 'bebidas',    name: 'Água Mineral 500ml',      desc: 'Com ou sem gás',                              price:  4.00, flavors: ['Sem gás', 'Com gás'] },
  { id: 'p16', image: 'assets/products/p16.svg', imageAlt: 'Ilustração de garrafa de cerveja long neck.', cat: 'bebidas',    name: 'Cerveja Long Neck',       desc: 'Long neck 355ml bem gelada',                  price:  9.90, flavors: ['Pilsen', 'IPA', 'Weiss'] },

  // — Sobremesas —
  { id: 'p17', image: 'assets/products/p17.svg', imageAlt: 'Ilustração de brownie de chocolate com sorvete de creme.', cat: 'sobremesas', name: 'Brownie com Sorvete', desc: 'Brownie quentinho com bola de sorvete de creme', price: 14.90 },
  { id: 'p18', image: 'assets/products/p18.svg', imageAlt: 'Ilustração de milkshake cremoso com cobertura e canudo.', cat: 'sobremesas', name: 'Milkshake 400ml',     desc: 'Cremoso, na medida certa',                       price: 16.90, flavors: ['Chocolate', 'Morango', 'Ovomaltine'] },
  { id: 'p19', image: 'assets/products/p19.svg', imageAlt: 'Ilustração de petit gâteau com chocolate derretido e sorvete.', cat: 'sobremesas', name: 'Petit Gâteau',        desc: 'Massa quente com recheio cremoso e sorvete',     price: 18.90 },
];
