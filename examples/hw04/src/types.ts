export type TransactionType = 'income' | 'expense';
export interface ITransaction {
  id: number;
  amount: number;
  type: TransactionType;
  date: string;
  description: string;
}
export interface IAccount {
  id: number;
  name: string;
  addTransaction(transaction: ITransaction): void;
  removeTransactionById(id: number): boolean;
  getTransactions(): ITransaction[];
}
export interface ISummary { income: number; expenses: number; balance: number; }
export interface IAccountManager {
  addAccount(account: IAccount): void;
  removeAccountById(id: number): boolean;
  getAccounts(): IAccount[];
  getAccountById(id: number): IAccount | undefined;
  getSummary(accountId: number): ISummary;
}
