// Requer npm start em outro terminal, Playwright e Chromium no ambiente de teste.
import { createRequire } from 'node:module';
import { readFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const { chromium } = createRequire(import.meta.url)('playwright');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const output = process.env.TEST_SCREENSHOT_DIR || '/workspace/scratch/ciclodias-html';
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-gpu'],
});
let checks = 0;
const errors = [];
const check = (condition, label) => { assert.ok(condition, label); checks += 1; };
const pages = ['index', 'produtos', 'sobre', 'entregas', 'contato', 'carrinho', 'tabelas',
  'produto-bicicleta', 'produto-capacete', 'produto-camara', 'produto-bolsa'];

async function context(options = {}) {
  const instance = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light', ...options });
  // Este ambiente bloqueia o Unsplash; o teste verifica a alternativa local, não a rede externa.
  await instance.route('https://images.unsplash.com/**', route => route.abort());
  instance.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  await instance.addInitScript(() => { window.openedUrls = []; window.open = url => { window.openedUrls.push(url); }; });
  return instance;
}
function pagePath(file) {
  const [filename, query = ''] = file.split('?');
  const name = filename.replace('.html', '');
  const folder = name === 'index' ? 'inicio' : name;
  return `paginas/${folder}/${name === 'index' ? 'inicio.html' : filename}${query ? '?' + query : ''}`;
}
async function go(page, path) {
  const response = await page.goto(base + '/' + pagePath(path));
  check(response.status() === 200, 'HTML acessível: ' + path);
  await page.locator('main h1').waitFor();
  await page.waitForFunction(() => !document.documentElement.classList.contains('no-js'));
}
async function images(page) {
  const broken = await page.evaluate(async () => {
    document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
    await document.fonts.ready;
    await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
    return [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.src);
  });
  check(broken.length === 0, 'fotos e logo carregam: ' + broken.join(', '));
}
async function count(page, expected) {
  await page.waitForFunction(total => document.querySelector('.cart-count')?.textContent.trim() === String(total), expected);
  checks += 1;
}

