// Parte 2: NF02 (datas de empréstimo/devolução) e NF01 (busca por título ou autor).
import { InMemoryRepository } from "../src/repo/in-memory-repository.js";
import { LibraryService } from "../src/services/library-service.js";

describe("Evoluções", () => {
  let service;

  beforeEach(() => {
    service = new LibraryService(new InMemoryRepository());
    service.registerUser("U01", "Roberto");
    service.registerBook("Dom Casmurro", "Machado de Assis", 2);
  });

  describe("NF02: data de empréstimo e devolução", () => {
    const emprestimo = new Date("2026-03-01T10:00:00Z");

    test("deve registrar a data informada ao emprestar o livro", () => {
      service.borrowBook("U01", "Dom Casmurro", emprestimo);

      expect(service.getLoanDate("U01", "Dom Casmurro")).toEqual(emprestimo);
    });

    test("deve usar a data atual como padrão quando a data não for informada", () => {
      const antes = new Date();
      service.borrowBook("U01", "Dom Casmurro");
      const depois = new Date();

      const data = service.getLoanDate("U01", "Dom Casmurro");
      expect(data >= antes && data <= depois).toBe(true);
    });

    test("deve calcular 10 dias de empréstimo na devolução", () => {
      service.borrowBook("U01", "Dom Casmurro", emprestimo);

      service.returnBook("U01", "Dom Casmurro", new Date("2026-03-11T10:00:00Z"));

      expect(service.listReturns("U01")).toEqual([
        {
          title: "Dom Casmurro",
          borrowedAt: emprestimo,
          returnedAt: new Date("2026-03-11T10:00:00Z"),
          days: 10,
        },
      ]);
    });

    test("deve calcular 0 dia quando a devolução for no mesmo dia", () => {
      service.borrowBook("U01", "Dom Casmurro", emprestimo);

      service.returnBook("U01", "Dom Casmurro", new Date("2026-03-01T18:00:00Z"));

      expect(service.listReturns("U01")[0].days).toBe(0);
    });

    test("deve contar só dias completos (9 dias e 23 horas = 9 dias)", () => {
      service.borrowBook("U01", "Dom Casmurro", emprestimo);

      service.returnBook("U01", "Dom Casmurro", new Date("2026-03-11T09:00:00Z"));

      expect(service.listReturns("U01")[0].days).toBe(9);
    });

    test("deve calcular 0 dia quando a devolução ocorre 1 minuto antes de completar 24 horas", () => {
      service.borrowBook("U01", "Dom Casmurro", emprestimo);

      service.returnBook("U01", "Dom Casmurro", new Date("2026-03-02T09:59:00Z"));

      expect(service.listReturns("U01")[0].days).toBe(0);
    });

    test("deve calcular 1 dia quando a devolução ocorre exatamente 24 horas depois", () => {
      service.borrowBook("U01", "Dom Casmurro", emprestimo);

      service.returnBook("U01", "Dom Casmurro", new Date("2026-03-02T10:00:00Z"));

      expect(service.listReturns("U01")[0].days).toBe(1);
    });

    test("deve lançar erro ao devolver com data anterior ao empréstimo", () => {
      service.borrowBook("U01", "Dom Casmurro", emprestimo);

      expect(() =>
        service.returnBook("U01", "Dom Casmurro", new Date("2026-02-28T10:00:00Z"))
      ).toThrow("Data de devolução inválida");
    });

    test("não deve alterar o estado quando a devolução com data inválida falha", () => {
      service.borrowBook("U01", "Dom Casmurro", emprestimo);

      expect(() =>
        service.returnBook("U01", "Dom Casmurro", new Date("2026-02-28T10:00:00Z"))
      ).toThrow();

      expect(service.listLoans("U01")).toEqual(["Dom Casmurro"]);
      expect(service.listBooks()[0].quantity).toBe(1);
      expect(service.listReturns("U01")).toEqual([]);
    });

    test("deve esquecer a data do empréstimo depois da devolução", () => {
      service.borrowBook("U01", "Dom Casmurro", emprestimo);
      service.returnBook("U01", "Dom Casmurro", new Date("2026-03-05T10:00:00Z"));

      expect(() => service.getLoanDate("U01", "Dom Casmurro")).toThrow(
        "Usuário não emprestou este livro"
      );
    });

    test("deve guardar uma data de empréstimo para cada livro", () => {
      service.registerBook("Quincas Borba", "Machado de Assis", 1);
      const outra = new Date("2026-03-03T10:00:00Z");

      service.borrowBook("U01", "Dom Casmurro", emprestimo);
      service.borrowBook("U01", "Quincas Borba", outra);

      expect(service.getLoanDate("U01", "Dom Casmurro")).toEqual(emprestimo);
      expect(service.getLoanDate("U01", "Quincas Borba")).toEqual(outra);
    });

    test("deve lançar erro ao consultar data de empréstimo de usuário inexistente", () => {
      expect(() => service.getLoanDate("U999", "Dom Casmurro")).toThrow(
        "Usuário não encontrado"
      );
    });

    test("deve lançar erro ao consultar data de empréstimo de livro inexistente", () => {
      expect(() => service.getLoanDate("U01", "Inexistente")).toThrow(
        "Livro não encontrado"
      );
    });

    test("deve listar os empréstimos ativos do usuário com a data de cada um", () => {
      service.registerBook("Quincas Borba", "Machado de Assis", 1);
      const outra = new Date("2026-03-03T10:00:00Z");
      service.borrowBook("U01", "Dom Casmurro", emprestimo);
      service.borrowBook("U01", "Quincas Borba", outra);

      expect(service.listLoansWithDates("U01")).toEqual([
        { title: "Dom Casmurro", borrowedAt: emprestimo },
        { title: "Quincas Borba", borrowedAt: outra },
      ]);
    });

    test("deve retirar da lista de empréstimos ativos o livro devolvido", () => {
      service.borrowBook("U01", "Dom Casmurro", emprestimo);
      service.returnBook("U01", "Dom Casmurro", new Date("2026-03-05T10:00:00Z"));

      expect(service.listLoansWithDates("U01")).toEqual([]);
    });

    test("deve lançar erro ao listar empréstimos com datas de usuário inexistente", () => {
      expect(() => service.listLoansWithDates("U999")).toThrow("Usuário não encontrado");
    });

    test("deve lançar erro ao listar devoluções de usuário inexistente", () => {
      expect(() => service.listReturns("U999")).toThrow("Usuário não encontrado");
    });
  });

  describe("NF01: busca de livros por título ou autor", () => {
    beforeEach(() => {
      service.registerBook("Memórias Póstumas", "Machado de Assis", 1);
      service.registerBook("A Hora da Estrela", "Clarice Lispector", 1);
    });

    test("deve encontrar livro pelo título exato", () => {
      const titulos = service.searchBooks("A Hora da Estrela").map((b) => b.title);

      expect(titulos).toEqual(["A Hora da Estrela"]);
    });

    test("deve encontrar livros por parte do título", () => {
      const titulos = service.searchBooks("hora").map((b) => b.title);

      expect(titulos).toEqual(["A Hora da Estrela"]);
    });

    test("deve encontrar livros por parte do autor", () => {
      const titulos = service.searchBooks("machado").map((b) => b.title);

      expect(titulos).toEqual(["Dom Casmurro", "Memórias Póstumas"]);
    });

    test("deve ignorar maiúsculas e minúsculas na busca", () => {
      const titulos = service.searchBooks("CLARICE").map((b) => b.title);

      expect(titulos).toEqual(["A Hora da Estrela"]);
    });

    test("deve retornar lista vazia quando nada corresponder", () => {
      expect(service.searchBooks("xyz")).toEqual([]);
    });

    test("deve retornar lista vazia para termo vazio", () => {
      expect(service.searchBooks("")).toEqual([]);
    });

    test("deve retornar lista vazia para termo só com espaços", () => {
      expect(service.searchBooks("   ")).toEqual([]);
    });

    test("deve retornar lista vazia quando o termo não for informado", () => {
      expect(service.searchBooks()).toEqual([]);
    });
  });
});
