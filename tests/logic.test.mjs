import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  filterProducts, productMessage, listMessage, whatsappUrl,
  normalizeCart, addCartItem, setCartQuantity, removeCartItem, cartCount, cartMessage,
} from '../logic.js';
import {demoProducts, products, company} from '../data.js';

// Deliberately separate fixtures: no stock, brand or price claims are added to the site.
const catalog = [
  {id: 'fixture-1', name: 'Câmara de teste', brand: 'Marca de teste', code: 'TESTE-01', category: 'Peças'},
  {id: 'fixture-2', name: 'Capacete de teste', brand: '', code: '', category: 'Acessórios', demo: true},
];

test('busca normaliza acentos, caixa, código e marca', () => {
  assert.equal(filterProducts(demoProducts, {query: 'BICICLETA'}).length, 3);
  assert.equal(filterProducts(demoProducts, {query: 'DEMO-02'})[0].id, 'demo-capacete');
  assert.equal(filterProducts(catalog, {query: 'camara', brand: 'Marca de teste'}).length, 1);
  assert.equal(filterProducts(catalog, {query: 'marca DE teste'}).length, 1);
  assert.equal(filterProducts(catalog, {query: ' teste-01 '}).length, 1);
});

test('filtros de categoria, marca e busca se combinam e permitem zero resultados', () => {
  assert.equal(filterProducts(demoProducts, {category: 'Bicicletas'}).length, 1);
  assert.equal(filterProducts(demoProducts, {category: 'Bicicletas', query: 'capacete'}).length, 0);
  assert.equal(filterProducts(catalog, {category: 'Peças', brand: 'Marca de teste', query: 'câmara'}).length, 1);
  assert.equal(filterProducts(catalog, {category: 'Acessórios', brand: 'Marca de teste'}).length, 0);
});

test('contatos configurados são válidos e o catálogo de demonstração permanece separado', () => {
  assert.ok(Array.isArray(products));
  assert.ok(products.every(product => !product.demo));
  assert.ok(!products.some(product => demoProducts.some(demo => demo.id === product.id)));
  assert.ok(whatsappUrl(company.whatsapp, 'Consulta'));
  assert.equal(new URL(company.instagram).hostname, 'www.instagram.com');
  assert.ok(demoProducts.every(product => product.demo && product.price === null));
  assert.equal(whatsappUrl('', 'teste'), null);
  assert.equal(whatsappUrl('123', 'teste'), null);
});

test('mensagens individuais e antigas preservam demonstração e codificação', () => {
  assert.match(productMessage(demoProducts[0]), /DEMO-01/);
  assert.match(productMessage(demoProducts[0]), /demonstração/);
  assert.match(listMessage(demoProducts.slice(0, 2)), /DEMO-02/);
  const url = new URL(whatsappUrl(company.whatsapp, 'Olá & preço?'));
  assert.equal(url.searchParams.get('text'), 'Olá & preço?');
});

test('migra IDs da lista anterior e une duplicados sem perder quantidades', () => {
  const saved = ['fixture-1', 'fixture-1', 'fixture-2', 'não-existe'];
  assert.deepEqual(normalizeCart(saved, catalog), [
    {id: 'fixture-1', quantity: 2}, {id: 'fixture-2', quantity: 1},
  ]);
  assert.deepEqual(normalizeCart([
    {id: 'fixture-1', quantity: 3}, {id: 'fixture-1', quantity: 4},
  ], catalog), [{id: 'fixture-1', quantity: 7}]);
});

test('carrinho ignora conteúdo corrompido, quantidades inválidas e produtos inexistentes', () => {
  for (const saved of [null, undefined, {}, '[]', 42]) assert.deepEqual(normalizeCart(saved, catalog), []);
  const invalid = [null, false, {}, {id: 'fixture-1'}, {id: 'fixture-1', quantity: 0},
    {id: 'fixture-1', quantity: -2}, {id: 'fixture-1', quantity: 1.5},
    {id: 'fixture-1', quantity: Infinity}, {id: 'fixture-1', quantity: NaN},
    {id: 'fixture-1', quantity: true}, {id: 'fixture-1', quantity: ''},
    {id: 'fixture-1', quantity: '2x'}, {id: 'não-existe', quantity: 1}];
  assert.deepEqual(normalizeCart(invalid, catalog), []);
  assert.deepEqual(normalizeCart([{id: 'fixture-1', quantity: 3000}], catalog), [{id: 'fixture-1', quantity: 999}]);
});

test('adicionar, alterar, remover e contar itens preserva o estado anterior', () => {
  const initial = [{id: 'fixture-1', quantity: 2}];
  const added = addCartItem(initial, 'fixture-1', catalog, 3);
  assert.deepEqual(initial, [{id: 'fixture-1', quantity: 2}]);
  assert.deepEqual(added, [{id: 'fixture-1', quantity: 5}]);
  const second = addCartItem(added, 'fixture-2', catalog);
  assert.equal(cartCount(second), 6);
  const changed = setCartQuantity(second, 'fixture-2', '7', catalog);
  assert.equal(cartCount(changed), 12);
  assert.equal(cartCount(second), 6);
  assert.deepEqual(removeCartItem(changed, 'fixture-1'), [{id: 'fixture-2', quantity: 7}]);
  assert.deepEqual(setCartQuantity(initial, 'fixture-1', 0, catalog), initial);
  assert.deepEqual(addCartItem(initial, 'não-existe', catalog), initial);
  assert.deepEqual(addCartItem(initial, 'fixture-1', catalog, -1), initial);
  assert.deepEqual(addCartItem([{id: 'fixture-1', quantity: 999}], 'fixture-1', catalog), [{id: 'fixture-1', quantity: 999}]);
});

test('normalização não aceita dados de produto injetados no armazenamento', () => {
  const saved = [{id: 'fixture-1', quantity: 2, name: 'Nome adulterado', price: 1, code: 'FAKE'}];
  assert.deepEqual(normalizeCart(saved, catalog), [{id: 'fixture-1', quantity: 2}]);
  const message = cartMessage(saved, catalog);
  assert.match(message, /Câmara de teste — Marca: Marca de teste — Código: TESTE-01 — Quantidade: 2/);
  assert.doesNotMatch(message, /Nome adulterado|FAKE|R\$/);
});

test('orçamento contém quantidades, dados disponíveis e aviso de demonstração sem preços inventados', () => {
  const message = cartMessage([{id: 'fixture-1', quantity: 3}, {id: 'fixture-2', quantity: 2}], catalog);
  assert.match(message, /TESTE-01 — Quantidade: 3/);
  assert.match(message, /Capacete de teste — Quantidade: 2 \(demonstração/);
  assert.match(message, /confirme os preços, a disponibilidade e as condições de entrega/);
  assert.doesNotMatch(message, /undefined|null|R\$/);
  assert.equal(cartMessage([], catalog), '');
  const url = new URL(whatsappUrl(company.whatsapp, message));
  assert.equal(url.pathname, '/' + company.whatsapp);
  assert.equal(url.searchParams.get('text'), message);
});
