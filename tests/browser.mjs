// Run with the development server already running:
//   npm start
//   node tests/browser.mjs
// Playwright and Chromium must be installed in the test environment.
// Test fixtures are injected only into browser responses, never into data.js.
import { createRequire } from 'node:module';
import { readFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const origin = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const screenshots = process.env.TEST_SCREENSHOT_DIR || '/workspace/scratch/ciclodias-v2';
const source = await readFile(new URL('../data.js', import.meta.url), 'utf8');
const fixtures = [
  { id: 'test-camara', name: 'Câmara de teste', brand: 'Marca A (teste)', code: 'TEST-001', category: 'Pneus e câmaras', description: 'Descrição de teste; não é produto comercial.', image: '', price: null, variations: ['Medida de teste'], demo: false },
  { id: 'test-pneu', name: 'Pneu de teste', brand: 'Marca B (teste)', code: 'TEST-002', category: 'Pneus e câmaras', description: 'Outro produto de teste.', image: '', price: 12.34, variations: [], demo: false },
  { id: 'test-capacete', name: 'Capacete de teste', brand: 'Marca A (teste)', code: 'TEST-003', category: 'Capacetes e acessórios', description: '', image: '', price: null, variations: [], demo: false },
];
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const errors = [];
let assertions = 0;
const check = (value, message) => { assert.ok(value, message); assertions += 1; };
const equal = (actual, expected, message) => { assert.deepEqual(actual, expected, message); assertions += 1; };
async function newContext(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => { window.openedUrls = []; window.open = (url, target, features) => { window.openedUrls.push({url, target, features}); return null; }; });
  if (options.mockCatalog || options.blankWhatsapp) {
    const mocked = source
      .replace('export const products=[];', `export const products=${JSON.stringify(options.mockCatalog ? fixtures : [])};`)
      .replace(/whatsapp:'[^']*'/, options.blankWhatsapp ? "whatsapp:''" : "whatsapp:'5511959455681'");
    await context.route('**/data.js', route => route.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: mocked }));
  }
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  return context;
}
async function go(page, route = '/') {
  await page.goto(`${origin}/#${route}`);
  await page.locator('main h1').waitFor();
}
async function count(page, expected) { equal(await page.locator('.cart-count').innerText(), String(expected), 'cart counter'); }
async function qty(page, id, expected) { equal(await page.locator(`[data-quantity="${id}"]`).inputValue(), String(expected), `quantity ${id}`); }
async function noOverflow(page, label) { check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `horizontal overflow: ${label}`); }
async function imagesLoaded(page) {
  const broken = await page.evaluate(async () => {
    const images = [...document.images];
    images.forEach(image => image.loading = 'eager');
    await Promise.all(images.map(image => image.decode().catch(() => {})));
    return images.filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src);
  });
  equal(broken, [], 'all image resources loaded');
  equal(await page.locator('.logo-pending,.photo-pending').count(), 0, 'no placeholder blocks');
}

