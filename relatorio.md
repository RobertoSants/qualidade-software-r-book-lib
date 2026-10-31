# Relatório — Testes no R Book Lib

**Integrantes:**

1. Roberto dos Santos Silva Junior
2. Annanda Lopes Jacobs
3. Rosilene da Silva Santos

**Evoluções implementadas:** NF01 (busca por título ou autor) e NF02 (controle de datas de empréstimo e devolução)

**Resultado final dos testes:** 

```text
Test Suites: 3 passed, 3 total
Tests:       54 passed, 54 total
```

---

## 1. Defeitos encontrados

Liste os defeitos do código original que os testes do grupo revelaram. Se não encontraram nenhum, escreva "nenhum" e explique quais regras conferiram com mais cuidado.

| Regra | Teste que revela o defeito (nome e arquivo) | Comportamento esperado | Comportamento obtido | Correção feita (arquivo e resumo) |
|---|---|---|---|---|
| RN01 | "RN01: deve proibir cadastrar dois livros com o mesmo título (case-insensitive)" em `tests/library-service.test.js` | Lançar erro ao tentar cadastrar título existente, independente de maiúsculas/minúsculas | Permitia cadastrar títulos idênticos com caixas diferentes | `src/repo/in-memory-repository.js`: ajuste em `findBook(title)` para converter o parâmetro e a busca com `.toLowerCase()` antes de comparar. |
| RN02 | "RN02: deve lançar erro ao cadastrar mais de 5 exemplares (limite inválido: 6)" em `tests/library-service.test.js` | Bloquear cadastro de livros com mais de 5 exemplares lançando erro | Aceitava quantidades acima de 5 exemplares | `src/services/library-service.js`: inclusão da validação `if (quantity > 5) throw new Error("Quantidade máxima é 5 exemplares");` em `registerBook`. |
| RN04 | "RN04: deve permitir no máximo 3 empréstimos e proibir o 4º empréstimo (limites 3 e 4)" em `tests/library-service.test.js` | Impedir que um mesmo usuário realize mais de 3 empréstimos ativos | Permitia empréstimos ilimitados sem validar a quantidade de livros na posse | `src/services/library-service.js`: inclusão da checagem `if (user.loanCount() >= 3) throw new Error("Usuário atingiu o limite de empréstimos (3)");` em `borrowBook`. |
| RN05 | "RN05: não deve permitir empréstimo duplicado do mesmo livro para o mesmo usuário" em `tests/library-service.test.js` | Lançar erro se o usuário tentar pegar o mesmo livro mais de uma vez | Permitia que o mesmo usuário pegasse múltiplos exemplares do mesmo livro | `src/services/library-service.js`: inclusão da verificação `if (user.hasBorrowed(book.title)) throw new Error("Usuário já tem esse livro emprestado");` em `borrowBook`. |
| RN06 | "RN06: não deve permitir remover livro que possui exemplares emprestados" em `tests/library-service.test.js` | Impedir a remoção de um livro cuja quantidade atual seja menor que a quantidade original cadastrada | Removia o livro do catálogo mesmo com exemplares emprestados com usuários | `src/services/library-service.js`: verificação `if (book.quantity !== book.originalQuantity) throw new Error("Não é possível remover: há exemplares emprestados");` em `removeBook`. |

---

## 2. Testabilidade

**a)** Na evolução com data, de que o código dependia para funcionar? Como essa dependência passou a ser recebida, e como os testes a controlam? Cite a assinatura do método e o nome de um teste.

> A regra dependia do relógio do sistema para capturar o instante exato dos empréstimos e devoluções (`new Date()`). Para viabilizar a testabilidade determinística de cálculos de intervalos de tempo (dias de permanência), a dependência temporal passou a ser injetável através de um parâmetro opcional que possui valor padrão. As assinaturas dos métodos em `src/services/library-service.js` foram ajustadas para `borrowBook(userId, title, date = new Date())` e `returnBook(userId, title, date = new Date())`. Nos testes, instâncias explícitas de `Date` fixas são passadas como argumento para simular a passagem exata do tempo sem recorrer a pausas falsas ou simulação pesada de relógio. Isso é verificado pelo teste **"deve calcular 10 dias de empréstimo na devolução"** no arquivo `tests/evolucoes.test.js`.

**b)** Aponte um trecho do projeto **original** em que a regra de negócio já estava separada da interface, e explique por que isso facilitou escrever os testes da Parte 1.

