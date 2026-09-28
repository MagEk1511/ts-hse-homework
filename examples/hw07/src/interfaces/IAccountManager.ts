namespace BudgetTracker {
export interface IAccountManager {
  readonly accounts: Account[];
  addAccount(account: Account): void;
  removeAccountById(accountId: number): boolean;
  getAccountById(id: number): Account | undefined;
  getAllAccounts(): Account[];
  getAccounts(): Account[];
  getSummary(): ISummary;
  getSummaryString(): string;
}
}