try {
  await mkdir(output, { recursive: true });
  const normal = await context();
  const page = await normal.newPage();

  for (const name of pages) {
    await go(page, name + '.html');
    await images(page);
    check(await page.locator('.official-logo').count() === 2, 'logo nos dois locais');
    check(await page.locator('a[href^="#/"]').count() === 0, 'links físicos entre páginas');
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'sem overflow no computador');
  }

  await go(page, 'index.html');
  await images(page);
  await page.screenshot({ path: output + '/inicio-desktop.png', fullPage: true });
  check(await page.locator('img.hero-photo').getAttribute('data-fallback') === '../../assets/ciclismo-urbano.png', 'alternativa da foto está no HTML');
  await page.locator('#main-nav a[href$="/sobre.html"]').click();
  await page.waitForURL('**/sobre.html');
  check(await page.locator('main h1').innerText() === 'Sobre a Ciclo Dias', 'navegação por link HTML');

  await go(page, 'produtos.html');
  check(await page.locator('#catalogo-real .product-card:visible').count() === 0, 'catálogo oficial vazio preservado');
  await page.locator('.demo-access summary').click();
  await page.getByRole('link', { name: 'Abrir demonstração' }).click();
  await page.waitForURL('**/produtos.html?modo=demo');
  check(await page.locator('#catalogo-demonstracao .product-card:visible').count() === 4, 'exemplos separados');
  await page.locator('#search').fill('DEMO-02');
  check(await page.locator('#catalogo-demonstracao .product-card:visible').count() === 1, 'busca por código do HTML');
  await page.locator('[data-clear-filters]').first().click();
  await page.locator('#category').selectOption('Bicicletas');
  check(await page.locator('#catalogo-demonstracao .product-card:visible').count() === 1, 'filtro de categoria');
  await page.locator('#search').fill('não existe');
  check(await page.getByRole('heading', { name: 'Nenhum produto encontrado' }).isVisible(), 'estado sem resultados');
  await page.reload();
  check(await page.locator('#search').inputValue() === 'não existe', 'busca persiste na URL');
  await page.locator('[data-clear-filters]').first().click();
  await page.locator('[data-add="demo-bicicleta"]').click();
  await count(page, 1);
  await page.locator('[data-add="demo-bicicleta"]').click();
  await count(page, 2);
  await page.locator('[data-add="demo-capacete"]').click();
  await count(page, 3);
  await page.locator('.cart-link').click();
  await page.locator('.cart-item').first().waitFor();
  check(await page.locator('.cart-item').count() === 2, 'duas linhas no carrinho');
  check(await page.locator('[data-quantity="demo-bicicleta"]').inputValue() === '2', 'repetição soma quantidade');
  await page.locator('[data-id="demo-bicicleta"][data-quantity-step="1"]').click();
  await count(page, 4);
  const quantity = page.locator('[data-quantity="demo-bicicleta"]');
  await quantity.fill('5');
  await quantity.blur();
  await count(page, 6);
  for (const invalid of ['0', '-1', '1.5', '1000', '']) {
    await quantity.fill(invalid); await quantity.blur();
    check(await quantity.inputValue() === '5', 'quantidade inválida é rejeitada');
  }
  await quantity.fill('7');
  // Clicar direto no orçamento deve aplicar o valor do campo sem perder o clique.
  await page.locator('[data-checkout]').click();
  await count(page, 8);
  const checkout = new URL(await page.evaluate(() => window.openedUrls.at(-1)));
  check(checkout.pathname === '/5511959455681', 'WhatsApp configurado');
  check(checkout.searchParams.get('text').includes('Quantidade: 7'), 'orçamento contém quantidade atualizada');
  check(checkout.searchParams.get('text').includes('DEMO-01'), 'orçamento contém referência');
  check(checkout.searchParams.get('text').includes('demonstração'), 'orçamento identifica demonstração');
  await page.reload();
  await count(page, 8);
  check(await page.locator('[data-quantity="demo-bicicleta"]').inputValue() === '7', 'carrinho persiste');
  await page.locator('[data-remove="demo-capacete"]').click();
  await count(page, 7);
  await page.locator('#clear-cart').click();
  await page.getByRole('button', { name: 'Manter itens' }).click();
  check(await page.locator('.cart-item').count() === 1, 'cancelar limpeza mantém item');
  await page.locator('#clear-cart').click();
  await page.locator('#confirm-clear-cart').click();
  await count(page, 0);
  check(await page.getByRole('heading', { name: 'Seu carrinho está vazio' }).isVisible(), 'limpeza confirmada');

  await page.evaluate(() => {
    localStorage.removeItem('ciclodias-cart');
    localStorage.setItem('ciclodias-budget', JSON.stringify(['demo-bicicleta']));
  });
  await page.reload(); await count(page, 1);
  await page.evaluate(() => localStorage.setItem('ciclodias-cart', '{inválido'));
  await page.reload(); await count(page, 0);

  await go(page, 'produto-capacete.html');
  await page.locator('#product-quantity').fill('3');
  await page.locator('[data-detail-add]').click(); await count(page, 3);
  await page.locator('[data-consultar-produto]').click();
  check((await page.evaluate(() => window.openedUrls.at(-1))).includes('DEMO-02'), 'consulta individual');
  await page.locator('.theme-toggle').click();
  check(await page.locator('html').getAttribute('data-theme') === 'dark', 'tema escuro');
  await page.reload();
  check(await page.locator('html').getAttribute('data-theme') === 'dark', 'tema persiste no HTML separado');
  await go(page, 'sobre.html');
  check(await page.locator('html').getAttribute('data-theme') === 'dark', 'tema preservado entre páginas');

  for (const theme of ['dark', 'light']) {
    if (await page.locator('html').getAttribute('data-theme') !== theme) await page.locator('.theme-toggle').click();
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      for (const name of pages) {
        await go(page, name + '.html'); await images(page);
        check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'sem overflow móvel: ' + name);
        check(await page.locator('html').getAttribute('data-theme') === theme, 'tema mantém nas páginas');
        if (name === 'index' && width === 390) await page.screenshot({ path: `${output}/inicio-${theme}-celular.png`, fullPage: true });
      }
    }
  }
  await go(page, 'index.html');
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await page.locator('#main-nav a[href$="/entregas.html"]').click();
  await page.waitForURL('**/entregas.html');
  check(await page.locator('main h1').innerText() === 'Entregas', 'menu móvel entre arquivos');
  await page.goto(base + '/#/catalogo?modo=demo');
  await page.waitForURL('**/produtos.html?modo=demo');
  checks += 1;
  await normal.close();

  // O conteúdo tem de continuar existindo mesmo com todo o JavaScript desativado.
  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  for (const name of pages) {
    await staticPage.goto(base + '/' + pagePath(name + '.html'), { waitUntil: 'domcontentloaded' });
    check(await staticPage.locator('main h1').isVisible(), 'HTML independente de JavaScript: ' + name);
    check(await staticPage.locator('.official-logo').count() === 2, 'logo já no HTML');
  }
  await staticContext.close();

  // Alterar o HTML deve mudar o que o visitante vê, sem editar JavaScript.
  const edited = await context();
  const originalHome = await readFile(new URL('../paginas/inicio/inicio.html', import.meta.url), 'utf8');
  await edited.route('**/inicio.html', route => route.fulfill({ contentType: 'text/html', body: originalHome.replace('Bicicletas, peças<br>e acessórios.', 'Texto editado diretamente no HTML') }));
  const editedPage = await edited.newPage(); await go(editedPage, 'index.html');
  check(await editedPage.locator('main h1').innerText() === 'Texto editado diretamente no HTML', 'JavaScript não sobrescreve o HTML editado');
  await edited.close();

  const catalogTest = await context();
  const originalCatalog = await readFile(new URL('../paginas/produtos/produtos.html', import.meta.url), 'utf8');
  const fixtures = await readFile(new URL('./fixtures/catalogo.html', import.meta.url), 'utf8');
  await catalogTest.route('**/produtos.html*', route => route.fulfill({ contentType: 'text/html', body: originalCatalog.replace(/<!-- INSERIR_PRODUTOS_REAIS:[\s\S]*?-->/, fixtures) }));
  const fixturePage = await catalogTest.newPage(); await go(fixturePage, 'produtos.html');
  check(await fixturePage.locator('#catalogo-real .product-card:visible').count() === 2, 'cadastro a partir de cartões HTML');
  await fixturePage.locator('#brand').selectOption('Marca de teste A');
  await fixturePage.locator('#category').selectOption('Pneus e câmaras');
  await fixturePage.locator('#search').fill('camara');
  check(await fixturePage.locator('#catalogo-real .product-card:visible').count() === 1, 'busca, marca e categoria combinadas');
  await fixturePage.locator('#search').fill('TESTE-02');
  check(await fixturePage.locator('#catalogo-real .product-card:visible').count() === 0, 'filtros combinados sem resultado');
  await fixturePage.locator('[data-clear-filters]').first().click();
  await fixturePage.locator('[data-add="teste-camara"]').click(); await count(fixturePage, 1);
  await fixturePage.locator('.cart-link').click();
  await fixturePage.locator('.cart-item').first().waitFor();
  check(await fixturePage.locator('[data-item-name]').innerText() === 'Câmara de teste', 'carrinho lê o nome do cartão HTML');
  await catalogTest.close();

  const fallback = await context();
  await fallback.route('**/js/configuracoes.js', route => route.fulfill({ contentType: 'text/javascript', body: "export const atendimento = {whatsapp:'',email:'diasciclo@yahoo.com.br'};" }));
  const fallbackPage = await fallback.newPage(); await go(fallbackPage, 'contato.html');
  await fallbackPage.locator('main [data-contact]').click();
  check(await fallbackPage.getByRole('heading', { name: 'WhatsApp ainda não disponível' }).isVisible(), 'fallback sem telefone');
  check(await fallbackPage.evaluate(() => window.openedUrls.length) === 0, 'nenhum link falso aberto');
  await fallback.close();

  check(errors.length === 0, 'sem erros de JavaScript: ' + errors.join(', '));
  console.log(`PASS: ${checks} verificações. HTML independente, navegação, busca, filtros, carrinho, WhatsApp, temas e responsividade.`);
} finally {
  await browser.close();
}
