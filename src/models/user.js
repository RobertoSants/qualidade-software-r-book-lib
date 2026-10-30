// models/user.js
export class User {
  constructor(id, name) {
    if (!id) throw new Error("Identificador inválido");
    this.id = id;
    this.name = name || "";
    // loans é um Set com os títulos emprestados
    this.loans = new Set();
    this.loanDates = new Map();
    this.returns = [];
  }

  borrow(title, date = new Date()) {
    this.loans.add(title);
    this.loanDates.set(title, date);
  }

  getLoanDate(title) {
    return this.loanDates.get(title);
  }


  hasBorrowed(title) {
    return this.loans.has(title);
  }

  return(title) {
    const borrowedAt = this.loanDates.get(title);
    this.loans.delete(title);
    this.loanDates.delete(title);
    return borrowedAt;
  }

  addReturnRecord(record) {
    this.returns.push(record);
  }

  listReturns() {
    return this.returns.slice();
  }

  loanCount() {
    return this.loans.size;
  }

  listLoans() {
    return Array.from(this.loans);
  }
}
