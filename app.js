import { company, categories, products, demoProducts, tables, delivery, photography, demoImages, categoryPhotos } from './data.js';
import {
  filterProducts, productMessage, whatsappUrl, normalizeCart, addCartItem,
  setCartQuantity, removeCartItem, cartCount, cartMessage,
} from './logic.js';

const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));
const allProducts = [...products, ...demoProducts];
const CART_KEY = 'ciclodias-cart';
let storageAvailable = true;
let cart = [];
try {
  const saved = localStorage.getItem(CART_KEY) ?? localStorage.getItem('ciclodias-budget') ?? '[]';
  try { cart = normalizeCart(JSON.parse(saved), allProducts); } catch { cart = []; }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
} catch {
  storageAvailable = false;
}

const icons = {
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>',
  cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3h3l3 12h11l3-9H6M9 15l-1 3h12"/><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.3 3.7a10.5 10.5 0 0 0-16.5 12L2.5 22l6.3-1.5A10.5 10.5 0 0 0 20.3 3.7Z"/><path d="M8 7.5c-2 3 2.5 8.5 6.5 8.5 1 0 2-1.5 2-2l-3-1.5-1 1c-1.5-.5-2.5-1.5-3-3l1-1L9 7.5Z"/></svg>',
};
const contactButton = (label = 'Falar no WhatsApp', message = 'Olá! Gostaria de saber mais sobre os produtos da Ciclo Dias.', className = 'btn yellow') =>
  `<button type="button" class="${className}" data-contact="${esc(message)}">${icons.whatsapp}${label}</button>`;
const logo = () => `<img class="official-logo" src="${esc(company.logo)}" alt="Ciclo Dias" width="479" height="417">`;
const countLabel = () => `${cartCount(cart)} ${cartCount(cart) === 1 ? 'item' : 'itens'}`;
const cartLink = () => `<a class="cart-link" href="#/carrinho" aria-label="Carrinho: ${countLabel()}">${icons.cart}<span>Carrinho</span><span class="cart-count" aria-hidden="true">${cartCount(cart)}</span></a>`;
const routeLink = (route, label) => `<a href="#${route}"${activeRoute === route ? ' aria-current="page"' : ''}>${label}</a>`;

const themeButton = () => {
  const dark = window.cicloTheme.get() === 'dark';
  return `<button class="theme-toggle" type="button" aria-label="Ativar tema ${dark ? 'claro' : 'escuro'}" aria-pressed="${dark}" title="Alternar tema"><svg viewBox="0 0 24 24" aria-hidden="true">${dark ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>' : '<path d="M20 15.5A9 9 0 0 1 8.5 4 9 9 0 1 0 20 15.5Z"/>'}</svg><span>${dark ? 'Escuro' : 'Claro'}</span></button>`;
};
function syncThemeButton() {
  const button = $('.theme-toggle');
  if (button) { const focus = document.activeElement === button; button.outerHTML = themeButton(); if (focus) $('.theme-toggle').focus({preventScroll:true}); }
}
window.addEventListener('ciclo-theme-change', syncThemeButton);

function header() {
  return `<div class="topline"><div class="wrap"><span>Bicicletas, peças e acessórios · Atacado e varejo</span><a href="mailto:${esc(company.email)}">${esc(company.email)}</a></div></div>
    <header class="site-header"><div class="wrap header-main">
      <a class="logo-link" href="#/" aria-label="Ciclo Dias — Início">${logo()}</a>
      <form class="header-search" data-search role="search" aria-label="Busca de produtos">
        <label class="sr-only" for="header-query">Buscar por nome, marca ou código</label>
        <input id="header-query" name="busca" type="search" placeholder="Qual peça você procura?" value="${esc(catalogState.query)}">
        <button type="submit" aria-label="Buscar produtos">${icons.search}</button>
      </form>
      <div class="header-contact"><span>Fale com a nossa equipe</span>${contactButton()}</div>
      ${themeButton()}
      <button class="menu-toggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="main-nav">☰</button>
    </div>
    <div class="nav-bar"><div class="wrap nav-inner"><nav id="main-nav" aria-label="Principal">
      ${routeLink('/', 'Início')}${routeLink('/produtos', 'Produtos')}${routeLink('/sobre', 'Sobre a Ciclo Dias')}${routeLink('/entregas', 'Entregas')}${routeLink('/contato', 'Contato')}
    </nav>${cartLink()}</div></div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="wrap footer-grid">
    <div class="footer-company"><a class="logo-link" href="#/" aria-label="Ciclo Dias — Início">${logo()}</a><p>Loja e distribuidora de bicicletas,<br>peças e acessórios.</p><p class="footer-slogan">${esc(company.slogan)}</p></div>
    <div><h2>Navegação</h2><a href="#/produtos">Produtos</a><a href="#/sobre">Sobre a Ciclo Dias</a><a href="#/entregas">Entregas</a><a href="#/carrinho">Carrinho de orçamento</a></div>
    <div><h2>Atendimento</h2><a href="#/contato">Fale com a Ciclo Dias</a><a href="mailto:${esc(company.email)}">${esc(company.email)}</a>${company.instagram ? `<a href="${esc(company.instagram)}" target="_blank" rel="noopener noreferrer">Instagram: @ciclodiasatacadovarejo</a>` : ''}<a href="#/tabelas">Tabela de preços</a>${company.channel ? `<a href="${esc(company.channel)}" target="_blank" rel="noopener noreferrer">Canal do WhatsApp</a>` : ''}</div>
  </div><div class="wrap footer-bottom"><span>© ${new Date().getFullYear()} Ciclo Dias</span><span>Preços, estoque e entregas sujeitos à confirmação no atendimento.</span></div></footer>
  ${activeRoute === '/carrinho' ? '' : contactButton('WhatsApp', undefined, 'mobile-contact')}`;
}

