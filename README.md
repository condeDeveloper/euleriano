# Circuitos eulerianos e o teorema BEST

Contar de quantos jeitos dá para percorrer todas as arestas de um grafo dirigido
voltando ao ponto de partida. Feito de dois jeitos que não trocam uma linha de
código: **andando em todos os circuitos, um por um**, e **calculando um
determinante**. Node puro, sem dependência nenhuma.

O teorema BEST — de Bruijn, van Aardenne-Ehrenfest, Smith e Tutte — diz que

```
ec(G) = tw(G, r) * PRODUTO sobre v de (grau_saida(v) - 1)!
```

onde `tw(G, r)` é o número de arborescências com raiz `r`, que sai do determinante
de um menor da laplaciana. É uma fórmula que troca um fatorial de busca por uma
conta de álgebra linear. Este repositório existe para medir se ela está certa, e
quanto ela economiza.

## Os quatro achados

1. **A busca e a fórmula concordam nos 7.818 grafos varridos, sem uma única
   divergência.** São todos os grafos dirigidos simples eulerianos e conexos de 2 a
   5 vértices, achados varrendo as 1.052.740 matrizes de adjacência possíveis.
2. **O número de arborescências não muda com a raiz escolhida — nos 7.818.** É a
   promessa que o teorema faz de lambuja, e aqui ela é medida, não repetida. Fora do
   euleriano a promessa cai: no grafo `0>1, 0>2, 1>2` cada raiz dá um número
   diferente.
3. **O grafo completo de 6 vértices tem 247.669.456.896 circuitos eulerianos.** O
   determinante responde isso em milissegundos; a enumeração desiste depois de 20
   milhões de nós sem ter chegado perto. Em 5 vértices ela ainda termina, gasta
   7.740.620 nós, e confirma os 972.000 da fórmula.
4. **Contar todos os circuitos custa 152 vezes achar um — mas só a partir de 4
   vértices.** Em 5 vértices são 24.605.397 nós de enumeração contra 161.540 passos
   de Hierholzer. Em 2 e 3 vértices a conta se inverte e achar um custa mais caro
   que contar todos.

## As tabelas

Tudo abaixo sai de `node ferramentas/medidor.js`. Nenhum número foi digitado à mão,
e todos estão presos em `testes/medidas.test.js`.

### O domínio varrido

| n | matrizes olhadas | eulerianos conexos | circuitos no total |
|---|---|---|---|
| 2 | 4 | 1 | 1 |
| 3 | 64 | 9 | 11 |
| 4 | 4.096 | 148 | 858 |
| 5 | 1.048.576 | 7.660 | 3.059.486 |

Com 5 vértices, só **0,73%** das matrizes são de grafos eulerianos conexos.

### A busca contra o teorema

| n | concordam | discordam |
|---|---|---|
| 2 | 1 | 0 |
| 3 | 9 | 0 |
| 4 | 148 | 0 |
| 5 | 7.660 | 0 |

### Contar todos contra achar um

| n | nós da enumeração | passos de Hierholzer | razão |
|---|---|---|---|
| 2 | 2 | 5 | 0,40x |
| 3 | 42 | 69 | 0,61x |
| 4 | 5.753 | 1.948 | 2,95x |
| 5 | 24.605.397 | 161.540 | 152,32x |

### O grafo completo, onde a busca para de alcançar

| n | arestas | BEST | a busca terminou? | nós gastos |
|---|---|---|---|---|
| 2 | 2 | 1 | sim | 2 |
| 3 | 6 | 3 | sim | 16 |
| 4 | 12 | 256 | sim | 1.750 |
| 5 | 20 | 972.000 | sim | 7.740.620 |
| 6 | 30 | 247.669.456.896 | **não, desistiu** | 20.000.001 |

### Um terceiro e um quarto caminho

No grafo completo vale a fórmula fechada de Cayley, `n^(n-2) * ((n-2)!)^n`, sem
determinante nenhum. No grafo de De Bruijn, os circuitos eulerianos **são** as
sequências de De Bruijn, que têm a contagem clássica `(k!)^(k^(n-1)) / k^n`.

| caso | BEST | fórmula fechada | batem? |
|---|---|---|---|
| completo n=4 | 256 | 256 | sim |
| completo n=6 | 247.669.456.896 | 247.669.456.896 | sim |
| De Bruijn k=2 n=3 | 2 | 2 | sim |
| De Bruijn k=2 n=4 | 16 | 16 | sim |
| De Bruijn k=3 n=2 | 24 | 24 | sim |

Quatro caminhos independentes para o mesmo número.

## O que as medidas me corrigiram

Os erros são meus, não do livro.

- **Escrevi num teste que 97⁸ passa de 2⁵³, para mostrar que o determinante precisa
  de BigInt. Não passa.** São 7.837.433.594.376.961 contra 9.007.199.254.740.992. O
  teste que eu tinha escrito para provar que o `double` não serve estava, ele mesmo,
  dentro da faixa em que o `double` serve. Troquei por 199⁸, que é 2.459.374.191.553.118.401
  e aí sim estoura — e o teste agora também confere que converter para `Number` e
  voltar muda o valor.
- **Afirmei que o grafo de De Bruijn de 4 símbolos e ordem 2 tem 331.776 circuitos.
  Tem 20.736.** O 331.776 é `(4!)^4`, o numerador da fórmula; eu tinha esquecido que
  ela ainda divide por `k^n = 16`. Foi o teste de medidas que pegou, que é
  exatamente para isso que ele existe.
- **Esperava que contar todos os circuitos fosse sempre mais caro que achar um.** Em
  2 e 3 vértices é o contrário: a enumeração gasta 2 e 42 nós, e Hierholzer gasta 5
  e 69 passos, porque a pilha dele paga um custo fixo que o fatorial ainda não
  superou. A virada acontece em 4 vértices.

## Como está organizado

```
src/grafo.js        o grafo dirigido e a geração do domínio inteiro
src/enumera.js      o primeiro caminho: andar em todos os circuitos
src/best.js         o segundo caminho: determinante de Bareiss em BigInt
src/hierholzer.js   achar UM circuito, para a comparação de custo
ferramentas/medidor.js   roda as varreduras e imprime as tabelas acima
testes/             103 testes
```

Por que Bareiss e não eliminação de Gauss comum: as divisões de Bareiss são sempre
exatas, então o determinante de uma matriz inteira sai inteiro. Com ponto flutuante,
um grafo de 6 vértices devolveria `23.999999999999996` onde a resposta é 24.

## Rodar

```bash
node --test testes/*.test.js   # a bateria inteira
node ferramentas/medidor.js    # recalcula todas as tabelas deste README
```

Sem `npm install`: não há dependência. Precisa de Node 18 ou mais novo.

## Licença

MIT.
