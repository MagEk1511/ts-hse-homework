import { Transaction } from '../src/classes/Transaction.js';
import type { ITransaction } from '../src/interfaces/ITransaction.js';
import type { AccountUpdate, TransactionUpdate, TransactionPreview, CompleteTransaction, NullableDescription, CategoryLimits, TransactionConstructorParams, TransactionInstance } from '../src/interfaces/utility-types.js';
import type { TransactionFieldType, OptionalTransaction, ReadonlyTransactionFields, IsIncome } from '../src/interfaces/mapped-types.js';
import { GenericStorage, Product } from '../src/generics.js';
import { formatCurrency } from '../src/lib/budget-utils.js';

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
export type AmountIsNumber = Expect<Equal<TransactionFieldType<'amount'>, number>>;
export type IdIsString = Expect<Equal<TransactionFieldType<'id'>, string>>;
export type InvalidKeyIsNever = Expect<Equal<TransactionFieldType<'unknown'>, never>>;
export type IncomeIsTrue = Expect<Equal<IsIncome<{ type: 'income' }>, true>>;
export type ExpenseIsFalse = Expect<Equal<IsIncome<{ type: 'expense' }>, false>>;
export type GeneralTransactionIsFalse = Expect<Equal<IsIncome<ITransaction>, false>>;
export type InstanceMatches = Expect<Equal<TransactionInstance, Transaction>>;
export type CompleteFields = Expect<Equal<CompleteTransaction, Required<ITransaction>>>;
export const params: TransactionConstructorParams = [1, 'income', '2023-01-01', 'Пример'];
export const nullable: NullableDescription = { id: 'uuid', amount: 1, type: 'income', date: '2023-01-01', description: null };
export const optional: OptionalTransaction<'description' | 'date'> = { id: 'uuid', amount: 1, type: 'income' };
export const protectedFields: ReadonlyTransactionFields<'id' | 'type'> = { ...nullable, description: '' };
protectedFields.amount = 2;
// @ts-expect-error выбранный mapped type делает type неизменяемым
protectedFields.type = 'expense';
// @ts-expect-error отсутствует обязательное поле amount
export const missingAmount: OptionalTransaction<'date' | 'description'> = { id: 'uuid', type: 'income' };
// @ts-expect-error id исключён из частичного обновления
export const idUpdate: TransactionUpdate = { id: 'changed' };
// @ts-expect-error нельзя подменять методы и коллекции счёта
export const methodUpdate: AccountUpdate = { getTransactions: () => [] };
// @ts-expect-error preview исключает description
export const preview: TransactionPreview = { id: 'uuid', amount: 1, type: 'income', date: '', description: '' };
// @ts-expect-error Record требует оба ключа
export const missingLimit: CategoryLimits = { income: 100 };
// @ts-expect-error библиотечная декларация принимает число
formatCurrency('100');
export const storage = new GenericStorage<Product>();
// @ts-expect-error Product требует name, price и describe
storage.add({ id: 1 });
// @ts-expect-error ограничение generic требует числовой id
export const invalidStorage = new GenericStorage<{ name: string }>();