function breadcrumbs(label, parent = '') {
  return `<nav class="breadcrumbs" aria-label="Você está aqui"><a href="#/">Início</a><span aria-hidden="true">/</span>${parent ? '<a href="#/produtos">Produtos</a><span aria-hidden="true">/</span>' : ''}<span aria-current="page">${esc(label)}</span></nav>`;
}
const price = product => Number.isFinite(product.price) && product.price >= 0
  ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)
  : 'Consulte pelo WhatsApp';
const productUrl = product => `#/produto/${encodeURIComponent(product.id)}`;
function productImage(product, lazy = true) {
  const src = product.image || demoImages[product.id] || photography.detail;
  const illustrative = !product.image || product.demo;
  return `<div class="product-image${illustrative ? ' illustrative-image' : ''}">${product.demo ? '<span class="demo-tag">Imagem ilustrativa</span>' : ''}<img src="${esc(src)}" alt="${illustrative ? esc(product.name) + ' — imagem ilustrativa, sem confirmação de estoque' : esc(product.name)}" ${lazy ? 'loading="lazy"' : ''}>${illustrative && !product.demo ? '<span class="image-caption">Imagem ilustrativa</span>' : ''}</div>`;
}
function productCard(product) {
  return `<article class="product-card">
    <a href="${productUrl(product)}" aria-label="Ver ${esc(product.name)}">${productImage(product)}</a>
    <div class="product-card-content"><p class="product-category">${esc(product.category)}</p>
      <h3><a href="${productUrl(product)}">${esc(product.name)}</a></h3>
      <p class="product-reference">${product.demo ? 'Exemplo de catálogo · sem estoque confirmado' : `${product.brand ? esc(product.brand) + ' · ' : ''}${product.code ? `Cód. ${esc(product.code)}` : 'Consulte as especificações'}`}</p>
      <p class="product-price">${price(product)}</p>
      <button type="button" class="btn yellow add-button" data-add="${esc(product.id)}">Adicionar ao carrinho</button>
      ${contactButton('Consultar produto', productMessage(product), 'product-consult')}
    </div></article>`;
}
const categoryUrl = category => `#/produtos?categoria=${encodeURIComponent(category)}`;
function home() {
  const featured = products.length ? products.slice(0, 4) : demoProducts;
  const photoCategories = [
    ['Bicicletas', 'Para o seu próximo pedal', categoryPhotos.bikes, 'Bicicletas'],
    ['Peças e componentes', 'Da manutenção à montagem', categoryPhotos.parts, 'Freios e componentes'],
    ['Pneus e rodas', 'Pneus, câmaras, rodas e aros', categoryPhotos.wheels, 'Pneus e câmaras'],
    ['Acessórios', 'Consulte as opções com a equipe', categoryPhotos.accessories, 'Capacetes e acessórios'],
  ];
  return `<section class="photo-hero"><img class="hero-photo" src="${esc(photography.hero)}" alt="Ciclista em bicicleta urbana — fotografia ilustrativa" fetchpriority="high"><div class="hero-shade"></div><div class="wrap hero-content"><p class="section-label">CICLO DIAS · ATACADO E VAREJO</p><h1>Bicicletas, peças<br>e acessórios.</h1><p>Para quem pedala.<br>Para quem faz o ciclismo acontecer.</p><div class="hero-actions"><a class="btn yellow" href="#/produtos">Conhecer os produtos <span aria-hidden="true">→</span></a>${contactButton('Fale com a gente', undefined, 'btn hero-contact')}</div></div><span class="hero-credit">Foto ilustrativa · Unsplash</span></section>
    <div class="service-bar wrap"><div><strong>Atacado e varejo</strong><span>Para ciclistas, lojas e oficinas</span></div><div><strong>Atendimento direto</strong><span>Tire suas dúvidas pelo WhatsApp</span></div><div><strong>Orçamento sem complicação</strong><span>Escolha os itens e consulte a equipe</span></div></div>
    <section class="wrap section categories-section"><div class="section-heading"><div><p class="section-label">ENCONTRE O QUE VOCÊ PROCURA</p><h2>Qual é o seu próximo projeto?</h2></div><a class="text-link" href="#/produtos">Ver todas as categorias →</a></div><div class="photo-categories">${photoCategories.map(([name,sub,photo,category]) => `<a href="${categoryUrl(category)}"><img src="${esc(photo)}" alt="${esc(name)} — foto ilustrativa de ciclismo" loading="lazy"><span class="category-caption"><strong>${name}</strong><small>${sub}</small></span><span class="category-arrow" aria-hidden="true">↗</span></a>`).join('')}</div><p class="photo-disclaimer">Fotos ilustrativas. Consulte modelos e disponibilidade com nossa equipe.</p></section>
    <section class="product-section"><div class="wrap section home-products"><div class="section-heading"><div><p class="section-label">BICICLETAS, PEÇAS E ACESSÓRIOS</p><h2>${products.length ? 'Conheça nossos produtos' : 'Explore as possibilidades'}</h2></div><a class="text-link" href="#/produtos${products.length ? '' : '?modo=demo'}">${products.length ? 'Ver produtos' : 'Ver exemplos'} →</a></div>${!products.length ? '<p class="examples-note">Uma amostra do visual do catálogo. Os itens abaixo são exemplos ilustrativos, sem estoque, marcas ou preços confirmados pela Ciclo Dias.</p>' : ''}<div class="product-grid">${featured.map(productCard).join('')}</div></div></section>
    <section class="wrap section store-story"><div class="story-photo"><img src="${esc(photography.cycling)}" alt="Pessoa com bicicleta em fotografia ilustrativa" loading="lazy"><span>Foto ilustrativa · Unsplash</span></div><div><p class="section-label">SOBRE A CICLO DIAS</p><h2>Bicicletas e peças.<br>Atendimento de perto.</h2><p>Somos loja e distribuidora de bicicletas, peças e acessórios. Atendemos quem pedala e quem trabalha com bicicletas.</p><p>Na compra para uso próprio, revenda ou manutenção, conte com a nossa equipe para consultar os itens de interesse.</p><a class="text-link" href="#/sobre">Conheça a Ciclo Dias →</a></div></section>
    <section class="trade-banner"><div class="wrap"><div><h2>Sua loja ou oficina também pedala com a gente.</h2><p>Solicite a tabela atualizada e consulte as condições para o seu pedido.</p></div><a href="#/tabelas" class="btn yellow">Solicitar tabela de preços →</a></div></section>
    <section class="wrap delivery-teaser"><div><h2>Entrega na sua região</h2><p>${esc(delivery.message)}</p></div><a class="text-link" href="#/entregas">Consultar entregas →</a></section>`;
}

