import type { AccountUpdate } from '../interfaces/utility-types.js';
import { v4 as uuidv4 } from 'uuid';
import type { IAccount } from '../interfaces/IAccount.js';
import type { ISummary } from '../interfaces/ISummary.js';
import { formatCurrency } from '../lib/budget-utils.js';
import { sumMoney } from '../utils/sumMoney.js';
import { validateName } from '../utils/validation.js';
import { BudgetSummary } from './BudgetSummary.js';
import type { Transaction } from './Transaction.js';

export class Account extends BudgetSummary implements IAccount, ISummary {
  readonly #id: string;
  get id(): string { return this.#id; }

  readonly #transactions: Transaction[] = [];

  constructor(public name: string) {
    super();
    validateName(name);
    this.name = name.trim();
    this.#id = uuidv4();
  }

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
    if (this.#transactions.some(t => t.id === transaction.id)) {
      throw new Error(`Транзакция с id ${transaction.id} уже существует на этом счёте.`);
    }
    this.#transactions.push(transaction);
  }

  removeTransactionById(transactionId: string): boolean {
    const index = this.#transactions.findIndex(t => t.id === transactionId);
    if (index === -1) return false;
    this.#transactions.splice(index, 1);
    return true;
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }



  update(update: AccountUpdate): void {
    if ('id' in update) throw new TypeError('Идентификатор счёта нельзя изменять.');
    if (update.name !== undefined) {
      validateName(update.name);
      this.name = update.name.trim();
    }
  }

  override getSummaryString(): string {
    return `${this.id.slice(0, 8)}) ${this.name} | Баланс: ${formatCurrency(this.balance)} | Транзакций: ${this.#transactions.length}`;
  }

  override toString(): string {
    const transactions = this.#transactions.length > 0
      ? this.#transactions.map(t => `  ${t.toString()}`).join('\n')
      : '  Транзакций пока нет.';
    return `${this.getSummaryString()}\nСписок транзакций:\n${transactions}`;
  }
}
