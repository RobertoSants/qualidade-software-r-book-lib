// tests/library-service.test.js
import { InMemoryRepository } from "../src/repo/in-memory-repository.js";
import { LibraryService } from "../src/services/library-service.js";

// Teste de exemplo: serve para conferir se o ambiente está funcionando.
// Substitua-o pela suíte do grupo.
describe("LibraryService", () => {
  let service;

  beforeEach(() => {
    service = new LibraryService(new InMemoryRepository());
  });

  test("começa sem livros cadastrados", () => {
    expect(service.listBooks()).toEqual([]);
  });
});