let catalogState = { query: '', category: '', brand: '', mode: 'real' };
let activeRoute = '/';
function catalog(params) {
  catalogState = {
    query: params.get('busca') || '', category: params.get('categoria') || '',
    brand: params.get('marca') || '', mode: params.get('modo') === 'demo' ? 'demo' : 'real',
  };
  const source = catalogState.mode === 'demo' ? demoProducts : products;
  const brands = [...new Set(source.map(product => product.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const categoryOptions = [...new Set([...categories, ...source.map(product => product.category).filter(Boolean)])];
  return `<section class="wrap page">${breadcrumbs('Produtos')}<div class="catalog-cover"><img src="${esc(photography.cycling)}" alt="Ciclismo — fotografia ilustrativa" loading="lazy"><span>Fotografia ilustrativa · Unsplash</span></div><div class="page-heading"><h1>Produtos</h1><p>Busque uma bicicleta, peça ou acessório e adicione ao carrinho para solicitar um orçamento.</p></div>
    ${catalogState.mode === 'demo' ? `<div class="notice demo-notice"><strong>Catálogo de demonstração</strong><p>Estes itens são apenas exemplos de navegação. Não representam produtos ou estoque da Ciclo Dias.</p><a href="#/produtos">Voltar ao catálogo oficial</a></div>` : ''}
    <div class="catalog-layout"><form id="filters" class="filters" role="search" aria-label="Filtros de produtos">
    <h2>Filtrar produtos</h2><label for="search">Nome, marca ou código</label><input type="search" id="search" value="${esc(catalogState.query)}" placeholder="O que você procura?" autocomplete="off">
    <label for="category">Categoria</label><select id="category"><option value="">Todas as categorias</option>${categoryOptions.map(category => `<option value="${esc(category)}"${category === catalogState.category ? ' selected' : ''}>${esc(category)}</option>`).join('')}</select>
    <label for="brand">Marca</label><select id="brand"><option value="">Todas as marcas</option>${brands.map(brand => `<option value="${esc(brand)}"${brand === catalogState.brand ? ' selected' : ''}>${esc(brand)}</option>`).join('')}</select>
    <button type="button" class="text-button" data-clear-filters>Limpar filtros</button>
    <p class="small muted">A lista de marcas acompanha os produtos cadastrados.</p></form>
    <div class="catalog-results"><p id="results-count" class="results-count" role="status"></p><div id="results" class="product-grid"></div></div></div>
    ${demoProducts.length && catalogState.mode === 'real' ? '<details class="demo-access"><summary>Testar a navegação com itens de demonstração</summary><p>O catálogo oficial ainda está vazio. As fotografias são ilustrativas e não representam produtos ou estoque confirmados da loja.</p><a class="text-link" href="#/produtos?modo=demo">Abrir demonstração →</a></details>' : ''}</section>`;
}
function updateResults(syncUrl = false) {
  if (!$('#results')) return;
  catalogState.query = $('#search').value;
  catalogState.category = $('#category').value;
  catalogState.brand = $('#brand').value;
  const source = catalogState.mode === 'demo' ? demoProducts : products;
  const filtered = filterProducts(source, catalogState);
  $('#results-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'produto encontrado' : 'produtos encontrados'}${catalogState.mode === 'demo' ? ' · demonstração' : ''}`;
  $('#results').innerHTML = filtered.length ? filtered.map(productCard).join('') : `<div class="empty-state"><h2>${source.length ? 'Nenhum produto encontrado' : 'Catálogo ainda não cadastrado'}</h2><p>${source.length ? 'Tente outro nome, código ou uma combinação diferente de filtros.' : 'Consulte nossa equipe para saber quais produtos estão disponíveis e receber a tabela atualizada.'}</p>${source.length ? '<button class="btn secondary" data-clear-filters>Limpar filtros</button>' : contactButton('Consultar produtos')}</div>`;
  if (syncUrl) {
    const params = new URLSearchParams();
    if (catalogState.query) params.set('busca', catalogState.query);
    if (catalogState.category) params.set('categoria', catalogState.category);
    if (catalogState.brand) params.set('marca', catalogState.brand);
    if (catalogState.mode === 'demo') params.set('modo', 'demo');
    history.replaceState(null, '', '#/produtos' + (params.size ? '?' + params.toString() : ''));
    $('#header-query').value = catalogState.query;
  }
}
function productPage(id) {
  const product = allProducts.find(item => item.id === id);
  if (!product) return `<section class="wrap page">${breadcrumbs('Produto não encontrado', true)}<h1>Produto não encontrado</h1><p>Este produto não está cadastrado no catálogo.</p><a class="btn yellow" href="#/produtos">Voltar aos produtos</a></section>`;
  return `<section class="wrap page">${breadcrumbs(product.name, true)}${product.demo ? '<div class="notice demo-notice"><strong>Produto de demonstração.</strong> Este item é um exemplo de navegação, sem estoque ou especificações comerciais confirmadas.</div>' : ''}
    <div class="product-detail">${productImage(product, false)}<div class="product-info"><p class="section-label">${esc(product.category)}</p><h1>${esc(product.name)}</h1>
    <dl class="product-facts"><div><dt>Marca</dt><dd>${esc(product.brand || 'Não informada')}</dd></div><div><dt>${product.demo ? 'Código de demonstração' : 'Código'}</dt><dd>${esc(product.code || 'Não informado')}</dd></div></dl>
    <p class="detail-price">${price(product)}</p><p class="muted small">Preço e disponibilidade confirmados pela equipe no atendimento.</p>
    <div class="product-add"><label for="product-quantity">Quantidade</label><input type="number" id="product-quantity" min="1" max="999" step="1" value="1" inputmode="numeric"><button class="btn yellow" data-add="${esc(product.id)}" data-detail-add>Adicionar ao carrinho</button></div>
    ${contactButton('Consultar este produto', productMessage(product), 'btn secondary')}
    <a class="text-link view-cart" href="#/carrinho">Ver carrinho de orçamento →</a></div></div>
    <section class="product-description"><h2>Detalhes do produto</h2><p>${esc(product.description || 'Consulte a equipe para conhecer os detalhes deste produto.')}</p>${product.variations?.length ? `<h3>Variações informadas</h3><ul>${product.variations.map(value => `<li>${esc(value)}</li>`).join('')}</ul><p class="small muted">Confirme a opção desejada com a equipe ao solicitar o orçamento.</p>` : ''}</section></section>`;
}
function cartPage() {
  const total = cartCount(cart);
  return `<section class="wrap page">${breadcrumbs('Carrinho')}<div class="page-heading"><h1>Carrinho de orçamento</h1><p>Confira os itens e as quantidades. O atendimento confirma preços, disponibilidade e entrega pelo WhatsApp.</p></div>
    ${!storageAvailable ? '<div class="notice">Seu navegador não permitiu salvar o carrinho. Os itens ficam disponíveis apenas nesta sessão.</div>' : ''}
    ${!cart.length ? `<div class="empty-state cart-empty">${icons.cart}<h2>Seu carrinho está vazio</h2><p>Adicione os produtos que você procura para consultar tudo em uma única mensagem.</p><a class="btn yellow" href="#/produtos">Ver produtos</a>${!products.length && demoProducts.length ? '<a class="text-link" href="#/produtos?modo=demo">Testar com itens de demonstração</a>' : ''}</div>` : `<div class="cart-layout"><div><div class="cart-table-heading"><span>Produto</span><span>Quantidade</span></div><ul class="cart-items">${cart.map(item => {
      const product = allProducts.find(product => product.id === item.id);
      return `<li class="cart-item" data-cart-id="${esc(item.id)}"><a class="cart-image-link" href="${productUrl(product)}" aria-label="Ver ${esc(product.name)}">${productImage(product)}</a><div class="cart-item-info"><a class="cart-product-name" href="${productUrl(product)}">${esc(product.name)}</a><p>${product.brand ? esc(product.brand) + ' · ' : ''}${product.code ? 'Cód. ' + esc(product.code) : 'Código a informar'}</p>${product.demo ? '<span class="cart-demo">Item de demonstração</span>' : ''}<p class="cart-price">${price(product)}</p><button class="remove-button" data-remove="${esc(item.id)}" aria-label="Remover ${esc(product.name)}">Remover</button></div><div class="quantity-control"><button data-quantity-step="-1" data-id="${esc(item.id)}" aria-label="Diminuir quantidade de ${esc(product.name)}"${item.quantity === 1 ? ' disabled' : ''}>−</button><input aria-label="Quantidade de ${esc(product.name)}" data-quantity="${esc(item.id)}" type="number" min="1" max="999" step="1" inputmode="numeric" value="${item.quantity}"><button data-quantity-step="1" data-id="${esc(item.id)}" aria-label="Aumentar quantidade de ${esc(product.name)}"${item.quantity === 999 ? ' disabled' : ''}>+</button></div></li>`;
    }).join('')}</ul><div class="cart-bottom-actions"><a class="text-link" href="#/produtos">← Continuar escolhendo</a><button class="text-button" id="clear-cart">Esvaziar carrinho</button></div></div>
    <aside class="cart-summary"><h2>Solicitar orçamento</h2><div class="summary-row"><span>Produtos diferentes</span><strong>${cart.length}</strong></div><div class="summary-row"><span>Quantidade total</span><strong data-total-quantity>${total} ${total === 1 ? 'unidade' : 'unidades'}</strong></div><p class="summary-price">Valores a confirmar</p><p>Os itens não ficam reservados. A equipe vai confirmar preços, estoque e condições do pedido.</p>${cart.some(item => allProducts.find(product => product.id === item.id)?.demo) ? '<p class="demo-warning">Sua lista contém itens de demonstração. Eles serão identificados na mensagem e não representam estoque real.</p>' : ''}${contactButton('Pedir orçamento no WhatsApp', cartMessage(cart, allProducts), 'btn yellow checkout-button')}<p class="small muted">Você revisa a mensagem no WhatsApp antes de enviá-la. Nenhum pagamento é realizado pelo site.</p></aside></div>`}</section>`;
}
function about() {
  return `<section class="wrap page">${breadcrumbs('Sobre a Ciclo Dias')}<div class="page-heading"><h1>Sobre a Ciclo Dias</h1><p>Loja e distribuidora de bicicletas, peças e acessórios.</p></div><div class="info-layout"><article class="prose"><img class="about-photo" src="${esc(photography.cycling)}" alt="Ciclistas em fotografia ilustrativa" loading="lazy"><p class="photo-disclaimer">Fotografia ilustrativa de ciclismo · Unsplash</p><h2>Atacado e varejo</h2><p>A Ciclo Dias atende consumidores finais, lojistas e profissionais que compram peças para revenda e manutenção.</p><p>Nosso atendimento pelo WhatsApp facilita a consulta de produtos, reposições e tabelas de preços. Fale com a equipe para conhecer os itens disponíveis e as condições do seu pedido.</p><h2>Bicicletas, peças e acessórios</h2><p>Consulte bicicletas, componentes para manutenção e acessórios. Se procura uma peça específica, informe nome, marca, código ou medida para ajudar no atendimento.</p><p class="brand-slogan">${esc(company.slogan)}</p></article><aside class="info-aside"><h2>Como podemos ajudar?</h2><p>Consulte produtos para sua bicicleta, sua loja ou sua oficina.</p>${contactButton()}<a class="text-link" href="#/produtos">Ver produtos →</a></aside></div></section>`;
}
function deliveries() {
  return `<section class="wrap page">${breadcrumbs('Entregas')}<div class="page-heading"><h1>Entregas</h1><p>${esc(delivery.message)}</p></div><div class="info-layout"><article class="prose"><h2>Consulte antes de fechar seu pedido</h2><p>A equipe confirma a região atendida, o valor do frete, eventuais valores mínimos e o prazo de entrega para o seu pedido.</p><h2>O que informar no atendimento</h2><ul><li>Sua cidade, bairro e CEP.</li><li>Os produtos e as quantidades de interesse.</li><li>Se a compra é para uso próprio, revenda ou manutenção.</li></ul>${delivery.regions.length ? `<h2>Condições cadastradas</h2><div class="region-list">${delivery.regions.map(region => `<section><h3>${esc(region.name)}</h3>${region.details ? `<p>${esc(region.details)}</p>` : '<p>Consulte as condições com a equipe.</p>'}</section>`).join('')}</div>` : '<p class="muted">As condições atuais ainda não foram publicadas no site. Confirme todos os detalhes no atendimento.</p>'}</article><aside class="info-aside"><h2>Entrega para sua região</h2><p>Envie seu bairro e CEP para consultar as condições.</p>${contactButton('Consultar entrega', 'Olá! Gostaria de consultar as condições de entrega. Minha cidade, bairro e CEP são: ')}</aside></div></section>`;
}
function contact() {
  return `<section class="wrap page">${breadcrumbs('Contato')}<div class="page-heading"><h1>Contato</h1><p>Fale com a Ciclo Dias para consultar produtos, tabela de preços e entregas.</p></div><div class="contact-grid"><section class="contact-primary"><h2>Atendimento pelo WhatsApp</h2><p>Informe o produto, a marca ou o código que você procura. Para vários itens, use o carrinho e envie uma única solicitação de orçamento.</p>${contactButton()}${!whatsappUrl(company.whatsapp, 'Consulta') ? '<p class="muted small">O número oficial ainda não está disponível. Use o e-mail abaixo.</p>' : ''}<a class="text-link" href="#/carrinho">Ir para o carrinho →</a></section><section class="contact-card"><h2>E-mail</h2><a href="mailto:${esc(company.email)}">${esc(company.email)}</a><h2>Redes e canais</h2>${company.instagram ? `<a href="${esc(company.instagram)}" target="_blank" rel="noopener noreferrer">@ciclodiasatacadovarejo</a>` : '<p>Instagram a informar.</p>'}${company.channel ? `<a href="${esc(company.channel)}" target="_blank" rel="noopener noreferrer">Canal do WhatsApp</a>` : ''}</section></div>${company.address || company.hours ? `<div class="contact-secondary">${company.address ? `<section><h2>Endereço</h2><p>${esc(company.address)}</p></section>` : ''}${company.hours ? `<section><h2>Horário de atendimento</h2><p>${esc(company.hours)}</p></section>` : ''}</div>` : ''}</section>`;
}
function tablePage() {
  return `<section class="wrap page">${breadcrumbs('Tabela de preços')}<div class="page-heading"><h1>Tabela de preços</h1><p>Solicite a versão atualizada para planejar o seu pedido.</p></div><div class="info-layout"><article class="prose"><h2>Consulte nossa equipe</h2><p>As tabelas são compartilhadas em PDF e Excel pelo atendimento. Antes de fechar o pedido, confirme os preços e a disponibilidade dos itens.</p>${contactButton('Solicitar tabela de preços', 'Olá! Gostaria de receber a tabela de preços atualizada da Ciclo Dias.')}</article><aside class="info-aside"><h2>Arquivos para download</h2>${tables.updatedAt ? `<p>Atualizada em ${new Date(tables.updatedAt + 'T12:00:00').toLocaleDateString('pt-BR')}</p>` : ''}${tables.pdf ? `<a class="btn secondary" href="${esc(tables.pdf)}" download>Baixar PDF</a>` : ''}${tables.excel ? `<a class="btn secondary" href="${esc(tables.excel)}" download>Baixar Excel</a>` : ''}${!tables.pdf && !tables.excel ? '<p>Nenhum arquivo cadastrado. Peça a tabela atual pelo WhatsApp.</p>' : ''}</aside></div></section>`;
}

function render() {
  const fragment = location.hash.slice(1);
  if (fragment === 'conteudo') return;
  const [path, query = ''] = fragment.split('?');
  activeRoute = path === '/catalogo' ? '/produtos' : path || '/';
  const params = new URLSearchParams(query);
  // Resolve catalog state before rendering the header search.
  if (activeRoute === '/produtos') catalogState.query = params.get('busca') || '';
  let content;
  let title;
  if (activeRoute === '/') { content = home(); title = 'Bicicletas, peças e acessórios'; }
  else if (activeRoute === '/produtos') { content = catalog(params); title = 'Produtos'; }
  else if (activeRoute === '/carrinho') { content = cartPage(); title = 'Carrinho de orçamento'; }
  else if (activeRoute === '/sobre') { content = about(); title = 'Sobre a Ciclo Dias'; }
  else if (activeRoute === '/entregas') { content = deliveries(); title = 'Entregas'; }
  else if (activeRoute === '/contato') { content = contact(); title = 'Contato'; }
  else if (activeRoute === '/tabelas') { content = tablePage(); title = 'Tabela de preços'; }
  else if (activeRoute.startsWith('/produto/')) {
    let id = '';
    try { id = decodeURIComponent(activeRoute.slice(9)); } catch { /* Invalid URL follows the not-found path. */ }
    content = productPage(id); title = allProducts.find(product => product.id === id)?.name || 'Produto não encontrado';
  } else { title = 'Página não encontrada'; content = '<section class="wrap page"><h1>Página não encontrada</h1><p>O endereço acessado não existe.</p><a class="btn yellow" href="#/">Voltar ao início</a></section>'; }
  document.title = title + ' | Ciclo Dias';
  $('meta[name="description"]').content = activeRoute === '/carrinho'
    ? 'Reúna os produtos e quantidades e solicite seu orçamento à Ciclo Dias pelo WhatsApp.'
    : `${title}. Ciclo Dias: bicicletas, peças e acessórios no atacado e no varejo. Consulte preços e disponibilidade com nossa equipe.`;
  $('#app').innerHTML = header() + `<main id="conteudo" tabindex="-1">${content}</main>` + footer();
  if (activeRoute === '/produtos') updateResults();
}
function toast(message) {
  $('#notice').textContent = message;
  $('#notice').classList.add('visible');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => $('#notice').classList.remove('visible'), 3500);
}
function persistCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
    toast('Seu navegador não permitiu salvar o carrinho. Os itens ficam nesta sessão.');
  }
  document.querySelectorAll('.cart-count').forEach(element => element.textContent = cartCount(cart));
  document.querySelectorAll('.cart-link').forEach(element => element.setAttribute('aria-label', `Carrinho: ${countLabel()}`));
}
function refreshCart(focusSelector) {
  const y = window.scrollY;
  render();
  const element = focusSelector ? $(focusSelector) : null;
  element?.focus({ preventScroll: true });
  window.scrollTo(0, y);
}
function openDialog(content) {
  $('#dialog').innerHTML = `<button class="close-dialog" aria-label="Fechar">×</button>${content}`;
  if (!$('#dialog').open) $('#dialog').showModal();
}
function contactAction(message) {
  const url = whatsappUrl(company.whatsapp, message);
  if (url) { window.open(url, '_blank', 'noopener,noreferrer'); return; }
  openDialog(`<h2>WhatsApp ainda não disponível</h2><p>Entre em contato por e-mail ou copie a mensagem para usar quando o canal estiver disponível.</p><a class="email-link" href="mailto:${esc(company.email)}?subject=Or%C3%A7amento%20Ciclo%20Dias&body=${encodeURIComponent(message)}">${esc(company.email)}</a><label for="contact-message">Sua mensagem</label><textarea id="contact-message" readonly>${esc(message)}</textarea><button class="btn yellow" id="copy-message">Copiar mensagem</button>`);
}
function clearFilters() {
  $('#search').value = '';
  $('#category').value = '';
  $('#brand').value = '';
  updateResults(true);
}
function updateQuantity(id, value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 999) {
    toast('Informe uma quantidade inteira entre 1 e 999.');
    const input = document.querySelector(`[data-quantity="${CSS.escape(id)}"]`);
    if (input) input.value = cart.find(item => item.id === id)?.quantity || 1;
    return;
  }
  cart = setCartQuantity(cart, id, number, allProducts);
  persistCart();
  const input = document.querySelector(`[data-quantity="${CSS.escape(id)}"]`);
  if (input) input.value = number;
  const row = input?.closest('.cart-item');
  row?.querySelector('[data-quantity-step="-1"]')?.toggleAttribute('disabled', number === 1);
  row?.querySelector('[data-quantity-step="1"]')?.toggleAttribute('disabled', number === 999);
  if ($('[data-total-quantity]')) $('[data-total-quantity]').textContent = `${cartCount(cart)} ${cartCount(cart) === 1 ? 'unidade' : 'unidades'}`;
  if ($('.checkout-button')) $('.checkout-button').dataset.contact = cartMessage(cart, allProducts);
}

