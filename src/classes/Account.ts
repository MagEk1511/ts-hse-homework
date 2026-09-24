namespace BudgetTracker {
export class Account extends BudgetSummary implements IAccount, ISummary {
  readonly #transactions: Transaction[] = [];

  constructor(public readonly id: number, public name: string) {
    super();
    validateId(id);
  }

  // Наружу выдаётся копия массива: изменить список можно только через методы.
  get transactions(): Transaction[] {
    return [...this.#transactions];
  }

  override get income(): number {
    return sumMoney(this.#transactions.filter(t => t.type === 'income').map(t => t.amount));
  }

  override get expenses(): number {
    return sumMoney(this.#transactions.filter(t => t.type === 'expense').map(t => t.amount));
  }

  addTransaction(transaction: Transaction): void {
    if (this.#transactions.some(existing => existing.id === transaction.id)) {
      throw new Error(`Транзакция с id ${transaction.id} уже существует на этом счёте.`);
    }
    this.#transactions.push(transaction);
  }

  removeTransactionById(transactionId: number): boolean {
    const index = this.#transactions.findIndex(t => t.id === transactionId);
    if (index === -1) return false;
    this.#transactions.splice(index, 1);
    return true;
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }

  override getSummaryString(): string {
    return `${this.id}) ${this.name} | Баланс: ${rubles.format(this.balance)} | Транзакций: ${this.#transactions.length}`;
  }

  override toString(): string {
    const transactions = this.#transactions.length > 0
      ? this.#transactions.map(t => `  ${t.toString()}`).join('\n')
      : '  Транзакций пока нет.';
    return `${this.getSummaryString()}\nСписок транзакций:\n${transactions}`;
  }
}
}
