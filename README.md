# Ciclo Dias

Site institucional e catálogo em português do Brasil, com carrinho de orçamento pelo WhatsApp. Mantém HTML, CSS e JavaScript nativos, sem dependências de produção, pagamentos ou cadastro.

## Abrir no computador

Com Node.js 22.13 ou superior, abra esta pasta no VS Code e execute:

```sh
npm start
```

Acesse `http://localhost:3000`. Use `PORT` para trocar a porta. Não é necessário `npm install`. Para hospedar como site estático, publique `index.html`, `style.css`, `app.js`, `logic.js`, `data.js` e `assets/`. O servidor Node é uma alternativa para desenvolvimento/hospedagem própria. Funciona com caminhos Windows e Linux.

## Páginas

- `#/`: início, categorias e acesso ao atendimento.
- `#/produtos`: catálogo oficial, busca por nome/marca/código e filtros combinados de categoria e marca.
- `#/produto/ID`: detalhes, foto inteira, marca, código e quantidade para adicionar.
- `#/sobre`, `#/entregas` e `#/contato`: informações da empresa.
- `#/carrinho`: lista com quantidades, remoção e solicitação de orçamento pelo WhatsApp.
- `#/tabelas`: solicitação e downloads de PDF/Excel, quando cadastrados.

O endereço antigo `#/catalogo` continua funcionando. Busca e filtros ficam na URL, permitindo recarregar ou voltar pelo histórico. As rotas usam hash e não exigem configuração de redirecionamentos na hospedagem.

## Atualizar os dados reais

Edite `data.js`, que é público. Não coloque senhas ou credenciais neste arquivo.

### Empresa e logo oficial

`company` reúne e-mail, WhatsApp, Instagram, logo, endereço, horários, canal do WhatsApp, domínio e CNPJ. WhatsApp e Instagram informados já estão cadastrados. O telefone deve conter somente dígitos com país e DDD (55 + DDD + número). Se estiver vazio/inválido, o site oferece e-mail e mensagem copiável, sem gerar link fictício.

**A logo oficial ainda está pendente:** o PDF mencionado não ficou disponível como arquivo no ambiente. Não houve recriação, redesenho nem uso de logo genérica. Cabeçalho e rodapé exibem um espaço neutro identificado. Quando receber o PDF, extraia a imagem original com `pdfimages` ou renderize a página em boa resolução, preserve cores, proporções e inscrições, salve em `assets/` e informe seu caminho em `company.logo`. O mesmo arquivo será usado nos dois locais, com `object-fit: contain`. O servidor já reconhece PNG, JPEG, WebP e AVIF.

### Produtos e fotos

`products` é o catálogo real e está vazio porque nenhum cadastro oficial foi fornecido. `categories` contém as categorias editáveis; o filtro de marca é montado a partir das marcas presentes nos produtos reais. Não é uma declaração de disponibilidade.

Estrutura de cadastro — substitua os campos abaixo por dados confirmados:

```js
{
  id: 'identificador-unico',
  name: 'Nome oficial do produto',
  category: 'Bicicletas',
  brand: '',
  code: '',
  description: '',
  price: null,
  image: '/assets/foto-oficial.webp',
  variations: [],
  demo: false
}
```

Use `price: null` quando o preço não estiver informado: aparece “Consulte pelo WhatsApp”. Nenhum total em dinheiro é calculado no carrinho, pois o orçamento depende de confirmação. Fotos são exibidas inteiras, em área quadrada com `object-fit: contain`. Sem foto ou com arquivo inacessível, aparece uma indicação neutra. As ilustrações SVG antigas não são usadas como fotos nem na página inicial.

`demoProducts` mantém os exemplos da versão anterior separados. Eles só aparecem ao escolher **Testar a navegação com itens de demonstração**, no fim da página Produtos, ou acessar `#/produtos?modo=demo`. Não entram na vitrine oficial. A mensagem de orçamento identifica explicitamente qualquer demonstração.

### Tabelas e entregas

`tables.pdf` e `tables.excel` recebem os caminhos dos arquivos reais em `assets/`. `updatedAt` recebe a data real em `AAAA-MM-DD`. Links e data só aparecem quando cadastrados.

`delivery.message` contém a orientação geral. `delivery.regions` aceita condições **confirmadas**, por exemplo objetos com `name` (região) e `details` (texto de condições). Os dados históricos divergentes não foram publicados como oferta vigente.

## Carrinho de orçamento

O carrinho permite adicionar novamente o mesmo produto, editar quantidades inteiras de 1 a 999, usar os botões +/−, remover e esvaziar com confirmação. O contador do menu soma as unidades. A mensagem contém nomes, códigos e marcas disponíveis, quantidades e pedido de confirmação de preço, estoque e entrega.

Os dados ficam em `localStorage`, na chave `ciclodias-cart`, em formato `[{id, quantity}]`. A lista anterior, `ciclodias-budget`, é migrada automaticamente quando ainda não há carrinho novo. Os dados são validados ao carregar: produtos removidos do catálogo são descartados, nomes/preços são sempre lidos do cadastro atual e armazenamento inválido não quebra o site. O carrinho permanece neste navegador e origem; não acompanha a pessoa entre dispositivos. Sem permissão para armazenamento, funciona na sessão e exibe um aviso.

O botão final apenas abre a mensagem no WhatsApp para a pessoa revisar e enviar. Não dispara mensagens, não faz pagamento, não reserva produtos e não confirma estoque.

## Verificação

```sh
npm test
```

Os testes unitários verificam busca, combinação de filtros, migração, quantidades, limites, dados inválidos, operações do carrinho e mensagens. A verificação de navegador está em `tests/browser.mjs` (requer Playwright e Chromium instalados; separados das dependências de produção). Os produtos e marcas de teste são injetados somente no navegador durante essa verificação, sem entrar no catálogo real.

## Pendências para publicação comercial

- Receber o PDF/arquivo da logo oficial e configurar `company.logo`.
- Cadastrar fotos, produtos, marcas, códigos, descrições e variações oficiais.
- Confirmar condições atuais de entrega, frete, valores mínimos e prazos.
- Completar endereço, horários, canal do WhatsApp, domínio e CNPJ, quando aplicável.
- Cadastrar preços e tabelas PDF/Excel somente com valores e datas reais.

O site não foi publicado nem enviado ao GitHub nesta atualização.
