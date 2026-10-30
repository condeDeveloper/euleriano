// Os grafos que o projeto varre: o domínio inteiro de n vertices, o grafo
// completo e o grafo de De Bruijn. Nada aqui conta circuito.

import { Grafo } from './grafo.js';
import { fatorial } from './determinante.js';

/**
 * Todos os grafos dirigidos SIMPLES (sem laco, sem aresta paralela) sobre n
 * vertices rotulados que sao eulerianos e conexos. O dominio e finito: cada um
 * dos n*(n-1) pares ordenados entra ou nao, logo 2^(n*(n-1)) matrizes. Varrido
 * inteiro, nao amostrado.
 */
export function* gerarSimples(n) {
  const pares = [];
  for (let u = 0; u < n; u++) for (let v = 0; v < n; v++) if (u !== v) pares.push([u, v]);
  const total = 1 << pares.length;
  for (let mascara = 1; mascara < total; mascara++) {
    const arestas = [];
    for (let i = 0; i < pares.length; i++) if (mascara & (1 << i)) arestas.push(pares[i]);
    const g = new Grafo(n, arestas);
    if (g.ehEuleriano()) yield g;
  }
}

/** Quantas matrizes a varredura de gerarSimples(n) percorre, euleriana ou nao. */
export function tamanhoDoDominio(n) {
  return 2 ** (n * (n - 1));
}

/** O grafo dirigido completo sobre n vertices: ida e volta entre todo par. */
export function completo(n) {
  const arestas = [];
  for (let u = 0; u < n; u++) for (let v = 0; v < n; v++) if (u !== v) arestas.push([u, v]);
  return new Grafo(n, arestas);
}

/**
 * Terceiro caminho, so para o grafo completo: Cayley diz que ele tem n^(n-2)
 * arborescencias, e todo vertice tem grau de saida n-1, entao o BEST fecha em
 * n^(n-2) * ((n-2)!)^n sem determinante nenhum.
 */
export function formulaCompleto(n) {
  let r = BigInt(n) ** BigInt(n - 2);
  for (let i = 0; i < n; i++) r *= fatorial(n - 2);
  return r;
}

/**
 * Grafo de De Bruijn de ordem n sobre k simbolos: os vertices sao as palavras de
 * n-1 simbolos e cada aresta e uma palavra de n. Ele e euleriano, e seus
 * circuitos eulerianos SAO as sequencias de De Bruijn.
 */
export function deBruijn(k, n) {
  const vertices = k ** (n - 1);
  const arestas = [];
  for (let v = 0; v < vertices; v++) {
    for (let s = 0; s < k; s++) arestas.push([v, (v * k + s) % vertices]);
  }
  return new Grafo(vertices, arestas);
}

/** A contagem classica de sequencias de De Bruijn ciclicas: (k!)^(k^(n-1)) / k^n. */
export function formulaDeBruijn(k, n) {
  return fatorial(k) ** BigInt(k ** (n - 1)) / BigInt(k) ** BigInt(n);
}
