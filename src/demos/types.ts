import { Account } from '../classes/Account.js';
import { Transaction } from '../classes/Transaction.js';
import type {
  AccountInfo, AccountUpdate, CategoryLimits, CompleteTransaction, NullableDescription,
  TransactionConstructorParams, TransactionInstance, TransactionPreview,
  TransactionUpdate, TransactionWithoutDescription,
} from '../interfaces/utility-types.js';
import type { IsIncome, OptionalTransaction, ReadonlyTransactionFields, TransactionFieldType } from '../interfaces/mapped-types.js';

const account = new Account('Личный бюджет');
const params: TransactionConstructorParams = [1000, 'income', '2023-01-01', 'Зарплата'];
const transaction: TransactionInstance = new Transaction(...params);
const transactionUpdate: TransactionUpdate = { amount: 1200 };
const accountUpdate: AccountUpdate = { name: 'Основной счёт' };
transaction.update(transactionUpdate);
account.update(accountUpdate);
account.addTransaction(transaction);
const complete: CompleteTransaction = { ...transaction, id: transaction.id };
const preview: TransactionPreview = { id: transaction.id, amount: transaction.amount, type: transaction.type, date: transaction.date };
const withoutDescription: TransactionWithoutDescription = { ...preview };
const accountInfo: AccountInfo = { id: account.id, name: account.name };
const limits: CategoryLimits = { income: 10000, expense: 5000 };
const nullable: NullableDescription = { ...complete, description: null };
const amount: TransactionFieldType<'amount'> = 500;
const optional: OptionalTransaction<'description' | 'date'> = { id: transaction.id, amount, type: 'expense' };
const protectedFields: ReadonlyTransactionFields<'id' | 'type'> = complete;
const incomeCheck: IsIncome<{ type: 'income'; amount: number }> = true;
const expenseCheck: IsIncome<{ type: 'expense' }> = false;
console.log('Utility types:', { complete, preview, withoutDescription, accountInfo, limits, nullable });
console.log('Conditional и mapped types:', { optional, protectedFields, incomeCheck, expenseCheck });
console.log(account.toString());
