// A fonte do catálogo é produtos.html. Não há textos ou links de fotos neste JS.
let consulta;

export function lerProdutos(documento) {
  return [...documento.querySelectorAll('article[data-product-id]')].map((cartao) => {
    const campo = (seletor) => cartao.querySelector(seletor)?.textContent.trim() || '';
    const link = cartao.querySelector('[data-product-name]');
    const imagem = cartao.querySelector('.product-image img');
    const valor = cartao.querySelector('[data-product-price]')?.dataset.productPrice;
    const base = new URL('../paginas/produtos/produtos.html', import.meta.url);

    return {
      id: cartao.dataset.productId,
      name: campo('[data-product-name]'),
      category: campo('[data-product-category]'),
      brand: campo('[data-product-brand]'),
      code: campo('[data-product-code]'),
      price: valor && Number.isFinite(Number(valor)) ? Number(valor) : null,
      priceLabel: campo('[data-product-price]'),
      image: imagem ? new URL(imagem.getAttribute('src'), base).href : '',
      url: link ? new URL(link.getAttribute('href'), base).href : base.href,
      demo: cartao.dataset.demo === 'true',
    };
  }).filter((produto) => produto.id && produto.name);
}

export function obterCatalogo() {
  if (!consulta) {
    consulta = (async () => {
      if (document.body.dataset.page === 'produtos') return lerProdutos(document);
      const resposta = await fetch(new URL('../paginas/produtos/produtos.html', import.meta.url));
      if (!resposta.ok) throw new Error('Catálogo indisponível');
      const documento = new DOMParser().parseFromString(await resposta.text(), 'text/html');
      return lerProdutos(documento);
    })();
  }
  return consulta;
}
