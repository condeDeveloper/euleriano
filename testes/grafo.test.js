import test from 'node:test';
import assert from 'node:assert/strict';
import { Grafo } from '../src/grafo.js';
import { gerarSimples, tamanhoDoDominio } from '../src/gerador.js';

const triangulo = () => new Grafo(3, [[0, 1], [1, 2], [2, 0]]);
const duploSentido = () => new Grafo(2, [[0, 1], [1, 0]]);
const oito = () => new Grafo(3, [[0, 1], [1, 0], [0, 2], [2, 0]]);

test('o triangulo e euleriano', () => {
  assert.equal(triangulo().ehEuleriano(), true);
});

test('grafo desbalanceado nao e euleriano', () => {
  const g = new Grafo(3, [[0, 1], [1, 2]]);
  assert.equal(g.ehEuleriano(), false);
});

test('grafo balanceado mas desconexo nao e euleriano', () => {
  // dois triangulos separados: todo vertice tem grau 1 de entrada e 1 de saida
  const g = new Grafo(6, [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3]]);
  assert.equal(g.balanceado(), true);
  assert.equal(g.conexoNosAtivos(), false);
  assert.equal(g.ehEuleriano(), false);
});

test('aresta paralela conta como aresta distinta', () => {
  const g = new Grafo(2, [[0, 1], [1, 0], [0, 1], [1, 0]]);
  assert.equal(g.m, 4);
  assert.equal(g.saida[0], 2);
});

test('o tamanho do dominio e 2 elevado a n(n-1)', () => {
  assert.equal(tamanhoDoDominio(2), 4);
  assert.equal(tamanhoDoDominio(3), 64);
  assert.equal(tamanhoDoDominio(4), 4096);
  assert.equal(tamanhoDoDominio(5), 1048576);
});

test('a chave do grafo nao depende da ordem em que as arestas foram dadas', () => {
  const a = new Grafo(3, [[0, 1], [1, 2], [2, 0]]);
  const b = new Grafo(3, [[2, 0], [0, 1], [1, 2]]);
  assert.equal(a.chave(), b.chave());
});

test('gerarSimples so devolve grafo euleriano', () => {
  for (const n of [2, 3, 4]) {
    for (const g of gerarSimples(n)) assert.equal(g.ehEuleriano(), true);
  }
});

test('gerarSimples nao repete grafo', () => {
  const vistos = new Set();
  for (const g of gerarSimples(4)) {
    const k = g.chave();
    assert.equal(vistos.has(k), false);
    vistos.add(k);
  }
});

test('gerarSimples nao cria laco nem aresta paralela', () => {
  for (const g of gerarSimples(4)) {
    const pares = g.arestas.map(([u, v]) => u + '>' + v);
    assert.equal(new Set(pares).size, pares.length);
    assert.equal(g.arestas.some(([u, v]) => u === v), false);
  }
});

test('em todo grafo gerado o numero de arestas e par ou impar conforme os graus', () => {
  for (const g of gerarSimples(4)) {
    const soma = g.saida.reduce((a, b) => a + b, 0);
    assert.equal(soma, g.m);
    assert.equal(g.entrada.reduce((a, b) => a + b, 0), g.m);
  }
});
