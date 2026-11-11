const normalizeSearch = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const filterProducts = (items, {query = '', category = '', brand = ''} = {}) => {
  const term = normalizeSearch(query.trim());
  return items.filter(product =>
    (!category || product.category === category) &&
    (!brand || product.brand === brand) &&
    normalizeSearch(`${product.name} ${product.brand || ''} ${product.code || ''}`).includes(term)
  );
};

export const productMessage = product => `Olá! Vi este produto no site da Ciclo Dias e gostaria de consultar o preço e a disponibilidade: ${product.name}${product.code ? ' — Código: ' + product.code : ''}.${product.demo ? '\nReferência de demonstração do site; não representa estoque confirmado.' : ''}`;

export const listMessage = items => `Olá! Gostaria de consultar preço e disponibilidade dos seguintes produtos:\n${items.map(product => `• ${product.name}${product.code ? ' — Código: ' + product.code : ''}${product.demo ? ' (demonstração)' : ''}`).join('\n')}\nAguardo a confirmação dos itens disponíveis.`;

export const whatsappUrl = (phone, message) => /^55\d{10,11}$/.test(phone) ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : null;

export const MAX_CART_QUANTITY = 999;

// Quantities may come from number inputs as strings. Reject blank, fractional,
// negative or nonnumeric values; limit positive integers to a practical maximum.
const quantityValue = value => {
  if (typeof value !== 'number' && !(typeof value === 'string' && /^\d+$/.test(value))) return null;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) return null;
  return Math.min(number, MAX_CART_QUANTITY);
};

// Persist only IDs and quantities. All descriptions, prices and other product
// data must come from the current catalog rather than untrusted local storage.
export const normalizeCart = (saved, products) => {
  if (!Array.isArray(saved)) return [];
  const knownIds = new Set(products.map(product => product.id));
  const entries = new Map();
  for (const entry of saved) {
    const id = typeof entry === 'string' ? entry : entry?.id;
    const quantity = typeof entry === 'string' ? 1 : quantityValue(entry?.quantity);
    if (typeof id !== 'string' || !knownIds.has(id) || quantity === null) continue;
    entries.set(id, Math.min((entries.get(id) || 0) + quantity, MAX_CART_QUANTITY));
  }
  return Array.from(entries, ([id, quantity]) => ({id, quantity}));
};

export const addCartItem = (cart, id, products, quantity = 1) => {
  const next = normalizeCart(cart, products);
  const amount = quantityValue(quantity);
  if (amount === null || !products.some(product => product.id === id)) return next;
  const index = next.findIndex(item => item.id === id);
  if (index === -1) next.push({id, quantity: amount});
  else next[index] = {...next[index], quantity: Math.min(next[index].quantity + amount, MAX_CART_QUANTITY)};
  return next;
};

export const setCartQuantity = (cart, id, quantity, products) => {
  const next = normalizeCart(cart, products);
  const amount = quantityValue(quantity);
  if (amount === null) return next;
  return next.map(item => item.id === id ? {...item, quantity: amount} : item);
};

export const removeCartItem = (cart, id) => cart.filter(item => item.id !== id);

export const cartCount = cart => cart.reduce((total, item) => total + (quantityValue(item.quantity) || 0), 0);

export const cartMessage = (cart, products) => {
  const entries = normalizeCart(cart, products);
  const catalog = new Map(products.map(product => [product.id, product]));
  if (!entries.length) return '';
  const lines = entries.map(({id, quantity}) => {
    const product = catalog.get(id);
    return `• ${product.name}${product.brand ? ' — Marca: ' + product.brand : ''}${product.code ? ' — Código: ' + product.code : ''} — Quantidade: ${quantity}${product.demo ? ' (demonstração; não representa estoque confirmado)' : ''}`;
  });
  return `Olá! Gostaria de solicitar um orçamento dos seguintes produtos na Ciclo Dias:\n\n${lines.join('\n')}\n\nPor favor, confirme os preços, a disponibilidade e as condições de entrega. Aguardo o atendimento para combinar o pedido.`;
};
