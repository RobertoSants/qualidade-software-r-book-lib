# R Book Lib

Sistema de biblioteca em console, com dados em memória.

## Requisitos

* Node.js 18 ou superior

## Instalação

```bash
npm install
```

## Comandos

| Comando | O que faz |
|---|---|
| `npm test` | Executa os testes |
| `npm test -- -t "parte do nome"` | Executa só os testes cujo nome contém o texto |
| `npm test -- --randomize` | Executa os testes em ordem aleatória |
| `npm run coverage` | Executa os testes e mostra o relatório de cobertura |
| `npm start` | Abre o sistema no console |

## Estrutura

```
src/
├─ app.js                       # ponto de entrada (console)
├─ ui/console-ui.js             # menu e leitura do teclado
├─ models/book.js               # livro
├─ models/user.js               # usuário e seus empréstimos
├─ repo/in-memory-repository.js # armazenamento em memória
└─ services/library-service.js  # regras de negócio
tests/
└─ library-service.test.js      # testes do serviço
```

O projeto usa ES Modules (`import`/`export`). O `package.json` já traz a configuração necessária para o Jest.
