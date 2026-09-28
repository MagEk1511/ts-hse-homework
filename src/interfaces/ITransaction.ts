import type { TransactionType } from './TransactionType.js';

export interface ITransaction {
  readonly id: string;
  readonly amount: number;
  readonly type: TransactionType;
  readonly date: string;
  readonly description: string;
}
