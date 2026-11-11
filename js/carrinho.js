// Preenche o <template> escrito em carrinho.html com os itens escolhidos.
import {
  iniciarCarrinho, obterItens, obterProduto, quantidadeTotal, podeSalvar,
  alterarQuantidade, removerProduto, esvaziarCarrinho, mensagemOrcamento,
} from './carrinho-store.js';
import { avisar, abrirWhatsApp } from './comum.js';

const lista = document.getElementById('cart-items');
const modelo = document.getElementById('cart-item-template');

function atualizarLinha(linha, item) {
  linha.querySelector('[data-quantity]').value = item.quantity;
  linha.querySelector('[data-quantity-step="-1"]').disabled = item.quantity === 1;
  linha.querySelector('[data-quantity-step="1"]').disabled = item.quantity === 999;
}

function desenharItens() {
  const fragmento = document.createDocumentFragment();
  obterItens().forEach((item) => {
    const produto = obterProduto(item.id);
    const linha = modelo.content.firstElementChild.cloneNode(true);
    linha.dataset.cartId = item.id;
    linha.querySelector('[data-item-name]').textContent = produto.name;
    linha.querySelectorAll('[data-item-link]').forEach((link) => { link.href = produto.url; });
    const imagem = linha.querySelector('[data-item-image]');
    imagem.src = produto.image;
    imagem.alt = produto.name;
    imagem.id = 'imagem-carrinho-' + produto.id;
    const referencia = [produto.brand, produto.code].filter(Boolean).join(' · ');
    linha.querySelector('[data-item-reference]').textContent = referencia;
    linha.querySelector('[data-item-demo]').hidden = !produto.demo;
    linha.querySelector('[data-item-price]').textContent = produto.priceLabel;
    const campo = linha.querySelector('[data-quantity]');
    campo.dataset.quantity = item.id;
    campo.setAttribute('aria-label', `Quantidade de ${produto.name}`);
    const remover = linha.querySelector('[data-remove]');
    remover.dataset.remove = item.id;
    remover.setAttribute('aria-label', `Remover ${produto.name}`);
    linha.querySelectorAll('[data-quantity-step]').forEach((botao) => {
      botao.dataset.id = item.id;
      const acao = botao.dataset.quantityStep === '1' ? 'Aumentar' : 'Diminuir';
      botao.setAttribute('aria-label', `${acao} quantidade de ${produto.name}`);
    });
    atualizarLinha(linha, item);
    fragmento.append(linha);
  });
  lista.replaceChildren(fragmento);
}

function atualizarResumo() {
  const itens = obterItens();
  const total = quantidadeTotal();
  document.getElementById('cart-empty').hidden = itens.length !== 0;
  document.getElementById('cart-content').hidden = itens.length === 0;
  document.querySelector('[data-summary-types]').textContent = itens.length;
  document.querySelector('[data-total-quantity]').textContent = `${total} ${total === 1 ? 'unidade' : 'unidades'}`;
  document.getElementById('cart-demo-warning').hidden = !itens.some((item) => obterProduto(item.id).demo);
  document.querySelector('[data-storage-warning]').hidden = podeSalvar();
}

function definirQuantidade(id, valor) {
  const quantidade = Number(valor);
  const linha = lista.querySelector(`[data-cart-id="${CSS.escape(id)}"]`);
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 999) {
    avisar('Informe uma quantidade inteira entre 1 e 999.');
    atualizarLinha(linha, obterItens().find((item) => item.id === id));
    return;
  }
  alterarQuantidade(id, quantidade);
}

document.addEventListener('carrinho:atualizado', (event) => {
  if (event.detail.tipo === 'quantidade') {
    const item = obterItens().find((item) => item.id === event.detail.id);
    const linha = lista.querySelector(`[data-cart-id="${CSS.escape(item.id)}"]`);
    if (linha) atualizarLinha(linha, item);
  } else {
    desenharItens();
  }
  atualizarResumo();
});

lista.addEventListener('change', (event) => {
  if (event.target.matches('[data-quantity]')) definirQuantidade(event.target.dataset.quantity, event.target.value);
});

lista.addEventListener('click', (event) => {
  const botao = event.target.closest('button');
  if (!botao) return;
  if (botao.matches('[data-remove]')) {
    removerProduto(botao.dataset.remove);
    avisar('Produto removido do carrinho.');
  }
  if (botao.matches('[data-quantity-step]')) {
    const item = obterItens().find((item) => item.id === botao.dataset.id);
    definirQuantidade(item.id, item.quantity + Number(botao.dataset.quantityStep));
  }
});

document.getElementById('clear-cart').addEventListener('click', () => {
  document.getElementById('clear-cart-dialog').showModal();
});

document.getElementById('confirm-clear-cart').addEventListener('click', () => {
  esvaziarCarrinho();
  document.getElementById('clear-cart-dialog').close();
  avisar('Carrinho esvaziado.');
});

document.querySelector('[data-checkout]').addEventListener('click', () => {
  if (obterItens().length) abrirWhatsApp(mensagemOrcamento());
});

iniciarCarrinho().then(() => {
  desenharItens();
  atualizarResumo();
}).catch(() => avisar('Não foi possível carregar os itens do carrinho. Recarregue a página.'));
