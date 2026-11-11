// Interações compartilhadas. O conteúdo visual está integralmente nos HTMLs.
import { atendimento } from './configuracoes.js';
import { whatsappUrl, productMessage } from './regras.js';
import { iniciarCarrinho, adicionarProduto, quantidadeTotal, obterProduto } from './carrinho-store.js';

let avisoTimer;
export function avisar(mensagem) {
  const aviso = document.getElementById('notice');
  if (!aviso) return;
  aviso.textContent = mensagem;
  aviso.classList.add('visible');
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => aviso.classList.remove('visible'), 3500);
}

export function abrirWhatsApp(mensagem) {
  const url = whatsappUrl(atendimento.whatsapp, mensagem);
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  const dialogo = document.getElementById('contact-dialog');
  const email = dialogo.querySelector('[data-fallback-email]');
  email.href = `mailto:${atendimento.email}?subject=Or%C3%A7amento%20Ciclo%20Dias&body=${encodeURIComponent(mensagem)}`;
  email.textContent = atendimento.email;
  dialogo.querySelector('textarea').value = mensagem;
  dialogo.showModal();
}

function atualizarContador() {
  const total = quantidadeTotal();
  document.querySelectorAll('.cart-count').forEach((elemento) => { elemento.textContent = total; });
  document.querySelectorAll('.cart-link').forEach((elemento) => {
    elemento.setAttribute('aria-label', `Carrinho: ${total} ${total === 1 ? 'item' : 'itens'}`);
  });
}

function atualizarBotaoTema() {
  const escuro = window.cicloTheme.get() === 'dark';
  document.querySelectorAll('.theme-toggle').forEach((botao) => {
    botao.setAttribute('aria-pressed', String(escuro));
    botao.setAttribute('aria-label', `Ativar tema ${escuro ? 'claro' : 'escuro'}`);
    botao.querySelector('[data-theme-name]').textContent = escuro ? 'Escuro' : 'Claro';
    botao.querySelector('[data-theme-icon="dark"]').toggleAttribute('hidden', escuro);
    botao.querySelector('[data-theme-icon="light"]').toggleAttribute('hidden', !escuro);
  });
}

window.addEventListener('ciclo-theme-change', atualizarBotaoTema);
document.addEventListener('carrinho:atualizado', atualizarContador);
atualizarBotaoTema();
iniciarCarrinho().then(atualizarContador).catch(() => {
  avisar('Não foi possível carregar o catálogo. Recarregue a página para usar o carrinho.');
});

document.addEventListener('click', async (event) => {
  const elemento = event.target.closest('button,a');
  if (!elemento) return;

  if (elemento.matches('.theme-toggle')) window.cicloTheme.toggle();
  if (elemento.matches('[data-contact]')) abrirWhatsApp(elemento.dataset.contact);
  if (elemento.matches('[data-consultar-produto]')) {
    const escopo = elemento.closest('article[data-product-id]') || document.querySelector('.product-info');
    const produto = { ...(obterProduto(elemento.dataset.consultarProduto) || {}) };
    const nome = escopo?.querySelector('[data-product-name]')?.textContent.trim();
    const codigo = escopo?.querySelector('[data-product-code]')?.textContent.trim();
    if (nome) produto.name = nome;
    if (codigo) produto.code = codigo;
    produto.demo = escopo?.dataset.demo === 'true' || document.body.dataset.demo === 'true' || produto.demo;
    abrirWhatsApp(productMessage(produto));
  }

  if (elemento.matches('[data-add]')) {
    const campo = document.getElementById('product-quantity');
    const quantidade = elemento.hasAttribute('data-detail-add') ? Number(campo.value) : 1;
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 999) {
      avisar('Informe uma quantidade inteira entre 1 e 999.');
      campo?.focus();
      return;
    }
    try {
      await adicionarProduto(elemento.dataset.add, quantidade);
      avisar('Produto adicionado ao carrinho. Confira a lista para solicitar seu orçamento.');
    } catch {
      avisar('Não foi possível adicionar o produto. Recarregue a página e tente novamente.');
    }
  }

  if (elemento.matches('.menu-toggle')) {
    const aberto = elemento.getAttribute('aria-expanded') !== 'true';
    elemento.setAttribute('aria-expanded', String(aberto));
    elemento.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    document.getElementById('main-nav').classList.toggle('open', aberto);
  }

  if (elemento.matches('[data-close-dialog]')) elemento.closest('dialog').close();
  if (elemento.id === 'copy-message') {
    const campo = document.getElementById('contact-message');
    try {
      await navigator.clipboard.writeText(campo.value);
      elemento.textContent = 'Mensagem copiada';
    } catch {
      campo.focus();
      campo.select();
      elemento.textContent = 'Selecione e copie a mensagem acima';
    }
  }
});

document.addEventListener('keydown', (event) => {
  const menu = document.getElementById('main-nav');
  if (event.key === 'Escape' && menu?.classList.contains('open')) {
    menu.classList.remove('open');
    const botao = document.querySelector('.menu-toggle');
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-label', 'Abrir menu');
    botao.focus();
  }
});

document.querySelectorAll('dialog').forEach((dialogo) => {
  dialogo.addEventListener('click', (event) => {
    if (event.target !== dialogo) return;
    const limites = dialogo.getBoundingClientRect();
    if (event.clientX < limites.left || event.clientX > limites.right || event.clientY < limites.top || event.clientY > limites.bottom) dialogo.close();
  });
});
