namespace BudgetTracker {
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
}
