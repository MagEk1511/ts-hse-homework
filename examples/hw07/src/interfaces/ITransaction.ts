namespace BudgetTracker {
export interface ITransaction {
  readonly id: number;
  readonly amount: number;
  readonly type: TransactionType;
  readonly date: string;
  readonly description: string;
}
}
