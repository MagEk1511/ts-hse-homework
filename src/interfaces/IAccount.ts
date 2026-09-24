namespace BudgetTracker {
export interface IAccount {
  readonly id: number;
  name: string;
  readonly transactions: Transaction[];
  addTransaction(transaction: Transaction): void;
  removeTransactionById(transactionId: number): boolean;
  getTransactions(): Transaction[];
}
}
