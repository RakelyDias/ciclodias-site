// Estado e persistência do orçamento; não contém marcação HTML.
import { obterCatalogo } from './catalogo-dados.js';
import {
  normalizeCart, addCartItem, setCartQuantity, removeCartItem, cartCount, cartMessage,
} from './regras.js';

const CHAVE = 'ciclodias-cart';
let produtos = [];
let itens = [];
let armazenamento = true;
let inicializacao;

function lerSalvos() {
  try {
    const salvo = localStorage.getItem(CHAVE) ?? localStorage.getItem('ciclodias-budget') ?? '[]';
    try { return JSON.parse(salvo); } catch { return []; }
  } catch {
    armazenamento = false;
    return [];
  }
}

function notificar(tipo, id = '') {
  document.dispatchEvent(new CustomEvent('carrinho:atualizado', { detail: { tipo, id } }));
}

function salvar(tipo, id) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(itens));
    armazenamento = true;
  } catch {
    armazenamento = false;
  }
  notificar(tipo, id);
}

export function iniciarCarrinho() {
  if (!inicializacao) {
    inicializacao = obterCatalogo().then((catalogo) => {
      produtos = catalogo;
      itens = normalizeCart(lerSalvos(), produtos);
      salvar('inicio');
      return itens;
    });
  }
  return inicializacao;
}

export const obterItens = () => itens.map((item) => ({ ...item }));
export const obterProduto = (id) => produtos.find((produto) => produto.id === id);
export const quantidadeTotal = () => cartCount(itens);
export const podeSalvar = () => armazenamento;
export const mensagemOrcamento = () => cartMessage(itens, produtos);

export async function adicionarProduto(id, quantidade = 1) {
  await iniciarCarrinho();
  itens = addCartItem(itens, id, produtos, quantidade);
  salvar('adicionar', id);
}

export function alterarQuantidade(id, quantidade) {
  itens = setCartQuantity(itens, id, quantidade, produtos);
  salvar('quantidade', id);
}

export function removerProduto(id) {
  itens = removeCartItem(itens, id);
  salvar('remover', id);
}

export function esvaziarCarrinho() {
  itens = [];
  salvar('limpar');
}

window.addEventListener('storage', (event) => {
  if (event.key !== CHAVE && event.key !== null) return;
  iniciarCarrinho().then(() => {
    itens = normalizeCart(lerSalvos(), produtos);
    notificar('outra-aba');
  });
});
