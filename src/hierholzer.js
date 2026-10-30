// Achar UM circuito euleriano custa uma passada pelas arestas. Contar TODOS custa
// o fatorial. Este arquivo existe para a diferenca entre as duas coisas poder ser
// medida, e nao so afirmada.

/**
 * Algoritmo de Hierholzer (1873). Anda enquanto houver aresta nao usada saindo do
 * vertice atual; quando empaca, costura o trecho fechado no lugar certo do
 * circuito. Cada aresta entra e sai da pilha uma vez.
 *
 * @returns {{circuito: number[], passos: number}} indices de aresta na ordem, e o
 *   numero de operacoes da pilha, que e a medida honesta do custo
 */
export function circuitoEuleriano(g, inicio = null) {
  if (!g.ehEuleriano()) return { circuito: [], passos: 0 };
  const v0 = inicio === null ? g.arestas[0][0] : inicio;
  // ponteiro por vertice: cada aresta de saida e olhada uma vez so na vida
  const proxima = new Array(g.n).fill(0);
  const usada = new Array(g.m).fill(false);

  const pilhaV = [v0];
  const pilhaA = [-1];
  const circuito = [];
  let passos = 0;

  while (pilhaV.length) {
    passos++;
    const v = pilhaV[pilhaV.length - 1];
    let achou = -1;
    while (proxima[v] < g.saindo[v].length) {
      const i = g.saindo[v][proxima[v]];
      if (!usada[i]) { achou = i; break; }
      proxima[v]++;
    }
    if (achou === -1) {
      const a = pilhaA.pop();
      pilhaV.pop();
      if (a !== -1) circuito.push(a);
    } else {
      usada[achou] = true;
      proxima[v]++;
      pilhaV.push(g.arestas[achou][1]);
      pilhaA.push(achou);
    }
  }
  circuito.reverse();
  return { circuito, passos };
}

/**
 * Confere que uma sequencia de indices de aresta e mesmo um circuito euleriano:
 * usa cada aresta uma unica vez, encadeia destino com origem, e fecha.
 */
export function ehCircuitoValido(g, circuito) {
  if (circuito.length !== g.m) return false;
  if (new Set(circuito).size !== g.m) return false;
  for (let i = 0; i < circuito.length; i++) {
    const [, destino] = g.arestas[circuito[i]];
    const [origemSeguinte] = g.arestas[circuito[(i + 1) % circuito.length]];
    if (destino !== origemSeguinte) return false;
  }
  return true;
}
