// tests/library-service.test.js
import { InMemoryRepository } from "../src/repo/in-memory-repository.js";
import { LibraryService } from "../src/services/library-service.js";

describe("LibraryService - Suíte de Testes da Parte 1 (Regras RN01 a RN08)", () => {
  let service;

  beforeEach(() => {
    service = new LibraryService(new InMemoryRepository());
  });

  describe("RN01 & RN02: Cadastro e Limites de Exemplares", () => {
    test("deve cadastrar um livro com sucesso com 1 e 5 exemplares (limites válidos)", () => {
      const b1 = service.registerBook("Dom Casmurro", "Machado de Assis", 1);
      const b2 = service.registerBook("Memórias Póstumas", "Machado de Assis", 5);

      expect(b1.quantity).toBe(1);
      expect(b2.quantity).toBe(5);
      expect(service.listBooks()).toHaveLength(2);
    });

    test("deve cadastrar com 1 exemplar padrão quando a quantidade for omitida", () => {
      const b = service.registerBook("Quincas Borba", "Machado de Assis");
      expect(b.quantity).toBe(1);
    });

    test("RN01: deve proibir cadastrar dois livros com o mesmo título (case-insensitive)", () => {
      service.registerBook("Dom Casmurro", "Machado de Assis", 2);

      expect(() =>
        service.registerBook("DOM CASMURRO", "Outro Autor", 1)
      ).toThrow("Livro já existe na biblioteca");
    });

    test("RN02: deve lançar erro ao cadastrar livro com título em branco ou inválido", () => {
      expect(() => service.registerBook("", "Autor", 1)).toThrow("Título inválido");
    });

    test("RN02: deve lançar erro para quantidade zero ou negativa", () => {
      expect(() => service.registerBook("Livro 0", "Autor", 0)).toThrow(
        "Quantidade deve ser positiva"
      );
    });

    test("RN02: deve lançar erro ao cadastrar mais de 5 exemplares (limite inválido: 6)", () => {
      expect(() => service.registerBook("Livro Grande", "Autor", 6)).toThrow(
        "Quantidade máxima é 5 exemplares"
      );
    });
  });

  describe("RN03: Cadastro Único de Usuários", () => {
    test("deve cadastrar usuário com id obrigatório e nome opcional", () => {
      const u1 = service.registerUser("U01", "Roberto Junior");
      const u2 = service.registerUser("U02", "");

      expect(u1.id).toBe("U01");
      expect(u2.id).toBe("U02");
      expect(service.listUsers()).toHaveLength(2);
    });

    test("deve lançar erro ao tentar cadastrar usuário sem ID ou com ID em branco", () => {
      expect(() => service.registerUser("", "Sem ID")).toThrow("Identificador inválido");
    });

    test("deve lançar erro ao tentar cadastrar ID de usuário duplicado", () => {
      service.registerUser("U01", "Roberto");

      expect(() => service.registerUser("U01", "Outro Roberto")).toThrow(
        "Usuário já cadastrado"
      );
    });
  });

  describe("RN04, RN05, RN08: Empréstimos", () => {
    beforeEach(() => {
      service.registerUser("U01", "Roberto");
      service.registerBook("Dom Casmurro", "Machado de Assis", 2);
    });

    test("deve realizar empréstimo com sucesso e decrementar os exemplares disponíveis", () => {
      const result = service.borrowBook("U01", "Dom Casmurro");

      const book = service.listBooks().find((b) => b.title === "Dom Casmurro");
      expect(result).toBe(true);
      expect(book.quantity).toBe(1);
      expect(service.listLoans("U01")).toContain("Dom Casmurro");
    });

    test("RN04: deve permitir no máximo 3 empréstimos e proibir o 4º empréstimo (limites 3 e 4)", () => {
      service.registerBook("Livro 2", "Autor", 1);
      service.registerBook("Livro 3", "Autor", 1);
      service.registerBook("Livro 4", "Autor", 1);

      service.borrowBook("U01", "Dom Casmurro");
      service.borrowBook("U01", "Livro 2");
      service.borrowBook("U01", "Livro 3");

      expect(() => service.borrowBook("U01", "Livro 4")).toThrow(
        "Usuário atingiu o limite de empréstimos (3)"
      );
    });

    test("RN05: não deve permitir empréstimo duplicado do mesmo livro para o mesmo usuário", () => {
      service.borrowBook("U01", "Dom Casmurro");

      expect(() => service.borrowBook("U01", "Dom Casmurro")).toThrow(
        "Usuário já tem esse livro emprestado"
      );
    });

    test("RN08: deve lançar erro se o livro não tiver exemplares disponíveis (limite 0)", () => {
      service.registerUser("U02", "Annanda");
      service.registerBook("Livro Raro", "Autor", 1);

      service.borrowBook("U01", "Livro Raro");

      expect(() => service.borrowBook("U02", "Livro Raro")).toThrow(
        "Nenhum exemplar disponível"
      );
    });

    test("RN08: deve lançar erro se o usuário ou livro informado não existirem", () => {
      expect(() => service.borrowBook("U999", "Dom Casmurro")).toThrow(
        "Usuário não encontrado"
      );
      expect(() => service.borrowBook("U01", "Inexistente")).toThrow(
        "Livro não encontrado"
      );
    });
  });

  describe("RN02, RN06, RN07 & RN08: Devoluções e Remoção de Livros", () => {
    beforeEach(() => {
      service.registerUser("U01", "Roberto");
      service.registerBook("A Hora da Estrela", "Clarice Lispector", 2);
      service.borrowBook("U01", "A Hora da Estrela");
    });

    test("deve devolver o livro com sucesso e incrementar a quantidade disponível", () => {
      const result = service.returnBook("U01", "A Hora da Estrela");

      const book = service.listBooks().find((b) => b.title === "A Hora da Estrela");
      expect(result).toBe(true);
      expect(book.quantity).toBe(2);
      expect(service.listLoans("U01")).not.toContain("A Hora da Estrela");
    });

    test("RN07: deve lançar erro ao tentar devolver livro que o usuário não emprestou", () => {
      service.registerBook("O Cortiço", "Aluísio", 2);

      expect(() => service.returnBook("U01", "O Cortiço")).toThrow(
        "Usuário não emprestou este livro"
      );
    });

    test("RN06: não deve permitir remover livro que possui exemplares emprestados", () => {
      expect(() => service.removeBook("A Hora da Estrela")).toThrow(
        "Não é possível remover: há exemplares emprestados"
      );
    });

    test("RN06: deve permitir remover livro quando todos os exemplares estiverem disponíveis", () => {
      service.returnBook("U01", "A Hora da Estrela");
      const result = service.removeBook("A Hora da Estrela");

      expect(result).toBe(true);
      expect(() => service.removeBook("A Hora da Estrela")).toThrow(
        "Livro não encontrado"
      );
    });
  });
});