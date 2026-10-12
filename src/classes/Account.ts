import { writeFile } from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { LogClass } from '../decorators/LogClass.js';
import { LogMethod } from '../decorators/LogMethod.js';
import { Metadata } from '../decorators/Metadata.js';
import { ReadOnly } from '../decorators/ReadOnly.js';
import type { IAccount } from '../interfaces/IAccount.js';
import type { ISummary } from '../interfaces/ISummary.js';
import type { AccountUpdate } from '../interfaces/utility-types.js';
import { formatCurrency } from '../lib/budget-utils.js';
import { escapeCsvValue } from '../utils/escapeCsvValue.js';
import { sumMoney } from '../utils/sumMoney.js';
import { errorMessage, validateName } from '../utils/validation.js';
import { BudgetSummary } from './BudgetSummary.js';
import type { Transaction } from './Transaction.js';

@LogClass
export class Account extends BudgetSummary implements IAccount, ISummary {
  @ReadOnly
  id: string;

  readonly #transactions: Transaction[] = [];

  constructor(public name: string) {
    super();
    validateName(name);
    this.name = name.trim();
    this.id = uuidv4();
  }

  @Metadata('description', 'История операций счёта')
  get transactions(): Transaction[] {
    return [...this.#transactions];
  }

  override get income(): number {
    return sumMoney(this.#transactions.filter(t => t.type === 'income').map(t => t.amount));
  }

  override get expenses(): number {
    return sumMoney(this.#transactions.filter(t => t.type === 'expense').map(t => t.amount));
  }

  @LogMethod
  addTransaction(transaction: Transaction): void {
    if (this.#transactions.some(t => t.id === transaction.id)) {
      throw new Error(`Транзакция с id ${transaction.id} уже существует на этом счёте.`);
    }
    this.#transactions.push(transaction);
  }

  @LogMethod
  removeTransactionById(transactionId: string): boolean {
    const index = this.#transactions.findIndex(t => t.id === transactionId);
    if (index === -1) return false;
    this.#transactions.splice(index, 1);
    return true;
  }

  @LogMethod
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

  async exportTransactionsToCSV(filename: string): Promise<void> {
    const rows = this.#transactions.map(t => [t.id, t.amount, t.type, t.date, t.description]
      .map(escapeCsvValue).join(','));
    const csv = ['id,amount,type,date,description', ...rows].join('\r\n') + '\r\n';
    try {
      await writeFile(filename, csv, 'utf8');
    } catch (error: unknown) {
      throw new Error(`Не удалось экспортировать CSV в «${filename}»: ${errorMessage(error)}`, { cause: error });
    }
  }

  override getSummaryString(): string {
    const description: unknown = Reflect.getMetadata('description', this, 'transactions');
    return `${this.id.slice(0, 8)}) ${this.name} | Баланс: ${formatCurrency(this.balance)} | Транзакций: ${this.#transactions.length}` +
      (typeof description === 'string' ? ` | ${description}` : '');
  }

  override toString(): string {
    const transactions = this.#transactions.length > 0
      ? this.#transactions.map(t => `  ${t.toString()}`).join('\n')
      : '  Транзакций пока нет.';
    return `${this.getSummaryString()}\nСписок транзакций:\n${transactions}`;
  }
}
