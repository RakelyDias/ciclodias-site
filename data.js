// Dados oficiais: preencha apenas com informações confirmadas pela empresa.
export const company={name:'Ciclo Dias',slogan:'CURTINDO A VIDA SOBRE DUAS RODAS',email:'diasciclo@yahoo.com.br',whatsapp:'5511959455681',logo:'/assets/logo-ciclo-dias.png',address:'',hours:'',instagram:'https://www.instagram.com/ciclodiasatacadovarejo/',channel:'',domain:'',cnpj:''};
export const categories=['Bicicletas','Quadros e garfos','Pneus e câmaras','Rodas e aros','Freios e componentes','Transmissão e movimentos centrais','Guidões, mesas e manoplas','Selins e canotes','Pedais','Capacetes e acessórios'];
export const mentionedBrands=['GTA','GIOS','INVIKTUS','VIPER','SUNRUN','ABSOLUT','ALFAMEQ','WENDY','EPIC','ELLEVEN'];
export const products=[];
// Apenas demonstração de interface. Não representam produtos ou estoque da loja.
export const demoProducts=[
{id:'demo-bicicleta',name:'Bicicleta urbana',category:'Bicicletas',brand:'',code:'DEMO-01',description:'Exemplo de apresentação de bicicleta. As especificações, medidas e cores serão cadastradas com o catálogo oficial.'},
{id:'demo-capacete',name:'Capacete para ciclismo',category:'Capacetes e acessórios',brand:'',code:'DEMO-02',description:'Exemplo de apresentação de acessório. A foto, a marca e as especificações dependem do cadastro oficial.'},
{id:'demo-camara',name:'Câmara para bicicleta',category:'Pneus e câmaras',brand:'',code:'DEMO-03',description:'Exemplo ilustrativo de câmara de ar. Consulte a equipe para saber quais medidas e tipos de válvula estão disponíveis; a fotografia não confirma produto, marca ou estoque da loja.'},
{id:'demo-bolsa',name:'Bolsa para bicicleta',category:'Capacetes e acessórios',brand:'',code:'DEMO-04',description:'Exemplo ilustrativo de bolsa para bicicleta. Consulte a equipe sobre opções e compatibilidade. A imagem não representa estoque confirmado ou parceria com a marca fotografada.'}
].map(p=>({...p,demo:true,price:null,image:'',variations:[]}));
export const tables={updatedAt:null,pdf:'',excel:''};
export const delivery={message:'Consulte as condições de entrega para sua região pelo WhatsApp.',regions:[]};

// Fotografias de contexto (Unsplash). Não são fotos de produtos da Ciclo Dias.
export const photography = {
  hero: '/assets/ciclismo-urbano.png',
  cycling: '/assets/passeio-bicicleta.png',
  bicycle: '/assets/bicicleta-urbana.png',
  detail: '/assets/detalhe-freio.jpg',
};
export const demoImages = {
  'demo-bicicleta': '/assets/catalogo/bicicleta-urbana.webp',
  'demo-capacete': '/assets/catalogo/capacete.png',
  'demo-camara': '/assets/catalogo/camara-bicicleta.webp',
  'demo-bolsa': '/assets/catalogo/bolsa-bicicleta.webp',
};
// Fotografias diferentes para categorias e exemplos de produto.
export const categoryPhotos = {
  bikes: '/assets/catalogo/categoria-bicicletas.webp',
  parts: '/assets/detalhe-freio.jpg',
  wheels: '/assets/roda-componentes.png',
  accessories: '/assets/catalogo/categoria-acessorios.webp',
};
