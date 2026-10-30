import test from 'node:test';
import assert from 'node:assert/strict';
import { Grafo } from '../src/grafo.js';
import { gerarSimples, tamanhoDoDominio } from '../src/gerador.js';
import { contarCircuitos, listarCircuitos } from '../src/enumera.js';
import { circuitoEuleriano, ehCircuitoValido } from '../src/hierholzer.js';

const triangulo = () => new Grafo(3, [[0, 1], [1, 2], [2, 0]]);
const duploSentido = () => new Grafo(2, [[0, 1], [1, 0]]);
const oito = () => new Grafo(3, [[0, 1], [1, 0], [0, 2], [2, 0]]);

test('o triangulo tem um circuito so', () => {
  assert.equal(contarCircuitos(triangulo()).total, 1n);
});

test('o oito tem um circuito so, porque a aresta de largada fixa a ordem', () => {
  // o oito sao dois lacos colados no vertice 0; fixando a largada em 0>1, o
  // segundo laco so pode ser percorrido depois, e nao ha segunda ordem possivel
  assert.equal(contarCircuitos(oito()).total, 1n);
});

test('vertice isolado nao impede o circuito', () => {
  const g = new Grafo(5, [[0, 1], [1, 2], [2, 0]]);
  assert.equal(g.ehEuleriano(), true);
  assert.deepEqual(g.ativos(), [0, 1, 2]);
});

test('contar circuitos de grafo nao euleriano devolve zero', () => {
  assert.equal(contarCircuitos(new Grafo(3, [[0, 1], [1, 2]])).total, 0n);
});

test('as duas arestas paralelas dao dois circuitos', () => {
  const g = new Grafo(2, [[0, 1], [1, 0], [0, 1], [1, 0]]);
  assert.equal(contarCircuitos(g).total, 2n);
});

test('listar e contar dao o mesmo numero', () => {
  for (const n of [2, 3, 4]) {
    for (const g of gerarSimples(n)) {
      assert.equal(BigInt(listarCircuitos(g).length), contarCircuitos(g).total);
    }
  }
});

test('todo circuito listado usa cada aresta exatamente uma vez', () => {
  for (const g of gerarSimples(4)) {
    for (const c of listarCircuitos(g)) {
      assert.equal(c.length, g.m);
      assert.equal(new Set(c).size, g.m);
    }
  }
});

test('todo circuito listado encadeia destino com origem e fecha', () => {
  for (const g of gerarSimples(4)) {
    for (const c of listarCircuitos(g)) {
      assert.equal(ehCircuitoValido(g, c), true);
    }
  }
});

test('todo circuito listado comeca na aresta 0', () => {
  for (const g of gerarSimples(4)) {
    for (const c of listarCircuitos(g)) assert.equal(c[0], 0);
  }
});

test('nao ha circuito repetido na listagem', () => {
  for (const g of gerarSimples(4)) {
    const lista = listarCircuitos(g).map((c) => c.join(','));
    assert.equal(new Set(lista).size, lista.length);
  }
});

test('o duplo sentido tem exatamente um circuito', () => {
  assert.equal(contarCircuitos(duploSentido()).total, 1n);
});
