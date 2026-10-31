// Parte 3: testes que cobrem trechos documentados ainda sem teste.
import { InMemoryRepository } from "../src/repo/in-memory-repository.js";
import { LibraryService } from "../src/services/library-service.js";

describe("Cobertura: valores padrão e validações documentadas", () => {
  let repo;
  let service;

  beforeEach(() => {
    repo = new InMemoryRepository();
    service = new LibraryService(repo);
  });

  describe("registerBook", () => {
    test("deve cadastrar o livro com autor 'Desconhecido' quando o autor for omitido", () => {
      const livro = service.registerBook("Livro Sem Autor");

      expect(livro.author).toBe("Desconhecido");
      expect(service.listBooks()[0].author).toBe("Desconhecido");
    });

    test("RN02: deve lançar erro para quantidade não inteira", () => {
      expect(() => service.registerBook("Livro Quebrado", "Autor", 1.5)).toThrow(
        "Quantidade deve ser positiva"
      );
    });

    test("deve lançar erro quando o título não for texto", () => {
      expect(() => service.registerBook(123, "Autor", 1)).toThrow("Título inválido");
    });

    test("deve lançar erro quando o título tiver só espaços", () => {
      expect(() => service.registerBook("   ", "Autor", 1)).toThrow("Título inválido");
    });
  });

  describe("registerUser", () => {
    test("deve cadastrar o usuário com nome vazio quando o nome for omitido", () => {
      const usuario = service.registerUser("U01");

      expect(usuario.name).toBe("");
      expect(service.listUsers()).toHaveLength(1);
    });

    test("deve lançar erro quando o identificador tiver só espaços", () => {
      expect(() => service.registerUser("   ", "Fulano")).toThrow("Identificador inválido");
    });
  });

  describe("RN08: devolução e consulta exigem usuário e livro existentes", () => {
    beforeEach(() => {
      service.registerUser("U01", "Roberto");
      service.registerBook("Dom Casmurro", "Machado de Assis", 1);
    });

    test("deve lançar erro ao devolver livro para usuário inexistente", () => {
      expect(() => service.returnBook("U999", "Dom Casmurro")).toThrow(
        "Usuário não encontrado"
      );
    });

    test("deve lançar erro ao devolver livro inexistente", () => {
      expect(() => service.returnBook("U01", "Inexistente")).toThrow(
        "Livro não encontrado"
      );
    });

    test("deve lançar erro ao listar empréstimos de usuário inexistente", () => {
      expect(() => service.listLoans("U999")).toThrow("Usuário não encontrado");
    });

    test("deve devolver lista vazia ao listar empréstimos de usuário sem empréstimos", () => {
      expect(service.listLoans("U01")).toEqual([]);
    });
  });

  describe("RN02: devolução não pode ultrapassar a quantidade cadastrada", () => {
    test("deve lançar erro quando a devolução faria a quantidade passar da cadastrada", () => {
      service.registerUser("U01", "Roberto");
      service.registerBook("Dom Casmurro", "Machado de Assis", 1);
      service.borrowBook("U01", "Dom Casmurro");

      // estado inconsistente forçado: o exemplar já consta como disponível
      repo.findBook("Dom Casmurro").quantity = 1;

      expect(() => service.returnBook("U01", "Dom Casmurro")).toThrow(
        "Quantidade máxima atingida"
      );
    });
  });
});