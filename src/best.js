// Segundo caminho, independente do primeiro: o teorema BEST.
//
//   ec(G) = tw(G, r) * PRODUTO sobre v de (grau_saida(v) - 1)!
//
// tw(G, r) e o numero de arborescencias de G com raiz r, isto e, subgrafos em que
// todo vertice menos r tem exatamente uma aresta saindo e todo caminho leva a r.
// Esse numero sai de um DETERMINANTE (teorema da arvore matricial dirigido), nao
// de busca nenhuma: este arquivo nunca anda num circuito.
//
// O nome e dos quatro: de Bruijn, van Aardenne-Ehrenfest, Smith e Tutte.

import { determinante, fatorial } from './determinante.js';

/**
 * Numero de arborescencias de g com raiz em r, pelo menor da laplaciana de saida
 * L = D_saida - A, removendo a linha e a coluna de r. So considera os vertices
 * ativos: vertice isolado nao participa de arborescencia nenhuma.
 */
export function arborescencias(g, r) {
  const ativos = g.ativos();
  if (!ativos.includes(r)) return 0n;
  const indice = new Map(ativos.map((v, i) => [v, i]));
  const k = ativos.length;

  const L = Array.from({ length: k }, () => new Array(k).fill(0));
  for (const [u, v] of g.arestas) {
    if (u === v) continue; // laco nao entra na laplaciana
    L[indice.get(u)][indice.get(u)] += 1;
    L[indice.get(u)][indice.get(v)] -= 1;
  }

  const fora = indice.get(r);
  const menor = [];
  for (let i = 0; i < k; i++) {
    if (i === fora) continue;
    const linha = [];
    for (let j = 0; j < k; j++) if (j !== fora) linha.push(L[i][j]);
    menor.push(linha);
  }
  return determinante(menor);
}


/**
 * O numero de circuitos eulerianos pelo teorema BEST. Mesma convencao do
 * enumerador: circuitos contados como ciclos de arestas, sem ponto de partida.
 */
export function contarPeloBest(g) {
  if (!g.ehEuleriano()) return 0n;
  const raiz = g.ativos()[0];
  let r = arborescencias(g, raiz);
  for (const v of g.ativos()) r *= fatorial(g.saida[v] - 1);
  return r;
}

/**
 * O teorema promete, de lambuja, que num grafo euleriano o numero de
 * arborescencias NAO DEPENDE da raiz escolhida. Isto devolve o numero visto de
 * cada raiz, para a afirmacao poder ser medida em vez de repetida.
 */
export function arborescenciasPorRaiz(g) {
  return g.ativos().map((v) => arborescencias(g, v));
}
