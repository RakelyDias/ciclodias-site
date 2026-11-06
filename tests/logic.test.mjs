import {test} from 'node:test';
import assert from 'node:assert/strict';
import {filterProducts,productMessage,listMessage,whatsappUrl} from '../logic.js';
import {demoProducts,products,company} from '../data.js';
test('busca normaliza acentos, caixa, código e marca',()=>{assert.equal(filterProducts(demoProducts,{query:'BICICLETA'}).length,3);assert.equal(filterProducts(demoProducts,{query:'DEMO-02'})[0].id,'demo-capacete');assert.equal(filterProducts([{name:'Câmara',brand:'GTA',code:'A1',category:'Peças'}],{query:'camara',brand:'GTA'}).length,1);});
test('filtros se combinam e permitem zero resultados',()=>{assert.equal(filterProducts(demoProducts,{category:'Bicicletas'}).length,1);assert.equal(filterProducts(demoProducts,{category:'Bicicletas',query:'capacete'}).length,0);assert.equal(filterProducts(demoProducts,{brand:'GTA'}).length,0);});
test('nenhum produto real ou contato fictício',()=>{assert.deepEqual(products,[]);assert.ok(whatsappUrl(company.whatsapp,'Consulta'));assert.equal(new URL(company.instagram).hostname,'www.instagram.com');assert.ok(demoProducts.every(p=>p.demo&&p.price===null));assert.equal(whatsappUrl('', 'teste'),null);assert.equal(whatsappUrl('123','teste'),null);});
test('mensagens preservam referências de demonstração e codificam o texto',()=>{assert.match(productMessage(demoProducts[0]),/DEMO-01/);assert.match(productMessage(demoProducts[0]),/demonstração/);assert.match(listMessage(demoProducts.slice(0,2)),/DEMO-02/);assert.match(whatsappUrl('5511999999999','Olá & preço?'),/text=Ol%C3%A1%20%26%20pre%C3%A7o%3F/);});
