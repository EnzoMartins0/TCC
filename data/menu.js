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
  storeAddress:      '📍 Rua das Brasas, 220 — endereço de exemplo',
  pickupAddress:     'Rua das Brasas, 220 — endereço de exemplo',

  // Busca
  searchPlaceholder: 'Buscar no cardápio (ex: bacon, suco...)',

  // Carrinho
  cartTitle:         'Sua sacola',
  cartBarLabel:      'Ver sacola',

  // Checkout
  checkoutTitle:          'Finalizar pedido',
  checkoutDeliveryTitle:  'Como você quer receber?',
  delivOptionDeliv:       '🛵 Entrega',
  delivOptionPickup:      '🏪 Retirar no local',
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
  btnWhatsApp:     '📲 Enviar comanda pelo WhatsApp',
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
  { id: 'promo',      name: 'Mais pedidos', icon: '🔥' },
  { id: 'lanches',    name: 'Lanches',      icon: '🍔' },
  { id: 'porcoes',    name: 'Porções',      icon: '🍟' },
  { id: 'bebidas',    name: 'Bebidas',      icon: '🥤' },
  { id: 'sobremesas', name: 'Sobremesas',   icon: '🍫' },
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
  { id: 'p1',  cat: 'promo',      name: 'Combo X-Brasa Duplo',       desc: 'Pão brioche, 2x smash 90g, cheddar, bacon crocante, molho da casa + batata + refri lata', price: 34.90, oldPrice: 41.80, icon: '🍔', extras: EXTRAS_LANCHE, remove: ['Cheddar', 'Bacon', 'Molho da casa'] },
  { id: 'p2',  cat: 'promo',      name: 'X-Tudo da Casa',            desc: 'Pão, hambúrguer 150g, presunto, queijo, ovo, bacon, alface, tomate, milho e batata palha',  price: 26.90,              icon: '🍔', extras: EXTRAS_LANCHE, remove: ['Presunto', 'Queijo', 'Ovo', 'Bacon', 'Alface', 'Tomate', 'Milho', 'Batata palha'] },
  { id: 'p3',  cat: 'promo',      name: 'Combo Smash Cheddar Bacon', desc: 'Smash duplo, cheddar cremoso, bacon + bebida lata gelada',                                  price: 29.90, oldPrice: 35.90, icon: '🧀', extras: EXTRAS_LANCHE, remove: ['Cheddar', 'Bacon'] },

  // — Lanches —
  { id: 'p4',  cat: 'lanches',    name: 'X-Salada',          desc: 'Pão, hambúrguer 120g, queijo, alface, tomate e maionese da casa',          price: 18.90, icon: '🍔', extras: EXTRAS_LANCHE, remove: ['Queijo', 'Alface', 'Tomate', 'Maionese da casa'] },
  { id: 'p5',  cat: 'lanches',    name: 'X-Bacon',           desc: 'Pão, hambúrguer 120g, queijo, bacon crocante e maionese da casa',           price: 22.90, icon: '🥓', extras: EXTRAS_LANCHE, remove: ['Queijo', 'Bacon', 'Maionese da casa'] },
  { id: 'p6',  cat: 'lanches',    name: 'X-Egg',             desc: 'Pão, hambúrguer 120g, queijo, ovo, alface e tomate',                        price: 20.90, icon: '🍳', extras: EXTRAS_LANCHE, remove: ['Queijo', 'Ovo', 'Alface', 'Tomate'] },
  { id: 'p7',  cat: 'lanches',    name: 'Veggie Smash',      desc: 'Hambúrguer de grão-de-bico, queijo, rúcula e tomate seco',                  price: 24.90, icon: '🥬', extras: EXTRAS_LANCHE, remove: ['Queijo', 'Rúcula', 'Tomate seco'] },
  { id: 'p8',  cat: 'lanches',    name: 'Cheddar Duplo Bacon', desc: 'Dois hambúrgueres 100g, cheddar em dobro e bacon crocante',              price: 28.90, icon: '🍔', extras: EXTRAS_LANCHE, remove: ['Cheddar', 'Bacon'] },

  // — Porções —
  { id: 'p9',  cat: 'porcoes',    name: 'Batata Frita Grande',   desc: '250g de batata crocante, serve até 2 pessoas',                    price: 19.90, icon: '🍟' },
  { id: 'p10', cat: 'porcoes',    name: 'Onion Rings',           desc: 'Anéis de cebola empanados, crocantes por fora',                   price: 17.90, icon: '🧅' },
  { id: 'p11', cat: 'porcoes',    name: 'Frango a Passarinho',   desc: '400g de frango temperado e frito na hora, com limão',             price: 32.90, icon: '🍗' },
  { id: 'p12', cat: 'porcoes',    name: 'Polenta Frita',         desc: 'Porção de polenta frita crocante com molho da casa',              price: 16.90, icon: '🌽' },

  // — Bebidas —
  { id: 'p13', cat: 'bebidas',    name: 'Refrigerante Lata 350ml', desc: 'Gelada, do jeito que tem que ser',            price:  6.00, icon: '🥤', flavors: ['Coca-Cola', 'Guaraná', 'Coca-Cola Zero', 'Fanta Laranja'] },
  { id: 'p14', cat: 'bebidas',    name: 'Suco Natural 500ml',      desc: 'Feito na hora, sem adição de açúcar',         price:  9.90, icon: '🧃', flavors: ['Laranja', 'Limão', 'Maracujá'] },
  { id: 'p15', cat: 'bebidas',    name: 'Água Mineral 500ml',      desc: 'Com ou sem gás',                              price:  4.00, icon: '💧', flavors: ['Sem gás', 'Com gás'] },
  { id: 'p16', cat: 'bebidas',    name: 'Cerveja Long Neck',       desc: 'Long neck 355ml bem gelada',                  price:  9.90, icon: '🍺', flavors: ['Pilsen', 'IPA', 'Weiss'] },

  // — Sobremesas —
  { id: 'p17', cat: 'sobremesas', name: 'Brownie com Sorvete', desc: 'Brownie quentinho com bola de sorvete de creme', price: 14.90, icon: '🍫' },
  { id: 'p18', cat: 'sobremesas', name: 'Milkshake 400ml',     desc: 'Cremoso, na medida certa',                       price: 16.90, icon: '🥤', flavors: ['Chocolate', 'Morango', 'Ovomaltine'] },
  { id: 'p19', cat: 'sobremesas', name: 'Petit Gâteau',        desc: 'Massa quente com recheio cremoso e sorvete',     price: 18.90, icon: '🍰' },
];
