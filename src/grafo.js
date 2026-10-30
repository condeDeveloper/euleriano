// O grafo dirigido com multiplicidade, e so isso. Nada aqui sabe gerar grafo nem
// contar circuito: isso e papel do gerador, do enumerador e do BEST.

export class Grafo {
  /**
   * @param {number} n quantidade de vertices
   * @param {Array<[number,number]>} arestas pares [origem, destino]; repetir o par
   *   cria aresta paralela, que e tratada como aresta distinta
   */
  constructor(n, arestas) {
    this.n = n;
    this.arestas = arestas.map(([u, v]) => [u, v]);
    this.saida = new Array(n).fill(0);
    this.entrada = new Array(n).fill(0);
    // incidencia: para cada vertice, os INDICES das arestas que saem dele
    this.saindo = Array.from({ length: n }, () => []);
    this.arestas.forEach(([u, v], i) => {
      this.saida[u]++;
      this.entrada[v]++;
      this.saindo[u].push(i);
    });
  }

  get m() {
    return this.arestas.length;
  }

  /** Vertices que tocam pelo menos uma aresta. Vertice isolado nao atrapalha. */
  ativos() {
    const a = [];
    for (let v = 0; v < this.n; v++) if (this.saida[v] + this.entrada[v] > 0) a.push(v);
    return a;
  }

  /** Grau de saida igual ao de entrada em todo vertice. Condicao local. */
  balanceado() {
    for (let v = 0; v < this.n; v++) if (this.saida[v] !== this.entrada[v]) return false;
    return true;
  }

  /**
   * Conexo no sentido fraco sobre os vertices ativos: ignorando a direcao, todo
   * vertice que tem aresta alcanca todo outro que tem aresta. Num grafo
   * balanceado, conexidade fraca ja implica a forte.
   */
  conexoNosAtivos() {
    const ativos = this.ativos();
    if (ativos.length === 0) return false;
    const viz = Array.from({ length: this.n }, () => []);
    for (const [u, v] of this.arestas) {
      viz[u].push(v);
      viz[v].push(u);
    }
    const visto = new Set([ativos[0]]);
    const pilha = [ativos[0]];
    while (pilha.length) {
      const x = pilha.pop();
      for (const y of viz[x]) if (!visto.has(y)) { visto.add(y); pilha.push(y); }
    }
    return ativos.every((v) => visto.has(v));
  }

  /** Tem circuito euleriano: balanceado e conexo nos vertices que tem aresta. */
  ehEuleriano() {
    return this.m > 0 && this.balanceado() && this.conexoNosAtivos();
  }

  /** Chave canonica do grafo, util para nao recontar o mesmo objeto. */
  chave() {
    return this.n + ':' + this.arestas.map(([u, v]) => u + '>' + v).sort().join(',');
  }
}
