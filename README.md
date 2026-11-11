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

**A logo oficial está aplicada:** `assets/logo-ciclo-dias.png` foi extraída diretamente do PDF fornecido pela empresa, sem redesenho ou alteração de cores, na resolução original de 479 × 417 px. Cabeçalho e rodapé usam o mesmo arquivo, configurado em `company.logo`, com proporções preservadas. O telefone que integra a arte foi preservado; os botões de atendimento usam exclusivamente o WhatsApp configurado em `company.whatsapp`.

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

Use `price: null` quando o preço não estiver informado: aparece “Consulte pelo WhatsApp”. Nenhum total em dinheiro é calculado no carrinho, pois o orçamento depende de confirmação. Fotos oficiais de produtos são exibidas inteiras, em área quadrada com `object-fit: contain`. Imagens de contexto aparecem somente como ilustrações identificadas; não representam o modelo ou estoque. As ilustrações SVG antigas não são usadas no site. Todas as fotos utilizadas no redesign estão salvas em `assets/`, sem dependência de links externos. Os créditos, arquivos de origem e licença são documentados em `assets/PHOTO-CREDITS.md` e `assets/PHOTOGRAPHY-LICENSE.txt`.

`demoProducts` mantém os exemplos da versão anterior separados. Na página inicial, há uma seção de exemplos explicitamente identificados, com fotos ilustrativas. Na página Produtos, os exemplos permanecem separados do catálogo oficial e só aparecem ao escolher **Testar a navegação com itens de demonstração**, ou acessar `#/produtos?modo=demo`. Não são apresentados como estoque da loja. A mensagem de orçamento identifica explicitamente qualquer demonstração.

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

- Cadastrar fotos, produtos, marcas, códigos, descrições e variações oficiais.
- Confirmar condições atuais de entrega, frete, valores mínimos e prazos.
- Completar endereço, horários, canal do WhatsApp, domínio e CNPJ, quando aplicável.
- Cadastrar preços e tabelas PDF/Excel somente com valores e datas reais.

O site não foi publicado nem enviado ao GitHub nesta atualização.

## Fotografias do redesign

`photography` e `demoImages` em `data.js` centralizam as fotografias locais e os vínculos dos exemplos. As fotos vêm do acervo público BikeX, creditado ao Unsplash e distribuído sob a licença MIT preservada no projeto. A logo pertence à Ciclo Dias e foi extraída do PDF da empresa. Nenhuma marca de outro site foi reutilizada. Os arquivos externos são apenas referências de origem na documentação; a interface usa cópias locais. A liberação de domínios Unsplash chegou a ser proposta no rascunho de rede, mas foi retirada ao adotar as imagens locais; a lista de domínios personalizados voltou ao estado anterior. Não é necessária uma mudança de rede para usar o site.

## Tema claro e escuro

O botão no cabeçalho alterna entre os dois temas. `theme.js` é carregado antes do CSS para aplicar a escolha sem uma tela clara intermediária. Na primeira visita, segue a preferência do sistema; após a escolha manual, usa `localStorage` na chave `ciclodias-theme`. A preferência acompanha navegação, recarga e retorno ao site, no mesmo navegador e origem. Sem permissão de armazenamento, a troca continua funcionando na sessão. As abas sincronizam a escolha.

A fonte Manrope é servida localmente em `assets/fonts/manrope.ttf`, com a licença SIL OFL preservada no mesmo diretório. Cores, superfícies e contraste dos temas são centralizados nas variáveis do início de `style.css`. Fotos e logo conservam suas cores originais nos dois temas.

A hospedagem estática deve incluir também `theme.js` e os novos diretórios de `assets/`. Não é necessária instalação adicional para rodar o site.

## Novos exemplos fotográficos

Os exemplos da interface foram atualizados para bicicleta, capacete, câmara e bolsa. Todos têm fotos correspondentes ao objeto, com `object-fit: contain`. Nenhum item foi inserido no catálogo real. Os exemplos antigos de pneu e quadro sem fotografia adequada foram retirados; seus identificadores não foram reaproveitados para outros produtos. Listas antigas deixam de mostrar esses exemplos removidos, em vez de trocá-los silenciosamente por outro objeto. As categorias originais, inclusive Quadros e garfos, permanecem nos filtros.

`demoImages` e `categoryPhotos` em `data.js` mantêm as fotos de produtos e categorias separadas. Os créditos, fontes e licenças dos novos arquivos estão em `assets/catalogo/PHOTO-SOURCES.md`. As oito fotos dos cartões da página inicial são diferentes. Os códigos de demonstração aparecem apenas identificados como tal no detalhe/mensagem, sem serem apresentados como códigos comerciais nos cartões.

Para conferir temas, fotos, contraste e preferência salva com Playwright/Chromium instalados e o servidor funcionando:

```sh
node tests/theme-browser.mjs
```

Este teste é complementar à regressão `node tests/browser.mjs` e aos testes unitários `npm test`.
