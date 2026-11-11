// A imagem e sua alternativa são declaradas no próprio HTML (src e data-fallback).
document.addEventListener('error', (event) => {
  const imagem = event.target;
  if (!(imagem instanceof HTMLImageElement)) return;
  if (!imagem.dataset.fallback || imagem.dataset.imageFallbackUsed) return;
  imagem.dataset.imageFallbackUsed = 'true';
  imagem.src = imagem.dataset.fallback;
}, true);
