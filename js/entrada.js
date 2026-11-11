// Atalho da raiz. A página inicial completa está na pasta paginas/inicio/.
if (!location.hash.startsWith('#/')) {
  location.replace(new URL('../paginas/inicio/inicio.html', document.currentScript.src).href);
}
