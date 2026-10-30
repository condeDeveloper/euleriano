#!/usr/bin/env node
// O medidor: roda as varreduras e imprime as tabelas que vao para o README.
// Nenhum numero do README e digitado a mao; todos saem daqui.

import { gerarSimples, tamanhoDoDominio, completo, formulaCompleto, deBruijn, formulaDeBruijn } from '../src/gerador.js';
import { contarCircuitos } from '../src/enumera.js';
import { contarPeloBest, arborescenciasPorRaiz } from '../src/best.js';
import { circuitoEuleriano, ehCircuitoValido } from '../src/hierholzer.js';

const br = (x) => x.toLocaleString('pt-BR');

// A varredura de n=5 passa de um segundo, e o medidor e os testes a pedem varias
// vezes. Guardar o resultado por n nao muda nenhum numero, so o relogio.
const guardado = new Map();

/** Varre todos os grafos simples eulerianos de n vertices e mede tudo de uma vez. */
export function varrer(n) {
  if (!guardado.has(n)) guardado.set(n, varrerDeVerdade(n));
  return guardado.get(n);
}

function varrerDeVerdade(n) {
  let grafos = 0;
  let circuitos = 0n;
  let maior = 0n;
  let maiorM = 0;
  let concordam = 0;
  let discordam = 0;
  let nosDaBusca = 0;
  let passosDeHierholzer = 0;
  let raizInvariante = 0;
  let raizMuda = 0;
  let validos = 0;

  for (const g of gerarSimples(n)) {
    grafos++;
    const porBusca = contarCircuitos(g);
    const porFormula = contarPeloBest(g);
    if (porBusca.total === porFormula) concordam++; else discordam++;

    circuitos += porFormula;
    if (porFormula > maior) { maior = porFormula; maiorM = g.m; }
    nosDaBusca += porBusca.nos;

    const h = circuitoEuleriano(g);
    passosDeHierholzer += h.passos;
    if (ehCircuitoValido(g, h.circuito)) validos++;

    const porRaiz = arborescenciasPorRaiz(g);
    if (porRaiz.every((x) => x === porRaiz[0])) raizInvariante++; else raizMuda++;
  }

  return {
    n,
    dominio: tamanhoDoDominio(n),
    grafos,
    circuitos,
    maior,
    maiorM,
    concordam,
    discordam,
    nosDaBusca,
    passosDeHierholzer,
    raizInvariante,
    raizMuda,
    validos,
  };
}

export function tabela(ns = [2, 3, 4, 5]) {
  return ns.map(varrer);
}

/**
 * Conta os circuitos de g pela BUSCA, mas desiste depois de `teto` nos. Serve
 * para medir ate onde a enumeracao chega de verdade, em vez de supor.
 * @returns {{total: bigint, nos: number, terminou: boolean}}
 */
export function contarComTeto(g, teto) {
  const m = g.m;
  const usada = new Array(m).fill(false);
  usada[0] = true;
  const inicio = g.arestas[0][0];
  let total = 0n;
  let nos = 0;
  let estourou = false;

  const anda = (atual, faltam) => {
    if (estourou) return;
    if (++nos > teto) { estourou = true; return; }
    if (faltam === 0) {
      if (atual === inicio) total++;
      return;
    }
    for (const i of g.saindo[atual]) {
      if (usada[i]) continue;
      usada[i] = true;
      anda(g.arestas[i][1], faltam - 1);
      usada[i] = false;
      if (estourou) return;
    }
  };

  anda(g.arestas[0][1], m - 1);
  return { total, nos, terminou: !estourou };
}

