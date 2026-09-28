namespace BudgetTracker {
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
}
