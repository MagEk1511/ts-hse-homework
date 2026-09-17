import type { Account, Transaction } from './classes.js';

export type TransactionType = 'income' | 'expense';

export interface ITransaction {
  readonly id: number;
  readonly amount: number;
  readonly type: TransactionType;
  readonly date: string;
  readonly description: string;
}

export interface ISummary {
  readonly income: number;
  readonly expenses: number;
  readonly balance: number;
}

export interface IAccount {
  readonly id: number;
  name: string;
  readonly transactions: Transaction[];
  addTransaction(transaction: Transaction): void;
  removeTransactionById(transactionId: number): boolean;
  getTransactions(): Transaction[];
}

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