document.addEventListener('submit', event => {
  if (event.target.matches('[data-search]')) {
    event.preventDefault();
    const query = new FormData(event.target).get('busca').trim();
    location.hash = '/produtos' + (query ? '?busca=' + encodeURIComponent(query) : '');
    if (activeRoute === '/produtos') render();
  } else if (event.target.id === 'filters') event.preventDefault();
});
document.addEventListener('input', event => {
  if (['search', 'category', 'brand'].includes(event.target.id)) updateResults(true);
});
document.addEventListener('change', event => {
  if (event.target.matches('[data-quantity]')) updateQuantity(event.target.dataset.quantity, event.target.value);
});
document.addEventListener('click', async event => {
  const element = event.target.closest('button,a');
  if (!element) return;
  if (element.matches('.theme-toggle')) window.cicloTheme.toggle();
  if (element.matches('[data-contact]')) contactAction(element.dataset.contact);
  if (element.matches('[data-add]')) {
    const quantity = element.hasAttribute('data-detail-add') ? Number($('#product-quantity').value) : 1;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
      toast('Informe uma quantidade inteira entre 1 e 999.'); $('#product-quantity')?.focus(); return;
    }
    cart = addCartItem(cart, element.dataset.add, allProducts, quantity);
    persistCart();
    toast(`${quantity === 1 ? 'Produto adicionado' : 'Produtos adicionados'} ao carrinho. Acesse Carrinho para pedir o orçamento.`);
  }
  if (element.matches('[data-remove]')) {
    cart = removeCartItem(cart, element.dataset.remove); persistCart(); refreshCart('main h1'); toast('Produto removido do carrinho.');
  }
  if (element.matches('[data-quantity-step]')) {
    const item = cart.find(item => item.id === element.dataset.id);
    if (item) updateQuantity(item.id, item.quantity + Number(element.dataset.quantityStep));
  }
  if (element.id === 'clear-cart') {
    openDialog('<h2>Esvaziar carrinho?</h2><p>Todos os itens serão removidos desta lista de orçamento.</p><div class="dialog-actions"><button class="btn yellow" id="confirm-clear-cart">Esvaziar carrinho</button><button class="btn secondary close-dialog-action">Manter itens</button></div>');
  }
  if (element.id === 'confirm-clear-cart') {
    cart = []; persistCart(); $('#dialog').close(); refreshCart(); toast('Carrinho esvaziado.');
  }
  if (element.matches('[data-clear-filters]')) clearFilters();
  if (element.matches('.menu-toggle')) {
    const open = element.getAttribute('aria-expanded') !== 'true';
    element.setAttribute('aria-expanded', String(open));
    element.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    $('#main-nav').classList.toggle('open', open);
  }
  if (element.matches('.close-dialog,.close-dialog-action')) $('#dialog').close();
  if (element.id === 'copy-message') {
    try { await navigator.clipboard.writeText($('#contact-message').value); element.textContent = 'Mensagem copiada'; }
    catch { $('#contact-message').focus(); $('#contact-message').select(); element.textContent = 'Selecione e copie a mensagem acima'; }
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && $('#main-nav')?.classList.contains('open')) {
    $('#main-nav').classList.remove('open');
    $('.menu-toggle').setAttribute('aria-expanded', 'false');
    $('.menu-toggle').setAttribute('aria-label', 'Abrir menu');
    $('.menu-toggle').focus();
  }
});
document.addEventListener('error', event => {
  if (event.target.matches?.('img')) {
    const image = event.target;
    if (!image.dataset.fallback) {
      image.dataset.fallback = 'true';
      image.src = image.classList.contains('official-logo') ? '/assets/logo-ciclo-dias.png' : photography.bicycle;
    }
  }
}, true);
$('#dialog').addEventListener('click', event => {
  if (event.target !== $('#dialog')) return;
  const bounds = $('#dialog').getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) $('#dialog').close();
});
$('.skip').addEventListener('click', event => { event.preventDefault(); $('#conteudo')?.focus(); });
window.addEventListener('hashchange', () => {
  if ($('#dialog').open) $('#dialog').close();
  render(); window.scrollTo(0, 0); $('#conteudo').focus({ preventScroll: true });
});
window.addEventListener('storage', event => {
  if (event.key !== CART_KEY && event.key !== null) return;
  try { cart = normalizeCart(JSON.parse(event.newValue || '[]'), allProducts); } catch { cart = []; }
  persistCart();
  if (activeRoute === '/carrinho') refreshCart();
});
render();
