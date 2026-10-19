import type { Transaction } from '../classes/Transaction.js';
import type { AccountUpdate } from './utility-types.js';

export interface IAccount {
  readonly id: string;
  name: string;
  readonly transactions: Transaction[];
  addTransaction(transaction: Transaction): void;
  removeTransactionById(transactionId: string): boolean;
  getTransactions(): Transaction[];
  update(update: AccountUpdate): void;
  exportTransactionsToCSV(filename: string): Promise<void>;
}
