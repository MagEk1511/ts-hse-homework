import type { ITransaction } from './ITransaction.js';

export type TransactionFieldType<TField> = TField extends keyof ITransaction ? ITransaction[TField] : never;

export type OptionalTransaction<TFields extends keyof ITransaction> =
  { [Key in keyof ITransaction as Key extends TFields ? never : Key]: ITransaction[Key] } &
  { [Key in TFields]?: ITransaction[Key] };

export type ReadonlyTransactionFields<TFields extends keyof ITransaction> =
  { [Key in keyof ITransaction as Key extends TFields ? never : Key]: ITransaction[Key] } &
  { readonly [Key in TFields]: ITransaction[Key] };

export type IsIncome<T> = T extends { type: 'income' } ? true : false;
