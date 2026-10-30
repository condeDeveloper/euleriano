// Primeiro caminho: contar circuitos eulerianos ANDANDO neles, um por um.
// Nao usa nenhuma formula. E o lado caro da conta, e o que diz a verdade.

/**
 * Conta os circuitos eulerianos de g fixando a PRIMEIRA ARESTA.
 *
 * Fixar a aresta inicial e o que faz esta contagem bater com a do teorema BEST.
 * Um circuito euleriano e um ciclo de arestas sem comeco; cada ciclo passa pela
 * aresta 0 exatamente uma vez, entao escolher a aresta 0 como largada nomeia cada
 * ciclo uma vez so. Sem isso a contagem sairia multiplicada pelo numero de arestas.
 *
 * @returns {{total: bigint, nos: number}} total de circuitos e nos visitados na busca
 */
export function contarCircuitos(g) {
  if (!g.ehEuleriano()) return { total: 0n, nos: 0 };
  const m = g.m;
  const usada = new Array(m).fill(false);
  usada[0] = true;
  const inicio = g.arestas[0][0];
  let total = 0n;
  let nos = 0;

  const anda = (atual, faltam) => {
    nos++;
    if (faltam === 0) {
      // so fecha se voltou ao ponto de partida
      if (atual === inicio) total++;
      return;
    }
    for (const i of g.saindo[atual]) {
      if (usada[i]) continue;
      usada[i] = true;
      anda(g.arestas[i][1], faltam - 1);
      usada[i] = false;
    }
  };

  anda(g.arestas[0][1], m - 1);
  return { total, nos };
}

/**
 * Lista os circuitos em vez de so contar. Serve para conferir a olho em grafo
 * pequeno e para o teste que exige que todo circuito use cada aresta uma vez.
 * @returns {number[][]} cada item e a sequencia de indices de aresta
 */
export function listarCircuitos(g) {
  if (!g.ehEuleriano()) return [];
  const m = g.m;
  const usada = new Array(m).fill(false);
  usada[0] = true;
  const inicio = g.arestas[0][0];
  const caminho = [0];
  const saida = [];

  const anda = (atual, faltam) => {
    if (faltam === 0) {
      if (atual === inicio) saida.push(caminho.slice());
      return;
    }
    for (const i of g.saindo[atual]) {
      if (usada[i]) continue;
      usada[i] = true;
      caminho.push(i);
      anda(g.arestas[i][1], faltam - 1);
      caminho.pop();
      usada[i] = false;
    }
  };

  anda(g.arestas[0][1], m - 1);
  return saida;
}
