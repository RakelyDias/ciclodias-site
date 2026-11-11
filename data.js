// Dados oficiais: preencha apenas com informações confirmadas pela empresa.
export const company={name:'Ciclo Dias',slogan:'CURTINDO A VIDA SOBRE DUAS RODAS',email:'diasciclo@yahoo.com.br',whatsapp:'5511959455681',logo:'/assets/logo-ciclo-dias.png',address:'',hours:'',instagram:'https://www.instagram.com/ciclodiasatacadovarejo/',channel:'',domain:'',cnpj:''};
export const categories=['Bicicletas','Quadros e garfos','Pneus e câmaras','Rodas e aros','Freios e componentes','Transmissão e movimentos centrais','Guidões, mesas e manoplas','Selins e canotes','Pedais','Capacetes e acessórios'];
export const mentionedBrands=['GTA','GIOS','INVIKTUS','VIPER','SUNRUN','ABSOLUT','ALFAMEQ','WENDY','EPIC','ELLEVEN'];
export const products=[];
// Apenas demonstração de interface. Não representam produtos ou estoque da loja.
export const demoProducts=[
{id:'demo-bicicleta',name:'Bicicleta urbana',category:'Bicicletas',brand:'',code:'DEMO-01',kind:'bike',description:'Exemplo de apresentação de bicicleta. As especificações, medidas e cores serão cadastradas com o catálogo oficial.'},
{id:'demo-capacete',name:'Acessório para ciclismo',category:'Capacetes e acessórios',brand:'',code:'DEMO-02',kind:'helmet',description:'Exemplo de apresentação de acessório. A foto, a marca e as especificações dependem do cadastro oficial.'},
{id:'demo-pneu',name:'Pneu para bicicleta',category:'Pneus e câmaras',brand:'',code:'DEMO-03',kind:'wheel',description:'Exemplo de apresentação de pneu. Consulte a equipe para conhecer os modelos e medidas disponíveis.'},
{id:'demo-quadro',name:'Quadro de bicicleta',category:'Quadros e garfos',brand:'',code:'DEMO-04',kind:'frame',description:'Exemplo de apresentação de quadro. Modelo, material, medidas e cores serão informados no cadastro oficial.'}
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
  'demo-bicicleta': photography.bicycle,
  'demo-capacete': photography.cycling,
  'demo-pneu': '/assets/roda-componentes.png',
  'demo-quadro': photography.bicycle,
};
