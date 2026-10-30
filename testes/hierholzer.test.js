import test from 'node:test';
import assert from 'node:assert/strict';
import { Grafo } from '../src/grafo.js';
import { gerarSimples, tamanhoDoDominio } from '../src/gerador.js';
import { contarCircuitos, listarCircuitos } from '../src/enumera.js';
import { circuitoEuleriano, ehCircuitoValido } from '../src/hierholzer.js';

const triangulo = () => new Grafo(3, [[0, 1], [1, 2], [2, 0]]);
const duploSentido = () => new Grafo(2, [[0, 1], [1, 0]]);
const oito = () => new Grafo(3, [[0, 1], [1, 0], [0, 2], [2, 0]]);

test('Hierholzer devolve circuito valido em todo grafo euleriano de 4 vertices', () => {
  for (const g of gerarSimples(4)) {
    const { circuito } = circuitoEuleriano(g);
    assert.equal(ehCircuitoValido(g, circuito), true);
  }
});

test('Hierholzer devolve circuito valido comecando de qualquer vertice ativo', () => {
  for (const g of gerarSimples(3)) {
    for (const v of g.ativos()) {
      const { circuito } = circuitoEuleriano(g, v);
      assert.equal(ehCircuitoValido(g, circuito), true);
      assert.equal(g.arestas[circuito[0]][0], v);
    }
  }
});

test('Hierholzer gasta no maximo 2m+1 passos', () => {
  for (const g of gerarSimples(4)) {
    const { passos } = circuitoEuleriano(g);
    assert.ok(passos <= 2 * g.m + 1, `${passos} passos para ${g.m} arestas`);
  }
});

test('o circuito de Hierholzer esta entre os circuitos enumerados', () => {
  for (const g of gerarSimples(3)) {
    const { circuito } = circuitoEuleriano(g, g.arestas[0][0]);
    const todos = listarCircuitos(g).map((c) => c.join(','));
    // normaliza a rotacao para comecar na aresta 0, como faz o enumerador
    const i = circuito.indexOf(0);
    const girado = circuito.slice(i).concat(circuito.slice(0, i));
    assert.ok(todos.includes(girado.join(',')));
  }
});

test('Hierholzer nao devolve nada em grafo nao euleriano', () => {
  const { circuito } = circuitoEuleriano(new Grafo(3, [[0, 1], [1, 2]]));
  assert.deepEqual(circuito, []);
});

test('ehCircuitoValido recusa circuito que repete aresta', () => {
  const g = triangulo();
  assert.equal(ehCircuitoValido(g, [0, 0, 1]), false);
});

test('ehCircuitoValido recusa circuito de tamanho errado', () => {
  assert.equal(ehCircuitoValido(triangulo(), [0, 1]), false);
});

test('ehCircuitoValido recusa sequencia que nao encadeia', () => {
  const g = new Grafo(4, [[0, 1], [1, 0], [2, 3], [3, 2]]);
  assert.equal(ehCircuitoValido(g, [0, 2, 1, 3]), false);
});
