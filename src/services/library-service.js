// services/library-service.js
import { Book } from "../models/book.js";
import { User } from "../models/user.js";

export class LibraryService {
  constructor(repository) {
    this.repo = repository;
  }

  // --- Operações com livros (RN01 & RN02) ---
  registerBook(title, author, quantity = 1) {
    if (!title || typeof title !== "string" || title.trim() === "") {
      throw new Error("Título inválido");
    }

    if (this.repo.findBook(title)) {
      throw new Error("Livro já existe na biblioteca");
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Quantidade deve ser positiva");
    }
    if (quantity > 5) {
      throw new Error("Quantidade máxima é 5 exemplares");
    }

    const book = new Book(title, author, quantity);
    this.repo.addBook(book);
    return book;
  }

  listBooks() {
    return this.repo.listBooks();
  }

  removeBook(title) {
    const book = this.repo.findBook(title);
    if (!book) throw new Error("Livro não encontrado");

    if (book.quantity !== book.originalQuantity) {
      throw new Error("Não é possível remover: há exemplares emprestados");
    }

    this.repo.removeBook(title);
    return true;
  }

  // --- Operações com usuários (RN03) ---
  registerUser(id, name) {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Identificador inválido");
    }

    if (this.repo.findUser(id)) {
      throw new Error("Usuário já cadastrado");
    }

    const user = new User(id, name);
    this.repo.addUser(user);
    return user;
  }

  listUsers() {
    return this.repo.listUsers();
  }

  // --- Operações de empréstimo (RN04, RN05 & RN08) ---
  borrowBook(userId, title) {
    const user = this.repo.findUser(userId);
    if (!user) throw new Error("Usuário não encontrado");

    const book = this.repo.findBook(title);
    if (!book) throw new Error("Livro não encontrado");

    if (book.quantity <= 0) throw new Error("Nenhum exemplar disponível");

    if (user.loanCount() >= 3) {
      throw new Error("Usuário atingiu o limite de empréstimos (3)");
    }

    if (user.hasBorrowed(book.title)) {
      throw new Error("Usuário já tem esse livro emprestado");
    }

    book.quantity -= 1;
    user.borrow(book.title);
    return true;
  }

  returnBook(userId, title) {
    const user = this.repo.findUser(userId);
    if (!user) throw new Error("Usuário não encontrado");

    const book = this.repo.findBook(title);
    if (!book) throw new Error("Livro não encontrado");

    if (!user.hasBorrowed(book.title)) {
      throw new Error("Usuário não emprestou este livro");
    }

    if (book.quantity + 1 > book.originalQuantity) {
      throw new Error("Quantidade máxima atingida");
    }

    // devolução
    book.quantity += 1;
    user.return(book.title);
    return true;
  }

  listLoans(userId) {
    const user = this.repo.findUser(userId);
    if (!user) throw new Error("Usuário não encontrado");
    return user.listLoans();
  }
}