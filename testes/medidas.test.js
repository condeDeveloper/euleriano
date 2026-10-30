// Os numeros que aparecem no README, presos aqui. Se o codigo mudar e o numero
// mudar junto, este arquivo quebra antes de o README virar mentira.
//
// Nenhum valor abaixo foi digitado de cabeca: todos sairam de
// `node ferramentas/medidor.js` e foram copiados de la.

import test from 'node:test';
import assert from 'node:assert/strict';
import { varrer, contarComTeto } from '../ferramentas/medidor.js';
import { completo, formulaCompleto, deBruijn, formulaDeBruijn } from '../src/gerador.js';
import { contarPeloBest } from '../src/best.js';

const medido = {
  2: { dominio: 4, grafos: 1, circuitos: 1n, nos: 2, hierholzer: 5 },
  3: { dominio: 64, grafos: 9, circuitos: 11n, nos: 42, hierholzer: 69 },
  4: { dominio: 4096, grafos: 148, circuitos: 858n, nos: 5753, hierholzer: 1948 },
  5: { dominio: 1048576, grafos: 7660, circuitos: 3059486n, nos: 24605397, hierholzer: 161540 },
};

for (const n of [2, 3, 4, 5]) {
  test(`tabela 1, n=${n}: dominio, grafos eulerianos e circuitos`, () => {
    const r = varrer(n);
    assert.equal(r.dominio, medido[n].dominio);
    assert.equal(r.grafos, medido[n].grafos);
    assert.equal(r.circuitos, medido[n].circuitos);
  });

  test(`tabela 2, n=${n}: a busca e o BEST nao discordam nenhuma vez`, () => {
    const r = varrer(n);
    assert.equal(r.concordam, medido[n].grafos);
    assert.equal(r.discordam, 0);
  });

  test(`tabela 3, n=${n}: custo da enumeracao e de Hierholzer`, () => {
    const r = varrer(n);
    assert.equal(r.nosDaBusca, medido[n].nos);
    assert.equal(r.passosDeHierholzer, medido[n].hierholzer);
  });

  test(`tabela 4, n=${n}: a raiz nunca muda o numero de arborescencias`, () => {
    const r = varrer(n);
    assert.equal(r.raizInvariante, medido[n].grafos);
    assert.equal(r.raizMuda, 0);
  });

  test(`tabela 5, n=${n}: Hierholzer acerta em todos`, () => {
    const r = varrer(n);
    assert.equal(r.validos, medido[n].grafos);
  });
}

test('fechamento: 7.818 grafos varridos no total', () => {
  const soma = [2, 3, 4, 5].reduce((a, n) => a + varrer(n).grafos, 0);
  assert.equal(soma, 7818);
});

test('fechamento: 3.060.356 circuitos contados no total', () => {
  const soma = [2, 3, 4, 5].reduce((a, n) => a + varrer(n).circuitos, 0n);
  assert.equal(soma, 3060356n);
});

test('fechamento: 1.052.740 matrizes olhadas no total', () => {
  const soma = [2, 3, 4, 5].reduce((a, n) => a + varrer(n).dominio, 0);
  assert.equal(soma, 1052740);
});

test('fechamento: nenhuma divergencia entre os dois caminhos', () => {
  const soma = [2, 3, 4, 5].reduce((a, n) => a + varrer(n).discordam, 0);
  assert.equal(soma, 0);
});

test('tabela 3: em n=5 contar todos custa 152 vezes achar um', () => {
  const r = varrer(5);
  const razao = r.nosDaBusca / r.passosDeHierholzer;
  assert.ok(razao > 152 && razao < 153, `razao medida: ${razao}`);
});

test('tabela 3: em n=2 e n=3 achar um custa MAIS que contar todos', () => {
  // o fatorial ainda nao pegou: nessa faixa a pilha de Hierholzer e o gasto maior
  for (const n of [2, 3]) {
    const r = varrer(n);
    assert.ok(r.nosDaBusca < r.passosDeHierholzer, `n=${n}`);
  }
});

test('tabela 1: so 0,73% das matrizes de 5 vertices sao eulerianas conexas', () => {
  const r = varrer(5);
  const fatia = (100 * r.grafos) / r.dominio;
  assert.ok(fatia > 0.72 && fatia < 0.74, `fatia medida: ${fatia}`);
});

const completos = { 2: 1n, 3: 3n, 4: 256n, 5: 972000n, 6: 247669456896n };
for (const n of [2, 3, 4, 5, 6]) {
  test(`tabela 6: o completo de ${n} vertices tem ${completos[n]} circuitos`, () => {
    assert.equal(contarPeloBest(completo(n)), completos[n]);
  });

  test(`tabela 7: no completo de ${n}, BEST e a formula de Cayley dao o mesmo`, () => {
    assert.equal(contarPeloBest(completo(n)), formulaCompleto(n));
  });
}

test('tabela 6: a busca termina no completo de 5 e gasta 7.740.620 nos', () => {
  const b = contarComTeto(completo(5), 20_000_000);
  assert.equal(b.terminou, true);
  assert.equal(b.total, 972000n);
  assert.equal(b.nos, 7740620);
});

test('tabela 6: a busca NAO termina no completo de 6 com 20 milhoes de nos', () => {
  const b = contarComTeto(completo(6), 20_000_000);
  assert.equal(b.terminou, false);
});

const deBruijns = [[2, 2, 1n], [2, 3, 2n], [2, 4, 16n], [3, 2, 24n]];
for (const [k, n, esperado] of deBruijns) {
  test(`tabela 7: De Bruijn k=${k} n=${n} da ${esperado} pelos dois caminhos`, () => {
    assert.equal(contarPeloBest(deBruijn(k, n)), esperado);
    assert.equal(formulaDeBruijn(k, n), esperado);
  });
}

test('o grafo de De Bruijn binario de ordem 5 tem 2.048 circuitos', () => {
  assert.equal(contarPeloBest(deBruijn(2, 5)), 2048n);
  assert.equal(formulaDeBruijn(2, 5), 2048n);
});

test('o grafo de De Bruijn de 4 simbolos e ordem 2 tem 20.736 circuitos', () => {
  // (4!)^4 da 331.776, mas a formula ainda divide por k^n = 16
  assert.equal(contarPeloBest(deBruijn(4, 2)), 20736n);
  assert.equal(formulaDeBruijn(4, 2), 20736n);
});
