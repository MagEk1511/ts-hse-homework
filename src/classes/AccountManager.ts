namespace BudgetTracker {
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
}
