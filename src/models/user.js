// models/user.js
export class User {
  constructor(id, name) {
    if (!id) throw new Error("Identificador inválido");
    this.id = id;
    this.name = name || "";
    // loans é um Set com os títulos emprestados
    this.loans = new Set();
  }

  borrow(title) {
    this.loans.add(title);
  }

  hasBorrowed(title) {
    return this.loans.has(title);
  }

  return(title) {
    this.loans.delete(title);
  }

  loanCount() {
    return this.loans.size;
  }

  listLoans() {
    return Array.from(this.loans);
  }
}
