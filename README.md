# Ciclo Dias — como editar o site

O site agora usa **HTML completo para cada página**. Textos, títulos, botões, links e imagens estão escritos nos próprios HTMLs. Não existe mais um `app.js` montando o corpo do site, nem um `data.js` guardando os links das fotos.

## Abra estes arquivos para fazer alterações

| Página | HTML para editar textos e fotos | CSS da mesma página |
| --- | --- | --- |
| Início | [paginas/inicio/inicio.html](paginas/inicio/inicio.html) | [inicio.css](paginas/inicio/inicio.css) |
| Produtos | [paginas/produtos/produtos.html](paginas/produtos/produtos.html) | [produtos.css](paginas/produtos/produtos.css) |
| Sobre a Ciclo Dias | [paginas/sobre/sobre.html](paginas/sobre/sobre.html) | [sobre.css](paginas/sobre/sobre.css) |
| Entregas | [paginas/entregas/entregas.html](paginas/entregas/entregas.html) | [entregas.css](paginas/entregas/entregas.css) |
| Contato | [paginas/contato/contato.html](paginas/contato/contato.html) | [contato.css](paginas/contato/contato.css) |
| Carrinho | [paginas/carrinho/carrinho.html](paginas/carrinho/carrinho.html) | [carrinho.css](paginas/carrinho/carrinho.css) |
| Tabelas de preços | [paginas/tabelas/tabelas.html](paginas/tabelas/tabelas.html) | [tabelas.css](paginas/tabelas/tabelas.css) |
| Bicicleta — demonstração | [paginas/produto-bicicleta/produto-bicicleta.html](paginas/produto-bicicleta/produto-bicicleta.html) | [produto-bicicleta.css](paginas/produto-bicicleta/produto-bicicleta.css) |
| Capacete — demonstração | [paginas/produto-capacete/produto-capacete.html](paginas/produto-capacete/produto-capacete.html) | [produto-capacete.css](paginas/produto-capacete/produto-capacete.css) |
| Câmara — demonstração | [paginas/produto-camara/produto-camara.html](paginas/produto-camara/produto-camara.html) | [produto-camara.css](paginas/produto-camara/produto-camara.css) |
| Bolsa — demonstração | [paginas/produto-bolsa/produto-bolsa.html](paginas/produto-bolsa/produto-bolsa.html) | [produto-bolsa.css](paginas/produto-bolsa/produto-bolsa.css) |

**O `index.html` da raiz é somente o atalho de entrada. Para editar a página inicial completa, abra `paginas/inicio/inicio.html`.**

## Organização das pastas

```text
ciclodias-site/
├── index.html                  # Atalho para a página inicial
├── paginas/
│   ├── inicio/
│   │   ├── inicio.html         # Conteúdo completo da página
│   │   └── inicio.css          # Estilos específicos da página
│   ├── produtos/
│   │   ├── produtos.html
│   │   └── produtos.css
│   ├── sobre/                  # Sobre: HTML + CSS
│   ├── entregas/               # Entregas: HTML + CSS
│   ├── contato/                # Contato: HTML + CSS
│   ├── carrinho/               # Carrinho: HTML + CSS
│   ├── tabelas/                # Tabelas: HTML + CSS
│   ├── produto-bicicleta/      # Detalhe do exemplo: HTML + CSS
│   ├── produto-capacete/
│   ├── produto-camara/
│   ├── produto-bolsa/
│   └── erro/                   # Página 404 + CSS
├── css/
│   └── geral.css               # Cores, temas, fonte, cabeçalho e rodapé
├── js/                         # Somente comportamento e configuração
├── assets/                     # Imagens, logo, fontes e créditos
├── tests/                      # Testes; não precisa editar ao trocar uma foto
├── package.json
└── server.mjs                  # Servidor local
```

## Trocar uma imagem

1. Abra o HTML da página na tabela acima.
2. Procure por `IMAGEM:` ou pelo identificador da foto, por exemplo `imagem-banner-principal`.
3. Troque **o valor de `src`** pela foto desejada.
4. Ajuste `alt` para descrever a nova foto.

Cada imagem tem um comentário com sua função. Os identificadores do logo são `imagem-logo-cabecalho` e `imagem-logo-rodape`. Os exemplos têm nomes como `imagem-demo-capacete`. Não há um mapa de links de imagens escondido em JavaScript.

Exemplo de foto local:

```html
<!-- IMAGEM: FOTO GRANDE DO CAPACETE. Altere o src para trocar esta imagem. -->
<img
  id="imagem-produto-capacete"
  src="../../assets/catalogo/capacete.png"
  alt="Capacete para ciclismo — imagem ilustrativa"
>
```

Você também pode colocar um link completo de imagem dentro de `src="https://..."`. O banner inicial já usa o link do Unsplash escolhido pela empresa. Seu `data-fallback` aponta para a alternativa local, caso a foto externa não carregue.

Para adicionar um arquivo, salve-o em `assets/` e use `../../assets/NOME-DO-ARQUIVO.jpg` nas páginas. Os nomes atuais identificam o conteúdo, como `capacete.png`, `camara-bicicleta.webp` e `logo-ciclo-dias-transparente.png`.

**A mesma foto pode ser usada em mais de uma página.** Se quiser trocar em todo o site, use **Ctrl + Shift + H** no VS Code para substituir o caminho do arquivo em todos os HTMLs. Cada página conserva o seu conteúdo diretamente, sem um processo que sobrescreva suas edições.

