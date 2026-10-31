# Relatório — Testes no R Book Lib

**Integrantes:**

1. 
2. 
3. 
4. 

**Evoluções implementadas:** (por exemplo, NF02 e NF01)

**Resultado final dos testes:** cole aqui as duas últimas linhas da saída de `npm test` (`Test Suites` e `Tests`).

```

```

---

## 1. Defeitos encontrados

Liste os defeitos do código original que os testes do grupo revelaram. Se não encontraram nenhum, escreva "nenhum" e explique quais regras conferiram com mais cuidado.

| Regra | Teste que revela o defeito (nome e arquivo) | Comportamento esperado | Comportamento obtido | Correção feita (arquivo e resumo) |
|---|---|---|---|---|
|  |  |  |  |  |

---

## 2. Testabilidade

**a)** Na evolução com data, de que o código dependia para funcionar? Como essa dependência passou a ser recebida, e como os testes a controlam? Cite a assinatura do método e o nome de um teste.

> 

**b)** Aponte um trecho do projeto **original** em que a regra de negócio já estava separada da interface, e explique por que isso facilitou escrever os testes da Parte 1.

> 

---

## 3. Cobertura

Saída de `npm run coverage`:

```
--------------------------|---------|----------|---------|---------|-------------------
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------------|---------|----------|---------|---------|-------------------
All files                 |   97.67 |    93.82 |     100 |     100 |
 models                   |   88.88 |    68.75 |     100 |     100 |
  book.js                 |      75 |    72.72 |     100 |     100 | 3-5
  user.js                 |   94.73 |       60 |     100 |     100 | 4,13
 repo                     |     100 |      100 |     100 |     100 |
  in-memory-repository.js |     100 |      100 |     100 |     100 |
 services                 |     100 |      100 |     100 |     100 |
  library-service.js      |     100 |      100 |     100 |     100 |
--------------------------|---------|----------|---------|---------|-------------------
```

A meta de 90% foi atingida: 100% de linhas e 93,82% de ramos. Antes da Parte 3 os
ramos estavam em 87,65%, abaixo da meta, e o comando acusava erro de threshold.
Para corrigir, criamos `tests/cobertura.test.js`, que cobre comportamentos
documentados que não tinham teste: erros da RN08 em `returnBook` e `listLoans`
(usuário ou livro inexistente), o erro "Quantidade máxima atingida" da RN02, o autor
padrão "Desconhecido", o nome padrão vazio, a quantidade não inteira, o título não
textual ou só com espaços e o identificador só com espaços.

| Arquivo e linha | O que o trecho faz | Por que não foi coberto |
|---|---|---|
| `book.js`, linha 3 | Valor padrão `quantity = 1` no construtor de `Book` | `LibraryService.registerBook` já aplica o padrão 1 e sempre repassa a quantidade ao `Book`, então o padrão do modelo nunca é usado. O comportamento é verificado pelo teste "deve cadastrar com 1 exemplar padrão quando a quantidade for omitida" (`library-service.test.js`). |
| `book.js`, linha 4 | `if (!title \|\| typeof title !== "string") throw "Título inválido"` | O serviço valida o título antes de criar o `Book`, então esse `throw` não é alcançável pelo `LibraryService`. Como a atividade pede testes via serviço, não testamos o modelo diretamente. A mesma regra é testada no serviço por "RN02: deve lançar erro ao cadastrar livro com título em branco ou inválido". |
| `book.js`, linha 5 | `if (!Number.isInteger(quantity) \|\| quantity <= 0) throw "Quantidade deve ser positiva"` | Mesmo motivo: o serviço valida a quantidade antes de instanciar `Book`. A regra é testada no serviço por "RN02: deve lançar erro para quantidade zero ou negativa" e "RN02: deve lançar erro para quantidade não inteira". |
| `user.js`, linha 4 | `if (!id) throw "Identificador inválido"` | `registerUser` valida o identificador antes de criar o `User`, então a verificação do modelo é inalcançável pelo serviço. A regra é testada por "deve lançar erro ao tentar cadastrar usuário sem ID ou com ID em branco". |
| `user.js`, linha 13 | Valor padrão `date = new Date()` em `User.borrow` | `borrowBook` do serviço sempre passa a data ao modelo. O padrão com a data atual vive no serviço e é testado por "deve usar a data atual como padrão quando a data não for informada" (`evolucoes.test.js`). |

Todos os trechos descobertos são defesas duplicadas nos modelos, já cobertas
indiretamente pela validação equivalente no `LibraryService`.

---

## 4. O que ficou sem teste, e por quê

Liste as partes do sistema que a suíte do grupo **não** verifica (arquivos, funções ou comportamentos) e explique o motivo de cada uma. Que tipo de erro poderia passar despercebido?

> 
