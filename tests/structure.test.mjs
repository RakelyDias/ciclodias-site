import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';

const pages = {
  index:'inicio', produtos:'produtos', sobre:'sobre', entregas:'entregas',
  contato:'contato', carrinho:'carrinho', tabelas:'tabelas',
  'produto-bicicleta':'produto', 'produto-capacete':'produto',
  'produto-camara':'produto', 'produto-bolsa':'produto', '404':'erro',
};

test('cada página entrega seu conteúdo completo no HTML e tem CSS identificado', async () => {
  for (const [page, css] of Object.entries(pages)) {
    const folder = page === 'index' ? 'inicio' : page === '404' ? 'erro' : page;
    const filename = page === 'index' ? 'inicio' : page;
    const html = await readFile(new URL(`../paginas/${folder}/${filename}.html`,import.meta.url),'utf8');
    assert.match(html,/<!DOCTYPE html>/i,page);
    assert.match(html,/<header[\s>]/,page);
    assert.match(html,/<main[^>]*>[\s\S]*?<h1[\s>]/,page);
    assert.match(html,/<footer[\s>]/,page);
    assert.ok(html.includes(`href="${filename}.css"`),page);
    assert.ok((await readFile(new URL(`../paginas/${folder}/${filename}.css`,import.meta.url),'utf8')).length>0,page);
    assert.doesNotMatch(html,/href="#\//,page);
  }
});

test('foto do banner e nomes dos exemplos são editáveis diretamente nos HTMLs', async () => {
  const home = await readFile(new URL('../paginas/inicio/inicio.html',import.meta.url),'utf8');
  const catalog = await readFile(new URL('../paginas/produtos/produtos.html',import.meta.url),'utf8');
  assert.match(home,/<img[^>]*class="hero-photo"[^>]*src="https:\/\/images\.unsplash\.com\/photo-1541625602330-2277a4c46182/);
  assert.match(catalog,/<article class="product-card" data-product-id="demo-bicicleta"/);
  assert.match(catalog,/data-product-name="">Bicicleta urbana<\/a>/);
  assert.match(catalog,/<img[^>]*src="\.\.\/\.\.\/assets\/catalogo\/capacete\.png"/);
});

test('JavaScript de produção não monta nem injeta o corpo das páginas', async () => {
  for (const file of await readdir(new URL('../js/',import.meta.url))) {
    const source = await readFile(new URL('../js/'+file,import.meta.url),'utf8');
    assert.doesNotMatch(source,/\.innerHTML\s*=|\.outerHTML\s*=|insertAdjacentHTML|document\.write/ ,file);
    assert.doesNotMatch(source,/<(?:main|header|footer|section|article|div|img)\b/,file);
  }
});
