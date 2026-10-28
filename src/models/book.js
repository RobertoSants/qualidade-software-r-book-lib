// models/book.js
export class Book {
  constructor(title, author, quantity = 1) {
    if (!title || typeof title !== "string") throw new Error("Título inválido");
    if (!Number.isInteger(quantity) || quantity <= 0) throw new Error("Quantidade deve ser positiva");
    this.title = title;
    this.author = author || "Desconhecido";
    this.quantity = quantity;
    this.originalQuantity = quantity;
  }
}
