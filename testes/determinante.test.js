import test from 'node:test';
import assert from 'node:assert/strict';
import { determinante, fatorial } from '../src/determinante.js';

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

test('determinante da matriz vazia e 1', () => {
  assert.equal(determinante([]), 1n);
});

test('determinante de 1x1', () => {
  assert.equal(determinante([[7]]), 7n);
});

test('determinante de 2x2', () => {
  assert.equal(determinante([[1, 2], [3, 4]]), -2n);
});

test('determinante da identidade e 1', () => {
  const id = (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  for (const n of [1, 2, 3, 4, 5]) assert.equal(determinante(id(n)), 1n);
});

test('determinante com linha de zeros e 0', () => {
  assert.equal(determinante([[1, 2, 3], [0, 0, 0], [4, 5, 6]]), 0n);
});

test('determinante com linhas iguais e 0', () => {
  assert.equal(determinante([[1, 2, 3], [1, 2, 3], [4, 5, 7]]), 0n);
});

test('determinante troca de sinal ao trocar duas linhas', () => {
  const a = [[2, 1, 3], [0, 4, 1], [5, 2, 2]];
  const b = [[0, 4, 1], [2, 1, 3], [5, 2, 2]];
  assert.equal(determinante(a), -determinante(b));
});

test('Bareiss concorda com Laplace em 300 matrizes inteiras', () => {
  // gerador proprio, deterministico, para o teste nao depender de Math.random
  let semente = 20261030;
  const proximo = () => {
    semente = (semente * 1103515245 + 12345) % 2147483648;
    return (semente % 19) - 9;
  };
  for (let caso = 0; caso < 300; caso++) {
    const n = 1 + (caso % 5);
    const m = Array.from({ length: n }, () => Array.from({ length: n }, proximo));
    assert.equal(determinante(m), laplace(m), `matriz ${JSON.stringify(m)}`);
  }
});

test('Bareiss nao usa ponto flutuante: determinante grande sai exato', () => {
  // uma matriz triangular com diagonal grande, cujo determinante passa de 2^53
  const n = 8;
  const m = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 199 : i < j ? 3 : 0)));
  assert.equal(determinante(m), 199n ** 8n);
  assert.equal(199n ** 8n, 2459374191553118401n);
  // 2^53 e o ultimo inteiro que um double representa sem buraco: este
  // determinante passa dele, entao com Number a resposta sairia arredondada
  assert.ok(199n ** 8n > 2n ** 53n);
  assert.notEqual(BigInt(Number(199n ** 8n)), 199n ** 8n);
});

test('o determinante pivota quando o primeiro elemento e zero', () => {
  assert.equal(determinante([[0, 1], [1, 0]]), -1n);
  assert.equal(determinante([[0, 0, 1], [0, 1, 0], [1, 0, 0]]), -1n);
});

test('fatorial de 0 e de 1 sao 1', () => {
  assert.equal(fatorial(0), 1n);
  assert.equal(fatorial(1), 1n);
});

test('fatorial de 20 cabe exato em BigInt', () => {
  assert.equal(fatorial(20), 2432902008176640000n);
});
