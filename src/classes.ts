import type {
  IAccount,
  IAccountManager,
  ISummary,
  ITransaction,
  TransactionType,
} from './types.js';

const rubles = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
});

function validateId(id: number): void {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new RangeError('Идентификатор должен быть положительным целым числом.');
  }
}

// Сложение в копейках исключает ошибки вроде 0.1 + 0.2 = 0.30000000000000004.
function sumMoney(amounts: readonly number[]): number {
  let kopecks = 0;
  for (const amount of amounts) {
    kopecks += Math.round(amount * 100);
    if (!Number.isSafeInteger(kopecks)) {
      throw new RangeError('Сумма превышает допустимый диапазон.');
    }
  }
  return kopecks / 100;
}

function validateDate(date: string): void {
  const isoPattern = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/;
  if (!isoPattern.test(date) || !Number.isFinite(Date.parse(date))) {
    throw new RangeError('Дата должна быть корректной строкой ISO 8601.');
  }

  // Date.parse нормализует 30 февраля, поэтому отдельно проверяем календарный день.
  const calendarDate = date.slice(0, 10);
  if (new Date(`${calendarDate}T00:00:00Z`).toISOString().slice(0, 10) !== calendarDate) {
    throw new RangeError('Указанной календарной даты не существует.');
  }
}

export class Transaction implements ITransaction {
  constructor(
    public readonly id: number,
    public readonly amount: number,
    public readonly type: TransactionType,
    public readonly date: string,
    public readonly description: string,
  ) {
    validateId(id);
    const kopecks = Math.round(amount * 100);
    if (
      !Number.isFinite(amount) || amount <= 0 ||
      !Number.isSafeInteger(kopecks) || kopecks <= 0 ||
      Math.abs(amount * 100 - kopecks) > 1e-7
    ) {
      throw new RangeError('Сумма должна быть положительным числом с точностью до копеек.');
    }
    if (type !== 'income' && type !== 'expense') {
      throw new TypeError('Тип транзакции должен быть income или expense.');
    }
    validateDate(date);
  }

  toString(): string {
    const typeLabel = this.type === 'income' ? 'доход' : 'расход';
    return `${this.id}) ${this.description} (${typeLabel} ${rubles.format(this.amount)}) | ${this.date}`;
  }
}

/** Общая реализация сводки: наследники определяют источники доходов и расходов. */
export abstract class BudgetSummary implements ISummary {
  abstract get income(): number;
  abstract get expenses(): number;

  get balance(): number {
    return sumMoney([this.income, -this.expenses]);
  }

  getSummary(): ISummary {
    const income = this.income;
    const expenses = this.expenses;
    return { income, expenses, balance: sumMoney([income, -expenses]) };
  }

  abstract getSummaryString(): string;
}

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

export class AccountManager extends BudgetSummary implements IAccountManager, ISummary {
  readonly #accounts: Account[] = [];

  get accounts(): Account[] {
    return [...this.#accounts];
  }

  override get income(): number {
    return sumMoney(this.#accounts.map(account => account.income));
  }

  override get expenses(): number {
    return sumMoney(this.#accounts.map(account => account.expenses));
  }

  addAccount(account: Account): void {
    if (this.getAccountById(account.id)) {
      throw new Error(`Счёт с id ${account.id} уже существует.`);
    }
    this.#accounts.push(account);
  }

  removeAccountById(accountId: number): boolean {
    const index = this.#accounts.findIndex(account => account.id === accountId);
    if (index === -1) return false;
    this.#accounts.splice(index, 1);
    return true;
  }

  getAccountById(id: number): Account | undefined {
    return this.#accounts.find(account => account.id === id);
  }

  getAllAccounts(): Account[] {
    return this.accounts;
  }

  // Совместимость с названием метода из задания по интерфейсам.
  getAccounts(): Account[] {
    return this.getAllAccounts();
  }

  override getSummaryString(): string {
    const summary = this.getSummary();
    const totals = `Всего счетов: ${this.#accounts.length} | Доходы: ${rubles.format(summary.income)} | Расходы: ${rubles.format(summary.expenses)} | Баланс: ${rubles.format(summary.balance)}`;
    return [totals, ...this.#accounts.map(account => account.getSummaryString())].join('\n');
  }

  override toString(): string {
    if (this.#accounts.length === 0) {
      return `Бюджет\n${this.getSummaryString()}\nСчетов пока нет.`;
    }
    return `Бюджет\n${this.getSummaryString()}\n\n${this.#accounts.map(account => account.toString()).join('\n\n')}`;
  }
}