try {
  await mkdir(screenshots, { recursive: true });
  const real = await newContext();
  const page = await real.newPage();
  await go(page);
  await imagesLoaded(page);
  await page.screenshot({ path: `${screenshots}/inicio-desktop.png`, fullPage: true });
  equal(await page.locator('.home-products .product-card').count(), 4, 'illustrative homepage examples');
  equal(await page.locator('.home-products .demo-tag').count(), 4, 'each homepage example explicitly labeled');
  check(await page.locator('.examples-note').isVisible(), 'homepage distinguishes examples from real stock');
  equal(await page.locator('.official-logo').count(), 2, 'official logo in header and footer');
  for (const [route, heading] of [
    ['/', 'Bicicletas, peças e acessórios.'], ['/produtos', 'Produtos'], ['/catalogo', 'Produtos'],
    ['/sobre', 'Sobre a Ciclo Dias'], ['/entregas', 'Entregas'], ['/contato', 'Contato'],
    ['/carrinho', 'Carrinho de orçamento'], ['/tabelas', 'Tabela de preços'],
  ]) {
    await go(page, route);
    equal((await page.locator('main h1').innerText()).replace(/\s+/g, ' ').trim(), heading, `route ${route}`);
    await noOverflow(page, `1440 ${route}`);
    await imagesLoaded(page);
    if (['/produtos', '/sobre', '/entregas', '/contato'].includes(route)) await page.screenshot({path: `${screenshots}/${route.slice(1)}-desktop.png`, fullPage:true});
  }
  await go(page, '/produtos');
  equal(await page.locator('.product-card').count(), 0, 'real catalog empty');
  check(await page.getByRole('heading', { name: 'Catálogo ainda não cadastrado' }).isVisible(), 'empty official catalog');
  await page.locator('.demo-access summary').click();
  await page.getByRole('link', { name: 'Abrir demonstração' }).click();
  await page.locator('.demo-notice').waitFor();
  equal(await page.locator('.product-card').count(), 4, 'demo catalog has four isolated items');
  check(await page.locator('.demo-notice').isVisible(), 'demo notice');
  await page.locator('[data-add="demo-bicicleta"]').click();
  await page.locator('[data-add="demo-bicicleta"]').click();
  await count(page, 2);
  await page.locator('[data-add="demo-capacete"]').click();
  await count(page, 3);
  await page.locator('.cart-link').click();
  await page.locator('.cart-item').first().waitFor();
  await qty(page, 'demo-bicicleta', 2);
  equal(await page.locator('.cart-item').count(), 2, 'repeated additions increment existing line');
  await page.locator('[data-id="demo-bicicleta"][data-quantity-step="1"]').click();
  await qty(page, 'demo-bicicleta', 3);
  await count(page, 4);
  await page.locator('[data-id="demo-bicicleta"][data-quantity-step="-1"]').click();
  await qty(page, 'demo-bicicleta', 2);
  const quantity = page.locator('[data-quantity="demo-bicicleta"]');
  await quantity.fill('5'); await quantity.blur();
  await qty(page, 'demo-bicicleta', 5); await count(page, 6);
  for (const invalid of ['0', '-2', '1.5', '1000', '']) {
    await quantity.fill(invalid); await quantity.blur();
    await qty(page, 'demo-bicicleta', 5); await count(page, 6);
  }
  check(await page.locator('[data-id="demo-capacete"][data-quantity-step="-1"]').isDisabled(), 'cannot decrement below one');
  await page.reload(); await qty(page, 'demo-bicicleta', 5); await count(page, 6);
  const returning = await real.newPage(); await go(returning, '/carrinho');
  await qty(returning, 'demo-bicicleta', 5); await count(returning, 6);
  await returning.close();
  await page.locator('#clear-cart').click();
  await page.getByRole('button', { name: 'Manter itens' }).click();
  equal(await page.locator('.cart-item').count(), 2, 'cancel clear preserves cart');
  await page.locator('[data-remove="demo-capacete"]').click();
  equal(await page.locator('.cart-item').count(), 1, 'remove cart item'); await count(page, 5);
  await page.locator('.checkout-button').click();
  const opened = await page.evaluate(() => window.openedUrls);
  equal(opened.length, 1, 'checkout opens one URL');
  const checkout = new URL(opened[0].url);
  equal(checkout.hostname, 'wa.me', 'checkout destination');
  equal(checkout.pathname, '/5511959455681', 'configured WhatsApp number');
  check(checkout.searchParams.get('text').includes('Quantidade: 5'), 'quantity in message');
  check(checkout.searchParams.get('text').includes('DEMO-01'), 'code in message');
  check(checkout.searchParams.get('text').includes('demonstração'), 'demo warning in message');
  await imagesLoaded(page);
  await page.waitForTimeout(3600);
  await page.screenshot({ path: `${screenshots}/carrinho-desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: `${screenshots}/carrinho-celular.png`, fullPage: true });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ['/', '/produtos', '/produtos?modo=demo', '/produto/demo-bicicleta', '/sobre', '/entregas', '/contato', '/carrinho', '/tabelas']) {
      await go(page, route); await noOverflow(page, `${width} ${route}`); await imagesLoaded(page);
      if (width === 390 && route === '/') await page.screenshot({ path: `${screenshots}/inicio-celular.png`, fullPage: true });
    }
  }
  await go(page);
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  check(await page.locator('#main-nav').isVisible(), 'mobile menu opens');
  await page.locator('#main-nav a[href="#/produtos"]').click();
  await page.locator('#search').waitFor();
  equal(await page.locator('main h1').innerText(), 'Produtos', 'mobile nav link');
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await page.keyboard.press('Escape');
  equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false', 'escape closes mobile menu');
  await go(page, '/carrinho');
  await page.locator('#clear-cart').click();
  await page.locator('#confirm-clear-cart').click();
  check(await page.getByRole('heading', { name: 'Seu carrinho está vazio' }).isVisible(), 'confirmed clear removes all');
  await count(page, 0);
  await page.evaluate(() => { localStorage.removeItem('ciclodias-cart'); localStorage.setItem('ciclodias-budget', JSON.stringify(['demo-bicicleta', 'demo-capacete'])); });
  await page.reload(); await qty(page, 'demo-bicicleta', 1); await qty(page, 'demo-capacete', 1); await count(page, 2);
  await page.evaluate(() => localStorage.setItem('ciclodias-cart', '{invalid-json'));
  await page.reload(); await count(page, 0);
  check(await page.getByRole('heading', { name: 'Seu carrinho está vazio' }).isVisible(), 'corrupt storage falls back safely');
  await go(page, '/produto/inexistente');
  check(await page.getByRole('heading', { name: 'Produto não encontrado' }).isVisible(), 'unknown product');
  await go(page, '/produto/%E0%A4%A');
  check(await page.getByRole('heading', { name: 'Produto não encontrado' }).isVisible(), 'invalid URL encoding');
  await go(page, '/pagina-inexistente');
  check(await page.getByRole('heading', { name: 'Página não encontrada' }).isVisible(), 'unknown route');
  await real.close();

  const mock = await newContext({ mockCatalog: true });
  const fixturePage = await mock.newPage();
  await go(fixturePage, '/produtos');
  equal(await fixturePage.locator('.product-card').count(), 3, 'browser-only catalog fixtures');
  await fixturePage.locator('#search').fill('camara');
  equal(await fixturePage.locator('.product-card').count(), 1, 'accent-insensitive product name search');
  await fixturePage.locator('#search').fill('TEST-002');
  equal(await fixturePage.locator('.product-card h3').innerText(), 'Pneu de teste', 'search by code');
  await fixturePage.locator('[data-clear-filters]').first().click();
  await fixturePage.locator('#brand').selectOption('Marca A (teste)');
  equal(await fixturePage.locator('.product-card').count(), 2, 'brand filter');
  await fixturePage.locator('#category').selectOption('Pneus e câmaras');
  equal(await fixturePage.locator('.product-card h3').innerText(), 'Câmara de teste', 'brand and category combined');
  await fixturePage.locator('#search').fill('capacete');
  equal(await fixturePage.locator('.product-card').count(), 0, 'search and filters combined without results');
  check(await fixturePage.getByRole('heading', { name: 'Nenhum produto encontrado' }).isVisible(), 'no-results state');
  await fixturePage.reload();
  equal(await fixturePage.locator('#category').inputValue(), 'Pneus e câmaras', 'category persists in URL');
  equal(await fixturePage.locator('#brand').inputValue(), 'Marca A (teste)', 'brand persists in URL');
  equal(await fixturePage.locator('#search').inputValue(), 'capacete', 'search persists in URL');
  await fixturePage.locator('[data-clear-filters]').first().click();
  await fixturePage.locator('#header-query').fill('TEST-001');
  await fixturePage.getByRole('button', { name: 'Buscar produtos', exact: true }).click();
  await fixturePage.waitForURL('**/#/produtos?busca=TEST-001');
  await fixturePage.locator('.product-card').first().waitFor();
  equal(await fixturePage.locator('.product-card').count(), 1, 'header search');
  await fixturePage.locator('.product-card h3 a').click();
  await fixturePage.locator('.product-info h1').waitFor();
  equal(await fixturePage.locator('main h1').innerText(), 'Câmara de teste', 'product page navigation');
  check((await fixturePage.locator('.product-facts').innerText()).includes('Marca A (teste)'), 'product brand');
  check((await fixturePage.locator('.product-facts').innerText()).includes('TEST-001'), 'product code');
  check((await fixturePage.locator('.product-description').innerText()).includes('Medida de teste'), 'product variants');
  check((await fixturePage.locator('.detail-price').innerText()).includes('Consulte pelo WhatsApp'), 'missing price');
  await fixturePage.locator('#product-quantity').fill('4');
  await fixturePage.locator('[data-detail-add]').click(); await count(fixturePage, 4);
  await fixturePage.locator('#product-quantity').fill('0');
  await fixturePage.locator('[data-detail-add]').click(); await count(fixturePage, 4);
  await go(fixturePage, '/carrinho');
  await fixturePage.locator('.checkout-button').click();
  const fixtureUrl = new URL(await fixturePage.evaluate(() => window.openedUrls.at(-1).url));
  check(fixtureUrl.searchParams.get('text').includes('Marca A (teste)'), 'brand in checkout message');
  check(fixtureUrl.searchParams.get('text').includes('Quantidade: 4'), 'product detail quantity in checkout');
  await go(fixturePage, '/produto/test-pneu');
  check((await fixturePage.locator('.detail-price').innerText()).includes('12,34'), 'real registered price formatting from browser-only fixture');
  await mock.close();

  const fallback = await newContext({ blankWhatsapp: true });
  const fallbackPage = await fallback.newPage();
  await go(fallbackPage, '/produto/demo-capacete');
  await fallbackPage.locator('[data-detail-add]').click();
  await go(fallbackPage, '/carrinho');
  await fallbackPage.locator('.checkout-button').click();
  check(await fallbackPage.getByRole('heading', { name: 'WhatsApp ainda não disponível' }).isVisible(), 'missing-number fallback');
  check((await fallbackPage.locator('#contact-message').inputValue()).includes('Quantidade: 1'), 'fallback contains budget message');
  equal(await fallbackPage.evaluate(() => window.openedUrls.length), 0, 'missing number never opens a false link');
  check((await fallbackPage.locator('.email-link').getAttribute('href')).startsWith('mailto:diasciclo@yahoo.com.br'), 'fallback email');
  await fallback.close();
  equal(errors, [], 'no JavaScript errors');
  console.log(`PASS: ${assertions} browser assertions. Navigation, search, combined filters, cart, persistence, migration, WhatsApp, fallback and responsive layout verified. Screenshots: ${screenshots}`);
} finally {
  await browser.close();
}