function imprimir() {
  const linhas = tabela();

  console.log('\n== Tabela 1: o dominio varrido ==');
  console.log('  n | matrizes olhadas | eulerianos conexos | circuitos no total');
  for (const l of linhas) {
    console.log(
      `  ${l.n} | ${br(l.dominio).padStart(16)} | ${br(l.grafos).padStart(18)} | ${br(l.circuitos).padStart(18)}`
    );
  }

  console.log('\n== Tabela 2: a busca contra o teorema BEST ==');
  console.log('  n | concordam | discordam');
  for (const l of linhas) {
    console.log(`  ${l.n} | ${br(l.concordam).padStart(9)} | ${br(l.discordam).padStart(9)}`);
  }

  console.log('\n== Tabela 3: custo de contar todos contra achar um ==');
  console.log('  n | nos da enumeracao | passos de Hierholzer | razao');
  for (const l of linhas) {
    const razao = l.passosDeHierholzer === 0 ? 0 : l.nosDaBusca / l.passosDeHierholzer;
    console.log(
      `  ${l.n} | ${br(l.nosDaBusca).padStart(17)} | ${br(l.passosDeHierholzer).padStart(20)} | ${razao.toFixed(2)}x`
    );
  }

  console.log('\n== Tabela 4: o numero de arborescencias depende da raiz? ==');
  console.log('  n | mesmo em toda raiz | muda com a raiz');
  for (const l of linhas) {
    console.log(`  ${l.n} | ${br(l.raizInvariante).padStart(18)} | ${br(l.raizMuda).padStart(15)}`);
  }

  console.log('\n== Tabela 5: o circuito que Hierholzer devolve e valido? ==');
  console.log('  n | grafos | circuitos validos');
  for (const l of linhas) {
    console.log(`  ${l.n} | ${br(l.grafos).padStart(6)} | ${br(l.validos).padStart(17)}`);
  }

  console.log('\n== Tabela 6: o grafo completo, onde a busca para de alcancar ==');
  console.log('  n | arestas | BEST | a busca terminou? | nos gastos');
  const TETO = 20_000_000;
  for (const n of [2, 3, 4, 5, 6]) {
    const g = completo(n);
    const f = contarPeloBest(g);
    const b = contarComTeto(g, TETO);
    const veredito = b.terminou ? `sim, deu ${br(b.total)}` : `NAO, desistiu`;
    console.log(
      `  ${n} | ${String(g.m).padStart(7)} | ${br(f).padStart(24)} | ${veredito.padEnd(26)} | ${br(b.nos)}`
    );
    if (b.terminou && b.total !== f) {
      console.error(`DIVERGENCIA no completo de ${n}: busca ${b.total}, BEST ${f}`);
      process.exit(1);
    }
  }

  console.log('\n== Tabela 7: o mesmo teorema contado por um terceiro caminho ==');
  console.log('  No grafo completo vale a formula fechada n^(n-2) * ((n-2)!)^n, de Cayley.');
  console.log('  No grafo de De Bruijn vale (k!)^(k^(n-1)) / k^n, que conta sequencias ciclicas.');
  console.log('  caso            | BEST | formula fechada | batem?');
  for (const n of [3, 4, 5, 6]) {
    const f = contarPeloBest(completo(n));
    const c = formulaCompleto(n);
    console.log(`  completo n=${n}     | ${br(f).padStart(20)} | ${br(c).padStart(20)} | ${f === c ? 'sim' : 'NAO'}`);
    if (f !== c) process.exit(1);
  }
  for (const [k, n] of [[2, 2], [2, 3], [2, 4], [3, 2]]) {
    const f = contarPeloBest(deBruijn(k, n));
    const c = formulaDeBruijn(k, n);
    console.log(`  De Bruijn k=${k} n=${n} | ${br(f).padStart(20)} | ${br(c).padStart(20)} | ${f === c ? 'sim' : 'NAO'}`);
    if (f !== c) process.exit(1);
  }

  const t = linhas.reduce(
    (a, l) => ({
      grafos: a.grafos + l.grafos,
      concordam: a.concordam + l.concordam,
      discordam: a.discordam + l.discordam,
      circuitos: a.circuitos + l.circuitos,
      validos: a.validos + l.validos,
      raizMuda: a.raizMuda + l.raizMuda,
    }),
    { grafos: 0, concordam: 0, discordam: 0, circuitos: 0n, validos: 0, raizMuda: 0 }
  );
  console.log('\n== Fechamento ==');
  console.log(`  grafos varridos ............. ${br(t.grafos)}`);
  console.log(`  circuitos contados .......... ${br(t.circuitos)}`);
  console.log(`  busca x BEST, concordancias . ${br(t.concordam)}`);
  console.log(`  busca x BEST, divergencias .. ${br(t.discordam)}`);
  console.log(`  circuitos de Hierholzer ok .. ${br(t.validos)} de ${br(t.grafos)}`);
  console.log(`  arborescencias que mudam com a raiz . ${br(t.raizMuda)}`);
  console.log('');

  if (t.discordam > 0 || t.validos !== t.grafos) {
    console.error('MEDIDA FORA DO ESPERADO: ver tabelas acima');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('medidor.js')) {
  imprimir();
}
