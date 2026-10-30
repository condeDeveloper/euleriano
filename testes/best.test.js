import test from 'node:test';
import assert from 'node:assert/strict';
import { Grafo } from '../src/grafo.js';
import { gerarSimples } from '../src/gerador.js';
import { contarCircuitos } from '../src/enumera.js';
import { fatorial } from '../src/determinante.js';
import { arborescencias, arborescenciasPorRaiz, contarPeloBest } from '../src/best.js';

/** Determinante por Laplace, lento e obvio: o juiz do juiz. */
function laplace(m) {
  const n = m.length;
  if (n === 0) return 1n;
  if (n === 1) return BigInt(m[0][0]);
  let soma = 0n;
  for (let j = 0; j < n; j++) {
    const menor = m.slice(1).map((linha) => linha.filter((_, k) => k !== j));
    const termo = BigInt(m[0][j]) * laplace(menor);
    soma += j % 2 === 0 ? termo : -termo;
  }
  return soma;
}

test('o triangulo tem uma arborescencia por raiz', () => {
  const g = new Grafo(3, [[0, 1], [1, 2], [2, 0]]);
  assert.deepEqual(arborescenciasPorRaiz(g), [1n, 1n, 1n]);
});

test('o grafo completo de 4 vertices tem 16 arborescencias, como diz Cayley', () => {
  // Cayley: o dirigido completo tem n^(n-2) arborescencias enraizadas
  const arestas = [];
  for (let u = 0; u < 4; u++) for (let v = 0; v < 4; v++) if (u !== v) arestas.push([u, v]);
  assert.equal(arborescencias(new Grafo(4, arestas), 0), 16n);
});

test('o grafo completo de 5 vertices tem 125 arborescencias', () => {
  const arestas = [];
  for (let u = 0; u < 5; u++) for (let v = 0; v < 5; v++) if (u !== v) arestas.push([u, v]);
  assert.equal(arborescencias(new Grafo(5, arestas), 0), 125n);
});

test('arborescencias com raiz num vertice isolado e zero', () => {
  const g = new Grafo(4, [[0, 1], [1, 2], [2, 0]]);
  assert.equal(arborescencias(g, 3), 0n);
});

test('num grafo euleriano o numero de arborescencias nao muda com a raiz', () => {
  for (const n of [2, 3, 4]) {
    for (const g of gerarSimples(n)) {
      const porRaiz = arborescenciasPorRaiz(g);
      assert.ok(porRaiz.every((x) => x === porRaiz[0]), `${g.chave()} deu ${porRaiz}`);
    }
  }
});

test('fora do euleriano, a raiz MUDA o numero de arborescencias', () => {
  // o contraexemplo que mostra que a invariancia acima nao e trivial
  const g = new Grafo(3, [[0, 1], [0, 2], [1, 2]]);
  const porRaiz = arborescenciasPorRaiz(g);
  assert.equal(porRaiz.every((x) => x === porRaiz[0]), false);
});

test('BEST bate com a enumeracao em todo grafo de 2 vertices', () => {
  for (const g of gerarSimples(2)) assert.equal(contarPeloBest(g), contarCircuitos(g).total);
});

test('BEST bate com a enumeracao em todo grafo de 3 vertices', () => {
  for (const g of gerarSimples(3)) assert.equal(contarPeloBest(g), contarCircuitos(g).total);
});

test('BEST bate com a enumeracao em todo grafo de 4 vertices', () => {
  for (const g of gerarSimples(4)) assert.equal(contarPeloBest(g), contarCircuitos(g).total);
});

test('BEST bate com a enumeracao em todo grafo de 5 vertices', () => {
  for (const g of gerarSimples(5)) assert.equal(contarPeloBest(g), contarCircuitos(g).total);
});

test('BEST devolve zero em grafo nao euleriano', () => {
  assert.equal(contarPeloBest(new Grafo(3, [[0, 1], [1, 2]])), 0n);
});

test('BEST nao depende de qual raiz o codigo escolhe', () => {
  // refaz a conta do BEST a mao, com cada raiz, e exige o mesmo resultado
  for (const g of gerarSimples(4)) {
    const esperado = contarPeloBest(g);
    for (const r of g.ativos()) {
      let x = arborescencias(g, r);
      for (const v of g.ativos()) x *= fatorial(g.saida[v] - 1);
      assert.equal(x, esperado);
    }
  }
});

test('o grafo completo de 4 fecha em 256 pelos dois caminhos', () => {
  const arestas = [];
  for (let u = 0; u < 4; u++) for (let v = 0; v < 4; v++) if (u !== v) arestas.push([u, v]);
  const g = new Grafo(4, arestas);
  assert.equal(contarPeloBest(g), 256n);
  assert.equal(contarCircuitos(g).total, 256n);
});

test('o grafo de De Bruijn binario de ordem 3 tem 2 circuitos', () => {
  // vertices = palavras de 2 bits, arestas = palavras de 3 bits
  const arestas = [];
  for (let v = 0; v < 4; v++) for (let s = 0; s < 2; s++) arestas.push([v, (v * 2 + s) % 4]);
  const g = new Grafo(4, arestas);
  assert.equal(contarPeloBest(g), 2n);
  assert.equal(contarCircuitos(g).total, 2n);
});

test('o grafo de De Bruijn binario de ordem 4 tem 16 circuitos', () => {
  const arestas = [];
  for (let v = 0; v < 8; v++) for (let s = 0; s < 2; s++) arestas.push([v, (v * 2 + s) % 8]);
  const g = new Grafo(8, arestas);
  assert.equal(contarPeloBest(g), 16n);
  assert.equal(contarCircuitos(g).total, 16n);
});

test('o grafo de De Bruijn ternario de ordem 2 tem 24 circuitos', () => {
  const arestas = [];
  for (let v = 0; v < 3; v++) for (let s = 0; s < 3; s++) arestas.push([v, (v * 3 + s) % 3]);
  const g = new Grafo(3, arestas);
  assert.equal(contarPeloBest(g), 24n);
});

test('o produto dos fatoriais sozinho nao da a resposta', () => {
  // se alguem esquecer o fator das arborescencias, o numero muda: a conta que
  // falha aqui e exatamente o erro que o teorema existe para evitar
  const arestas = [];
  for (let u = 0; u < 4; u++) for (let v = 0; v < 4; v++) if (u !== v) arestas.push([u, v]);
  const g = new Grafo(4, arestas);
  let soFatoriais = 1n;
  for (const v of g.ativos()) soFatoriais *= fatorial(g.saida[v] - 1);
  assert.equal(soFatoriais, 16n);
  assert.notEqual(soFatoriais, contarPeloBest(g));
});