> No projeto original, a classe `LibraryService` (`src/services/library-service.js`) encapsulava os métodos operacionais (como `borrowBook` e `registerBook`) operando sobre modelos puros de domínio (`Book` e `User`) e um repositório em memória (`InMemoryRepository`), sem conter nenhuma dependência com interfaces de terminal (`console.log`, `readline`) ou servidor HTTP. Isso facilitou os testes da Parte 1 porque permitiu instanciar diretamente o serviço com `new LibraryService(new InMemoryRepository())` dentro dos blocos `beforeEach` e invocar os métodos do sistema programmaticamente, inspecionando retornos de funções e exceções lançadas por `expect().toThrow()` de forma rápida, isolada e sem ruído de I/O.

---

## 3. Cobertura

Saída de `npm run coverage`:

```text
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

A meta de 90% foi atingida: 100% de linhas e 93,82% de ramos. Antes da Parte 3 os ramos estavam em 87,65%, abaixo da meta, e o comando acusava erro de threshold. Para corrigir, criamos `tests/cobertura.test.js`, que cobre comportamentos documentados que não tinham teste: erros da RN08 em `returnBook` e `listLoans` (usuário ou livro inexistente), o erro "Quantidade máxima atingida" da RN02, o autor padrão "Desconhecido", o nome padrão vazio, a quantidade não inteira, o título não textual ou só com espaços e o identificador só com espaços.

| Arquivo e linha | O que o trecho faz | Por que não foi coberto |
|---|---|---|
| `book.js`, linha 3 | Valor padrão `quantity = 1` no construtor de `Book` | `LibraryService.registerBook` já aplica o padrão 1 e sempre repassa a quantidade ao `Book`, então o padrão do modelo nunca é usado. O comportamento é verificado pelo teste "deve cadastrar com 1 exemplar padrão quando a quantidade for omitida" (`library-service.test.js`). |
| `book.js`, linha 4 | `if (!title \|\| typeof title !== "string") throw "Título inválido"` | O serviço valida o título antes de criar o `Book`, então esse `throw` não é alcançável pelo `LibraryService`. Como a atividade pede testes via serviço, não testamos o modelo diretamente. A mesma regra é testada no serviço por "RN02: deve lançar erro ao cadastrar livro com título em branco ou inválido". |
| `book.js`, linha 5 | `if (!Number.isInteger(quantity) \|\| quantity <= 0) throw "Quantidade deve ser positiva"` | Mesmo motivo: o serviço valida a quantidade antes de instanciar `Book`. A regra é testada no serviço por "RN02: deve lançar erro para quantidade zero ou negativa" e "RN02: deve lançar erro para quantidade não inteira". |
| `user.js`, linha 4 | `if (!id) throw "Identificador inválido"` | `registerUser` valida o identificador antes de criar o `User`, então a verificação do modelo é inalcançável pelo serviço. A regra é testada por "deve lançar erro ao tentar cadastrar usuário sem ID ou com ID em branco". |
| `user.js`, linha 13 | Valor padrão `date = new Date()` em `User.borrow` | `borrowBook` do serviço sempre passa a data ao modelo. O padrão com a data atual vive no serviço e é testado por "deve usar a data atual como padrão quando a data não for informada" (`evolucoes.test.js`). |

Todos os trechos descobertos são defesas duplicadas nos modelos, já cobertas indiretamente pela validação equivalente no `LibraryService`.

---

## 4. O que ficou sem teste, e por quê

Liste as partes do sistema que a suíte do grupo **não** verifica (arquivos, funções ou comportamentos) e explique o motivo de cada uma. Que tipo de erro poderia passar despercebido?

> 1. **Instanciação direta dos modelos de domínio sem passar pelo `LibraryService` (`src/models/book.js` e `src/models/user.js`):**
>    - **Motivo:** O direcionamento da atividade exigia testar a aplicação a partir da fachada pública (`LibraryService`). Com isso, os métodos construtores de `Book` e `User` não possuem suítes de teste unitário isoladas (*unit tests*).
>    - **Impacto/Risco:** Se outro módulo do sistema ou uma evolução futura instanciar um `Book` ou `User` diretamente sem passar pela camada `LibraryService`, falhas no tratamento de exceções internas das instâncias ou nos valores padrão dos construtores (linhas 3 a 5 de `book.js` e linha 4 de `user.js`) podem passar despercebidas.
> 2. **Persistência real de dados e concorrência:**
>    - **Motivo:** O projeto utiliza o repositório volátil `InMemoryRepository` (`src/repo/in-memory-repository.js`). Não foram testados cenários de persistência em banco de dados real (SQL/NoSQL) nem concorrência de acessos simulando requisições simultâneas.
>    - **Impacto/Risco:** Condições de corrida (*race conditions*) em acessos paralelos ao estoque de exemplares ou falhas de sincronização ao salvar o estado dos dados não seriam detectados pelos testes unitários síncronos atuais.