## Alterar textos e estilos

- **Texto da página:** altere os títulos e parágrafos no HTML correspondente.
- **Foto da página:** altere o `src` da imagem nesse HTML.
- **Espaçamento ou layout de uma página:** edite o CSS ao lado desse HTML.
- **Cores, temas, fonte, cabeçalho e rodapé compartilhados:** edite `css/geral.css`.
- **Links e textos do cabeçalho/rodapé:** estão completos em cada HTML. Para uma alteração global, use a busca/substituição em todos os arquivos.
- **Logo:** a versão sem fundo é `assets/logo-ciclo-dias-transparente.png`; as referências estão nos HTMLs. O arquivo original extraído do PDF continua preservado em `assets/logo-ciclo-dias.png`.

Os atributos `data-*` identificam elementos usados pela busca e pelo carrinho. Você pode editar os textos e `src` normalmente, mas preserve esses identificadores ao alterar um cartão existente.

## Produtos e carrinho

`paginas/produtos/produtos.html` contém os cartões do catálogo e é a fonte de nomes, fotos, marcas, códigos e preços usados pelo carrinho. O JavaScript lê esses elementos; não cria a página e não guarda outra lista de produtos.

- `#catalogo-real`: área para produtos confirmados pela empresa, inicialmente vazia.
- `#catalogo-demonstracao`: quatro exemplos ilustrativos, separados do catálogo real. Para visualizar, use o link de demonstração no final da página Produtos.
- Cada cartão possui `data-product-id` único e `data-demo="true"` ou `"false"`.
- Nome, categoria e código são textos dentro do cartão. As fotos são tags `<img>` normais.
- Quando houver uma marca confirmada, acrescente um elemento com `data-product-brand` no cartão.
- Sem preço confirmado, preserve `data-product-price=""` e o texto “Consulte pelo WhatsApp”. Se cadastrar preço real, informe o número nesse atributo e o valor formatado no texto do mesmo elemento.

Para criar um produto real: copie um cartão para a área real, use um ID novo, troque `data-demo` para `false` e preencha somente informações confirmadas. Crie também uma pasta para seu HTML de detalhe e CSS, usando uma das páginas de produto como base; atualize os links do cartão. Retire os avisos de demonstração e ajuste `data-demo` no HTML de detalhe quando o produto passar a ser real.

Se alterar nome/foto de um item que aparece no início, no catálogo e no detalhe, atualize esses HTMLs. **O carrinho lê a versão cadastrada em `produtos.html`.** Não troque um ID existente para fazer um item salvo virar outro produto.

O layout de cada linha do carrinho está no `<template id="cart-item-template">` de `carrinho.html`. Apenas os itens escolhidos pelo visitante são preenchidos dinamicamente. Quantidades, remoção, confirmação de limpeza e contador continuam funcionando. Os itens ficam no mesmo `localStorage` da versão anterior (`ciclodias-cart`), com migração da lista antiga (`ciclodias-budget`).

## Atendimento, tabelas e entregas

- O número usado para abrir o WhatsApp e o e-mail de alternativa estão em `js/configuracoes.js`. Não há fotos nem marcação HTML nesse arquivo.
- Textos e links de contato visíveis estão em `paginas/contato/contato.html` e nos rodapés.
- Mensagens gerais dos botões estão no atributo `data-contact` do botão, em cada HTML. Consultas de produto e de carrinho usam os dados do HTML e as quantidades escolhidas.
- Para publicar PDF/Excel reais, coloque os arquivos em `assets/` e acrescente links de download em `paginas/tabelas/tabelas.html`. Informe somente a data real da tabela.
- Regiões, fretes e prazos confirmados devem ser escritos em `paginas/entregas/entregas.html`. Nenhuma condição histórica divergente foi publicada.
- O seletor claro/escuro mantém a preferência salva em `ciclodias-theme`.

Os créditos das fotografias e as licenças estão em `assets/PHOTO-CREDITS.md` e `assets/catalogo/PHOTO-SOURCES.md`.

## Abrir para conferir

No terminal do VS Code, na raiz do projeto:

```sh
npm start
```

Abra `http://localhost:3000`. Requer Node.js 22.13 ou superior. Não precisa de `npm install` para o site. Como alternativa, abra `paginas/inicio/inicio.html` com **Live Server** no VS Code.

Use um servidor HTTP para testar o carrinho e os módulos JavaScript. Abrir pelo duplo clique (`file://`) permite ler o HTML, mas o navegador pode bloquear a leitura do catálogo e os módulos.

Não há compilação, framework de páginas ou gerador que precise executar depois de editar o HTML. Salve o arquivo e atualize o navegador. Para publicar, copie as páginas, `index.html`, `css/`, `js/` e `assets/` para a hospedagem estática.

## Testes

```sh
npm test
```

Com Playwright/Chromium instalados no ambiente de teste e o servidor funcionando:

```sh
node tests/browser.mjs
```

A verificação cobre os HTMLs com e sem JavaScript, edição direta de conteúdo, navegação, busca, filtros combinados, carrinho, orçamento, migração dos itens, temas e layout no computador/celular. Os dados de marcas usados para testar filtros ficam exclusivamente em `tests/fixtures/` e não entram no catálogo real.
