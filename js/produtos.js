// Filtra os cartões que já estão escritos em produtos.html, sem gerar HTML.
import { filterProducts } from './regras.js';
import { lerProdutos } from './catalogo-dados.js';

const parametros = new URLSearchParams(location.search);
const demonstracao = parametros.get('modo') === 'demo';
const secao = document.getElementById(demonstracao ? 'catalogo-demonstracao' : 'catalogo-real');
const produtos = lerProdutos(secao);
const busca = document.getElementById('search');
const categoria = document.getElementById('category');
const marca = document.getElementById('brand');

busca.value = parametros.get('busca') || '';
categoria.value = parametros.get('categoria') || '';
document.getElementById('header-query').value = busca.value;
document.getElementById('catalogo-real').hidden = demonstracao;
document.getElementById('catalogo-demonstracao').hidden = !demonstracao;
document.getElementById('demo-notice').hidden = !demonstracao;
document.querySelector('.demo-access').hidden = demonstracao;

const marcas = [...new Set(produtos.map((produto) => produto.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
marcas.forEach((nome) => marca.add(new Option(nome, nome)));
marca.value = parametros.get('marca') || '';

function filtrar(sincronizar = true) {
  const encontrados = filterProducts(produtos, { query: busca.value, category: categoria.value, brand: marca.value });
  const ids = new Set(encontrados.map((produto) => produto.id));
  secao.querySelectorAll('article[data-product-id]').forEach((cartao) => { cartao.hidden = !ids.has(cartao.dataset.productId); });
  secao.querySelector('[data-catalog-empty]').hidden = encontrados.length !== 0;
  document.querySelector('[data-result-count]').textContent = encontrados.length;
  document.querySelector('[data-result-singular]').hidden = encontrados.length !== 1;
  document.querySelector('[data-result-plural]').hidden = encontrados.length === 1;
  if (sincronizar) {
    const estado = new URLSearchParams();
    if (demonstracao) estado.set('modo', 'demo');
    if (busca.value) estado.set('busca', busca.value);
    if (categoria.value) estado.set('categoria', categoria.value);
    if (marca.value) estado.set('marca', marca.value);
    history.replaceState(null, '', location.pathname + (estado.size ? '?' + estado : ''));
    document.getElementById('header-query').value = busca.value;
  }
}

document.getElementById('filters').addEventListener('submit', (event) => event.preventDefault());
[busca, categoria, marca].forEach((campo) => campo.addEventListener('input', () => filtrar()));
document.querySelectorAll('[data-clear-filters]').forEach((botao) => {
  botao.addEventListener('click', () => {
    busca.value = '';
    categoria.value = '';
    marca.value = '';
    filtrar();
  });
});
filtrar(false);
