// Compatibilidade com links compartilhados da versão anterior. As páginas novas são HTMLs reais.
(() => {
  if (!location.hash.startsWith('#/')) return;
  const [rota, consulta = ''] = location.hash.slice(1).split('?');
  const paginas = {
    '/': 'paginas/inicio/inicio.html',
    '/produtos': 'paginas/produtos/produtos.html',
    '/catalogo': 'paginas/produtos/produtos.html',
    '/sobre': 'paginas/sobre/sobre.html',
    '/entregas': 'paginas/entregas/entregas.html',
    '/contato': 'paginas/contato/contato.html',
    '/carrinho': 'paginas/carrinho/carrinho.html',
    '/tabelas': 'paginas/tabelas/tabelas.html',
    '/produto/demo-bicicleta': 'paginas/produto-bicicleta/produto-bicicleta.html',
    '/produto/demo-capacete': 'paginas/produto-capacete/produto-capacete.html',
    '/produto/demo-camara': 'paginas/produto-camara/produto-camara.html',
    '/produto/demo-bolsa': 'paginas/produto-bolsa/produto-bolsa.html',
  };
  const destino = paginas[rota] || 'paginas/erro/404.html';
  const raiz = new URL('../', document.currentScript.src);
  location.replace(new URL(destino + (consulta ? '?' + consulta : ''), raiz).href);
})();
