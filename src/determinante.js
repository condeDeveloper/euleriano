// Determinante inteiro EXATO, em BigInt. Fica num arquivo proprio porque e a
// unica peca de algebra do projeto e nao sabe nada sobre grafo.

/**
 * Algoritmo de Bareiss. A cada passo divide pelo pivo anterior, e essa divisao e
 * sempre exata: o determinante de uma matriz inteira sai inteiro, sem ponto
 * flutuante em lugar nenhum. Com double, um grafo de 6 vertices devolveria
 * 23.999999999999996 onde a resposta e 24.
 *
 * @param {number[][]} matriz quadrada, entradas inteiras
 * @returns {bigint}
 */
export function determinante(matriz) {
  const n = matriz.length;
  if (n === 0) return 1n;
  const a = matriz.map((linha) => linha.map(BigInt));
  let sinal = 1n;
  let anterior = 1n;

  for (let k = 0; k < n - 1; k++) {
    if (a[k][k] === 0n) {
      let troca = -1;
      for (let i = k + 1; i < n; i++) if (a[i][k] !== 0n) { troca = i; break; }
      if (troca === -1) return 0n;
      [a[k], a[troca]] = [a[troca], a[k]];
      sinal = -sinal;
    }
    for (let i = k + 1; i < n; i++) {
      for (let j = k + 1; j < n; j++) {
        a[i][j] = (a[i][j] * a[k][k] - a[i][k] * a[k][j]) / anterior;
      }
      a[i][k] = 0n;
    }
    anterior = a[k][k];
  }
  return sinal * a[n - 1][n - 1];
}

/** Fatorial em BigInt: o produto do BEST estoura o double em grafo pequeno. */
export function fatorial(n) {
  let r = 1n;
  for (let i = 2n; i <= BigInt(n); i++) r *= i;
  return r;
}
