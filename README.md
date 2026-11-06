# Site Ciclo Dias

Site em português do Brasil, com catálogo e consulta de orçamento. HTML, CSS e JavaScript nativos, sem dependências de produção.

## Executar

Requer Node.js 20 ou superior. Na pasta do projeto:

```sh
npm start
```

Servidor na porta 3000, configurável com `PORT`. `npm test` executa os testes da busca, filtros e mensagens. Para hospedagem estática, publique `index.html`, `style.css`, `app.js`, `logic.js`, `data.js` e `assets/`. O servidor Node é apenas uma opção para desenvolvimento ou hospedagem própria. As rotas usam hash e não exigem regras especiais de redirecionamento.

## Atualizar conteúdo

Edite `data.js`:

- `company`: contatos, logotipo oficial, endereço, horário, redes, domínio e CNPJ. WhatsApp deve conter apenas dígitos com país e DDD (55 + DDD + número). Enquanto vazio, os botões abrem uma explicação, e-mail e mensagem copiável. Nenhum contato fictício é utilizado.
- `categories`: categorias editáveis.
- `products`: catálogo real, inicialmente vazio. Use identificadores únicos, nome, categoria, marca e código reais, descrição, preço numérico ou `null`, `image` com caminho da foto e `variations` com lista de textos. Fotos inteiras são exibidas com `object-fit: contain`.
- `demoProducts`: referências ilustrativas separadas, marcadas como demonstração. Não são estoque real. Para retirar a demonstração em uma versão pública, remova a aba demonstrativa e a faixa de demonstração em `app.js` e use apenas os produtos reais na vitrine.
- `tables`: caminhos de arquivos PDF/Excel e `updatedAt` no formato `AAAA-MM-DD`, somente quando existir atualização real. Salve os arquivos em `assets/` e cadastre os caminhos. Links e data aparecem apenas quando informados.
- `delivery`: mensagem de entrega e espaço `regions` para os dados confirmados. Regras históricas divergentes não foram publicadas. A visualização detalhada por região deve ser adicionada quando essas condições estiverem confirmadas.

Exemplo de estrutura de produto (substitua todos os campos por dados reais):

```js
{ id: 'identificador-unico', name: 'Nome oficial', category: 'Bicicletas',
  brand: '', code: '', description: '', price: null,
  image: '/assets/foto-oficial.webp', variations: [], demo: false }
```

A marca no cabeçalho é um texto provisório, não uma reprodução do logotipo oficial. As ilustrações SVG foram produzidas apenas como espaços reservados identificados.

## Funcionalidades e limites

Busca por nome/marca/código, filtros combinados, catálogo oficial vazio, catálogo demonstrativo, detalhes de produto, lista de orçamento com armazenamento local, remoção e limpeza da lista, mensagens individuais e de lista, fallback sem WhatsApp, tabelas, contato, entregas e páginas institucionais. Não há pagamento, login, confirmação de estoque ou disparo automático.

`data.js` é configuração pública: não armazene senhas ou credenciais. A lista fica somente no navegador. Downloads dependem de arquivos reais. As marcas citadas na página institucional são referências históricas, sem declaração de parceria ou disponibilidade.

## Validação realizada

Chromium em 1440 px (desktop), 390 px e 320 px (celular): navegação, menu móvel, busca, filtro por categoria, ausência de resultados, catálogo oficial vazio, produto, persistência da lista ao recarregar, mensagem com itens e fallback de contato. Sem erros de JavaScript nas páginas verificadas. A inspeção visual foi feita com capturas de tela.

## Antes de publicar o site

WhatsApp e Instagram informados já estão cadastrados. Cadastrar logotipo, fotos, catálogo real e confirmar as regras atuais de entrega. Completar endereço, horários, canal do WhatsApp, domínio e CNPJ quando aplicável. Cadastrar preços, PDFs/Excel e data somente com dados confirmados. Remover as referências demonstrativas da versão comercial. Revisar metadados e domínio com a hospedagem escolhida; não houve publicação nem deploy nesta tarefa.
